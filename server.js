const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { URL } = require("node:url");
const os = require("node:os");
const { createHash } = require("node:crypto");
const { spawn } = require("node:child_process");
const { DatabaseSync } = require("node:sqlite");
const { File } = require("node:buffer");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const { createAdolEngine } = require("./adol-engine");
let cron = null;
try {
  cron = require("node-cron");
} catch {
  cron = null;
}
let pdfParse = null;
try {
  const loaded = require("pdf-parse");
  pdfParse = loaded?.default || loaded;
} catch {
  pdfParse = null;
}
let falClient = null;
try {
  falClient = require("@fal-ai/client");
} catch {
  falClient = null;
}

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "0.0.0.0";
const ROOT = __dirname;
const MARKET_QUOTE_TIMEOUT_MS = 30000;
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || "";
const FMP_API_KEY = process.env.FMP_API_KEY || "";
const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY || "";
const POLYGON_API_KEY = process.env.POLYGON_API_KEY || "";
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || "";
const TIINGO_API_KEY = process.env.TIINGO_API_KEY || "";
const UNUSUAL_WHALES_API_KEY = process.env.UNUSUAL_WHALES_API_KEY || "";
const TRADIER_API_KEY = process.env.TRADIER_API_KEY || "";
const TRADIER_BASE_URL = (process.env.TRADIER_BASE_URL || "https://api.tradier.com/v1").trim();
const TV_WEBHOOK_SECRET = (process.env.TV_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET || "").trim();
const OPENAI_API_KEY = (process.env.OPENAI_API_KEY || "").trim();
const OPENAI_MODEL = (process.env.OPENAI_MODEL || "gpt-5.4").trim();
const OPENAI_URL = (process.env.OPENAI_URL || "https://api.openai.com/v1/responses").trim();
const X_BEARER_TOKEN = (process.env.X_BEARER_TOKEN || "").trim();
const REDDIT_CLIENT_ID = (process.env.REDDIT_CLIENT_ID || "").trim();
const REDDIT_CLIENT_SECRET = (process.env.REDDIT_CLIENT_SECRET || "").trim();
const REDDIT_USER_AGENT = (process.env.REDDIT_USER_AGENT || "adol-scanner/1.0").trim();
const STOCKTWITS_TOKEN = (process.env.STOCKTWITS_TOKEN || "").trim();
const SERPAPI_KEY = (process.env.SERPAPI_KEY || "").trim();
const APIFY_TOKEN = (process.env.APIFY_TOKEN || "").trim();
const MARKETCHECK_API_KEY = (process.env.MARKETCHECK_API_KEY || "").trim();
const TELEGRAM_BOT_TOKEN = (process.env.TELEGRAM_BOT_TOKEN || "").trim();
const TELEGRAM_CHAT_ID = (process.env.TELEGRAM_CHAT_ID || "").trim();
const TELEGRAM_CONFIG_FILE = path.join(ROOT, "scanner_runtime_config.json");
const CHEAPTRIP_ALERTS_FILE = path.join(ROOT, "cheaptrip_alerts.json");
const CHEAPTRIP_TELEGRAM_BOT_TOKEN = (process.env.CHEAPTRIP_TELEGRAM_BOT_TOKEN || "").trim();
const CHEAPTRIP_TELEGRAM_CHAT_ID = (process.env.CHEAPTRIP_TELEGRAM_CHAT_ID || "").trim();
const CHEAPTRIP_TELEGRAM_CONFIG_FILE = path.join(ROOT, "cheaptrip_runtime_config.json");
const ADOL_COMMAND_CENTER_FILE = path.join(ROOT, "adol_command_center_config.json");
const MARKETCHECK_CONFIG_FILE = path.join(ROOT, "marketcheck_runtime_config.json");
const FACEBOOK_PAGE_ID = (process.env.FACEBOOK_PAGE_ID || "").trim();
const FACEBOOK_PAGE_ACCESS_TOKEN = (process.env.FACEBOOK_PAGE_ACCESS_TOKEN || "").trim();
const FACEBOOK_CONFIG_FILE = path.join(ROOT, "dealerflow_facebook_config.json");
const FACEBOOK_SCHEDULE_FILE = path.join(ROOT, "dealerflow_facebook_schedule.json");
const FAL_KEY = (process.env.FAL_KEY || "").trim();
const AI_VIDEO_TEST_MODE = String(process.env.AI_VIDEO_TEST_MODE || "").trim().toLowerCase() === "true";
const ADOL_CRON_EXPRESSION = "*/15 7-20 * * 1-5";
const ADOL_TZ = "America/New_York";
const ADOL_TOP_ETFS = ["SPY", "QQQ", "IWM", "DIA", "SMH", "XLF", "XLK", "XLE", "XLI", "XLY", "XLP", "XLV", "XLU"];
const ADOL_FALLBACK_DOW30 = ["AAPL", "AMGN", "AXP", "BA", "CAT", "CRM", "CSCO", "CVX", "DIS", "GS", "HD", "HON", "IBM", "INTC", "JNJ", "JPM", "KO", "MCD", "MMM", "MRK", "MSFT", "NKE", "NVDA", "PG", "SHW", "TRV", "UNH", "V", "VZ", "WMT"];
const ADOL_FALLBACK_NASDAQ100 = ["AAPL", "MSFT", "NVDA", "AMZN", "META", "GOOGL", "GOOG", "TSLA", "AVGO", "COST", "AMD", "NFLX", "ADBE", "PEP", "TMUS", "CSCO", "INTC", "AMGN", "QCOM", "TXN", "INTU", "CMCSA", "AMAT", "HON", "BKNG", "SBUX", "GILD", "ADP", "ISRG", "LRCX", "MU", "ADI", "PANW", "VRTX", "MDLZ", "REGN", "SNPS", "KLAC", "MELI", "CDNS"];
const ADOL_FALLBACK_SP500 = ["AAPL", "MSFT", "NVDA", "AMZN", "META", "GOOGL", "TSLA", "BRK.B", "LLY", "JPM", "UNH", "XOM", "V", "MA", "AVGO", "HD", "PG", "COST", "MRK", "ABBV", "PEP", "KO", "BAC", "ADBE", "CRM", "WMT", "AMD", "NFLX", "CSCO", "TMO", "ACN", "MCD", "LIN", "DHR", "ABT", "DIS", "INTC", "PFE", "TXN", "CMCSA", "ORCL", "QCOM", "NKE", "NEE", "WFC", "PM", "UPS", "RTX", "LOW", "HON"];

function adolUniqSymbols(input) {
  const out = [];
  const seen = new Set();
  for (const raw of Array.isArray(input) ? input : []) {
    const symbol = String(raw || "").trim().toUpperCase();
    if (!symbol || !/^[A-Z0-9.\-^]+$/.test(symbol) || seen.has(symbol)) continue;
    seen.add(symbol);
    out.push(symbol);
  }
  return out;
}
const DEAL_SPOTTER_DB_PATH = path.join(ROOT, "great_deals.sqlite");
const APIFY_FACEBOOK_ACTOR_ID = (process.env.APIFY_FACEBOOK_ACTOR_ID || "apify/facebook-marketplace-scraper").trim();
const APIFY_CRAIGSLIST_ACTOR_ID = (process.env.APIFY_CRAIGSLIST_ACTOR_ID || "apify/craigslist-scraper").trim();
const APIFY_EBAY_ACTOR_ID = (process.env.APIFY_EBAY_ACTOR_ID || "apify/ebay-scraper").trim();
const ADOL_TRADE_SUITE_DIR = path.join(ROOT, "adol22-trade-suite");
const ADOL_TRADE_SUITE_FILES = [
  "PROJECT_SUMMARY.md",
  "QUICK_REFERENCE.md",
  "DEPLOYMENT_GUIDE.md",
  "config.example.json",
  "setup.sh",
  "orchestrator.js",
  "trade-idea-agent.js",
  "portfolio-tracker.js",
  "backtest.js",
  "slack-alerts.js"
];
const ADOL_TRADE_SUITE_RUNNABLE = [
  "orchestrator.js",
  "trade-idea-agent.js",
  "portfolio-tracker.js",
  "backtest.js",
  "slack-alerts.js"
];
const TELEGRAM_FILE_CFG = loadTelegramConfigFile();
let ADOL_COMMAND_CENTER_CFG = loadAdolCommandCenterConfig();
const EFFECTIVE_TELEGRAM_BOT_TOKEN = TELEGRAM_BOT_TOKEN || TELEGRAM_FILE_CFG.telegram_bot_token || "";
const EFFECTIVE_TELEGRAM_CHAT_ID = TELEGRAM_CHAT_ID || TELEGRAM_FILE_CFG.telegram_chat_id || "";
let FACEBOOK_FILE_CFG = loadFacebookConfigFile();
let DEALERFLOW_FACEBOOK_SCHEDULES = loadFacebookSchedulesFile();
let FACEBOOK_SCHEDULER_BUSY = false;
const dealSpotterDb = initDealSpotterDb();

function loadMarketcheckConfigFile() {
  try {
    if (!fs.existsSync(MARKETCHECK_CONFIG_FILE)) return {};
    const raw = fs.readFileSync(MARKETCHECK_CONFIG_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return {
      marketcheck_api_key: String(parsed?.marketcheck_api_key || "").trim()
    };
  } catch {
    return {};
  }
}

function saveMarketcheckConfigFile(apiKey) {
  try {
    const payload = { marketcheck_api_key: String(apiKey || "").trim() };
    fs.writeFileSync(MARKETCHECK_CONFIG_FILE, JSON.stringify(payload, null, 2), "utf8");
    return true;
  } catch {
    return false;
  }
}

function resolveMarketcheckApiKey() {
  const fileCfg = loadMarketcheckConfigFile();
  const key = String(MARKETCHECK_API_KEY || fileCfg.marketcheck_api_key || "").trim();
  return key;
}

function resolveTelegramCredentials() {
  const fileCfg = loadTelegramConfigFile();
  const token = String(
    TELEGRAM_BOT_TOKEN ||
    process.env.BOT_TOKEN ||
    fileCfg.telegram_bot_token ||
    ""
  ).trim();
  const chatId = String(
    TELEGRAM_CHAT_ID ||
    process.env.CHAT_ID ||
    fileCfg.telegram_chat_id ||
    ""
  ).trim();
  return { token, chatId };
}


function defaultAdolCommandCenterConfig() {
  return {
    autoScanEnabled: true,
    mode: "balanced",
    watchlist: ["AMD", "NVDA", "TSLA"],
    riskPerTrade: 100,
    dailyMaxLossR: -2
  };
}

function normalizeAdolMode(value) {
  const mode = String(value || "").trim().toLowerCase();
  if (mode === "conservative" || mode === "balanced" || mode === "aggressive") return mode;
  return "balanced";
}

function loadAdolCommandCenterConfig() {
  const fallback = defaultAdolCommandCenterConfig();
  try {
    if (!fs.existsSync(ADOL_COMMAND_CENTER_FILE)) return fallback;
    const raw = fs.readFileSync(ADOL_COMMAND_CENTER_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return {
      autoScanEnabled: parsed?.autoScanEnabled !== false,
      mode: normalizeAdolMode(parsed?.mode),
      watchlist: adolUniqSymbols(Array.isArray(parsed?.watchlist) ? parsed.watchlist : fallback.watchlist),
      riskPerTrade: Number.isFinite(Number(parsed?.riskPerTrade)) ? Number(parsed.riskPerTrade) : fallback.riskPerTrade,
      dailyMaxLossR: Number.isFinite(Number(parsed?.dailyMaxLossR)) ? Number(parsed.dailyMaxLossR) : fallback.dailyMaxLossR
    };
  } catch {
    return fallback;
  }
}

function saveAdolCommandCenterConfig(config) {
  try {
    const fallback = defaultAdolCommandCenterConfig();
    const payload = {
      autoScanEnabled: config?.autoScanEnabled !== false,
      mode: normalizeAdolMode(config?.mode),
      watchlist: adolUniqSymbols(Array.isArray(config?.watchlist) ? config.watchlist : []),
      riskPerTrade: Number.isFinite(Number(config?.riskPerTrade)) ? Number(config.riskPerTrade) : fallback.riskPerTrade,
      dailyMaxLossR: Number.isFinite(Number(config?.dailyMaxLossR)) ? Number(config.dailyMaxLossR) : fallback.dailyMaxLossR
    };
    fs.writeFileSync(ADOL_COMMAND_CENTER_FILE, JSON.stringify(payload, null, 2), "utf8");
    return payload;
  } catch {
    return null;
  }
}

function getModeSettingPatch(mode) {
  const normalized = normalizeAdolMode(mode);
  if (normalized === "conservative") {
    return {
      riskMode: "conservative",
      minAPlusScore: 70,
      minTradeScore: 75,
      minRvolTrade: 2.2,
      maxSpreadPct: 0.9
    };
  }
  if (normalized === "aggressive") {
    return {
      riskMode: "aggressive",
      minAPlusScore: 70,
      minTradeScore: 65,
      minRvolTrade: 1.5,
      maxSpreadPct: 1.8
    };
  }
  return {
    riskMode: "balanced",
    minAPlusScore: 70,
    minTradeScore: 70,
    minRvolTrade: 2.0,
    maxSpreadPct: 1.2
  };
}

if (falClient?.fal && FAL_KEY) {
  try {
    falClient.fal.config({ credentials: FAL_KEY });
  } catch {
    // Keep server alive; route will report config errors if this fails.
  }
}

function pickAiVideoModel(resolution) {
  if (resolution === "512p") {
    return "fal-ai/minimax/hailuo-02-fast/image-to-video";
  }
  if (resolution === "1080p") {
    return "fal-ai/minimax/hailuo-02/pro/image-to-video";
  }
  return "fal-ai/minimax/hailuo-2.3/standard/image-to-video";
}

function extractAiVideoUrl(result) {
  return (
    result?.data?.video?.url ||
    result?.data?.video_url ||
    result?.data?.url ||
    ""
  );
}

function sanitizeTradeSuiteFileName(input) {
  const base = path.basename(String(input || "").trim());
  if (!base) return "";
  if (!ADOL_TRADE_SUITE_FILES.includes(base) && !ADOL_TRADE_SUITE_RUNNABLE.includes(base)) {
    return "";
  }
  return base;
}

function listTradeSuiteFiles() {
  const rows = [];
  for (const name of ADOL_TRADE_SUITE_FILES) {
    const fullPath = path.join(ADOL_TRADE_SUITE_DIR, name);
    if (!fs.existsSync(fullPath)) continue;
    try {
      const stat = fs.statSync(fullPath);
      rows.push({
        name,
        size: stat.size,
        modifiedAt: stat.mtime.toISOString(),
        runnable: ADOL_TRADE_SUITE_RUNNABLE.includes(name),
        kind: path.extname(name).toLowerCase()
      });
    } catch {
      // ignore per-file errors
    }
  }
  return rows;
}

function readTradeSuiteFile(name) {
  const safeName = sanitizeTradeSuiteFileName(name);
  if (!safeName) return null;
  const fullPath = path.join(ADOL_TRADE_SUITE_DIR, safeName);
  if (!fs.existsSync(fullPath)) return null;
  try {
    const stat = fs.statSync(fullPath);
    const ext = path.extname(safeName).toLowerCase();
    const isTextLike = [".md", ".json", ".js", ".sh", ".txt", ".yaml", ".yml"].includes(ext);
    if (!isTextLike) return null;
    const content = fs.readFileSync(fullPath, "utf8");
    return {
      name: safeName,
      size: stat.size,
      modifiedAt: stat.mtime.toISOString(),
      content: content.slice(0, 120000)
    };
  } catch {
    return null;
  }
}

function runTradeSuiteScript(name) {
  return new Promise((resolve) => {
    const safeName = sanitizeTradeSuiteFileName(name);
    if (!safeName || !ADOL_TRADE_SUITE_RUNNABLE.includes(safeName)) {
      resolve({ ok: false, error: "Script is not allowed." });
      return;
    }
    const fullPath = path.join(ADOL_TRADE_SUITE_DIR, safeName);
    if (!fs.existsSync(fullPath)) {
      resolve({ ok: false, error: "Script file not found." });
      return;
    }

    // Script-specific default args so "Run" in UI executes a useful action.
    // Without this, orchestrator.js only prints help and appears broken.
    const defaultScriptArgs = {
      "orchestrator.js": ["run-daily"]
    };
    const launchArgs = [fullPath, ...(defaultScriptArgs[safeName] || [])];

    const startedAt = Date.now();
    const child = spawn(process.execPath, launchArgs, {
      cwd: ADOL_TRADE_SUITE_DIR,
      env: { ...process.env },
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";
    const maxText = 160000;
    const timeoutMs = 45000;

    const timer = setTimeout(() => {
      try {
        child.kill("SIGTERM");
      } catch {
        // ignore timeout kill errors
      }
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      stdout += String(chunk || "");
      if (stdout.length > maxText) stdout = stdout.slice(-maxText);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk || "");
      if (stderr.length > maxText) stderr = stderr.slice(-maxText);
    });

    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({
        ok: false,
        error: error?.message || "Failed to start script.",
        stdout,
        stderr
      });
    });

    child.on("close", (code, signal) => {
      clearTimeout(timer);
      resolve({
        ok: Number(code) === 0,
        code: Number.isFinite(code) ? Number(code) : null,
        signal: signal || "",
        elapsedMs: Date.now() - startedAt,
        stdout,
        stderr
      });
    });
  });
}

function pickTradeSuiteHighlights(stdout, maxLines = 8) {
  const lines = String(stdout || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) return [];
  return lines.slice(-Math.max(1, Number(maxLines) || 8));
}

function buildTradeSuiteTelegramSummary(payload) {
  const stamp = String(payload?.stamp || "");
  const runs = Array.isArray(payload?.runs) ? payload.runs : [];
  const okCount = runs.filter((r) => r?.ok).length;
  const failCount = runs.length - okCount;
  const header = [
    "ADOL22 Trade Suite Full Run",
    stamp ? `Time: ${stamp}` : "",
    `Success: ${okCount}`,
    `Failed: ${failCount}`
  ].filter(Boolean);

  const body = runs.map((run, idx) => {
    const script = String(run?.script || `script-${idx + 1}`);
    const status = run?.ok ? "OK" : "FAILED";
    const elapsedMs = Number(run?.elapsedMs || 0);
    const elapsedSec = Number.isFinite(elapsedMs) ? (elapsedMs / 1000).toFixed(2) : "0.00";
    const highlights = pickTradeSuiteHighlights(run?.stdout, 4);
    const highlightLine = highlights.length ? `Highlights: ${highlights.join(" | ")}` : "Highlights: (none)";
    return `${idx + 1}) ${script} - ${status} (${elapsedSec}s)\n${highlightLine}`;
  });

  return `${header.join("\n")}\n\n${body.join("\n\n")}\n\nAlerts only. No auto trading.`;
}

async function runTradeSuiteFullSuite() {
  const scripts = ["trade-idea-agent.js", "portfolio-tracker.js", "backtest.js"];
  const startedAt = Date.now();
  const runs = [];

  for (const script of scripts) {
    // Sequential run keeps logs readable and execution deterministic.
    const result = await runTradeSuiteScript(script);
    runs.push({
      script,
      ok: Boolean(result?.ok),
      code: Number.isFinite(result?.code) ? Number(result.code) : null,
      signal: String(result?.signal || ""),
      elapsedMs: Number(result?.elapsedMs || 0),
      stdout: String(result?.stdout || ""),
      stderr: String(result?.stderr || ""),
      error: String(result?.error || "")
    });
  }

  const stamp = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
  const summaryText = buildTradeSuiteTelegramSummary({ stamp, runs });
  const creds = resolveCheapTripTelegramCredentials();
  const telegram = {
    configured: Boolean(creds.token && creds.chatId),
    sent: false,
    result: null
  };

  if (telegram.configured) {
    const sent = await sendTelegramMessage(creds.token, creds.chatId, summaryText);
    telegram.sent = Boolean(sent?.ok);
    telegram.result = sent;
  }

  return {
    ok: runs.every((run) => run.ok),
    startedAtIso: new Date(startedAt).toISOString(),
    elapsedMs: Date.now() - startedAt,
    runs,
    summaryText,
    telegram
  };
}

async function sendTelegramMessage(token, chatId, text, extraPayload = {}) {
  const url = `https://api.telegram.org/bot${encodeURIComponent(token)}/sendMessage`;
  const sendOnce = async (payload) => {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    let bodyText = "";
    try {
      bodyText = await response.text();
    } catch {
      bodyText = "";
    }
    let parsed = {};
    try {
      parsed = bodyText ? JSON.parse(bodyText) : {};
    } catch {
      parsed = {};
    }
    return {
      ok: response.ok && parsed?.ok === true,
      statusCode: response.status,
      body: parsed,
      rawBodyText: bodyText
    };
  };

  const plainPayload = {
    chat_id: chatId,
    text: String(text || ""),
    disable_web_page_preview: true,
    ...extraPayload
  };
  const formattedPayload = {
    ...plainPayload,
    parse_mode: "HTML"
  };

  const firstTry = await sendOnce(formattedPayload);
  if (firstTry.ok) {
    return { ...firstTry, fallbackUsed: false };
  }

  const failText = String(firstTry?.body?.description || firstTry?.rawBodyText || "");
  const shouldFallback = /can't parse entities|unsupported start tag|parse entities|bad request/i.test(failText);
  if (!shouldFallback) {
    return { ...firstTry, fallbackUsed: false };
  }

  const secondTry = await sendOnce(plainPayload);
  return {
    ...secondTry,
    fallbackUsed: true,
    firstFailure: {
      statusCode: firstTry.statusCode,
      body: firstTry.body
    }
  };
}

function escapeTelegramHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildTelegramHtmlAlert(title, stamp, message, icon = "🔔") {
  const safeTitle = escapeTelegramHtml(title || "Alert");
  const safeStamp = escapeTelegramHtml(stamp || "");
  const safeMessage = escapeTelegramHtml(message || "").replace(/\r?\n/g, "<br>");
  return `${icon} <b>${safeTitle}</b><br><b>Time:</b> ${safeStamp}<br><br>${safeMessage}`;
}

let TELEGRAM_POLL_OFFSET = 0;
let TELEGRAM_POLL_BUSY = false;
let TELEGRAM_POLL_LAST_AT = "";
let TELEGRAM_POLL_LAST_ERROR = "";
let TELEGRAM_POLL_STARTED = false;
const TELEGRAM_POLL_MS = 15000;
const TELEGRAM_REPLY_STALE_MS = 10 * 60 * 1000;

function formatTickerPrice(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  return `$${n.toFixed(n >= 100 ? 2 : 2)}`;
}

function formatPct(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0.00%";
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

function telegramActionEmoji(action) {
  const key = String(action || "").toLowerCase();
  if (key === "long" || key === "buy" || key === "strong buy") return "🟢";
  if (key === "short" || key === "sell" || key === "exit") return "🔴";
  if (key.includes("watch")) return "🟡";
  if (key.includes("avoid")) return "⚪";
  return "🔹";
}

function extractSymbolsFromText(text) {
  const matches = String(text || "")
    .toUpperCase()
    .match(/\b[A-Z]{1,5}(?:\.[A-Z])?\b/g);
  if (!matches) return [];
  const ignored = new Set([
    "WHAT", "STOCK", "STOCKS", "BUY", "SELL", "NOW", "TOP", "LONG", "LONGS", "SHORT", "SHORTS",
    "BIAS", "HELP", "REPORT", "SCAN", "WATCH", "WATCHLIST", "THE", "AND", "FOR", "WITH", "BEST"
  ]);
  return Array.from(new Set(matches.filter((symbol) => !ignored.has(symbol))));
}

function buildTelegramHelpText() {
  return [
    "🤖 ADOL22 Telegram Command Deck",
    "Compact keyboard enabled for smaller buttons.",
    "",
    "1. Alert Center",
    "/top - strict important alerts only",
    "/bestnow or /best - highest conviction setups only",
    "/buy - best bullish setups now",
    "/sell - best bearish setups now",
    "",
    "2. AI Assistant",
    "/analyze TSLA - full setup explanation",
    "/technical TSLA - full deep dive",
    "/ticker TSLA - quick ticker snapshot",
    "/search semiconductors - search anything in ADOL22",
    "/compare AMD NVDA - side-by-side compare",
    "/size TSLA - position size from risk",
    "/plan TSLA - execution plan only",
    "/levels TSLA - support, resistance, entry, stop, targets",
    "/why TSLA - why the bot likes or rejects it",
    "",
    "3. Mobile Scanner",
    "/scan - run a fresh ADOL22 scan",
    "/top10 - top 10 buys and sells",
    "/movers - session movers up/down",
    "/premarketplan /middaycheck /closeplan",
    "",
    "4. Command Center",
    "/startscan - turn auto scan on",
    "/stopscan - turn auto scan off",
    "/mode conservative|balanced|aggressive",
    "/setrisk 150 - set fixed risk per trade",
    "/setmaxloss -2 - set daily max loss in R",
    "/watchlist add AMD",
    "/watchlist remove TSLA",
    "/watchlist clear",
    "",
    "5. News Terminal",
    "/news - big news + analyst calls",
    "/earnings - earnings / estimate snapshot",
    "/flow - where the money is flowing",
    "/institutional or /inst - institutional summary",
    "/social or /soc - social summary",
    "/liquidity or /liq - liquidity map summary",
    "/report or /rep - AI market report",
    "/macro - macro / regime summary",
    "/regime - quick risk-on / risk-off read",
    "/sectors - sector shortcut keyboard",
    "/market or /mkt - session shortcut keyboard",
    "",
    "6. Risk Manager",
    "/risk - market risk warning + execution conditions",
    "/bias - market bias + session",
    "/report - short AI market report",
    "",
    "You can also type:",
    "what stocks to buy now",
    "top shorts",
    "market bias",
    "best setup today"
  ].join("\n");
}

function buildTelegramQuickKeyboard(page = "main") {
  const normalizedPage = String(page || "main").toLowerCase();
  const keyboard = normalizedPage === "command"
    ? [
        [{ text: "/on" }, { text: "/off" }],
        [{ text: "/mode c" }, { text: "/mode b" }, { text: "/mode a" }],
        [{ text: "/setrisk 100" }, { text: "/setmaxloss -2" }],
        [{ text: "/wl add AMD" }],
        [{ text: "/wl rem TSLA" }],
        [{ text: "/wl" }, { text: "/wl clear" }],
        [{ text: "/main" }, { text: "/help" }]
      ]
    : normalizedPage === "alerts"
      ? [
          [{ text: "/top" }, { text: "/buy" }, { text: "/sell" }],
          [{ text: "/topbuy" }, { text: "/topsell" }, { text: "/top10" }],
          [{ text: "/scan" }, { text: "/risk" }],
          [{ text: "/main" }, { text: "/help" }]
        ]
    : normalizedPage === "assistant"
      ? [
          [{ text: "/an TSLA" }, { text: "/tech TSLA" }],
          [{ text: "/plan TSLA" }, { text: "/lvls TSLA" }],
          [{ text: "/why TSLA" }, { text: "/cmp AMD NVDA" }],
          [{ text: "/t NVDA" }, { text: "/t AMD" }, { text: "/t AAPL" }],
          [{ text: "/t SPY" }, { text: "/t QQQ" }, { text: "/t TSLA" }],
          [{ text: "/tickers" }, { text: "/main" }],
          [{ text: "/help" }]
        ]
    : normalizedPage === "market"
      ? [
          [{ text: "/pre" }, { text: "/reg" }, { text: "/ah" }],
          [{ text: "/macro" }, { text: "/regime" }],
          [{ text: "/risk" }, { text: "/bias" }, { text: "/scan" }],
          [{ text: "/sec" }, { text: "/main" }, { text: "/help" }]
        ]
    : normalizedPage === "sectors"
      ? [
          [{ text: "/semis" }, { text: "/tech" }, { text: "/energy" }],
          [{ text: "/fin" }, { text: "/cons" }, { text: "/health" }],
          [{ text: "/flow" }, { text: "/mkt" }, { text: "/main" }],
          [{ text: "/help" }]
        ]
    : normalizedPage === "more"
    ? [
        [{ text: "/flow" }, { text: "/liquidity" }, { text: "/cot" }],
        [{ text: "/inst" }, { text: "/soc" }, { text: "/news" }],
        [{ text: "/earn" }, { text: "/rep" }, { text: "/bias" }],
        [{ text: "/t TSLA" }, { text: "/tech TSLA" }],
        [{ text: "/w AMD NVDA TSLA" }],
        [{ text: "/tickers" }, { text: "/intel" }, { text: "/cmd" }],
        [{ text: "/main" }],
        [{ text: "/help" }]
      ]
    : normalizedPage === "intel"
      ? [
          [{ text: "/news" }, { text: "/earn" }, { text: "/rep" }],
          [{ text: "/flow" }, { text: "/liq" }, { text: "/cot" }],
          [{ text: "/institutional" }, { text: "/social" }, { text: "/bias" }],
          [{ text: "/scan" }, { text: "/movers" }],
          [{ text: "/main" }, { text: "/more" }, { text: "/cmd" }],
          [{ text: "/help" }]
        ]
    : normalizedPage === "tickers"
      ? [
          [{ text: "/t SPY" }, { text: "/t QQQ" }, { text: "/t TSLA" }],
          [{ text: "/t NVDA" }, { text: "/t AMD" }, { text: "/t AAPL" }],
          [{ text: "/tech SPY" }, { text: "/tech QQQ" }, { text: "/tech TSLA" }],
          [{ text: "/tech NVDA" }, { text: "/tech AMD" }, { text: "/tech AAPL" }],
          [{ text: "/top10buy" }, { text: "/top10sell" }],
          [{ text: "/buy" }, { text: "/sell" }, { text: "/wait" }],
          [{ text: "/main" }, { text: "/more" }, { text: "/help" }]
        ]
      : [
          [{ text: "/top" }, { text: "/best" }, { text: "/risk" }],
          [{ text: "/buy" }, { text: "/sell" }, { text: "/wait" }],
          [{ text: "/scan" }, { text: "/bias" }, { text: "/news" }],
          [{ text: "/flow" }, { text: "/inst" }, { text: "/soc" }],
          [{ text: "/rep" }, { text: "/liq" }, { text: "/cot" }],
          [{ text: "/tickers" }, { text: "/mkt" }, { text: "/sec" }],
          [{ text: "/cmd" }, { text: "/intel" }, { text: "/more" }],
          [{ text: "/help" }]
        ];
  return {
    keyboard,
    resize_keyboard: true,
    one_time_keyboard: false
  };
}

function classifyHeatRiskForTelegram(row) {
  const rsi = Number(row?.rsi || 0);
  const rvol = Number(row?.rvol || 0);
  const price = Number(row?.price || 0);
  const ema21 = Number(row?.ema21 || 0);
  const extensionPct = ema21 > 0 ? ((price - ema21) / ema21) * 100 : 0;
  if (rsi >= 75 && rvol >= 2 && extensionPct >= 10) return "CLIMACTIC";
  if (rsi >= 70 && extensionPct >= 8) return "OVEREXTENDED";
  if (price > ema21 && rsi >= 55 && rsi <= 72 && rvol >= 1.1) return "HEALTHY";
  return "MIXED";
}

function buildDeepDiveAction(row) {
  const action = String(row?.action || "");
  if (action === "Long") return "ENTER NOW / BUY PULLBACK";
  if (action === "Short") return "SHORT SETUP / SELL RALLIES";
  if (action === "WatchOnly") return "WAIT FOR PULLBACK";
  return "AVOID / NO TRADE";
}

function buildTelegramRowLine(row, index) {
  if (!row) return "";
  const action = String(row.action || "").trim() || "WatchOnly";
  const side = action === "Long" ? "LONG" : action === "Short" ? "SHORT" : action;
  const finalScore = Number.isFinite(Number(row.finalAiScore)) ? Math.round(Number(row.finalAiScore)) : 0;
  const bull = Number.isFinite(Number(row.bullScore)) ? Math.round(Number(row.bullScore)) : 0;
  const bear = Number.isFinite(Number(row.bearScore)) ? Math.round(Number(row.bearScore)) : 0;
  const rvol = Number.isFinite(Number(row.rvol)) ? Number(row.rvol).toFixed(2) : "0.00";
  const grade =
    action === "Long" ? "A+" :
    action === "Short" ? "C-" :
    action === "WatchOnly" ? "WAIT" :
    "AVOID";
  return `${index + 1}. ${telegramActionEmoji(action)} ${row.ticker} ${formatTickerPrice(row.price)} | ${grade} | ${side} | Final ${finalScore} | Bull ${bull} | Bear ${bear} | RVOL ${rvol}`;
}

function formatCompactBillions(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return "N/A";
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${Math.round(num)}`;
}

function formatPlainNumber(value, digits = 2) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "N/A";
  return num.toFixed(digits);
}

function formatEarningsDate(value) {
  if (!value) return "Unavailable";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "Unavailable";
  return dt.toLocaleString("en-US", {
    timeZone: "America/New_York",
    month: "numeric",
    day: "numeric",
    year: "numeric"
  });
}

function extractAnalystMentionsFromNews(rows) {
  return (Array.isArray(rows) ? rows : [])
    .map((item) => String(item?.title || item?.headline || "").trim())
    .filter((title) => /upgrade|downgrade|price target|raised|cut|initiated|outperform|underperform|overweight|underweight/i.test(title))
    .slice(0, 3);
}

async function buildSingleTickerReply(scan, ticker, row) {
  const symbol = String(ticker || row?.ticker || "").trim().toUpperCase();
  if (!symbol) return "Send a valid ticker like /ticker TSLA.";

  let livePayload = null;
  let fundamentals = null;
  let liveError = "";
  let mtfPayloads = {};
  let yahooNews = [];

  try {
    livePayload = await buildLivePayload(symbol, "1D", "professional");
  } catch (error) {
    liveError = error?.message || "Live market data unavailable.";
  }

  try {
    const mtfResults = await Promise.allSettled([
      buildLivePayload(symbol, "4H", "professional"),
      buildLivePayload(symbol, "1H", "professional"),
      buildLivePayload(symbol, "15M", "professional")
    ]);
    mtfPayloads = {
      "4H": mtfResults[0]?.status === "fulfilled" ? mtfResults[0].value : null,
      "1H": mtfResults[1]?.status === "fulfilled" ? mtfResults[1].value : null,
      "15M": mtfResults[2]?.status === "fulfilled" ? mtfResults[2].value : null
    };
  } catch {}

  try {
    fundamentals = await fetchYahooFundamentals(symbol);
  } catch {}

  try {
    yahooNews = await fetchYahooNews(symbol);
  } catch {}

  const fd = livePayload?.formData || {};
  const dailyFd = livePayload?.formData || {};
  const tf4h = mtfPayloads["4H"]?.formData || {};
  const tf1h = mtfPayloads["1H"]?.formData || {};
  const tf15m = mtfPayloads["15M"]?.formData || {};
  const marketBias = String(scan?.marketBias || fd.spyTrend || "Mixed");
  const session = String(scan?.session || "Live Lookup");
  const price = Number.isFinite(Number(row?.price)) ? Number(row.price) : Number(fd.price || 0);
  const support = Number.isFinite(Number(row?.stop)) ? Number(row.stop) : Number(fd.support || 0);
  const resistance = Number.isFinite(Number(row?.t3)) ? Number(row.t3) : Number(fd.resistance || 0);
  const liquidityZone = String(fd.liquidityZone || row?.liquidityEvent || "Not mapped");
  const bull = Number.isFinite(Number(row?.bullScore)) ? Math.round(Number(row.bullScore)) : 0;
  const bear = Number.isFinite(Number(row?.bearScore)) ? Math.round(Number(row.bearScore)) : 0;
  const finalAi = Number.isFinite(Number(row?.finalAiScore)) ? Math.round(Number(row.finalAiScore)) : 0;
  const institutional = Number.isFinite(Number(row?.institutionalScore)) ? Math.round(Number(row.institutionalScore)) : 0;
  const trend = String(row?.trend || fd.trend || "Mixed");
  const structure = String(fd.structure || row?.setupType || "Mixed structure");
  const rvol = Number.isFinite(Number(row?.rvol)) ? Number(row.rvol) : 0;
  const vwap = Number.isFinite(Number(row?.vwap)) ? Number(row.vwap) : Number(fd.vwap || 0);
  const ema9 = Number.isFinite(Number(row?.ema9)) ? Number(row.ema9) : Number(fd.ema9 || 0);
  const ema21 = Number.isFinite(Number(row?.ema21)) ? Number(row.ema21) : Number(fd.ema21 || 0);
  const ema200 = Number.isFinite(Number(row?.ema200)) ? Number(row.ema200) : Number(fd.ema200 || 0);
  const rsi = Number.isFinite(Number(row?.rsi)) ? Number(row.rsi) : Number(fd.rsi || 0);
  const rr1 = row?.entry && row?.stop && row?.t1 ? Math.abs((row.t1 - row.entry) / (row.entry - row.stop || 1)) : 0;
  const rr2 = row?.entry && row?.stop && row?.t2 ? Math.abs((row.t2 - row.entry) / (row.entry - row.stop || 1)) : 0;
  const vwapSide = price >= vwap ? "Above VWAP" : "Below VWAP";
  const emaStack = ema9 > ema21 && ema21 > ema200
    ? "Bullish EMA stack"
    : ema9 < ema21 && ema21 < ema200
      ? "Bearish EMA stack"
      : "Mixed EMA stack";
  const overallBias = bull || bear
    ? (bull >= bear ? "Bullish" : "Bearish")
    : (price >= vwap && ema9 >= ema21 ? "Bullish" : "Bearish");
  const action = row ? buildDeepDiveAction(row) : (price >= vwap && ema9 > ema21 ? "WAIT FOR PULLBACK" : "AVOID / NO TRADE");
  const heat = row
    ? classifyHeatRiskForTelegram(row)
    : (rsi >= 75 ? "CLIMACTIC" : rsi >= 68 ? "OVEREXTENDED" : price > ema21 ? "HEALTHY" : "MIXED");
  const reason = String(row?.reason || "").trim()
    || [trend, structure, String(fd.volumeCharacter || "").trim()].filter(Boolean).join(" | ")
    || liveError
    || "No note";
  const newsNote = String(fd.catalyst || fd.newsNotes || "No fresh catalyst found");
  const macroRead = `SPY ${String(fd.spyTrend || "Mixed")} | QQQ ${String(fd.qqqTrend || "Mixed")} | VIX ${String(fd.vix || "N/A")}`;
  const mtfLine = [
    `Daily ${String(dailyFd.trend || trend || "Mixed")}`,
    `4H ${String(tf4h.trend || "Unavailable")}`,
    `1H ${String(tf1h.trend || "Unavailable")}`,
    `15m ${String(tf15m.trend || "Unavailable")}`
  ].join(" | ");
  const fundamentalLine = [
    `Mkt Cap ${formatCompactBillions(fundamentals?.marketCap)}`,
    `PE ${formatPlainNumber(fundamentals?.pe, 1)}`,
    `EPS ${formatPlainNumber(fundamentals?.eps, 2)}`,
    `Beta ${formatPlainNumber(fundamentals?.beta, 2)}`
  ].join(" | ");
  const earningsLine = [
    `Earnings ${formatEarningsDate(fundamentals?.earningsDate)}`,
    `Est FY ${formatPlainNumber(fundamentals?.epsCurrentYearEstimate, 2)}`,
    `Est NQ ${formatPlainNumber(fundamentals?.epsNextQuarterEstimate, 2)}`,
    `Whisper ${fundamentals?.whisperEstimate ? formatPlainNumber(fundamentals?.whisperEstimate, 2) : "Unavailable"}`
  ].join(" | ");
  const sectorIndustry = [fundamentals?.sector, fundamentals?.industry].filter(Boolean).join(" / ") || String(row?.sector || "Broad Market");
  const topHeadlines = (Array.isArray(yahooNews) ? yahooNews : [])
    .slice(0, 3)
    .map((item) => trimText(String(item?.title || item?.headline || "Headline"), 80));
  const analystMentions = extractAnalystMentionsFromNews(yahooNews);

  return [
    `${telegramActionEmoji(row?.action || "")} ${symbol} Deep Dive`,
    `Session: ${session}`,
    `Market Bias: ${marketBias}`,
    `Overall Bias: ${overallBias}`,
    `Action: ${action}`,
    `Trend / Structure: ${trend} | ${structure}`,
    `Multi-Timeframe: ${mtfLine}`,
    `Price: ${formatTickerPrice(price)} (${formatPct(row?.changePct)})`,
    `Sector / Industry: ${sectorIndustry}`,
    `Support / Resistance: ${formatTickerPrice(fd.support || support)} / ${formatTickerPrice(fd.resistance || resistance)}`,
    `Liquidity Zone: ${liquidityZone}`,
    `Bull/Bear/Final: ${bull} / ${bear} / ${finalAi}`,
    `Institutional Score: ${institutional || "N/A"}`,
    `RVOL: ${rvol ? rvol.toFixed(2) : "N/A"}`,
    `VWAP: ${formatTickerPrice(vwap)} (${vwapSide})`,
    `EMA Stack: ${emaStack}`,
    `Momentum (RSI): ${rsi ? rsi.toFixed(1) : "N/A"}`,
    `Heat Risk: ${heat}`,
    `Entry: ${formatTickerPrice(row?.entry || fd.support || price)}`,
    `Stop: ${formatTickerPrice(row?.stop || fd.support || 0)}`,
    `T1/T2/T3: ${formatTickerPrice(row?.t1 || fd.resistance || 0)} / ${formatTickerPrice(row?.t2 || 0)} / ${formatTickerPrice(row?.t3 || 0)}`,
    `R/R to T1/T2: ${Number.isFinite(rr1) && rr1 > 0 ? rr1.toFixed(2) : "N/A"}R / ${Number.isFinite(rr2) && rr2 > 0 ? rr2.toFixed(2) : "N/A"}R`,
    `Fundamentals: ${fundamentalLine}`,
    `Earnings / Estimate / Whisper: ${earningsLine}`,
    `Big News: ${topHeadlines.length ? topHeadlines.join(" | ") : "No fresh headline catalyst"}`,
    `Upgrade / Downgrade: ${analystMentions.length ? analystMentions.join(" | ") : "No fresh analyst call found"}`,
    `Social / News: ${Math.round(Number(row?.socialSentimentScore || 0))} / ${Math.round(Number(row?.newsSentimentScore || 0))}`,
    `Options Flow: ${String(row?.optionsBias || "Disabled")}`,
    `Macro Filter: ${macroRead}`,
    `Catalyst: ${newsNote}`,
    `Reason: ${reason}`,
    liveError ? `Data Note: ${liveError}` : ""
  ].filter(Boolean).join("\n");
}

async function buildTechnicalTickerReply(scan, ticker, row) {
  const base = await buildSingleTickerReply(scan, ticker, row);
  const symbol = String(ticker || row?.ticker || "").trim().toUpperCase();
  return [
    `📊 ${symbol} Technical Map`,
    "",
    base
  ].join("\n");
}

async function ensureAdolScanForTelegram(forceFresh = false) {
  const last = adolEngine.getLastScan();
  if (!forceFresh && last?.generatedAt) {
    const ageMs = Date.now() - new Date(last.generatedAt).getTime();
    if (Number.isFinite(ageMs) && ageMs >= 0 && ageMs <= TELEGRAM_REPLY_STALE_MS) {
      return last;
    }
  }
  const fresh = await adolEngine.runScan({}, "telegram_query");
  return fresh?.ok ? fresh : last || fresh;
}

function buildBuyReply(scan, symbols = []) {
  const rows = Array.isArray(scan?.rows) ? scan.rows : [];
  const scoped = symbols.length ? rows.filter((row) => symbols.includes(String(row.ticker || "").toUpperCase())) : rows;
  const buys = scoped
    .filter((row) => String(row.action || "") === "Long" && Number(row.rvol || 0) >= 2)
    .sort((a, b) => {
      const finalDiff = Number(b.finalAiScore || 0) - Number(a.finalAiScore || 0);
      if (finalDiff !== 0) return finalDiff;
      return Number(b.bullScore || 0) - Number(a.bullScore || 0);
    })
    .slice(0, 5);
  if (!buys.length) return "No A+ bullish Buy Now setups are available right now. Rules: score 70+ and RVOL 2+.";
  return [
    "🚨 A+ BUY NOW SETUPS",
    `Session: ${scan.session}`,
    `Market Bias: ${scan.marketBias}`,
    "Rules: A+ score 70+ | RVOL 2+ | Above VWAP | EMA trend aligned",
    "",
    ...buys.map(buildTelegramRowLine)
  ].join("\n");
}

function buildSellReply(scan, symbols = []) {
  const rows = Array.isArray(scan?.rows) ? scan.rows : [];
  const scoped = symbols.length ? rows.filter((row) => symbols.includes(String(row.ticker || "").toUpperCase())) : rows;
  const sells = scoped
    .filter((row) => String(row.action || "") === "Short" && Number(row.rvol || 0) >= 2)
    .sort((a, b) => {
      const finalDiff = Number(b.finalAiScore || 0) - Number(a.finalAiScore || 0);
      if (finalDiff !== 0) return finalDiff;
      return Number(b.bearScore || 0) - Number(a.bearScore || 0);
    })
    .slice(0, 5);
  if (!sells.length) return "No C- bearish Sell Now setups are available right now. Rules: score 70+ and RVOL 2+.";
  return [
    "🚨 C- SELL NOW SETUPS",
    `Session: ${scan.session}`,
    `Market Bias: ${scan.marketBias}`,
    "Rules: score 70+ | RVOL 2+ | Below VWAP | EMA trend aligned",
    "",
    ...sells.map(buildTelegramRowLine)
  ].join("\n");
}

function buildWaitReply(scan, symbols = []) {
  const rows = Array.isArray(scan?.rows) ? scan.rows : [];
  const scoped = symbols.length ? rows.filter((row) => symbols.includes(String(row.ticker || "").toUpperCase())) : rows;
  const waitRows = scoped
    .filter((row) => {
      const action = String(row?.action || "");
      const finalAi = Number(row?.finalAiScore || 0);
      const bull = Number(row?.bullScore || 0);
      const bear = Number(row?.bearScore || 0);
      return action === "WatchOnly" || (finalAi >= 60 && finalAi < 70) || Math.max(bull, bear) >= 65;
    })
    .sort((a, b) => Number(b.finalAiScore || 0) - Number(a.finalAiScore || 0))
    .slice(0, 5);
  if (!waitRows.length) return "No clean wait / pullback setups are available in the latest ADOL22 scan.";
  return [
    "🟡 Best Wait / Pullback Setups",
    `Session: ${scan.session}`,
    `Market Bias: ${scan.marketBias}`,
    "",
    ...waitRows.map(buildTelegramRowLine)
  ].join("\n");
}

function buildTop5Reply(scan) {
  return [
    buildBuyReply(scan),
    "",
    buildSellReply(scan)
  ].join("\n");
}

function isRiskOffScan(scan) {
  const tone = String(scan?.report?.riskTone || scan?.report?.marketTone || "").toLowerCase();
  return scan?.marketBias === "Bearish" || tone.includes("risk-off") || tone.includes("defensive");
}

function rowHasVwapTrigger(row) {
  const price = Number(row?.price || 0);
  const vwap = Number(row?.vwap || 0);
  const bull = Number(row?.bullScore || 0);
  const bear = Number(row?.bearScore || 0);
  if (!price || !vwap) return false;
  if (bull >= bear) return price >= vwap;
  return price <= vwap;
}

function rowHasLiquidityTrigger(row) {
  const event = String(row?.liquidityEvent || row?.setupType || row?.reason || "").toLowerCase();
  return event.includes("sweep") || event.includes("reclaim") || event.includes("loss") || event.includes("grab");
}

function isStrictHighQualityCandidate(row, scan) {
  const finalAi = Number(row?.finalAiScore || 0);
  const rvol = Number(row?.rvol || 0);
  return finalAi >= 70
    && rvol >= 2
    && rowHasVwapTrigger(row)
    && rowHasLiquidityTrigger(row)
    && !isRiskOffScan(scan);
}

function buildStrictCandidateLine(row, index) {
  const side = Number(row?.bullScore || 0) >= Number(row?.bearScore || 0) ? "BUY" : "SELL";
  const liq = String(row?.liquidityEvent || row?.setupType || "No sweep");
  const vwapState = Number(row?.price || 0) >= Number(row?.vwap || 0) ? "VWAP reclaim" : "VWAP loss";
  const grade = side === "BUY" ? "A+" : "C-";
  return `${index + 1}. ${telegramActionEmoji(side)} ${row.ticker} ${formatTickerPrice(row.price)} | ${grade} | ${side} | Final ${Math.round(Number(row.finalAiScore || 0))} | RVOL ${Number(row.rvol || 0).toFixed(2)} | ${vwapState} | ${liq}`;
}

function buildTop10Reply(scan) {
  const topBuys = (Array.isArray(scan?.rankings?.topBullishMovers) ? scan.rankings.topBullishMovers : [])
    .filter((row) => Number(row.bullScore || 0) >= Number(row.bearScore || 0))
    .slice(0, 10);
  const topSells = (Array.isArray(scan?.rankings?.topBearishMovers) ? scan.rankings.topBearishMovers : [])
    .filter((row) => Number(row.bearScore || 0) > Number(row.bullScore || 0))
    .slice(0, 10);
  return [
    "✅ ADOL22 Top 10 Buy",
    ...(topBuys.length ? topBuys.map(buildTelegramRowLine) : ["- None"]),
    "",
    "⛔ ADOL22 Top 10 Sell",
    ...(topSells.length ? topSells.map(buildTelegramRowLine) : ["- None"])
  ].join("\n");
}

function buildTopReply(scan) {
  const rows = Array.isArray(scan?.rows) ? scan.rows : [];
  const strict = rows
    .filter((row) => isStrictHighQualityCandidate(row, scan))
    .sort((a, b) => Number(b.finalAiScore || 0) - Number(a.finalAiScore || 0))
    .slice(0, 5);
  const warning = isRiskOffScan(scan) ? "⚠️ Risk-off warning is active. Reduce size or stay selective." : "✅ Risk tone acceptable for selective execution.";
  return [
    "🎯 ADOL22 Strict A+ Setups",
    `Session: ${scan.session}`,
    `Market Bias: ${scan.marketBias}`,
    warning,
    "Rules: Final AI >= 70 | RVOL >= 2 | VWAP reclaim/loss | Liquidity sweep/reclaim",
    "",
    ...(strict.length ? strict.map(buildStrictCandidateLine) : ["No strict A+ setups right now."])
  ].join("\n");
}

function buildBestNowReply(scan) {
  const rows = Array.isArray(scan?.rows) ? scan.rows : [];
  const candidates = rows
    .filter((row) => isStrictHighQualityCandidate(row, scan))
    .sort((a, b) => {
      const scoreA = Number(a.finalAiScore || 0) + Number(a.rvol || 0) * 4 + Math.max(Number(a.bullScore || 0), Number(a.bearScore || 0)) * 0.25;
      const scoreB = Number(b.finalAiScore || 0) + Number(b.rvol || 0) * 4 + Math.max(Number(b.bullScore || 0), Number(b.bearScore || 0)) * 0.25;
      return scoreB - scoreA;
    })
    .slice(0, 3);
  return [
    "🏆 ADOL22 Highest Conviction Now",
    `Session: ${scan.session}`,
    `Market Bias: ${scan.marketBias}`,
    "",
    ...(candidates.length ? candidates.map(buildStrictCandidateLine) : ["NO HIGH-PROBABILITY TRADES RIGHT NOW"])
  ].join("\n");
}

function buildTop10BuyReply(scan) {
  const topBuys = (Array.isArray(scan?.rankings?.topBullishMovers) ? scan.rankings.topBullishMovers : [])
    .filter((row) => Number(row.bullScore || 0) >= Number(row.bearScore || 0))
    .slice(0, 10);
  return [
    "✅ ADOL22 Top 10 Buy",
    ...(topBuys.length ? topBuys.map(buildTelegramRowLine) : ["- None"])
  ].join("\n");
}

function buildTop10SellReply(scan) {
  const topSells = (Array.isArray(scan?.rankings?.topBearishMovers) ? scan.rankings.topBearishMovers : [])
    .filter((row) => Number(row.bearScore || 0) > Number(row.bullScore || 0))
    .slice(0, 10);
  return [
    "⛔ ADOL22 Top 10 Sell",
    ...(topSells.length ? topSells.map(buildTelegramRowLine) : ["- None"])
  ].join("\n");
}

function buildTopBuyReply(scan) {
  return buildBuyReply(scan);
}

function buildTopSellReply(scan) {
  return buildSellReply(scan);
}

function buildMoversReply(scan) {
  const up = Array.isArray(scan?.rankings?.topSessionMoversUp) ? scan.rankings.topSessionMoversUp.slice(0, 5) : [];
  const down = Array.isArray(scan?.rankings?.topSessionMoversDown) ? scan.rankings.topSessionMoversDown.slice(0, 5) : [];
  return [
    "📈 ADOL22 Top Movers",
    `Session: ${scan.session}`,
    `Market Bias: ${scan.marketBias}`,
    "",
    "🟢 Movers Up",
    ...(up.length
      ? up.map((row, i) => `${i + 1}. ${row.ticker} ${formatTickerPrice(row.price)} | ${formatPct(row.changePct)} | Gap ${formatPct(row.gapPct)} | RVOL ${Number(row.rvol || 0).toFixed(2)}`)
      : ["- None"]),
    "",
    "🔴 Movers Down",
    ...(down.length
      ? down.map((row, i) => `${i + 1}. ${row.ticker} ${formatTickerPrice(row.price)} | ${formatPct(row.changePct)} | Gap ${formatPct(row.gapPct)} | RVOL ${Number(row.rvol || 0).toFixed(2)}`)
      : ["- None"])
  ].join("\n");
}

function buildSearchReply(scan, query = "") {
  const q = String(query || "").trim();
  const lower = q.toLowerCase();
  const rows = Array.isArray(scan?.rows) ? scan.rows : [];
  if (!q) {
    return "Use /search TSLA, /search semiconductors, /search earnings, or just type what you want to find.";
  }

  const scoreMatch = q.match(/\b(\d{2,3})\+\b/);
  if (scoreMatch) {
    const minScore = Math.max(0, Math.min(100, Number(scoreMatch[1] || 0)));
    const wantsBuy = /\bbuy\b|\blong\b|\bbull/i.test(q);
    const wantsSell = /\bsell\b|\bshort\b|\bbear/i.test(q);
    const filtered = rows
      .filter((row) => Number(row?.finalAiScore || 0) >= minScore)
      .filter((row) => {
        if (wantsBuy && !wantsSell) return Number(row?.bullScore || 0) >= Number(row?.bearScore || 0);
        if (wantsSell && !wantsBuy) return Number(row?.bearScore || 0) > Number(row?.bullScore || 0);
        return true;
      })
      .sort((a, b) => Number(b.finalAiScore || 0) - Number(a.finalAiScore || 0))
      .slice(0, 10);

    const title = wantsBuy && !wantsSell
      ? `🔎 ADOL22 Score Search: ${minScore}+ BUY`
      : wantsSell && !wantsBuy
        ? `🔎 ADOL22 Score Search: ${minScore}+ SELL`
        : `🔎 ADOL22 Score Search: ${minScore}+`;

    return [
      title,
      `Session: ${scan.session}`,
      `Market Bias: ${scan.marketBias}`,
      "",
      ...(filtered.length ? filtered.map(buildTelegramRowLine) : [`- No setups found at ${minScore}+ right now.`]),
      "",
      "Tip: Try searches like 70+, 70+ buy, 70+ sell, 80+ semis."
    ].join("\n");
  }

  const matched = rows.filter((row) => {
    const haystack = [
      row?.ticker,
      row?.sector,
      row?.industry,
      row?.trend,
      row?.action,
      row?.reason,
      row?.setupType,
      row?.liquidityEvent,
      row?.optionsBias,
      row?.socialBias,
      row?.projection
    ]
      .map((x) => String(x || "").toLowerCase())
      .join(" | ");
    return haystack.includes(lower);
  });

  const strict = matched
    .filter((row) => isStrictHighQualityCandidate(row, scan))
    .sort((a, b) => Number(b.finalAiScore || 0) - Number(a.finalAiScore || 0))
    .slice(0, 5);

  const general = matched
    .sort((a, b) => Number(b.finalAiScore || 0) - Number(a.finalAiScore || 0))
    .slice(0, 8);

  const upgrades = (Array.isArray(scan?.bigNews?.upgrades) ? scan.bigNews.upgrades : [])
    .filter((item) => `${item?.ticker || ""} ${item?.headline || ""}`.toLowerCase().includes(lower))
    .slice(0, 3);
  const downgrades = (Array.isArray(scan?.bigNews?.downgrades) ? scan.bigNews.downgrades : [])
    .filter((item) => `${item?.ticker || ""} ${item?.headline || ""}`.toLowerCase().includes(lower))
    .slice(0, 3);

  return [
    `🔎 ADOL22 Search: ${q}`,
    `Session: ${scan.session}`,
    `Market Bias: ${scan.marketBias}`,
    "",
    "Best High-Quality Matches",
    ...(strict.length ? strict.map(buildTelegramStrictLine) : ["- None"]),
    "",
    "Top General Matches",
    ...(general.length ? general.map(buildTelegramRowLine) : ["- None"]),
    "",
    "Relevant News / Analyst Calls",
    ...(upgrades.length ? upgrades.map((item, i) => `🟢 ${i + 1}. ${item.ticker} | ${item.headline}`) : []),
    ...(downgrades.length ? downgrades.map((item, i) => `🔴 ${i + 1}. ${item.ticker} | ${item.headline}`) : []),
    ...(!upgrades.length && !downgrades.length ? ["- No matching news items found."] : []),
    "",
    "Tip: You can search tickers, sectors, themes, trend words, or news words."
  ].join("\n");
}

function buildFlowReply(scan) {
  const rows = Array.isArray(scan?.rows) ? scan.rows : [];
  const sectorMap = new Map();
  for (const row of rows) {
    const sector = String(row?.sector || "Broad Market");
    if (!sectorMap.has(sector)) {
      sectorMap.set(sector, { sector, count: 0, bull: 0, bear: 0, final: 0 });
    }
    const bucket = sectorMap.get(sector);
    bucket.count += 1;
    bucket.bull += Number(row?.bullScore || 0);
    bucket.bear += Number(row?.bearScore || 0);
    bucket.final += Number(row?.finalAiScore || 0);
  }
  const sectorFlow = Array.from(sectorMap.values()).map((bucket) => {
    const avgBull = bucket.count ? bucket.bull / bucket.count : 0;
    const avgBear = bucket.count ? bucket.bear / bucket.count : 0;
    const avgFinal = bucket.count ? bucket.final / bucket.count : 0;
    return {
      sector: bucket.sector,
      avgBull,
      avgBear,
      avgFinal,
      direction: avgBull >= avgBear ? "Inflow" : "Outflow"
    };
  });
  const inflow = sectorFlow.filter((x) => x.direction === "Inflow").sort((a, b) => b.avgFinal - a.avgFinal).slice(0, 5);
  const outflow = sectorFlow.filter((x) => x.direction === "Outflow").sort((a, b) => a.avgFinal - b.avgFinal).slice(0, 5);
  return [
    "🔵 ADOL22 Money Flow",
    `Session: ${scan.session}`,
    `Market Bias: ${scan.marketBias}`,
    "",
    "🟢 Inflow Sectors",
    ...(inflow.length
      ? inflow.map((row, i) => `${i + 1}. ${row.sector} | Final ${Math.round(row.avgFinal)} | Bull ${Math.round(row.avgBull)} / Bear ${Math.round(row.avgBear)}`)
      : ["- None"]),
    "",
    "🔴 Outflow Sectors",
    ...(outflow.length
      ? outflow.map((row, i) => `${i + 1}. ${row.sector} | Final ${Math.round(row.avgFinal)} | Bull ${Math.round(row.avgBull)} / Bear ${Math.round(row.avgBear)}`)
      : ["- None"])
  ].join("\n");
}

function buildSectorFocusReply(scan, title, matchers = []) {
  const rows = (Array.isArray(scan?.rows) ? scan.rows : [])
    .filter((row) => {
      const sector = String(row?.sector || "").toLowerCase();
      const industry = String(row?.industry || "").toLowerCase();
      return matchers.some((matcher) => sector.includes(matcher) || industry.includes(matcher));
    })
    .sort((a, b) => Number(b.finalAiScore || 0) - Number(a.finalAiScore || 0));
  const best = rows.slice(0, 5);
  const weak = [...rows].sort((a, b) => Number(a.finalAiScore || 0) - Number(b.finalAiScore || 0)).slice(0, 3);
  return [
    `🏭 ADOL22 ${title}`,
    `Session: ${scan.session}`,
    `Market Bias: ${scan.marketBias}`,
    `Names matched: ${rows.length}`,
    "",
    "Best Positioned",
    ...(best.length ? best.map(buildTelegramRowLine) : ["- None"]),
    "",
    "Weak / Caution",
    ...(weak.length ? weak.map(buildTelegramRowLine) : ["- None"])
  ].join("\n");
}

function buildSessionPlaybookReply(scan, mode = "regular") {
  const key = String(mode || "regular").toLowerCase();
  const presets = {
    premarket: {
      title: "🌅 ADOL22 Premarket Playbook",
      focus: "Focus on gap + RVOL names only. Ignore weak overnight drift.",
      picks: Array.isArray(scan?.rankings?.topSessionMoversUp) ? scan.rankings.topSessionMoversUp.slice(0, 5) : []
    },
    regular: {
      title: "🕘 ADOL22 Regular Market Playbook",
      focus: "Best window for clean reclaim, sweep, breakout, and continuation setups.",
      picks: Array.isArray(scan?.rankings?.topBullishMovers) ? scan.rankings.topBullishMovers.slice(0, 5) : []
    },
    afterhours: {
      title: "🌙 ADOL22 After Hours Playbook",
      focus: "Use smaller size. Prioritize earnings, strong news, and only the cleanest continuation.",
      picks: Array.isArray(scan?.rankings?.topSessionMoversDown) ? scan.rankings.topSessionMoversDown.slice(0, 5) : []
    }
  };
  const preset = presets[key] || presets.regular;
  return [
    preset.title,
    `Current Session: ${scan.session}`,
    `Market Bias: ${scan.marketBias}`,
    `Risk Mode: ${isRiskOffScan(scan) ? "RISK-OFF / DEFENSIVE" : "RISK-ON / SELECTIVE"}`,
    "",
    `Focus: ${preset.focus}`,
    "",
    "Best Names To Watch",
    ...(preset.picks.length ? preset.picks.map(buildTelegramRowLine) : ["- None"])
  ].join("\n");
}

function findRowForSymbol(scan, symbol) {
  const target = String(symbol || "").trim().toUpperCase();
  const rows = Array.isArray(scan?.rows) ? scan.rows : [];
  return rows.find((row) => String(row?.ticker || "").toUpperCase() === target) || null;
}

function buildSizeReply(scan, symbol) {
  const row = findRowForSymbol(scan, symbol);
  if (!row) return `I could not find ${String(symbol || "").toUpperCase()} in the latest ADOL22 scan. Try /scan first.`;
  const status = adolEngine.getStatus?.() || {};
  const riskPerTrade = Number(status?.riskManager?.riskPerTrade || 100);
  const entry = Number(row?.entry || row?.price || 0);
  const stop = Number(row?.stop || 0);
  const riskPerShare = Math.abs(entry - stop);
  const shares = riskPerShare > 0 ? Math.max(0, Math.floor(riskPerTrade / riskPerShare)) : 0;
  const maxPositionValue = shares * entry;
  const action = buildDeepDiveAction(row);
  return [
    `📏 ADOL22 Position Size — ${String(symbol || "").toUpperCase()}`,
    `Session: ${scan.session}`,
    `Action: ${action}`,
    `Risk Per Trade: ${formatTickerPrice(riskPerTrade)}`,
    `Entry: ${formatTickerPrice(entry)}`,
    `Stop: ${formatTickerPrice(stop)}`,
    `Risk Per Share: ${riskPerShare > 0 ? formatTickerPrice(riskPerShare) : "N/A"}`,
    `Position Size: ${shares > 0 ? `${shares} shares` : "No valid size"}`,
    `Position Value: ${shares > 0 ? formatTickerPrice(maxPositionValue) : "N/A"}`,
    `Targets: ${formatTickerPrice(row?.t1 || 0)} / ${formatTickerPrice(row?.t2 || 0)} / ${formatTickerPrice(row?.t3 || 0)}`
  ].join("\n");
}

function buildCompareReply(scan, leftSymbol, rightSymbol) {
  const left = findRowForSymbol(scan, leftSymbol);
  const right = findRowForSymbol(scan, rightSymbol);
  if (!left || !right) {
    return `Use /compare AMD NVDA with two tickers that exist in the latest ADOL22 scan.`;
  }
  const leftEdge = Number(left.finalAiScore || 0) + Number(left.rvol || 0) * 5 + (Number(left.bullScore || 0) - Number(left.bearScore || 0)) * 0.25;
  const rightEdge = Number(right.finalAiScore || 0) + Number(right.rvol || 0) * 5 + (Number(right.bullScore || 0) - Number(right.bearScore || 0)) * 0.25;
  const winner = leftEdge >= rightEdge ? left : right;
  const loser = winner === left ? right : left;
  return [
    `⚖️ ADOL22 Compare: ${left.ticker} vs ${right.ticker}`,
    `Session: ${scan.session}`,
    `Market Bias: ${scan.marketBias}`,
    "",
    `${left.ticker}: Final ${Math.round(Number(left.finalAiScore || 0))} | Bull ${Math.round(Number(left.bullScore || 0))} | Bear ${Math.round(Number(left.bearScore || 0))} | RVOL ${Number(left.rvol || 0).toFixed(2)} | ${left.trend || left.action || "Mixed"}`,
    `${right.ticker}: Final ${Math.round(Number(right.finalAiScore || 0))} | Bull ${Math.round(Number(right.bullScore || 0))} | Bear ${Math.round(Number(right.bearScore || 0))} | RVOL ${Number(right.rvol || 0).toFixed(2)} | ${right.trend || right.action || "Mixed"}`,
    "",
    `Winner: ${winner.ticker}`,
    `Why: stronger combined edge from Final AI, RVOL, and directional pressure.`,
    `Caution: ${loser.ticker} is the weaker side right now unless structure improves.`
  ].join("\n");
}

function buildMacroReply(scan) {
  const summary = scan?.summary || {};
  const report = scan?.report || {};
  const riskOff = isRiskOffScan(scan);
  const rows = Array.isArray(scan?.rows) ? scan.rows : [];
  const leaders = [...rows]
    .sort((a, b) => Number(b.finalAiScore || 0) - Number(a.finalAiScore || 0))
    .slice(0, 3)
    .map((row) => `${row.ticker} ${formatTickerPrice(row.price)} | Final ${Math.round(Number(row.finalAiScore || 0))}`);
  const weak = [...rows]
    .sort((a, b) => Number(a.finalAiScore || 0) - Number(b.finalAiScore || 0))
    .slice(0, 3)
    .map((row) => `${row.ticker} ${formatTickerPrice(row.price)} | Final ${Math.round(Number(row.finalAiScore || 0))}`);
  return [
    "🌍 ADOL22 Macro / Regime",
    `Session: ${scan.session}`,
    `Market Status: ${scan.marketStatus}`,
    `Bias: ${scan.marketBias}`,
    `Regime: ${riskOff ? "RISK-OFF / DEFENSIVE" : "RISK-ON / SELECTIVE"}`,
    `Trade / Wait / Avoid: ${summary.trade || 0} / ${summary.wait || 0} / ${summary.avoid || 0}`,
    `Action Plan: ${report.actionPlan || report.finalActionPlan || "Stay selective and trade only clean alignment."}`,
    "",
    `Leadership: ${leaders.length ? leaders.join(" • ") : "-"}`,
    `Weakness: ${weak.length ? weak.join(" • ") : "-"}`
  ].join("\n");
}

function buildLevelsReply(scan, symbol) {
  const row = findRowForSymbol(scan, symbol);
  if (!row) return `I could not find ${String(symbol || "").toUpperCase()} in the latest ADOL22 scan. Try /scan first.`;
  return [
    `🎯 ADOL22 Levels — ${row.ticker}`,
    `Session: ${scan.session}`,
    `Trend: ${row.trend || "Mixed"}`,
    `Action: ${buildDeepDiveAction(row)}`,
    `Entry: ${formatTickerPrice(row.entry || row.price || 0)}`,
    `Stop: ${formatTickerPrice(row.stop || 0)}`,
    `Target 1: ${formatTickerPrice(row.t1 || 0)}`,
    `Target 2: ${formatTickerPrice(row.t2 || 0)}`,
    `Target 3: ${formatTickerPrice(row.t3 || 0)}`,
    `VWAP: ${formatTickerPrice(row.vwap || 0)} | EMA9: ${formatTickerPrice(row.ema9 || 0)} | EMA21: ${formatTickerPrice(row.ema21 || 0)} | EMA200: ${formatTickerPrice(row.ema200 || 0)}`,
    `Liquidity: ${String(row.liquidityEvent || row.setupType || "No mapped sweep")}`
  ].join("\n");
}

function buildWhyReply(scan, symbol) {
  const row = findRowForSymbol(scan, symbol);
  if (!row) return `I could not find ${String(symbol || "").toUpperCase()} in the latest ADOL22 scan. Try /scan first.`;
  const action = buildDeepDiveAction(row);
  const reasons = [
    `Bull / Bear / Final: ${Math.round(Number(row.bullScore || 0))} / ${Math.round(Number(row.bearScore || 0))} / ${Math.round(Number(row.finalAiScore || 0))}`,
    `RVOL: ${Number(row.rvol || 0).toFixed(2)}`,
    `VWAP: ${Number(row.price || 0) >= Number(row.vwap || 0) ? "Above VWAP" : "Below VWAP"}`,
    `EMA Stack: ${Number(row.ema9 || 0) > Number(row.ema21 || 0) && Number(row.ema21 || 0) > Number(row.ema200 || 0) ? "Bullish" : Number(row.ema9 || 0) < Number(row.ema21 || 0) && Number(row.ema21 || 0) < Number(row.ema200 || 0) ? "Bearish" : "Mixed"}`,
    `Heat Risk: ${classifyHeatRiskForTelegram(row)}`,
    `Reason: ${String(row.reason || row.setupType || row.trend || "No note")}`
  ];
  return [
    `🧠 ADOL22 Why — ${row.ticker}`,
    `Session: ${scan.session}`,
    `Action: ${action}`,
    "",
    ...reasons,
    "",
    `AI Read: ${action.includes("ENTER") || action.includes("SHORT") ? "Setup is actionable if price respects the trigger and market conditions stay aligned." : "The structure is not clean enough yet. Wait for stronger confirmation before acting."}`
  ].join("\n");
}

function buildPlanReply(scan, symbol) {
  const row = findRowForSymbol(scan, symbol);
  if (!row) return `I could not find ${String(symbol || "").toUpperCase()} in the latest ADOL22 scan. Try /scan first.`;
  const entry = Number(row.entry || row.price || 0);
  const stop = Number(row.stop || 0);
  const t1 = Number(row.t1 || 0);
  const t2 = Number(row.t2 || 0);
  const riskPerShare = entry && stop ? Math.abs(entry - stop) : 0;
  const rr1 = riskPerShare > 0 && t1 ? Math.abs((t1 - entry) / riskPerShare) : 0;
  const rr2 = riskPerShare > 0 && t2 ? Math.abs((t2 - entry) / riskPerShare) : 0;
  const action = buildDeepDiveAction(row);
  const invalidation = Number(row.price || 0) >= Number(row.vwap || 0)
    ? `Invalid if price loses VWAP ${formatTickerPrice(row.vwap || 0)} and momentum stalls.`
    : `Invalid if price reclaims VWAP ${formatTickerPrice(row.vwap || 0)} and sellers lose control.`;
  return [
    `📋 ADOL22 Trade Plan — ${row.ticker}`,
    `Session: ${scan.session}`,
    `Action: ${action}`,
    `Setup: ${String(row.setupType || row.trend || "Mixed")}`,
    "",
    `Entry Zone: ${formatTickerPrice(entry)}`,
    `Stop: ${formatTickerPrice(stop)}`,
    `Target 1: ${formatTickerPrice(t1)}`,
    `Target 2: ${formatTickerPrice(t2)}`,
    `Target 3: ${formatTickerPrice(row.t3 || 0)}`,
    `R/R to T1/T2: ${rr1 > 0 ? rr1.toFixed(2) : "N/A"}R / ${rr2 > 0 ? rr2.toFixed(2) : "N/A"}R`,
    "",
    `Execution: ${String(row.reason || "Wait for clean confirmation at the level.").trim()}`,
    invalidation
  ].join("\n");
}

function buildCotReply(scan) {
  const summary = scan?.summary || {};
  const bulls = Number(summary.bulls || 0);
  const bears = Number(summary.bears || 0);
  const bias = bulls > bears ? "Bullish positioning" : bears > bulls ? "Bearish positioning" : "Balanced positioning";
  const conviction = Math.abs(bulls - bears) >= 20 ? "Strong" : Math.abs(bulls - bears) >= 8 ? "Moderate" : "Mixed";
  const topBull = (Array.isArray(scan?.rankings?.topBullishMovers) ? scan.rankings.topBullishMovers : []).slice(0, 5);
  const topBear = (Array.isArray(scan?.rankings?.topBearishMovers) ? scan.rankings.topBearishMovers : []).slice(0, 5);
  return [
    "🟣 ADOL22 COT Data",
    `Session: ${scan.session}`,
    `Bias: ${bias}`,
    `Conviction: ${conviction}`,
    `Bulls / Bears: ${bulls} / ${bears}`,
    "",
    "Bullish Leadership",
    ...(topBull.length ? topBull.map(buildTelegramRowLine) : ["- None"]),
    "",
    "Bearish Leadership",
    ...(topBear.length ? topBear.map(buildTelegramRowLine) : ["- None"])
  ].join("\n");
}

function buildInstitutionalReply(scan) {
  const summary = scan?.report?.institutionalModeSummary || {};
  const rows = Array.isArray(scan?.rows) ? scan.rows : [];
  const leaders = [...rows].sort((a, b) => Number(b?.institutionalScore || 0) - Number(a?.institutionalScore || 0)).slice(0, 5);
  return [
    "🏦 ADOL22 Institutional Mode",
    `Session: ${scan.session}`,
    `Market Bias: ${scan.marketBias}`,
    "",
    "Leaders",
    ...(leaders.length
      ? leaders.map((row, i) => `${i + 1}. ${row.ticker} | Institutional ${Math.round(Number(row.institutionalScore || 0))} | ${row.setupType || row.trend || "Setup"}`)
      : ["- None"]),
    "",
    `Buyers In Control: ${(summary.buyersInControl || []).slice(0, 6).join(", ") || "-"}`,
    `Sellers In Control: ${(summary.sellersInControl || []).slice(0, 6).join(", ") || "-"}`,
    `Liquidity Grabs: ${(summary.liquidityGrabsDetected || []).slice(0, 6).join(", ") || "-"}`,
    `Bull Traps: ${(summary.bullTrapsDetected || []).slice(0, 6).join(", ") || "-"}`,
    `Bear Traps: ${(summary.bearTrapsDetected || []).slice(0, 6).join(", ") || "-"}`,
    `Best A+ Institutional Setup: ${summary.bestAPlusInstitutionalSetup || "N/A"}`
  ].join("\n");
}

function buildSocialReply(scan) {
  const leaders = Array.isArray(scan?.report?.socialLeaders) ? scan.report.socialLeaders.slice(0, 5) : [];
  const quiet = Array.isArray(scan?.report?.strongChartLowAttention) ? scan.report.strongChartLowAttention.slice(0, 5) : [];
  const hype = Array.isArray(scan?.report?.hypeWeakChart) ? scan.report.hypeWeakChart.slice(0, 5) : [];
  return [
    "🟡 ADOL22 Social Sentiment",
    `Session: ${scan.session}`,
    `Market Bias: ${scan.marketBias}`,
    "",
    "Leaders",
    ...(leaders.length
      ? leaders.map((row, i) => `${i + 1}. ${row.ticker} | Social ${Math.round(Number(row.social || row.socialSentimentScore || 0))}`)
      : ["- None"]),
    "",
    "Quiet Strength",
    ...(quiet.length
      ? quiet.map((row, i) => `${i + 1}. ${row.ticker} | Final ${Math.round(Number(row.finalAiScore || 0))} | Social ${Math.round(Number(row.socialSentimentScore || 0))}`)
      : ["- None"]),
    "",
    "Hype Traps",
    ...(hype.length
      ? hype.map((row, i) => `${i + 1}. ${row.ticker} | Final ${Math.round(Number(row.finalAiScore || 0))} | Social ${Math.round(Number(row.socialSentimentScore || 0))}`)
      : ["- None"])
  ].join("\n");
}

function buildNewsReply(scan) {
  const upgrades = Array.isArray(scan?.bigNews?.upgrades) ? scan.bigNews.upgrades.slice(0, 5) : [];
  const downgrades = Array.isArray(scan?.bigNews?.downgrades) ? scan.bigNews.downgrades.slice(0, 5) : [];
  return [
    "📰 ADOL22 Big News + Analyst Calls",
    `Session: ${scan.session}`,
    "",
    "🟢 Upgrades",
    ...(upgrades.length
      ? upgrades.map((row, i) => `${i + 1}. ${row.ticker} | ${row.headline}`)
      : ["- None"]),
    "",
    "🔴 Downgrades",
    ...(downgrades.length
      ? downgrades.map((row, i) => `${i + 1}. ${row.ticker} | ${row.headline}`)
      : ["- None"])
  ].join("\n");
}

function buildEarningsReply(scan) {
  const rows = Array.isArray(scan?.rows) ? scan.rows : [];
  const candidates = [...rows]
    .sort((a, b) => Number(b.finalAiScore || 0) - Number(a.finalAiScore || 0))
    .slice(0, 8);
  return [
    "📅 ADOL22 Earnings / Estimate Snapshot",
    `Session: ${scan.session}`,
    "",
    ...(candidates.length
      ? candidates.map((row, i) => `${i + 1}. ${row.ticker} | Final ${Math.round(Number(row.finalAiScore || 0))} | Bull ${Math.round(Number(row.bullScore || 0))} | Bear ${Math.round(Number(row.bearScore || 0))} | Earnings: Use /technical ${row.ticker}`)
      : ["- No names available"]),
    "",
    "Tip: send /technical TICKER for the full earnings / estimate / whisper row."
  ].join("\n");
}

function buildRiskReply(scan) {
  const summary = scan?.summary || {};
  const riskOff = isRiskOffScan(scan);
  const rows = Array.isArray(scan?.rows) ? scan.rows : [];
  const vwapTriggers = rows.filter((row) => rowHasVwapTrigger(row)).length;
  const liquidityTriggers = rows.filter((row) => rowHasLiquidityTrigger(row)).length;
  const strictCount = rows.filter((row) => isStrictHighQualityCandidate(row, scan)).length;
  return [
    "🛡️ ADOL22 Risk Manager",
    `Session: ${scan.session}`,
    `Market Bias: ${scan.marketBias}`,
    `Risk Mode: ${riskOff ? "RISK-OFF / DEFENSIVE" : "RISK-ON / SELECTIVE"}`,
    `Trade / Wait / Avoid: ${summary.trade || 0} / ${summary.wait || 0} / ${summary.avoid || 0}`,
    `VWAP reclaim/loss triggers: ${vwapTriggers}`,
    `Liquidity sweep/reclaim triggers: ${liquidityTriggers}`,
    `Strict A+ candidates: ${strictCount}`,
    riskOff
      ? "Warning: Risk-off conditions are active. Focus on only the cleanest setups or reduce size."
      : "Warning: No major risk-off warning. Stay selective and avoid chasing weak RVOL names."
  ].join("\n");
}

function buildAlertCenterReply(scan) {
  const summary = scan?.summary || {};
  const rows = Array.isArray(scan?.rows) ? scan.rows : [];
  const strict = rows.filter((row) => isStrictHighQualityCandidate(row, scan)).slice(0, 5);
  const vwapTriggers = rows.filter((row) => rowHasVwapTrigger(row)).length;
  const liquidityTriggers = rows.filter((row) => rowHasLiquidityTrigger(row)).length;
  return [
    "🚨 ADOL22 Alert Center",
    `Session: ${scan.session}`,
    `Market Bias: ${scan.marketBias}`,
    `Important setups now: ${strict.length}`,
    `Trade / Wait / Avoid: ${summary.trade || 0} / ${summary.wait || 0} / ${summary.avoid || 0}`,
    `VWAP reclaim/loss triggers: ${vwapTriggers}`,
    `Liquidity sweep/reclaim triggers: ${liquidityTriggers}`,
    "",
    ...(strict.length ? strict.map(buildTelegramStrictLine) : ["No strict alert-center setups right now."]),
    "",
    "Triggers used: A+ score, RVOL spike, VWAP reclaim/loss, liquidity sweep, risk-off warning."
  ].join("\n");
}

function buildCommandCenterReply(note = "") {
  const cfg = ADOL_COMMAND_CENTER_CFG || defaultAdolCommandCenterConfig();
  const status = adolEngine.getStatus?.() || {};
  const modePatch = getModeSettingPatch(cfg.mode);
  const lines = [
    "🎛️ ADOL22 Command Center",
    `Auto Scan: ${cfg.autoScanEnabled ? "ON" : "OFF"}`,
    `Mode: ${cfg.mode.toUpperCase()}`,
    `Watchlist: ${cfg.watchlist.length ? cfg.watchlist.join(", ") : "None"}`,
    `Risk Per Trade: ${formatTickerPrice(cfg.riskPerTrade || 100)}`,
    `Daily Max Loss: ${String(cfg.dailyMaxLossR ?? -2)}R`,
    `Trade Score Threshold: ${modePatch.minTradeScore}`,
    `RVOL Threshold: ${modePatch.minRvolTrade}`,
    `Max Spread %: ${modePatch.maxSpreadPct}`,
    `Scheduler Active: ${status?.scheduler?.enabled ? "YES" : "NO"}`
  ];
  if (note) {
    lines.push("", note);
  }
  return lines.join("\n");
}

function updateAdolCommandCenter(patch = {}) {
  const next = {
    ...defaultAdolCommandCenterConfig(),
    ...ADOL_COMMAND_CENTER_CFG,
    ...patch
  };
  if (patch.mode) next.mode = normalizeAdolMode(patch.mode);
  if (patch.watchlist) next.watchlist = adolUniqSymbols(patch.watchlist);
  if (typeof patch.autoScanEnabled === "boolean") next.autoScanEnabled = patch.autoScanEnabled;
  if (Number.isFinite(Number(patch.riskPerTrade))) next.riskPerTrade = Number(patch.riskPerTrade);
  if (Number.isFinite(Number(patch.dailyMaxLossR))) next.dailyMaxLossR = Number(patch.dailyMaxLossR);
  return applyAdolCommandCenterConfig(next);
}

function buildWatchlistReply(scan) {
  const configured = Array.isArray(ADOL_COMMAND_CENTER_CFG?.watchlist) ? ADOL_COMMAND_CENTER_CFG.watchlist : [];
  const rows = Array.isArray(scan?.rows) ? scan.rows : [];
  const watchRows = rows
    .filter((row) => configured.length ? configured.includes(String(row?.ticker || "").toUpperCase()) : true)
    .sort((a, b) => Number(b.finalAiScore || 0) - Number(a.finalAiScore || 0))
    .slice(0, 10);
  return [
    "👀 ADOL22 Watchlist",
    `Session: ${scan.session}`,
    `Market Bias: ${scan.marketBias}`,
    `Tracked Symbols: ${configured.length ? configured.join(", ") : "None"}`,
    "",
    ...(watchRows.length ? watchRows.map(buildTelegramRowLine) : ["No tracked watchlist names matched the latest scan."])
  ].join("\n");
}

function buildBiasReply(scan) {
  const summary = scan?.summary || {};
  return [
    `${scan.marketBias === "Bullish" ? "🟢" : scan.marketBias === "Bearish" ? "🔴" : "🟡"} ADOL22 Market Bias`,
    `Session: ${scan.session}`,
    `Market Status: ${scan.marketStatus}`,
    `Bias: ${scan.marketBias}`,
    `Trade: ${summary.trade || 0}`,
    `Wait: ${summary.wait || 0}`,
    `Avoid: ${summary.avoid || 0}`,
    `Bulls: ${summary.bulls || 0}`,
    `Bears: ${summary.bears || 0}`,
    `Last Scan: ${scan.generatedAt ? new Date(scan.generatedAt).toLocaleString("en-US", { timeZone: "America/New_York" }) : "-"}`
  ].join("\n");
}

function buildReportReply(scan) {
  const report = scan?.report || adolEngine.getReport() || {};
  const summary = scan?.summary || {};
  const topBull = Array.isArray(scan?.rankings?.topBullish) ? scan.rankings.topBullish.slice(0, 5) : [];
  const topBear = Array.isArray(scan?.rankings?.topBearish) ? scan.rankings.topBearish.slice(0, 5) : [];
  const bestNow = Array.isArray(scan?.rows)
    ? scan.rows.filter((row) => isStrictHighQualityCandidate(row, scan)).slice(0, 3)
    : [];
  const moneyFlow = Array.isArray(scan?.report?.flowLeaders) ? scan.report.flowLeaders.slice(0, 3) : [];
  const socialLeaders = Array.isArray(scan?.report?.socialLeaders) ? scan.report.socialLeaders.slice(0, 3) : [];
  const institutional = Array.isArray(scan?.rows)
    ? [...scan.rows].sort((a, b) => Number(b.institutionalScore || 0) - Number(a.institutionalScore || 0)).slice(0, 3)
    : [];
  const riskTone = report.riskTone || report.marketTone || (isRiskOffScan(scan) ? "Risk-Off" : "Risk-On / Selective");
  return [
    "📘 ADOL22 AI Market Report",
    `Session: ${scan.session}`,
    `Bias: ${scan.marketBias}`,
    `Risk Tone: ${riskTone}`,
    `Trade / Wait / Avoid: ${summary.trade || 0} / ${summary.wait || 0} / ${summary.avoid || 0}`,
    `Bulls / Bears: ${summary.bulls || 0} / ${summary.bears || 0}`,
    `Action Plan: ${report.actionPlan || report.finalActionPlan || "Stay selective and focus on clean setups."}`,
    "",
    "Best Right Now:",
    ...(bestNow.length ? bestNow.map(buildTelegramStrictLine) : ["- No strict A+ setup right now"]),
    "",
    "Top Bullish:",
    ...(topBull.length ? topBull.map(buildTelegramRowLine) : ["- None"]),
    "",
    "Top Bearish:",
    ...(topBear.length ? topBear.map(buildTelegramRowLine) : ["- None"]),
    "",
    "Institutional Leaders:",
    ...(institutional.length ? institutional.map((row, i) => `${i + 1}. ${row.ticker} | Institutional ${Math.round(Number(row.institutionalScore || 0))} | ${row.setupType || row.trend || "Setup"}`) : ["- None"]),
    "",
    "Money Flow:",
    ...(moneyFlow.length ? moneyFlow.map((row, i) => `${i + 1}. ${row.sector || row.label || row.ticker || "Flow"} | ${row.direction || row.flow || "In Play"}`) : ["- Mixed / no standout rotation"]),
    "",
    "Social / Attention Leaders:",
    ...(socialLeaders.length ? socialLeaders.map((row, i) => `${i + 1}. ${row.ticker} | Social ${Math.round(Number(row.social || row.socialSentimentScore || 0))} | Final ${Math.round(Number(row.finalAiScore || 0))}`) : ["- None"]),
    "",
    `Desk Read: ${isRiskOffScan(scan) ? "Defense first. Only take clean high-RVOL confirmations." : "Selective offense. Favor aligned trend + VWAP + liquidity setups."}`
  ].join("\n");
}

function buildDecisionReply(scan, symbol) {
  const row = findRowForSymbol(scan, symbol);
  const target = String(symbol || "").trim().toUpperCase();
  if (!row) return `I could not find ${target} in the latest ADOL22 scan. Try /scan first or use /ticker ${target}.`;
  const price = Number(row.price || 0);
  const vwap = Number(row.vwap || 0);
  const bull = Math.round(Number(row.bullScore || 0));
  const bear = Math.round(Number(row.bearScore || 0));
  const finalAi = Math.round(Number(row.finalAiScore || 0));
  const rvol = Number(row.rvol || 0);
  const aboveVwap = price >= vwap;
  const bullishStack = Number(row.ema9 || 0) > Number(row.ema21 || 0) && Number(row.ema21 || 0) > Number(row.ema200 || 0);
  const bearishStack = Number(row.ema9 || 0) < Number(row.ema21 || 0) && Number(row.ema21 || 0) < Number(row.ema200 || 0);
  const riskOff = isRiskOffScan(scan);
  let verdict = "WAIT";
  let reason = "Setup is not clean enough yet.";
  if (bull >= 70 && rvol >= 2 && aboveVwap && bullishStack && !riskOff) {
    verdict = "BUY";
    reason = "Bull score, VWAP, EMA stack, and RVOL are all aligned for a higher-quality long setup.";
  } else if (bear >= 70 && rvol >= 2 && !aboveVwap && bearishStack) {
    verdict = "SELL / SHORT";
    reason = "Bear score, VWAP loss, EMA stack, and RVOL are aligned for a higher-quality short setup.";
  } else if (finalAi < 55 || (riskOff && bull > bear && rvol < 2)) {
    verdict = "AVOID";
    reason = "Conviction is weak or the market regime is not supportive enough for this setup.";
  } else if (bull > bear) {
    verdict = "WAIT FOR PULLBACK";
    reason = "Bias leans bullish, but confirmation is still incomplete or participation is too weak.";
  } else if (bear > bull) {
    verdict = "WAIT / WEAK SHORT";
    reason = "Bias leans bearish, but this is not a clean high-conviction short trigger yet.";
  }

  return [
    `🎯 ${target} Buy or Sell`,
    `Session: ${scan.session}`,
    `Verdict: ${verdict}`,
    `Bias: ${bull >= bear ? "Bullish" : "Bearish"}`,
    `Bull / Bear / Final: ${bull} / ${bear} / ${finalAi}`,
    `RVOL: ${rvol.toFixed(2)}`,
    `VWAP: ${aboveVwap ? "Above VWAP" : "Below VWAP"}`,
    `EMA Trend: ${bullishStack ? "Bullish stack" : bearishStack ? "Bearish stack" : "Mixed stack"}`,
    `Entry: ${formatTickerPrice(row.entry || row.price || 0)}`,
    `Stop: ${formatTickerPrice(row.stop || 0)}`,
    `Targets: ${formatTickerPrice(row.t1 || 0)} / ${formatTickerPrice(row.t2 || 0)} / ${formatTickerPrice(row.t3 || 0)}`,
    `Reason: ${reason}`
  ].join("\n");
}

async function buildTelegramChatReply(text) {
  const raw = String(text || "").trim();
  const lower = raw.toLowerCase();
  if (!raw) return buildTelegramHelpText();
  if (/^\/main\b/.test(lower)) return "⬅️ Main keyboard ready. Use the buttons below.";
  if (/^\/more\b/.test(lower)) return "➡️ More tools keyboard ready. Use the buttons below.";
  if (/^\/tickers\b/.test(lower)) return "🎯 Favorite ticker keyboard ready. Use the buttons below.";
  if (/^\/intel\b/.test(lower)) return "🧠 News / earnings / liquidity keyboard ready. Use the buttons below.";
  if (/^\/market\b|^\/mkt\b/.test(lower)) return "🕘 Session keyboard ready. Pick Premarket, Regular, or After Hours.";
  if (/^\/sectors\b|^\/sec\b/.test(lower)) return "🏭 Sector keyboard ready. Pick the pocket you want to drill into.";
  if (/^\/command\b|^\/cmd\b/.test(lower)) return buildCommandCenterReply("Use the command-center buttons below.");
  if (/^\/alerts\b/.test(lower)) {
    const scan = await ensureAdolScanForTelegram(false);
    if (!scan?.ok) return "Alert Center is not ready right now. Try /scan in a minute.";
    return buildAlertCenterReply(scan);
  }
  if (/^\/assistant\b/.test(lower)) return "🤖 AI Assistant keyboard ready. Use /analyze, /technical, or the ticker shortcuts below.";
  if (/^\/?(start|help)\b/.test(lower)) return buildTelegramHelpText();

  if (/^\/startscan\b|^\/on\b/.test(lower)) {
    updateAdolCommandCenter({ autoScanEnabled: true });
    return buildCommandCenterReply("✅ Auto scan enabled. Scheduled scans and alerts are live.");
  }

  if (/^\/stopscan\b|^\/off\b/.test(lower)) {
    updateAdolCommandCenter({ autoScanEnabled: false });
    return buildCommandCenterReply("🛑 Auto scan disabled. Manual /scan still works.");
  }

  if (/^\/mode\b/.test(lower)) {
    const match = lower.match(/^\/mode\s+(conservative|balanced|aggressive|c|b|a)\b/);
    if (!match) {
      return "Use /mode conservative, /mode balanced, or /mode aggressive.";
    }
    const alias = String(match[1] || "").toLowerCase();
    const mode = normalizeAdolMode(alias === "c" ? "conservative" : alias === "b" ? "balanced" : alias === "a" ? "aggressive" : alias);
    updateAdolCommandCenter({ mode });
    return buildCommandCenterReply(`✅ Mode switched to ${mode.toUpperCase()}.`);
  }

  if (/^\/setrisk\b/.test(lower)) {
    const match = raw.match(/^\/setrisk\s+(-?\d+(?:\.\d+)?)\b/i);
    if (!match) return "Use /setrisk 150";
    const riskPerTrade = Number(match[1]);
    if (!Number.isFinite(riskPerTrade) || riskPerTrade <= 0) return "Risk per trade must be a positive number.";
    updateAdolCommandCenter({ riskPerTrade });
    return buildCommandCenterReply(`✅ Risk per trade set to ${formatTickerPrice(riskPerTrade)}.`);
  }

  if (/^\/setmaxloss\b/.test(lower)) {
    const match = raw.match(/^\/setmaxloss\s+(-?\d+(?:\.\d+)?)\b/i);
    if (!match) return "Use /setmaxloss -2";
    const dailyMaxLossR = Number(match[1]);
    if (!Number.isFinite(dailyMaxLossR)) return "Daily max loss must be a number, like /setmaxloss -2";
    updateAdolCommandCenter({ dailyMaxLossR });
    return buildCommandCenterReply(`✅ Daily max loss set to ${dailyMaxLossR}R.`);
  }

  if (/^\/watchlist\s+clear\b|^\/wl\s+clear\b/.test(lower)) {
    updateAdolCommandCenter({ watchlist: [] });
    return buildCommandCenterReply("🧹 Watchlist cleared.");
  }

  if (/^\/(?:watchlist|wl)\s+(add|remove|rem)\b/.test(lower)) {
    const current = Array.isArray(ADOL_COMMAND_CENTER_CFG?.watchlist) ? ADOL_COMMAND_CENTER_CFG.watchlist : [];
    const operation = /\/(?:watchlist|wl)\s+add\b/.test(lower) ? "add" : "remove";
    const items = extractSymbolsFromText(raw);
    if (!items.length) {
      return `Use /watchlist ${operation} AMD NVDA TSLA`;
    }
    const nextWatchlist = operation === "add"
      ? adolUniqSymbols([...current, ...items])
      : current.filter((symbol) => !items.includes(String(symbol).toUpperCase()));
    updateAdolCommandCenter({ watchlist: nextWatchlist });
    return buildCommandCenterReply(
      operation === "add"
        ? `✅ Added: ${items.join(", ")}`
        : `🗑️ Removed: ${items.join(", ")}`
    );
  }

  const forceFresh = /^\/scan\b|fresh scan|refresh scan|run scan/.test(lower);
  const scan = await ensureAdolScanForTelegram(forceFresh);
  if (!scan?.ok) {
    return `ADOL22 scan is not ready right now.\n${scan?.error ? `Error: ${scan.error}` : "Try again in a minute."}`;
  }

  const symbols = extractSymbolsFromText(raw);
  if (/^\/compare\b|^\/cmp\b/.test(lower)) {
    const items = extractSymbolsFromText(raw);
    if (items.length < 2) return "Use /compare AMD NVDA";
    return buildCompareReply(scan, items[0], items[1]);
  }

  if ((/buy or sell|should i buy|should i sell|buy now or wait|sell now or wait/.test(lower)) && symbols.length) {
    return buildDecisionReply(scan, symbols[0]);
  }

  if (/^\/plan\b/.test(lower)) {
    const items = extractSymbolsFromText(raw);
    if (!items.length) return "Use /plan TSLA";
    return buildPlanReply(scan, items[0]);
  }

  if (/^\/levels\b|^\/lvls\b/.test(lower)) {
    const items = extractSymbolsFromText(raw);
    if (!items.length) return "Use /levels TSLA";
    return buildLevelsReply(scan, items[0]);
  }

  if (/^\/why\b/.test(lower)) {
    const items = extractSymbolsFromText(raw);
    if (!items.length) return "Use /why TSLA";
    return buildWhyReply(scan, items[0]);
  }

  if (/^\/size\b/.test(lower)) {
    const items = extractSymbolsFromText(raw);
    if (!items.length) return "Use /size TSLA";
    return buildSizeReply(scan, items[0]);
  }

  if (/^\/technical\b|^\/tech\b|technical on|technical map|deep dive/.test(lower) && symbols.length) {
    const target = symbols[0];
    const row = Array.isArray(scan.rows) ? scan.rows.find((item) => String(item.ticker || "").toUpperCase() === target) : null;
    return await buildTechnicalTickerReply(scan, target, row);
  }

  if (/^\/ticker\b|^\/t\b/.test(lower) || (/^[A-Z]{1,5}(?:\.[A-Z])?$/i.test(raw) && symbols.length === 1)) {
    const target = symbols[0];
    const row = Array.isArray(scan.rows) ? scan.rows.find((item) => String(item.ticker || "").toUpperCase() === target) : null;
    return await buildSingleTickerReply(scan, target, row);
  }

  if (/^\/watch\b|^\/w\b|watchlist/.test(lower) && symbols.length) {
    return [
      `👀 Watchlist Snapshot: ${symbols.join(", ")}`,
      "",
      buildBuyReply(scan, symbols),
      "",
      buildSellReply(scan, symbols)
    ].join("\n");
  }

  if (/^\/analyze\b|^\/an\b/.test(lower) && symbols.length) {
    const target = symbols[0];
    const row = Array.isArray(scan.rows) ? scan.rows.find((item) => String(item.ticker || "").toUpperCase() === target) : null;
    return await buildTechnicalTickerReply(scan, target, row);
  }

  if (/^\/search\b/.test(lower)) {
    const query = raw.replace(/^\/search\b/i, "").trim();
    if (symbols.length === 1 && query.toUpperCase() === symbols[0]) {
      const target = symbols[0];
      const row = Array.isArray(scan.rows) ? scan.rows.find((item) => String(item.ticker || "").toUpperCase() === target) : null;
      return await buildTechnicalTickerReply(scan, target, row);
    }
    return buildSearchReply(scan, query);
  }

  if (/^\/top\b|strict setups?|a\+ setups?/.test(lower)) return buildTopReply(scan);
  if (/^\/bestnow\b|^\/best\b|highest conviction|best now/.test(lower)) return buildBestNowReply(scan);
  if (/^\/buy\b|what stocks.*buy|buy now|top longs?|best buys?/.test(lower)) return buildBuyReply(scan, symbols);
  if (/^\/sell\b|^\/short\b|what stocks.*short|top shorts?|best shorts?/.test(lower)) return buildSellReply(scan, symbols);
  if (/^\/wait\b|wait setups?|pullback setups?|watch only/.test(lower)) return buildWaitReply(scan, symbols);
  if (/^\/macro\b|^\/regime\b|macro read|market regime/.test(lower)) return buildMacroReply(scan);
  if (/^\/risk\b|risk manager|risk off|risk-on/.test(lower)) return buildRiskReply(scan);
  if (/^\/watchlist\b/.test(lower)) return buildWatchlistReply(scan);
  if (/^\/topbuy\b|top buy|top buys/.test(lower)) return buildTopBuyReply(scan);
  if (/^\/topsell\b|top sell|top sells/.test(lower)) return buildTopSellReply(scan);
  if (/^\/top10buy\b|top 10 buy|top10 buy/.test(lower)) return buildTop10BuyReply(scan);
  if (/^\/top10sell\b|top 10 sell|top10 sell/.test(lower)) return buildTop10SellReply(scan);
  if (/^\/top10\b|top 10|top10/.test(lower)) return buildTop10Reply(scan);
  if (/^\/top5\b|top 5|top5|best setup/.test(lower)) return buildTop5Reply(scan);
  if (/^\/movers\b|top movers|movers now/.test(lower)) return buildMoversReply(scan);
  if (/^\/flow\b|^\/liq\b|money flow|where.*money/.test(lower)) return buildFlowReply(scan);
  if (/^\/liquidity\b|^\/liq\b|liquidity map/.test(lower)) return buildFlowReply(scan);
  if (/^\/semis\b|semiconductors?/.test(lower)) return buildSectorFocusReply(scan, "Semiconductors", ["semi", "semiconductor", "chip"]);
  if (/^\/tech\b|technology\b|software\b/.test(lower)) return buildSectorFocusReply(scan, "Technology", ["technology", "software", "internet", "cloud"]);
  if (/^\/energy\b|oil\b|gas\b/.test(lower)) return buildSectorFocusReply(scan, "Energy", ["energy", "oil", "gas", "exploration"]);
  if (/^\/financials\b|^\/fin\b|banks?\b|finance\b/.test(lower)) return buildSectorFocusReply(scan, "Financials", ["financial", "bank", "capital markets", "insurance"]);
  if (/^\/consumer\b|^\/cons\b|retail\b/.test(lower)) return buildSectorFocusReply(scan, "Consumer", ["consumer", "retail", "apparel", "restaurant", "auto"]);
  if (/^\/healthcare\b|^\/health\b|health care\b|biotech\b|pharma\b/.test(lower)) return buildSectorFocusReply(scan, "Healthcare", ["health", "biotech", "pharma", "medical"]);
  if (/^\/premarket\b|^\/pre\b/.test(lower)) return buildSessionPlaybookReply(scan, "premarket");
  if (/^\/premarketplan\b/.test(lower)) return buildSessionPlaybookReply(scan, "premarket");
  if (/^\/regular\b|^\/reg\b|regular market/.test(lower)) return buildSessionPlaybookReply(scan, "regular");
  if (/^\/middaycheck\b/.test(lower)) return buildSessionPlaybookReply(scan, "regular");
  if (/^\/afterhours\b|^\/ah\b|after hours/.test(lower)) return buildSessionPlaybookReply(scan, "afterhours");
  if (/^\/closeplan\b/.test(lower)) return buildSessionPlaybookReply(scan, "afterhours");
  if (/^\/cot\b|cot data|positioning/.test(lower)) return buildCotReply(scan);
  if (/^\/institutional\b|^\/inst\b|institutional mode/.test(lower)) return buildInstitutionalReply(scan);
  if (/^\/social\b|^\/soc\b|social sentiment/.test(lower)) return buildSocialReply(scan);
  if (/^\/news\b|big news|upgrade|downgrade|analyst/.test(lower)) return buildNewsReply(scan);
  if (/^\/earnings\b|^\/earn\b|earnings|estimate|whisper/.test(lower)) return buildEarningsReply(scan);
  if (/^\/bias\b|market bias|market status/.test(lower)) return buildBiasReply(scan);
  if (/^\/report\b|^\/rep\b|ai market report|report/.test(lower)) return buildReportReply(scan);
  if (/^\/scan\b/.test(lower)) return `✅ Fresh scan complete\n\n${buildBiasReply(scan)}`;

  if (!raw.startsWith("/")) {
    if (symbols.length === 1) {
      const target = symbols[0];
      const row = Array.isArray(scan.rows) ? scan.rows.find((item) => String(item.ticker || "").toUpperCase() === target) : null;
      return await buildTechnicalTickerReply(scan, target, row);
    }
    return buildSearchReply(scan, raw);
  }

  return [
    "I can help with ADOL22 commands.",
    "",
    buildTelegramHelpText()
  ].join("\n");
}

function getTelegramUpdateMessage(update) {
  const msg = update?.message || update?.edited_message || null;
  if (!msg || msg?.from?.is_bot) return null;
  const text = String(msg.text || "").trim();
  if (!text) return null;
  return {
    updateId: Number(update?.update_id || 0),
    chatId: String(msg?.chat?.id || "").trim(),
    messageId: Number(msg?.message_id || 0),
    text,
    firstName: String(msg?.from?.first_name || "").trim()
  };
}

async function fetchTelegramUpdates(token, offset = 0) {
  const url = `https://api.telegram.org/bot${encodeURIComponent(token)}/getUpdates`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      offset,
      timeout: 0,
      allowed_updates: ["message", "edited_message"]
    })
  });
  const payload = await response.json().catch(() => ({}));
  return {
    ok: response.ok && payload?.ok === true,
    statusCode: response.status,
    payload
  };
}

async function processTelegramUpdate(update) {
  const message = getTelegramUpdateMessage(update);
  if (!message) return;
  const creds = resolveTelegramCredentials();
  if (!creds.token || !creds.chatId) return;
  if (message.chatId !== String(creds.chatId)) return;
  const reply = await buildTelegramChatReply(message.text);
  if (!reply) return;
  const page = /^\/more\b/i.test(String(message.text || "").trim())
    ? "more"
    : /^\/command\b|^\/cmd\b|^\/startscan\b|^\/stopscan\b|^\/on\b|^\/off\b|^\/mode\b|^\/watchlist\b|^\/wl\b|^\/setrisk\b|^\/setmaxloss\b/i.test(String(message.text || "").trim())
      ? "command"
    : /^\/market\b|^\/mkt\b|^\/premarket\b|^\/pre\b|^\/regular\b|^\/reg\b|^\/afterhours\b|^\/ah\b|^\/premarketplan\b|^\/middaycheck\b|^\/closeplan\b|^\/macro\b|^\/regime\b/i.test(String(message.text || "").trim())
      ? "market"
    : /^\/sectors\b|^\/sec\b|^\/semis\b|^\/tech\b|^\/energy\b|^\/financials\b|^\/fin\b|^\/consumer\b|^\/cons\b|^\/healthcare\b|^\/health\b/i.test(String(message.text || "").trim())
      ? "sectors"
    : /^\/alerts\b|^\/top\b|^\/bestnow\b|^\/best\b|^\/buy\b|^\/sell\b|^\/topbuy\b|^\/topsell\b|^\/top10\b|^\/top10buy\b|^\/top10sell\b/i.test(String(message.text || "").trim())
      ? "alerts"
    : /^\/assistant\b|^\/analyze\b|^\/an\b|^\/compare\b|^\/cmp\b|^\/size\b|^\/plan\b|^\/levels\b|^\/lvls\b|^\/why\b/i.test(String(message.text || "").trim())
      ? "assistant"
    : /^\/main\b/i.test(String(message.text || "").trim())
      ? "main"
      : /^\/tickers\b/i.test(String(message.text || "").trim())
        ? "tickers"
      : /^\/intel\b/i.test(String(message.text || "").trim())
        ? "intel"
      : /^(\/flow|\/liquidity|\/liq|\/cot|\/institutional|\/inst|\/social|\/soc|\/news|\/earnings|\/earn|\/technical|\/tech|\/ticker|\/t|\/watch|\/w|\/rep|\/report)\b/i.test(String(message.text || "").trim())
        ? "more"
        : /^(\/wait)\b/i.test(String(message.text || "").trim())
          ? "main"
        : "main";
  await sendTelegramMessage(
    creds.token,
    message.chatId,
    reply,
    { reply_markup: buildTelegramQuickKeyboard(page) }
  );
}

async function primeTelegramPolling() {
  const creds = resolveTelegramCredentials();
  if (!creds.token) return;
  const snapshot = await fetchTelegramUpdates(creds.token, 0);
  if (!snapshot.ok) {
    TELEGRAM_POLL_LAST_ERROR = String(snapshot?.payload?.description || `HTTP ${snapshot.statusCode}`);
    return;
  }
  const rows = Array.isArray(snapshot?.payload?.result) ? snapshot.payload.result : [];
  if (rows.length) {
    TELEGRAM_POLL_OFFSET = Number(rows[rows.length - 1]?.update_id || 0) + 1;
  }
  TELEGRAM_POLL_LAST_AT = new Date().toISOString();
  TELEGRAM_POLL_LAST_ERROR = "";
}

async function pollTelegramUpdatesOnce() {
  if (TELEGRAM_POLL_BUSY) return;
  const creds = resolveTelegramCredentials();
  if (!creds.token || !creds.chatId) return;
  TELEGRAM_POLL_BUSY = true;
  try {
    const result = await fetchTelegramUpdates(creds.token, TELEGRAM_POLL_OFFSET);
    if (!result.ok) {
      TELEGRAM_POLL_LAST_ERROR = String(result?.payload?.description || `HTTP ${result.statusCode}`);
      return;
    }
    TELEGRAM_POLL_LAST_ERROR = "";
    TELEGRAM_POLL_LAST_AT = new Date().toISOString();
    const updates = Array.isArray(result?.payload?.result) ? result.payload.result : [];
    for (const update of updates) {
      const updateId = Number(update?.update_id || 0);
      if (updateId >= TELEGRAM_POLL_OFFSET) {
        TELEGRAM_POLL_OFFSET = updateId + 1;
      }
      await processTelegramUpdate(update);
    }
  } catch (error) {
    TELEGRAM_POLL_LAST_ERROR = error?.message || String(error);
  } finally {
    TELEGRAM_POLL_BUSY = false;
  }
}

async function startTelegramPolling() {
  if (TELEGRAM_POLL_STARTED) return;
  const creds = resolveTelegramCredentials();
  if (!creds.token || !creds.chatId) return;
  TELEGRAM_POLL_STARTED = true;
  await primeTelegramPolling().catch(() => {});
  setInterval(() => {
    pollTelegramUpdatesOnce().catch(() => {});
  }, TELEGRAM_POLL_MS);
}

function loadTelegramConfigFile() {
  try {
    if (!fs.existsSync(TELEGRAM_CONFIG_FILE)) return {};
    const raw = fs.readFileSync(TELEGRAM_CONFIG_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return {
      telegram_bot_token: String(parsed?.telegram_bot_token || "").trim(),
      telegram_chat_id: String(parsed?.telegram_chat_id || "").trim()
    };
  } catch {
    return {};
  }
}

function saveTelegramConfigFile(token, chatId) {
  try {
    const payload = {
      telegram_bot_token: String(token || "").trim(),
      telegram_chat_id: String(chatId || "").trim()
    };
    fs.writeFileSync(TELEGRAM_CONFIG_FILE, JSON.stringify(payload, null, 2), "utf8");
    return true;
  } catch {
    return false;
  }
}

function loadCheapTripTelegramConfigFile() {
  try {
    if (!fs.existsSync(CHEAPTRIP_TELEGRAM_CONFIG_FILE)) return {};
    const raw = fs.readFileSync(CHEAPTRIP_TELEGRAM_CONFIG_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return {
      telegram_bot_token: String(parsed?.telegram_bot_token || "").trim(),
      telegram_chat_id: String(parsed?.telegram_chat_id || "").trim()
    };
  } catch {
    return {};
  }
}

function saveCheapTripTelegramConfigFile(token, chatId) {
  try {
    const payload = {
      telegram_bot_token: String(token || "").trim(),
      telegram_chat_id: String(chatId || "").trim()
    };
    fs.writeFileSync(CHEAPTRIP_TELEGRAM_CONFIG_FILE, JSON.stringify(payload, null, 2), "utf8");
    return true;
  } catch {
    return false;
  }
}

function resolveCheapTripTelegramCredentials() {
  const fileCfg = loadCheapTripTelegramConfigFile();
  const token = String(
    CHEAPTRIP_TELEGRAM_BOT_TOKEN ||
    fileCfg.telegram_bot_token ||
    ""
  ).trim();
  const chatId = String(
    CHEAPTRIP_TELEGRAM_CHAT_ID ||
    fileCfg.telegram_chat_id ||
    ""
  ).trim();
  return { token, chatId };
}

function loadFacebookConfigFile() {
  try {
    if (!fs.existsSync(FACEBOOK_CONFIG_FILE)) return {};
    const raw = fs.readFileSync(FACEBOOK_CONFIG_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return {
      page_id: String(parsed?.page_id || "").trim(),
      page_access_token: String(parsed?.page_access_token || "").trim()
    };
  } catch {
    return {};
  }
}

function saveFacebookConfigFile(pageId, pageAccessToken) {
  try {
    const payload = {
      page_id: String(pageId || "").trim(),
      page_access_token: String(pageAccessToken || "").trim()
    };
    fs.writeFileSync(FACEBOOK_CONFIG_FILE, JSON.stringify(payload, null, 2), "utf8");
    FACEBOOK_FILE_CFG = payload;
    return true;
  } catch {
    return false;
  }
}

function maskToken(token) {
  const t = String(token || "").trim();
  if (!t) return "";
  if (t.length <= 8) return "****";
  return `${t.slice(0, 4)}...${t.slice(-4)}`;
}

function maskPageId(pageId) {
  const p = String(pageId || "").trim();
  if (!p) return "";
  if (p.length <= 4) return "****";
  return `...${p.slice(-4)}`;
}

function resolveFacebookCredentials() {
  const fileCfg = loadFacebookConfigFile();
  const pageId = String(FACEBOOK_PAGE_ID || fileCfg.page_id || "").trim();
  const pageAccessToken = String(FACEBOOK_PAGE_ACCESS_TOKEN || fileCfg.page_access_token || "").trim();
  return { pageId, pageAccessToken };
}

function loadFacebookSchedulesFile() {
  try {
    if (!fs.existsSync(FACEBOOK_SCHEDULE_FILE)) return [];
    const raw = fs.readFileSync(FACEBOOK_SCHEDULE_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveFacebookSchedulesFile(rows) {
  try {
    fs.writeFileSync(FACEBOOK_SCHEDULE_FILE, JSON.stringify(Array.isArray(rows) ? rows : [], null, 2), "utf8");
    DEALERFLOW_FACEBOOK_SCHEDULES = Array.isArray(rows) ? rows : [];
    return true;
  } catch {
    return false;
  }
}

function makeScheduleId() {
  return `fb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function sendFacebookPagePost({ pageId, pageAccessToken, message, link }) {
  const pid = String(pageId || "").trim();
  const pat = String(pageAccessToken || "").trim();
  const msg = String(message || "").trim();
  const lnk = String(link || "").trim();
  if (!pid || !pat) return { ok: false, error: "Facebook page credentials are missing." };
  if (!msg) return { ok: false, error: "Facebook message is required." };
  const endpoint = `https://graph.facebook.com/v22.0/${encodeURIComponent(pid)}/feed`;
  const payload = new URLSearchParams();
  payload.set("message", msg);
  payload.set("access_token", pat);
  if (lnk) payload.set("link", lnk);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: payload.toString()
  });
  let bodyText = "";
  try {
    bodyText = await response.text();
  } catch {
    bodyText = "";
  }
  let body = {};
  try {
    body = bodyText ? JSON.parse(bodyText) : {};
  } catch {
    body = { raw: bodyText };
  }
  return {
    ok: response.ok && !body?.error,
    statusCode: response.status,
    body,
    postId: body?.id || ""
  };
}

async function processDealerflowFacebookSchedules() {
  if (FACEBOOK_SCHEDULER_BUSY) return;
  FACEBOOK_SCHEDULER_BUSY = true;
  try {
    const creds = resolveFacebookCredentials();
    const nowMs = Date.now();
    let changed = false;
    const rows = Array.isArray(DEALERFLOW_FACEBOOK_SCHEDULES) ? DEALERFLOW_FACEBOOK_SCHEDULES : [];
    for (const item of rows) {
      if (!item || item.status !== "scheduled") continue;
      const runAtMs = Date.parse(String(item.runAtIso || ""));
      if (!Number.isFinite(runAtMs)) {
        item.status = "failed";
        item.lastError = "Invalid runAt time.";
        item.processedAt = new Date().toISOString();
        changed = true;
        continue;
      }
      if (runAtMs > nowMs) continue;
      if (!creds.pageId || !creds.pageAccessToken) {
        item.status = "failed";
        item.lastError = "Facebook credentials not configured.";
        item.processedAt = new Date().toISOString();
        changed = true;
        continue;
      }
      const sent = await sendFacebookPagePost({
        pageId: creds.pageId,
        pageAccessToken: creds.pageAccessToken,
        message: item.message,
        link: item.link
      });
      item.processedAt = new Date().toISOString();
      if (sent.ok) {
        item.status = "sent";
        item.postId = sent.postId || "";
        item.lastError = "";
      } else {
        item.status = "failed";
        item.lastError = sent?.body?.error?.message || sent?.error || `Facebook error ${sent.statusCode || ""}`.trim();
      }
      changed = true;
    }
    if (changed) saveFacebookSchedulesFile(rows);
  } catch (error) {
    console.error("[DealerFlow Facebook Scheduler] error:", error?.message || error);
  } finally {
    FACEBOOK_SCHEDULER_BUSY = false;
  }
}

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".jsx": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

const TIMEFRAME_CONFIG = {
  "1D": { range: "6mo", interval: "1d", aggregate: 1 },
  "4H": { range: "1mo", interval: "1h", aggregate: 4 },
  "1H": { range: "1mo", interval: "1h", aggregate: 1 },
  "15M": { range: "5d", interval: "15m", aggregate: 1 }
};
const CANDLE_TIMEFRAME_CONFIG = {
  "5M": { range: "1d", interval: "5m", aggregate: 1 },
  "15M": { range: "5d", interval: "15m", aggregate: 1 },
  "1H": { range: "1mo", interval: "1h", aggregate: 1 },
  "1D": { range: "6mo", interval: "1d", aggregate: 1 },
  "1W": { range: "2y", interval: "1wk", aggregate: 1 }
};

const MACRO_SYMBOLS = {
  SPY: ["SPY"],
  QQQ: ["QQQ"],
  VIX: ["^VIX"],
  DXY: ["DX-Y.NYB", "DX=F"],
  US10Y: ["^TNX"],
  US2Y: ["^UST2Y", "^US2Y", "2YY=F"]
};
const MARKET_CAP_CACHE = new Map();
const TV_WEBHOOK_ALERTS = [];
const TV_WEBHOOK_MAX_ROWS = 160;
const SCAN_FIELD_LABELS = {
  fullName: "Full Name",
  dob: "Date of Birth",
  ssnLast4: "SSN Last 4",
  phone: "Phone",
  email: "Email",
  address: "Street Address",
  cityStateZip: "City / State / ZIP",
  employer: "Employer",
  jobTitle: "Job Title",
  monthlyIncome: "Monthly Income",
  housingPayment: "Housing Payment",
  timeAtResidence: "Time at Residence",
  timeOnJob: "Time on Job",
  vehicleInterested: "Vehicle Interested In"
};
const SCAN_FIELD_KEYS = Object.keys(SCAN_FIELD_LABELS);
const PROMPT_PRESETS = {
  market_open: ({ ticker, extraContext }) => `
Act like an institutional market analyst.

Analyze:
- ${ticker}
- SPY / QQQ / DIA trend
- VIX sentiment
- DXY
- 2-Year Yield
- Oil
- Gold
- Bitcoin
- Sector rotation
- Important macro pressure
- Earnings movers if relevant

Extra context:
${extraContext || "None provided"}

Output exactly in this structure:
1. Market Bias
2. Key Levels
3. Momentum Analysis
4. Strongest Areas
5. Weakest Areas
6. Best Trade Setup
7. Invalidation
8. A+ Score (0-100)
9. Grade (A+ / A / B / C)

Keep it sharp, short, and professional.
`,
  stock_sniper: ({ ticker, extraContext }) => `
Act like a hedge fund trader.

Analyze ${ticker} using:
- EMA 9 / 21 / 200 trend structure
- Relative strength vs SPY
- Volume behavior
- Liquidity zones
- Stop-hunt risk
- Breakout quality
- Fakeout probability
- Institutional accumulation/distribution
- Momentum quality

Extra context:
${extraContext || "None provided"}

Output exactly in this structure:
1. Bullish or Bearish
2. Entry Zone
3. Stop Loss
4. Target 1
5. Target 2
6. Why this setup works
7. Main risk
8. A+ Score (0-100)
9. Grade (A+ / A / B / C)

Be precise. No fluff.
`,
  options_flow: ({ ticker, extraContext }) => `
Act like a smart-money options trader.

Analyze ${ticker} with focus on:
- call sweeps
- put sweeps
- key strikes
- gamma pressure
- dealer positioning
- dark pool clues
- likely trap zones

Extra context:
${extraContext || "None provided"}

Output exactly in this structure:
1. Smart Money Direction
2. Bullish or Bearish
3. Key Strikes
4. Trap Zones
5. Best Trade Idea
6. Invalidation
7. A+ Score (0-100)
8. Grade (A+ / A / B / C)

Keep it trader-style.
`,
  macro_interpreter: ({ ticker, extraContext }) => `
Act like a macro intelligence analyst.

Explain what current macro conditions mean for ${ticker} and the broader market.
Focus on:
- yields
- dollar
- oil
- gold
- volatility
- sector rotation
- risk-on / risk-off sentiment

Extra context:
${extraContext || "None provided"}

Output exactly in this structure:
1. Macro Tone
2. What Helps This Market
3. What Hurts This Market
4. Bullish Case
5. Bearish Case
6. Best Positioned Sectors
7. Risk Warning
8. Institutional Read

Be direct and actionable.
`,
  sector_rotation: ({ ticker, extraContext }) => `
Act like an institutional sector strategist.

Rank sector rotation and explain where ${ticker} fits.
Focus on:
- strongest sectors
- weakest sectors
- money flow
- leadership
- laggards
- sustainability of rotation

Extra context:
${extraContext || "None provided"}

Output exactly in this structure:
1. Rotation Overview
2. Leading Sectors
3. Weak Sectors
4. Where ${ticker} Fits
5. Best Opportunity
6. Main Warning
7. Action Plan

Short and sharp.
`
};

const adolEngine = createAdolEngine({
  finnhubApiKey: FINNHUB_API_KEY,
  polygonApiKey: POLYGON_API_KEY,
  alphaVantageApiKey: ALPHA_VANTAGE_API_KEY,
  tradierApiKey: TRADIER_API_KEY,
  tradierBaseUrl: TRADIER_BASE_URL,
  xBearerToken: X_BEARER_TOKEN,
  redditClientId: REDDIT_CLIENT_ID,
  redditClientSecret: REDDIT_CLIENT_SECRET,
  redditUserAgent: REDDIT_USER_AGENT,
  stocktwitsToken: STOCKTWITS_TOKEN,
  telegramBotToken: EFFECTIVE_TELEGRAM_BOT_TOKEN,
  telegramChatId: EFFECTIVE_TELEGRAM_CHAT_ID,
  quoteFetcher: async (symbols) => {
    try {
      return await fetchMarketQuotes(symbols, {
        finnhub: FINNHUB_API_KEY,
        fmp: FMP_API_KEY,
        twelvedata: TWELVE_DATA_API_KEY,
        polygon: POLYGON_API_KEY,
        unusualWhales: UNUSUAL_WHALES_API_KEY,
        tradier: TRADIER_API_KEY
      });
    } catch {
      return [];
    }
  },
  universeFetcher: async ({ mode, limit, minPrice, minAvgVolume }) => {
    const targetLimit = Math.max(
      mode === "full_market" ? 500 : mode === "extended" ? 250 : 120,
      Number(limit || 0) || 0
    );
    if (FMP_API_KEY) {
      const params = new URLSearchParams({
        apikey: FMP_API_KEY,
        isEtf: "false",
        isActivelyTrading: "true",
        marketCapMoreThan: "300000000",
        priceMoreThan: String(Math.max(1, Number(minPrice || 5) || 5)),
        volumeMoreThan: String(Math.max(100000, Number(minAvgVolume || 1000000) || 1000000)),
        limit: String(Math.min(targetLimit, 500))
      });
      const url = `https://financialmodelingprep.com/api/v3/stock-screener?${params.toString()}`;
      const payload = await fetchJsonSafe(url);
      if (Array.isArray(payload) && payload.length) {
        return adolUniqSymbols(payload.map((row) => row?.symbol).filter(Boolean));
      }
    }
    return [];
  },
  cron,
  fallbackSP500: ADOL_FALLBACK_SP500,
  fallbackNasdaq100: ADOL_FALLBACK_NASDAQ100,
  fallbackDow30: ADOL_FALLBACK_DOW30,
  log: (line) => {
    try {
      console.log(line);
    } catch {
      // ignore log failure
    }
  }
});

function applyAdolCommandCenterConfig(config = ADOL_COMMAND_CENTER_CFG) {
  const next = {
    ...defaultAdolCommandCenterConfig(),
    ...(config || {})
  };
  ADOL_COMMAND_CENTER_CFG = {
    autoScanEnabled: next.autoScanEnabled !== false,
    mode: normalizeAdolMode(next.mode),
    watchlist: adolUniqSymbols(Array.isArray(next.watchlist) ? next.watchlist : []),
    riskPerTrade: Number.isFinite(Number(next.riskPerTrade)) ? Number(next.riskPerTrade) : defaultAdolCommandCenterConfig().riskPerTrade,
    dailyMaxLossR: Number.isFinite(Number(next.dailyMaxLossR)) ? Number(next.dailyMaxLossR) : defaultAdolCommandCenterConfig().dailyMaxLossR
  };
  adolEngine.updateSettings({
    autoScanEnabled: ADOL_COMMAND_CENTER_CFG.autoScanEnabled,
    watchlist: ADOL_COMMAND_CENTER_CFG.watchlist,
    riskPerTrade: ADOL_COMMAND_CENTER_CFG.riskPerTrade,
    dailyMaxLossR: ADOL_COMMAND_CENTER_CFG.dailyMaxLossR,
    ...getModeSettingPatch(ADOL_COMMAND_CENTER_CFG.mode)
  });
  saveAdolCommandCenterConfig(ADOL_COMMAND_CENTER_CFG);
  return ADOL_COMMAND_CENTER_CFG;
}

applyAdolCommandCenterConfig(ADOL_COMMAND_CENTER_CFG);

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url, `http://${req.headers.host}`);

    if (requestUrl.pathname === "/api/health") {
      return writeJson(res, 200, {
        ok: true,
        version: "market-v2",
        providers: {
          finnhub: Boolean(FINNHUB_API_KEY),
          fmp: Boolean(FMP_API_KEY),
          tiingo: Boolean(TIINGO_API_KEY),
          yahoo: true,
          googleNewsRss: true
        },
        adol: {
          enabled: true,
          cron: ADOL_CRON_EXPRESSION,
          timezone: ADOL_TZ
        }
      });
    }

    if (requestUrl.pathname === "/api/search/flights") {
      if (req.method !== "POST") {
        return writeJson(res, 405, { ok: false, error: "Method not allowed. Use POST." });
      }
      const bodyText = await readRequestBody(req);
      let payload = {};
      try {
        payload = bodyText ? JSON.parse(bodyText) : {};
      } catch {
        payload = {};
      }
      const search = cheapTripNormalizeSearch(payload);
      const flights = buildMockFlightResults(search);
      return writeJson(res, 200, {
        ok: true,
        source: "mock",
        providerPlan: "Connect Amadeus / Travelpayouts here later.",
        search,
        results: flights
      });
    }

    if (requestUrl.pathname === "/api/search/hotels") {
      if (req.method !== "POST") {
        return writeJson(res, 405, { ok: false, error: "Method not allowed. Use POST." });
      }
      const bodyText = await readRequestBody(req);
      let payload = {};
      try {
        payload = bodyText ? JSON.parse(bodyText) : {};
      } catch {
        payload = {};
      }
      const search = cheapTripNormalizeSearch(payload);
      const hotels = buildMockHotelResults(search);
      return writeJson(res, 200, {
        ok: true,
        source: "mock",
        providerPlan: "Connect Expedia / Booking / Agoda partner APIs here later.",
        search,
        results: hotels
      });
    }

    if (requestUrl.pathname === "/api/search/stays") {
      if (req.method !== "POST") {
        return writeJson(res, 405, { ok: false, error: "Method not allowed. Use POST." });
      }
      const bodyText = await readRequestBody(req);
      let payload = {};
      try {
        payload = bodyText ? JSON.parse(bodyText) : {};
      } catch {
        payload = {};
      }
      const search = cheapTripNormalizeSearch(payload);
      const stays = buildMockStayResults(search);
      return writeJson(res, 200, {
        ok: true,
        source: "mock",
        inventoryLabel: "Vacation rental partner inventory",
        providerPlan: "Connect partner apartment / vacation rental inventory here later.",
        search,
        results: stays
      });
    }

    if (requestUrl.pathname === "/api/report" && req.method === "POST") {
      const bodyText = await readRequestBody(req);
      let payload = {};
      try {
        payload = bodyText ? JSON.parse(bodyText) : {};
      } catch {
        payload = {};
      }
      const search = cheapTripNormalizeSearch(payload);
      const flights = Array.isArray(payload?.flights) ? payload.flights : buildMockFlightResults(search);
      const hotels = Array.isArray(payload?.hotels) ? payload.hotels : buildMockHotelResults(search);
      const stays = Array.isArray(payload?.stays) ? payload.stays : buildMockStayResults(search);
      const summary = calculateCheapTripSummary(search, flights, hotels, stays);
      const report = buildCheapTripReport(summary);
      return writeJson(res, 200, {
        ok: true,
        source: "mock",
        summary,
        report
      });
    }

    if (requestUrl.pathname === "/api/cheaptrip/alerts") {
      if (req.method !== "GET") {
        return writeJson(res, 405, { ok: false, error: "Method not allowed. Use GET." });
      }
      const alerts = loadCheapTripAlerts();
      return writeJson(res, 200, {
        ok: true,
        alerts
      });
    }

    if (requestUrl.pathname === "/api/alerts/create") {
      if (req.method !== "POST") {
        return writeJson(res, 405, { ok: false, error: "Method not allowed. Use POST." });
      }
      const bodyText = await readRequestBody(req);
      let payload = {};
      try {
        payload = bodyText ? JSON.parse(bodyText) : {};
      } catch {
        payload = {};
      }
      const search = cheapTripNormalizeSearch(payload);
      const targetPrice = Math.max(0, cheapTripNumber(payload.targetPrice, 0));
      if (!search.origin || !search.destination || targetPrice <= 0) {
        return writeJson(res, 400, { ok: false, error: "origin, destination, and targetPrice are required." });
      }
      const alerts = loadCheapTripAlerts();
      const alert = {
        id: `cheaptrip-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        ...search,
        targetPrice,
        enabled: true,
        createdAt: new Date().toISOString(),
        duplicate: false
      };
      alerts.unshift(alert);
      saveCheapTripAlerts(alerts.slice(0, 1000));
      return writeJson(res, 200, {
        ok: true,
        alert
      });
    }

    if (requestUrl.pathname === "/api/alerts/check") {
      if (req.method !== "POST" && req.method !== "GET") {
        return writeJson(res, 405, { ok: false, error: "Method not allowed. Use GET or POST." });
      }
      const results = await checkCheapTripAlertsNow();
      return writeJson(res, 200, {
        ok: true,
        checkedAt: new Date().toISOString(),
        results
      });
    }

    if (requestUrl.pathname === "/api/cheaptrip/telegram/config") {
      if (req.method !== "POST") {
        return writeJson(res, 405, { ok: false, error: "Method not allowed. Use POST." });
      }
      const bodyText = await readRequestBody(req);
      let payload = {};
      try {
        payload = bodyText ? JSON.parse(bodyText) : {};
      } catch {
        payload = {};
      }
      const token = String(payload?.telegramBotToken || payload?.telegram_bot_token || "").trim();
      const chatId = String(payload?.telegramChatId || payload?.telegram_chat_id || "").trim();
      if (!token || !chatId) {
        return writeJson(res, 400, { ok: false, error: "telegramBotToken and telegramChatId are required." });
      }
      const saved = saveCheapTripTelegramConfigFile(token, chatId);
      if (!saved) {
        return writeJson(res, 500, { ok: false, error: "Unable to save CheapTrip Telegram config." });
      }
      return writeJson(res, 200, {
        ok: true,
        telegramConfigured: true,
        tokenMask: `${token.slice(0, 10)}...${token.slice(-4)}`,
        chatIdMask: `...${chatId.slice(-4)}`
      });
    }

    if (requestUrl.pathname === "/api/cheaptrip/telegram/test") {
      if (req.method !== "POST") {
        return writeJson(res, 405, { ok: false, error: "Method not allowed. Use POST." });
      }
      const creds = resolveCheapTripTelegramCredentials();
      if (!creds.token || !creds.chatId) {
        return writeJson(res, 400, { ok: false, error: "CheapTrip Telegram not configured." });
      }
      const bodyText = await readRequestBody(req);
      let payload = {};
      try {
        payload = bodyText ? JSON.parse(bodyText) : {};
      } catch {
        payload = {};
      }
      const message = String(payload?.message || "CheapTrip AI Telegram test").trim();
      const sent = await sendTelegramMessage(creds.token, creds.chatId, message.slice(0, 3500));
      if (!sent.ok) {
        return writeJson(res, 500, { ok: false, error: sent?.body || "CheapTrip Telegram test failed." });
      }
      return writeJson(res, 200, { ok: true, sentAt: new Date().toISOString() });
    }

    if (requestUrl.pathname === "/api/telegram/send") {
      if (req.method !== "POST") {
        return writeJson(res, 405, { ok: false, error: "Method not allowed. Use POST." });
      }
      const creds = resolveCheapTripTelegramCredentials();
      if (!creds.token || !creds.chatId) {
        return writeJson(res, 400, { ok: false, error: "CheapTrip Telegram not configured." });
      }
      const bodyText = await readRequestBody(req);
      let payload = {};
      try {
        payload = bodyText ? JSON.parse(bodyText) : {};
      } catch {
        payload = {};
      }
      const message = String(payload?.message || "").trim();
      if (!message) {
        return writeJson(res, 400, { ok: false, error: "message is required." });
      }
      const sent = await sendTelegramMessage(creds.token, creds.chatId, message.slice(0, 3500));
      if (!sent.ok) {
        return writeJson(res, 500, {
          ok: false,
          error: sent?.body || "Telegram send failed."
        });
      }
      return writeJson(res, 200, {
        ok: true,
        sentAt: new Date().toISOString()
      });
    }

    if (requestUrl.pathname === "/api/ai-video/health") {
      if (req.method !== "GET") {
        return writeJson(res, 405, { success: false, message: "Method not allowed. Use GET." });
      }
      return writeJson(res, 200, {
        success: true,
        message: "AI video backend is running",
        testMode: AI_VIDEO_TEST_MODE,
        falConfigured: Boolean(FAL_KEY),
        falInstalled: Boolean(falClient?.fal)
      });
    }

    if (requestUrl.pathname === "/api/ai-video/image-to-video") {
      if (req.method !== "POST") {
        return writeJson(res, 405, { success: false, message: "Method not allowed. Use POST." });
      }

      const contentType = String(req.headers["content-type"] || "");
      if (!contentType.toLowerCase().includes("multipart/form-data")) {
        return writeJson(res, 400, {
          success: false,
          message: "Content-Type must be multipart/form-data."
        });
      }

      const bodyBuffer = await readRequestBodyBuffer(req, 30 * 1024 * 1024);
      const parsed = parseMultipartFormData(bodyBuffer, contentType);
      const fields = parsed?.fields || {};
      const files = Array.isArray(parsed?.files) ? parsed.files : [];
      const imageFile = files[0];

      if (!imageFile?.contentBuffer?.length) {
        return writeJson(res, 400, {
          success: false,
          message: "No image file received. Field name must be image."
        });
      }

      const prompt = String(fields.prompt || "").trim();
      const style = String(fields.style || "vehicle_ad").trim();
      const duration = String(fields.duration || "6").trim();
      const resolution = String(fields.resolution || "768p").trim();
      const batchIndex = String(fields.batchIndex || "1").trim();
      const batchTotal = String(fields.batchTotal || "1").trim();

      if (!prompt) {
        return writeJson(res, 400, {
          success: false,
          message: "Prompt is required."
        });
      }

      if (!["512p", "768p", "1080p"].includes(resolution)) {
        return writeJson(res, 400, {
          success: false,
          message: "Invalid resolution. Use 512p, 768p, or 1080p."
        });
      }

      if (AI_VIDEO_TEST_MODE) {
        return writeJson(res, 200, {
          success: true,
          testMode: true,
          model: "test-mode-sample-video",
          videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
          received: {
            filename: imageFile.originalName,
            style,
            duration,
            resolution,
            batchIndex,
            batchTotal
          }
        });
      }

      if (!FAL_KEY) {
        return writeJson(res, 500, {
          success: false,
          message: "Missing FAL_KEY in .env file."
        });
      }

      if (!falClient?.fal) {
        return writeJson(res, 500, {
          success: false,
          message: "Missing @fal-ai/client package. Run: npm install @fal-ai/client"
        });
      }

      try {
        const uploadable = new File(
          [imageFile.contentBuffer],
          imageFile.originalName || "vehicle-image.png",
          { type: imageFile.mimeType || "application/octet-stream" }
        );
        const imageUrl = await falClient.fal.storage.upload(uploadable);
        const model = pickAiVideoModel(resolution);
        const result = await falClient.fal.subscribe(model, {
          input: {
            prompt,
            image_url: imageUrl
          },
          logs: true
        });
        const videoUrl = extractAiVideoUrl(result);
        if (!videoUrl) {
          return writeJson(res, 500, {
            success: false,
            message: "Video generated, but no video URL was returned.",
            raw: result?.data || null
          });
        }
        return writeJson(res, 200, {
          success: true,
          model,
          videoUrl,
          received: {
            filename: imageFile.originalName,
            style,
            duration,
            resolution,
            batchIndex,
            batchTotal
          }
        });
      } catch (error) {
        return writeJson(res, 500, {
          success: false,
          message: error?.message || "Video generation failed."
        });
      }
    }

    // Legacy scanner compatibility routes (used by existing A+ Scanner UI)
    if (requestUrl.pathname === "/health") {
      return writeJson(res, 200, {
        ok: true,
        service: "adol-compat",
        port: Number(PORT),
        adolEnabled: true
      });
    }

    if (requestUrl.pathname === "/set-telegram-config") {
      if (req.method !== "POST") {
        return writeJson(res, 405, { ok: false, error: "Method not allowed. Use POST." });
      }
      const bodyText = await readRequestBody(req);
      let payload = {};
      try {
        payload = bodyText ? JSON.parse(bodyText) : {};
      } catch {
        payload = {};
      }
      const tokenRaw = String(payload?.telegram_bot_token || payload?.token || "").trim();
      const chatRaw = String(payload?.telegram_chat_id || payload?.chatId || payload?.chat_id || "").trim();
      const out = adolEngine.setTelegramConfig(tokenRaw, chatRaw);
      const persisted = tokenRaw && chatRaw ? saveTelegramConfigFile(tokenRaw, chatRaw) : false;
      return writeJson(res, 200, {
        ok: true,
        telegram_configured: Boolean(out?.configured),
        token_mask: out?.tokenMasked || "",
        chat_id_mask: out?.chatIdMasked || "",
        persisted
      });
    }

    if (requestUrl.pathname === "/test-telegram" || requestUrl.pathname === "/api/adol/test-telegram") {
      if (req.method !== "GET" && req.method !== "POST") {
        return writeJson(res, 405, { ok: false, error: "Method not allowed. Use GET or POST." });
      }
      const creds = resolveTelegramCredentials();
      if (!creds.token || !creds.chatId) {
        return writeJson(res, 400, {
          ok: false,
          telegram_configured: false,
          result: { ok: false, reason: "Telegram not configured" }
        });
      }
      const stamp = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
      const sent = await sendTelegramMessage(creds.token, creds.chatId, `A+ Scanner Telegram test OK\nTime: ${stamp}`);
      if (!sent.ok) {
        return writeJson(res, 500, {
          ok: false,
          telegram_configured: true,
          result: {
            ok: false,
            status_code: sent.statusCode,
            body: sent.body
          }
        });
      }
      return writeJson(res, 200, {
        ok: true,
        telegram_configured: true,
        result: {
          ok: true,
          status_code: sent.statusCode
        }
      });
    }

    if (requestUrl.pathname === "/run-scanner") {
      if (req.method !== "POST") {
        return writeJson(res, 405, { ok: false, error: "Method not allowed. Use POST." });
      }
      const bodyText = await readRequestBody(req);
      let payload = {};
      try {
        payload = bodyText ? JSON.parse(bodyText) : {};
      } catch {
        payload = {};
      }
      const watchlist = Array.isArray(payload?.watchlist) ? payload.watchlist : [];
      const minScore = Number(payload?.min_score);
      if (Array.isArray(watchlist) && watchlist.length) {
        adolEngine.updateSettings({ watchlist });
      }
      if (Number.isFinite(minScore)) {
        adolEngine.updateSettings({ minAPlusScore: Math.max(0, Math.min(100, Math.round(minScore))) });
      }
      const scan = await adolEngine.runScan({ watchlist }, "manual");
      const alertsSent = Number(scan?.alerts?.sent || 0);
      return writeJson(res, scan?.ok ? 200 : 500, {
        ...scan,
        alerts_sent: alertsSent
      });
    }

    if (requestUrl.pathname === "/api/adol/status") {
      if (req.method !== "GET") {
        return writeJson(res, 405, { ok: false, error: "Method not allowed. Use GET." });
      }
      return writeJson(res, 200, adolEngine.getStatus());
    }

    if (requestUrl.pathname === "/api/adol/last") {
      if (req.method !== "GET") {
        return writeJson(res, 405, { ok: false, error: "Method not allowed. Use GET." });
      }
      const payload = adolEngine.getLastScan();
      if (!payload) {
        return writeJson(res, 200, {
          ok: true,
          hasData: false,
          message: "No ADOL scan has run yet."
        });
      }
      return writeJson(res, 200, {
        ok: true,
        hasData: true,
        payload
      });
    }

    if (requestUrl.pathname === "/api/adol/report") {
      if (req.method !== "GET") {
        return writeJson(res, 405, { ok: false, error: "Method not allowed. Use GET." });
      }
      const report = adolEngine.getReport();
      return writeJson(res, 200, {
        ok: true,
        hasReport: Boolean(report),
        report: report || null
      });
    }

    if (requestUrl.pathname === "/api/report") {
      if (req.method !== "GET") {
        return writeJson(res, 405, { ok: false, error: "Method not allowed. Use GET." });
      }
      const report = adolEngine.getReport();
      return writeJson(res, 200, {
        ok: true,
        hasReport: Boolean(report),
        report: report || null,
        institutionalModeSummary: report?.institutionalModeSummary || null
      });
    }

    if (requestUrl.pathname === "/api/adol/settings") {
      if (req.method === "GET") {
        return writeJson(res, 200, {
          ok: true,
          status: adolEngine.getStatus()
        });
      }
      if (req.method !== "POST") {
        return writeJson(res, 405, { ok: false, error: "Method not allowed. Use GET or POST." });
      }
      const bodyText = await readRequestBody(req);
      let payload = {};
      try {
        payload = bodyText ? JSON.parse(bodyText) : {};
      } catch {
        payload = {};
      }
      const settings = adolEngine.updateSettings(payload || {});
      return writeJson(res, 200, {
        ok: true,
        settings,
        status: adolEngine.getStatus()
      });
    }

    if (requestUrl.pathname === "/api/adol/trade-suite/files") {
      if (req.method !== "GET") {
        return writeJson(res, 405, { ok: false, error: "Method not allowed. Use GET." });
      }
      if (!fs.existsSync(ADOL_TRADE_SUITE_DIR)) {
        return writeJson(res, 200, {
          ok: true,
          exists: false,
          directory: ADOL_TRADE_SUITE_DIR,
          files: []
        });
      }
      return writeJson(res, 200, {
        ok: true,
        exists: true,
        directory: ADOL_TRADE_SUITE_DIR,
        files: listTradeSuiteFiles()
      });
    }

    if (requestUrl.pathname === "/api/adol/trade-suite/read") {
      if (req.method !== "GET") {
        return writeJson(res, 405, { ok: false, error: "Method not allowed. Use GET." });
      }
      const file = String(requestUrl.searchParams.get("file") || "").trim();
      const payload = readTradeSuiteFile(file);
      if (!payload) {
        return writeJson(res, 404, { ok: false, error: "File not found or not readable." });
      }
      return writeJson(res, 200, { ok: true, ...payload });
    }

    if (requestUrl.pathname === "/api/adol/trade-suite/run") {
      if (req.method !== "POST") {
        return writeJson(res, 405, { ok: false, error: "Method not allowed. Use POST." });
      }
      const bodyText = await readRequestBody(req);
      let payload = {};
      try {
        payload = bodyText ? JSON.parse(bodyText) : {};
      } catch {
        payload = {};
      }
      const script = String(payload?.script || "").trim();
      const result = await runTradeSuiteScript(script);
      const status = result?.ok ? 200 : 500;
      return writeJson(res, status, {
        ok: Boolean(result?.ok),
        script,
        ...result
      });
    }

    if (requestUrl.pathname === "/api/adol/trade-suite/run-full") {
      if (req.method !== "POST") {
        return writeJson(res, 405, { ok: false, error: "Method not allowed. Use POST." });
      }
      try {
        const result = await runTradeSuiteFullSuite();
        return writeJson(res, 200, result);
      } catch (error) {
        return writeJson(res, 500, {
          ok: false,
          error: error?.message || "Failed to run full Trade Suite."
        });
      }
    }

    if (requestUrl.pathname === "/api/adol/set-telegram") {
      if (req.method !== "POST") {
        return writeJson(res, 405, { ok: false, error: "Method not allowed. Use POST." });
      }
      const bodyText = await readRequestBody(req);
      let payload = {};
      try {
        payload = bodyText ? JSON.parse(bodyText) : {};
      } catch {
        payload = {};
      }
      const out = adolEngine.setTelegramConfig(payload?.telegram_bot_token, payload?.telegram_chat_id);
      const tokenRaw = String(payload?.telegram_bot_token || "").trim();
      const chatRaw = String(payload?.telegram_chat_id || "").trim();
      const persisted = tokenRaw && chatRaw ? saveTelegramConfigFile(tokenRaw, chatRaw) : false;
      return writeJson(res, 200, {
        ok: true,
        ...out,
        persisted
      });
    }

    if (requestUrl.pathname === "/api/adol/telegram-alert") {
      if (req.method !== "POST") {
        return writeJson(res, 405, { ok: false, error: "Method not allowed. Use POST." });
      }
      const creds = resolveTelegramCredentials();
      if (!creds.token || !creds.chatId) {
        return writeJson(res, 400, {
          ok: false,
          error: "Telegram not configured. Set token/chat id in ADOL22 Settings."
        });
      }
      const bodyText = await readRequestBody(req);
      let payload = {};
      try {
        payload = bodyText ? JSON.parse(bodyText) : {};
      } catch {
        payload = {};
      }
      const title = String(payload?.title || "ADOL22 Alert").trim();
      const messageRaw = String(payload?.message || "").trim();
      if (!messageRaw) {
        return writeJson(res, 400, { ok: false, error: "Alert message is required." });
      }
      const stamp = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
      const text = buildTelegramHtmlAlert(title, stamp, messageRaw.slice(0, 3200), "📣");
      const sent = await sendTelegramMessage(creds.token, creds.chatId, text);
      if (!sent.ok) {
        return writeJson(res, 500, {
          ok: false,
          error: "Telegram send failed.",
          statusCode: sent.statusCode,
          body: sent.body
        });
      }
      return writeJson(res, 200, {
        ok: true,
        message: "ADOL22 scan alert sent to Telegram",
        chatIdMasked: creds.chatId.length > 4 ? `...${creds.chatId.slice(-4)}` : "****"
      });
    }

    if (requestUrl.pathname === "/api/adol/test-technical-alert") {
      if (req.method !== "POST") {
        return writeJson(res, 405, { ok: false, error: "Method not allowed. Use POST." });
      }
      const bodyText = await readRequestBody(req);
      let payload = {};
      try {
        payload = bodyText ? JSON.parse(bodyText) : {};
      } catch {
        payload = {};
      }
      const side = String(payload?.side || "LONG").toUpperCase() === "SHORT" ? "SHORT" : "LONG";
      const result = await adolEngine.sendTestTechnicalAlert(side);
      if (!result?.ok) {
        return writeJson(res, 400, {
          ok: false,
          error: result?.error || "test_alert_failed",
          telegram: result?.telegram || null
        });
      }
      return writeJson(res, 200, {
        ok: true,
        message: `${side} technical alert sent`,
        ticker: result.ticker,
        telegram: result.telegram
      });
    }

    if (requestUrl.pathname === "/api/adol/telegram-ticker") {
      if (req.method !== "POST") {
        return writeJson(res, 405, { ok: false, error: "Method not allowed. Use POST." });
      }
      const creds = resolveTelegramCredentials();
      if (!creds.token || !creds.chatId) {
        return writeJson(res, 400, {
          ok: false,
          error: "Telegram not configured. Set token/chat id in ADOL22 Settings."
        });
      }
      const bodyText = await readRequestBody(req);
      let payload = {};
      try {
        payload = bodyText ? JSON.parse(bodyText) : {};
      } catch {
        payload = {};
      }
      const ticker = String(payload?.ticker || payload?.symbol || "").trim().toUpperCase();
      const mode = String(payload?.mode || "technical").trim().toLowerCase();
      if (!ticker) {
        return writeJson(res, 400, { ok: false, error: "Ticker is required." });
      }
      const scan = await ensureAdolScanForTelegram(false);
      const rows = Array.isArray(scan?.rows) ? scan.rows : [];
      const row = rows.find((item) => String(item?.ticker || "").toUpperCase() === ticker) || null;
      const rawReply = mode === "technical"
        ? await buildTechnicalTickerReply(scan, ticker, row)
        : await buildSingleTickerReply(scan, ticker, row);
      const stamp = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
      const title = mode === "technical" ? `${ticker} Technical Deep Dive` : `${ticker} Deep Dive`;
      const text = buildTelegramHtmlAlert(title, stamp, rawReply.slice(0, 3200), mode === "technical" ? "📊" : "📣");
      const sent = await sendTelegramMessage(creds.token, creds.chatId, text);
      if (!sent.ok) {
        return writeJson(res, 500, {
          ok: false,
          error: sent?.body || sent?.reason || "Telegram send failed.",
          telegram: sent
        });
      }
      return writeJson(res, 200, {
        ok: true,
        ticker,
        mode,
        chatIdMasked: creds.chatId.length > 4 ? `...${creds.chatId.slice(-4)}` : "****"
      });
    }

    if (requestUrl.pathname === "/api/dealerflow/test") {
      if (req.method !== "GET" && req.method !== "POST") {
        return writeJson(res, 405, { ok: false, error: "Method not allowed. Use GET or POST." });
      }
      const creds = resolveTelegramCredentials();
      if (!creds.token || !creds.chatId) {
        return writeJson(res, 400, {
          ok: false,
          error: "Telegram not configured. Set TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID or BOT_TOKEN + CHAT_ID."
        });
      }
      const stamp = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
      const text = buildTelegramHtmlAlert("DealerFlow AI connected", stamp, "Backend test completed successfully.", "✅");
      const sent = await sendTelegramMessage(creds.token, creds.chatId, text);
      if (!sent.ok) {
        return writeJson(res, 500, {
          ok: false,
          error: "Telegram send failed.",
          statusCode: sent.statusCode,
          body: sent.body
        });
      }
      return writeJson(res, 200, {
        ok: true,
        message: "Sent to Telegram",
        chatIdMasked: creds.chatId.length > 4 ? `...${creds.chatId.slice(-4)}` : "****"
      });
    }

    if (requestUrl.pathname === "/api/dealerflow/alert") {
      if (req.method !== "POST") {
        return writeJson(res, 405, { ok: false, error: "Method not allowed. Use POST." });
      }
      const creds = resolveTelegramCredentials();
      if (!creds.token || !creds.chatId) {
        return writeJson(res, 400, {
          ok: false,
          error: "Telegram not configured. Set TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID or BOT_TOKEN + CHAT_ID."
        });
      }

      const bodyText = await readRequestBody(req);
      let payload = {};
      try {
        payload = bodyText ? JSON.parse(bodyText) : {};
      } catch {
        payload = {};
      }

      const title = String(payload?.title || "DealerFlow Alert").trim();
      const messageRaw = String(payload?.message || "").trim();
      if (!messageRaw) {
        return writeJson(res, 400, { ok: false, error: "Alert message is required." });
      }

      const stamp = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
      const clipped = messageRaw.slice(0, 3200);
      const text = buildTelegramHtmlAlert(title, stamp, clipped, "🔔");

      const sent = await sendTelegramMessage(creds.token, creds.chatId, text);
      if (!sent.ok) {
        return writeJson(res, 500, {
          ok: false,
          error: "Telegram send failed.",
          statusCode: sent.statusCode,
          body: sent.body
        });
      }
      return writeJson(res, 200, {
        ok: true,
        message: "Alert sent to Telegram",
        chatIdMasked: creds.chatId.length > 4 ? `...${creds.chatId.slice(-4)}` : "****"
      });
    }

    if (requestUrl.pathname === "/api/dealerflow/facebook/status") {
      const creds = resolveFacebookCredentials();
      const rows = Array.isArray(DEALERFLOW_FACEBOOK_SCHEDULES) ? DEALERFLOW_FACEBOOK_SCHEDULES : [];
      const pending = rows.filter((x) => x && x.status === "scheduled").length;
      return writeJson(res, 200, {
        ok: true,
        configured: Boolean(creds.pageId && creds.pageAccessToken),
        pageIdMasked: maskPageId(creds.pageId),
        tokenMasked: maskToken(creds.pageAccessToken),
        schedulesTotal: rows.length,
        schedulesPending: pending
      });
    }

    if (requestUrl.pathname === "/api/dealerflow/facebook/config") {
      if (req.method !== "POST") {
        return writeJson(res, 405, { ok: false, error: "Method not allowed. Use POST." });
      }
      const bodyText = await readRequestBody(req);
      let payload = {};
      try {
        payload = bodyText ? JSON.parse(bodyText) : {};
      } catch {
        payload = {};
      }
      const pageId = String(payload?.pageId || "").trim();
      const pageAccessToken = String(payload?.pageAccessToken || "").trim();
      if (!pageId || !pageAccessToken) {
        return writeJson(res, 400, { ok: false, error: "pageId and pageAccessToken are required." });
      }
      const persisted = saveFacebookConfigFile(pageId, pageAccessToken);
      return writeJson(res, 200, {
        ok: true,
        persisted,
        configured: true,
        pageIdMasked: maskPageId(pageId),
        tokenMasked: maskToken(pageAccessToken)
      });
    }

    if (requestUrl.pathname === "/api/dealerflow/facebook/post-now") {
      if (req.method !== "POST") {
        return writeJson(res, 405, { ok: false, error: "Method not allowed. Use POST." });
      }
      const creds = resolveFacebookCredentials();
      if (!creds.pageId || !creds.pageAccessToken) {
        return writeJson(res, 400, {
          ok: false,
          error: "Facebook not configured. Save Page ID and Page Access Token first."
        });
      }
      const bodyText = await readRequestBody(req);
      let payload = {};
      try {
        payload = bodyText ? JSON.parse(bodyText) : {};
      } catch {
        payload = {};
      }
      const message = String(payload?.message || "").trim();
      const link = String(payload?.link || "").trim();
      if (!message) {
        return writeJson(res, 400, { ok: false, error: "message is required." });
      }
      const sent = await sendFacebookPagePost({
        pageId: creds.pageId,
        pageAccessToken: creds.pageAccessToken,
        message,
        link
      });
      if (!sent.ok) {
        return writeJson(res, 500, {
          ok: false,
          error: sent?.body?.error?.message || "Facebook post failed.",
          statusCode: sent.statusCode,
          body: sent.body
        });
      }
      return writeJson(res, 200, {
        ok: true,
        postId: sent.postId || "",
        pageIdMasked: maskPageId(creds.pageId)
      });
    }

    if (requestUrl.pathname === "/api/dealerflow/facebook/schedules") {
      if (req.method === "GET") {
        const rows = (Array.isArray(DEALERFLOW_FACEBOOK_SCHEDULES) ? DEALERFLOW_FACEBOOK_SCHEDULES : [])
          .slice()
          .sort((a, b) => Date.parse(String(a?.runAtIso || "")) - Date.parse(String(b?.runAtIso || "")));
        return writeJson(res, 200, { ok: true, rows });
      }
      if (req.method === "POST") {
        const bodyText = await readRequestBody(req);
        let payload = {};
        try {
          payload = bodyText ? JSON.parse(bodyText) : {};
        } catch {
          payload = {};
        }
        const title = String(payload?.title || "Vehicle Scheduled Post").trim();
        const message = String(payload?.message || "").trim();
        const link = String(payload?.link || "").trim();
        const runAtIso = String(payload?.runAtIso || "").trim();
        if (!message) return writeJson(res, 400, { ok: false, error: "message is required." });
        const runAtMs = Date.parse(runAtIso);
        if (!Number.isFinite(runAtMs)) {
          return writeJson(res, 400, { ok: false, error: "runAtIso is invalid." });
        }
        const schedule = {
          id: makeScheduleId(),
          title,
          message,
          link,
          runAtIso: new Date(runAtMs).toISOString(),
          status: "scheduled",
          createdAt: new Date().toISOString(),
          processedAt: "",
          postId: "",
          lastError: ""
        };
        const rows = Array.isArray(DEALERFLOW_FACEBOOK_SCHEDULES) ? DEALERFLOW_FACEBOOK_SCHEDULES : [];
        rows.push(schedule);
        saveFacebookSchedulesFile(rows);
        return writeJson(res, 200, { ok: true, schedule });
      }
      if (req.method === "DELETE") {
        const id = String(requestUrl.searchParams.get("id") || "").trim();
        if (!id) return writeJson(res, 400, { ok: false, error: "id is required." });
        const rows = Array.isArray(DEALERFLOW_FACEBOOK_SCHEDULES) ? DEALERFLOW_FACEBOOK_SCHEDULES : [];
        const before = rows.length;
        const afterRows = rows.filter((x) => String(x?.id || "") !== id);
        if (afterRows.length === before) {
          return writeJson(res, 404, { ok: false, error: "Schedule not found." });
        }
        saveFacebookSchedulesFile(afterRows);
        return writeJson(res, 200, { ok: true, removedId: id });
      }
      return writeJson(res, 405, { ok: false, error: "Method not allowed." });
    }

    if (requestUrl.pathname === "/api/adol/scan") {
      if (req.method !== "POST") {
        return writeJson(res, 405, { ok: false, error: "Method not allowed. Use POST." });
      }
      const bodyText = await readRequestBody(req);
      let payload = {};
      try {
        payload = bodyText ? JSON.parse(bodyText) : {};
      } catch {
        payload = {};
      }
      const scan = await adolEngine.runScan(payload || {}, "manual");
      const status = scan?.ok ? 200 : (scan?.busy ? 200 : 500);
      return writeJson(res, status, scan);
    }

    if (requestUrl.pathname === "/api/webhooks/tradingview") {
      if (req.method === "GET") {
        return writeJson(res, 200, {
          ok: true,
          endpoint: "/api/webhooks/tradingview",
          method: "POST",
          secured: Boolean(TV_WEBHOOK_SECRET),
          auth: TV_WEBHOOK_SECRET ? "query token (?token=...)" : "none",
          note: "Send JSON from TradingView alerts. Example: {\"symbol\":\"NVDA\",\"side\":\"BUY\",\"message\":\"Breakout above range\"}"
        });
      }
      if (req.method !== "POST") {
        return writeJson(res, 405, { error: "Method not allowed. Use POST." });
      }
      if (!isTradingViewWebhookAuthorized(requestUrl, req)) {
        return writeJson(res, 401, {
          error: "Unauthorized webhook token.",
          hint: "Set ?token=YOUR_SECRET in TradingView webhook URL and TV_WEBHOOK_SECRET on server."
        });
      }
      const body = await readRequestBody(req);
      const payload = parseTradingViewPayload(body);
      if (!payload) {
        return writeJson(res, 400, { error: "Invalid TradingView payload." });
      }
      TV_WEBHOOK_ALERTS.unshift(payload);
      if (TV_WEBHOOK_ALERTS.length > TV_WEBHOOK_MAX_ROWS) {
        TV_WEBHOOK_ALERTS.length = TV_WEBHOOK_MAX_ROWS;
      }
      return writeJson(res, 200, { ok: true, received: payload, total: TV_WEBHOOK_ALERTS.length });
    }

    if (requestUrl.pathname === "/api/market/tv-alerts") {
      const limit = Math.max(1, Math.min(100, Number(requestUrl.searchParams.get("limit") || 30)));
      const symbol = String(requestUrl.searchParams.get("symbol") || "").trim().toUpperCase();
      const rows = TV_WEBHOOK_ALERTS
        .filter((row) => (symbol ? row.symbol === symbol : true))
        .slice(0, limit);
      return writeJson(res, 200, {
        source: "tradingview-webhook",
        secured: Boolean(TV_WEBHOOK_SECRET),
        total: TV_WEBHOOK_ALERTS.length,
        rows
      });
    }

    if (requestUrl.pathname.startsWith("/api/fmp/")) {
      return proxyFinancialModelingPrep(requestUrl, res);
    }

    if (requestUrl.pathname.startsWith("/api/td/")) {
      return proxyTwelveData(requestUrl, res);
    }

    if (requestUrl.pathname === "/api/yahoo/quote") {
      const symbols = (requestUrl.searchParams.get("symbols") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (!symbols.length) {
        return writeJson(res, 400, { error: "At least one symbol is required." });
      }

      const payload = await fetchYahooQuotes(symbols);
      return writeJson(res, 200, payload);
    }

    if (requestUrl.pathname === "/api/market/quote") {
      const symbols = (requestUrl.searchParams.get("symbols") || "")
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);

      if (!symbols.length) {
        return writeJson(res, 400, { error: "At least one symbol is required." });
      }

      const keys = resolveProviderKeys(requestUrl.searchParams);
      const payload = await fetchMarketQuotes(symbols, keys);
      return writeJson(res, 200, payload);
    }

    if (requestUrl.pathname === "/api/marketcheck/config") {
      if (req.method === "GET") {
        const resolved = resolveMarketcheckApiKey();
        return writeJson(res, 200, {
          ok: true,
          configured: Boolean(resolved),
          keyMasked: maskToken(resolved),
          source: MARKETCHECK_API_KEY ? "env" : (resolved ? "runtime_file" : "none")
        });
      }
      if (req.method !== "POST") {
        return writeJson(res, 405, { ok: false, error: "Method not allowed. Use GET/POST." });
      }
      const bodyText = await readRequestBody(req);
      let payload = {};
      try {
        payload = bodyText ? JSON.parse(bodyText) : {};
      } catch {
        payload = {};
      }
      const apiKey = String(payload?.api_key || payload?.marketcheck_api_key || "").trim();
      if (!apiKey) {
        return writeJson(res, 400, { ok: false, error: "marketcheck_api_key is required." });
      }
      const persisted = saveMarketcheckConfigFile(apiKey);
      return writeJson(res, 200, {
        ok: true,
        configured: true,
        persisted,
        keyMasked: maskToken(apiKey),
        warning: "For production, keep MARKETCHECK_API_KEY in backend .env and avoid exposing it in browser."
      });
    }

    if (requestUrl.pathname === "/api/marketcheck") {
      if (req.method === "GET") {
        const key = resolveMarketcheckApiKey();
        return writeJson(res, 200, {
          ok: true,
          configured: Boolean(key),
          keyMasked: maskToken(key),
          baseUrl: "https://api.marketcheck.com/v2/"
        });
      }
      if (req.method !== "POST") {
        return writeJson(res, 405, { ok: false, error: "Method not allowed. Use POST." });
      }
      const bodyText = await readRequestBody(req);
      let payload = {};
      try {
        payload = bodyText ? JSON.parse(bodyText) : {};
      } catch {
        payload = {};
      }
      const action = String(payload?.action || "all").trim().toLowerCase();
      const apiKeyOverride = String(payload?.api_key || "").trim();
      const key = apiKeyOverride || resolveMarketcheckApiKey();
      if (!key) {
        return writeJson(res, 400, {
          ok: false,
          error: "MarketCheck key not configured. Set MARKETCHECK_API_KEY in backend .env or POST /api/marketcheck/config."
        });
      }

      const vin = String(payload?.vin || "").trim().toUpperCase();
      const askingPrice = mcNumber(payload?.askingPrice ?? payload?.asking_price, NaN);
      const milesInput = mcNumber(payload?.miles, NaN);
      const zip = String(payload?.zip || payload?.zipcode || "").trim();
      const radius = Math.max(1, Math.min(500, Math.round(mcNumber(payload?.radius, 150))));

      let decoded = null;
      let decodeError = "";
      if (vin && (action === "all" || action === "decode" || action === "comps" || action === "premium")) {
        const decodeRes = await mcFetch(`decode/car/${encodeURIComponent(vin)}/specs`, {}, key);
        if (decodeRes.ok) {
          decoded = decodeRes.data || {};
        } else {
          decodeError = decodeRes.error || "VIN decode failed";
        }
        if (action === "decode") {
          return writeJson(res, decodeRes.ok ? 200 : 502, {
            ok: decodeRes.ok,
            action: "decode",
            vin,
            decoded: decodeRes.data || null,
            error: decodeRes.ok ? "" : decodeRes.error,
            configured: true
          });
        }
      }

      const year = String(payload?.year || decoded?.year || "").trim();
      const make = String(payload?.make || decoded?.make || "").trim();
      const model = String(payload?.model || decoded?.model || "").trim();
      const trim = String(payload?.trim || decoded?.trim || "").trim();

      let compsRaw = null;
      let compsError = "";
      let compRows = [];
      if (action === "all" || action === "comps" || action === "premium") {
        const params = {
          year,
          make,
          model,
          trim,
          zip,
          radius,
          car_type: "used",
          rows: String(Math.max(15, Math.min(80, Math.round(mcNumber(payload?.rows, 40))))),
          sort_by: "dist",
          sort_order: "asc"
        };
        const compsRes = await mcFetch("search/car/active", params, key);
        if (compsRes.ok) {
          compsRaw = compsRes.data || {};
          compRows = mcNormalizeCompRows(compsRaw);
        } else {
          compsError = compsRes.error || "Comp search failed";
        }
      }

      let premium = null;
      let premiumError = "";
      if (action === "premium") {
        const premiumCandidates = [
          "marketcheck_price/car",
          "marketcheck_price/car/used",
          "price/car"
        ];
        const pParams = {
          year,
          make,
          model,
          trim,
          miles: Number.isFinite(milesInput) ? String(Math.round(milesInput)) : "",
          zip
        };
        for (const pPath of premiumCandidates) {
          const pRes = await mcFetch(pPath, pParams, key);
          if (pRes.ok) {
            premium = pRes.data || {};
            premiumError = "";
            break;
          }
          premiumError = pRes.error || "Premium valuation endpoint unavailable";
        }
      }

      const summary = mcSummary(compRows);
      const marketAverage = Number(summary.avgPrice);
      const lowComp = Number(summary.lowPrice);
      const highComp = Number(summary.highPrice);
      const milesAvg = Number(summary.avgMiles);

      const priceDiff = Number.isFinite(askingPrice) && Number.isFinite(marketAverage)
        ? round2(askingPrice - marketAverage)
        : null;
      const milesDiff = Number.isFinite(milesInput) && Number.isFinite(milesAvg)
        ? Math.round(milesInput - milesAvg)
        : null;

      return writeJson(res, 200, {
        ok: true,
        action,
        configured: true,
        vin,
        year,
        make,
        model,
        trim,
        zip,
        radius,
        askingPrice: Number.isFinite(askingPrice) ? round2(askingPrice) : null,
        miles: Number.isFinite(milesInput) ? Math.round(milesInput) : null,
        decode: decoded,
        decodeError,
        compsSummary: summary,
        comps: compRows,
        compsError,
        premiumValuation: premium,
        premiumError,
        marketAverage: Number.isFinite(marketAverage) ? marketAverage : null,
        lowestComparable: Number.isFinite(lowComp) ? lowComp : null,
        highestComparable: Number.isFinite(highComp) ? highComp : null,
        priceDifferenceVsAverage: Number.isFinite(priceDiff) ? priceDiff : null,
        milesDifferenceVsAverage: Number.isFinite(milesDiff) ? milesDiff : null
      });
    }

    if (requestUrl.pathname === "/api/great-deals/settings") {
      if (req.method !== "GET") {
        return writeJson(res, 405, { ok: false, error: "Method not allowed. Use GET." });
      }
      return writeJson(res, 200, {
        ok: true,
        providers: {
          serpapi: Boolean(SERPAPI_KEY),
          apify: Boolean(APIFY_TOKEN),
          telegram: Boolean(resolveTelegramCredentials().token && resolveTelegramCredentials().chatId)
        },
        actorIds: {
          facebook: APIFY_FACEBOOK_ACTOR_ID || "",
          craigslist: APIFY_CRAIGSLIST_ACTOR_ID || "",
          ebay: APIFY_EBAY_ACTOR_ID || ""
        }
      });
    }

    if (requestUrl.pathname === "/api/great-deals/scan") {
      if (req.method !== "POST") {
        return writeJson(res, 405, { ok: false, error: "Method not allowed. Use POST." });
      }
      const bodyText = await readRequestBody(req);
      let payload = {};
      try {
        payload = bodyText ? JSON.parse(bodyText) : {};
      } catch {
        payload = {};
      }
      const result = await runDealSpotterScan(payload);
      return writeJson(res, 200, result);
    }

    if (requestUrl.pathname === "/api/great-deals/deals") {
      if (req.method === "GET") {
        const params = {
          search: String(requestUrl.searchParams.get("search") || ""),
          grade: String(requestUrl.searchParams.get("grade") || ""),
          source: String(requestUrl.searchParams.get("source") || ""),
          status: String(requestUrl.searchParams.get("status") || ""),
          sortBy: String(requestUrl.searchParams.get("sortBy") || "created_at"),
          sortDir: String(requestUrl.searchParams.get("sortDir") || "desc")
        };
        const rows = listDealSpotterDeals(params);
        return writeJson(res, 200, { ok: true, rows });
      }
      if (req.method === "POST") {
        const bodyText = await readRequestBody(req);
        let payload = {};
        try {
          payload = bodyText ? JSON.parse(bodyText) : {};
        } catch {
          payload = {};
        }
        const saved = upsertDealSpotterDeal(payload);
        return writeJson(res, 200, { ok: true, deal: saved });
      }
      return writeJson(res, 405, { ok: false, error: "Method not allowed. Use GET or POST." });
    }

    const dealStatusMatch = requestUrl.pathname.match(/^\/api\/great-deals\/deals\/([^/]+)\/status$/);
    if (dealStatusMatch) {
      if (req.method !== "POST" && req.method !== "PATCH") {
        return writeJson(res, 405, { ok: false, error: "Method not allowed. Use POST." });
      }
      const id = decodeURIComponent(dealStatusMatch[1] || "");
      const bodyText = await readRequestBody(req);
      let payload = {};
      try {
        payload = bodyText ? JSON.parse(bodyText) : {};
      } catch {
        payload = {};
      }
      const status = String(payload.status || "").trim().toLowerCase();
      if (!status) return writeJson(res, 400, { ok: false, error: "status is required." });
      const changed = updateDealSpotterStatus(id, status);
      if (!changed) return writeJson(res, 404, { ok: false, error: "Deal not found." });
      return writeJson(res, 200, { ok: true, id, status });
    }

    const dealDeleteMatch = requestUrl.pathname.match(/^\/api\/great-deals\/deals\/([^/]+)$/);
    if (dealDeleteMatch && req.method === "DELETE") {
      const id = decodeURIComponent(dealDeleteMatch[1] || "");
      const changed = deleteDealSpotterDeal(id);
      if (!changed) return writeJson(res, 404, { ok: false, error: "Deal not found." });
      return writeJson(res, 200, { ok: true, id });
    }

    if (requestUrl.pathname === "/api/great-deals/manual-analyze") {
      if (req.method !== "POST") {
        return writeJson(res, 405, { ok: false, error: "Method not allowed. Use POST." });
      }
      const bodyText = await readRequestBody(req);
      let payload = {};
      try {
        payload = bodyText ? JSON.parse(bodyText) : {};
      } catch {
        payload = {};
      }
      const analysis = analyzeManualListing(payload);
      return writeJson(res, 200, { ok: true, analysis });
    }

    if (requestUrl.pathname === "/api/great-deals/telegram/test") {
      if (req.method !== "POST") {
        return writeJson(res, 405, { ok: false, error: "Method not allowed. Use POST." });
      }
      const bodyText = await readRequestBody(req);
      let payload = {};
      try {
        payload = bodyText ? JSON.parse(bodyText) : {};
      } catch {
        payload = {};
      }
      const fallback = resolveTelegramCredentials();
      const creds = {
        token: String(payload?.telegram_bot_token || payload?.token || fallback.token || "").trim(),
        chatId: String(payload?.telegram_chat_id || payload?.chatId || payload?.chat_id || fallback.chatId || "").trim()
      };
      if (!creds.token || !creds.chatId) {
        return writeJson(res, 400, { ok: false, error: "Telegram not configured." });
      }
      const sent = await sendTelegramMessage(creds.token, creds.chatId, "Deal Spotter Telegram test OK");
      if (!sent.ok) {
        return writeJson(res, 500, { ok: false, error: "Telegram send failed.", details: sent });
      }
      return writeJson(res, 200, { ok: true, sent });
    }

    if (requestUrl.pathname === "/api/great-deals/telegram/config") {
      if (req.method !== "POST") {
        return writeJson(res, 405, { ok: false, error: "Method not allowed. Use POST." });
      }
      const bodyText = await readRequestBody(req);
      let payload = {};
      try {
        payload = bodyText ? JSON.parse(bodyText) : {};
      } catch {
        payload = {};
      }
      const token = String(payload?.telegram_bot_token || payload?.token || "").trim();
      const chatId = String(payload?.telegram_chat_id || payload?.chatId || payload?.chat_id || "").trim();
      if (!token || !chatId) {
        return writeJson(res, 400, { ok: false, error: "telegram_bot_token and telegram_chat_id are required." });
      }
      const persisted = saveTelegramConfigFile(token, chatId);
      return writeJson(res, 200, {
        ok: true,
        persisted,
        token_mask: token.length > 10 ? `${token.slice(0, 8)}...${token.slice(-4)}` : "***",
        chat_id_mask: chatId.length > 4 ? `...${chatId.slice(-4)}` : "***"
      });
    }

    if (requestUrl.pathname === "/api/great-deals/rss-proxy") {
      if (req.method !== "GET") {
        return writeJson(res, 405, { ok: false, error: "Method not allowed. Use GET." });
      }

      const rawUrl = String(requestUrl.searchParams.get("url") || "").trim();
      if (!rawUrl) {
        return writeJson(res, 400, { ok: false, error: "Missing url query parameter." });
      }

      let feedUrl;
      try {
        feedUrl = new URL(rawUrl);
      } catch {
        return writeJson(res, 400, { ok: false, error: "Invalid feed url." });
      }

      if (feedUrl.protocol !== "https:") {
        return writeJson(res, 400, { ok: false, error: "Only https feeds are allowed." });
      }

      const host = String(feedUrl.hostname || "").toLowerCase();
      const allowedHosts = [
        "www.ebay.com",
        "ebay.com",
        "slickdeals.net",
        "www.slickdeals.net",
        "dealslist.com",
        "www.dealslist.com",
        "reddit.com",
        "www.reddit.com",
        "old.reddit.com",
        "dealnews.com",
        "www.dealnews.com",
      ];
      const isCraigslist = host.endsWith(".craigslist.org");
      const isAllowed = isCraigslist || allowedHosts.includes(host);
      if (!isAllowed) {
        return writeJson(res, 400, { ok: false, error: `Host not allowed: ${host}` });
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      let upstream;
      try {
        upstream = await fetch(feedUrl.toString(), {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
            "Accept": "application/rss+xml, application/xml, text/xml, */*",
            "Accept-Language": "en-US,en;q=0.9"
          },
          signal: controller.signal
        });
      } catch (error) {
        clearTimeout(timeout);
        return writeJson(res, 502, {
          ok: false,
          error: "Upstream fetch failed.",
          details: error instanceof Error ? error.message : String(error)
        });
      } finally {
        clearTimeout(timeout);
      }

      const xml = await upstream.text();
      if (!upstream.ok) {
        return writeJson(res, upstream.status, {
          ok: false,
          error: `Upstream responded ${upstream.status}.`,
          bodyPreview: String(xml || "").slice(0, 240)
        });
      }

      if (!xml || !xml.includes("<")) {
        return writeJson(res, 502, { ok: false, error: "Upstream returned empty XML." });
      }

      res.writeHead(200, {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*"
      });
      res.end(xml);
      return;
    }

    // Simple quote endpoint for direct frontend calls like:
    // fetch("http://localhost:3001/api/quote/AMD")
    if (requestUrl.pathname.startsWith("/api/quote/")) {
      const symbol = String(requestUrl.pathname.replace("/api/quote/", "") || "")
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9.\-]/g, "");

      if (!symbol) {
        return writeJson(res, 400, { error: "Symbol is required." });
      }

      const keys = resolveProviderKeys(requestUrl.searchParams);
      const rows = await fetchMarketQuotes([symbol], keys);
      const q = Array.isArray(rows) ? rows[0] : null;

      if (!q) {
        return writeJson(res, 404, { error: `No quote found for ${symbol}` });
      }

      return writeJson(res, 200, {
        symbol,
        price: Number(q.price || 0),
        open: Number(q.open || 0),
        high: Number(q.dayHigh || q.high || 0),
        low: Number(q.dayLow || q.low || 0),
        previousClose: Number(q.previousClose || 0)
      });
    }

    if (requestUrl.pathname === "/api/yahoo/news") {
      const tickers = (requestUrl.searchParams.get("tickers") || "")
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);
      const limit = Math.max(1, Math.min(50, Number(requestUrl.searchParams.get("limit") || 20)));

      if (!tickers.length) {
        return writeJson(res, 400, { error: "At least one ticker is required." });
      }

      const rows = await Promise.all(
        tickers.map(async (ticker) => {
          const items = await fetchYahooNews(ticker);
          return items.map((item) => ({ ...item, ticker }));
        })
      );

      const merged = rows
        .flat()
        .sort((a, b) => {
          const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
          const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
          return tb - ta;
        })
        .slice(0, limit);

      return writeJson(res, 200, merged);
    }

    if (requestUrl.pathname === "/api/market/news") {
      const tickers = (requestUrl.searchParams.get("tickers") || "")
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);
      const limit = Math.max(1, Math.min(50, Number(requestUrl.searchParams.get("limit") || 20)));

      if (!tickers.length) {
        return writeJson(res, 400, { error: "At least one ticker is required." });
      }

      const keys = resolveProviderKeys(requestUrl.searchParams);
      const payload = await fetchMarketNews(tickers, limit, keys);
      return writeJson(res, 200, payload);
    }

    if (requestUrl.pathname.startsWith("/api/news/")) {
      const ticker = String(requestUrl.pathname.replace("/api/news/", "") || "")
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9.\-]/g, "");
      const limit = Math.max(1, Math.min(50, Number(requestUrl.searchParams.get("limit") || 20)));
      if (!ticker) {
        return writeJson(res, 400, { error: "Missing ticker." });
      }

      const keys = resolveProviderKeys(requestUrl.searchParams);
      let rows = [];
      if (keys.finnhub) {
        rows = await fetchFinnhubNews(ticker, keys.finnhub);
      }
      if (!rows.length && keys.tiingo) {
        rows = await fetchTiingoNews(ticker, keys.tiingo);
      }
      if (!rows.length) {
        const fallback = await fetchYahooNews(ticker);
        rows = fallback.map((item) => ({
          ticker,
          title: item.title || "Untitled",
          headline: item.title || "Untitled",
          source: item.source || "Yahoo",
          publishedAt: item.publishedAt || null,
          datetime: item.publishedAt || null,
          link: item.link || "#",
          url: item.link || "#",
          image: "",
          category: "news",
          summary: item.summary || ""
        }));
      }
      const news = rows.slice(0, limit).map((item) => ({
        headline: item.headline || item.title || "Untitled",
        summary: item.summary || "",
        source: item.source || "Live feed",
        url: item.url || item.link || "#",
        image: item.image || "",
        datetime: item.datetime || item.publishedAt || "",
        category: item.category || "news"
      }));
      return writeJson(res, 200, {
        ticker,
        count: news.length,
        news
      });
    }

    if (requestUrl.pathname === "/api/market/options-flow") {
      const symbols = (requestUrl.searchParams.get("symbols") || "")
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);

      if (!symbols.length) {
        return writeJson(res, 400, { error: "At least one symbol is required." });
      }

      const limit = Math.max(3, Math.min(60, Number(requestUrl.searchParams.get("limit") || 20)));
      const flowType = String(requestUrl.searchParams.get("flowType") || "all").toLowerCase();
      const minNotional = Math.max(0, Number(requestUrl.searchParams.get("minNotional") || 0));
      const unusualOnly = String(requestUrl.searchParams.get("unusualOnly") || "false").toLowerCase() === "true";
      const keys = resolveProviderKeys(requestUrl.searchParams);
      const payload = await fetchOptionsFlow(symbols, {
        limit,
        flowType,
        minNotional,
        unusualOnly,
        keys
      });
      return writeJson(res, 200, payload);
    }

    if (requestUrl.pathname === "/api/yahoo/candles") {
      const symbol = (requestUrl.searchParams.get("symbol") || "").trim().toUpperCase();
      const timeframe = (requestUrl.searchParams.get("timeframe") || "1D").trim().toUpperCase();

      if (!symbol) {
        return writeJson(res, 400, { error: "Symbol is required." });
      }

      const payload = await fetchYahooCandlesWithIndicators(symbol, timeframe);
      return writeJson(res, 200, payload);
    }

    if (requestUrl.pathname === "/api/yahoo/fundamentals") {
      const symbol = (requestUrl.searchParams.get("symbol") || "").trim().toUpperCase();
      if (!symbol) {
        return writeJson(res, 400, { error: "Symbol is required." });
      }
      const payload = await fetchYahooFundamentals(symbol);
      return writeJson(res, 200, payload);
    }

    if (requestUrl.pathname === "/api/market/fundamentals") {
      const symbol = (requestUrl.searchParams.get("symbol") || "").trim().toUpperCase();
      if (!symbol) {
        return writeJson(res, 400, { error: "Symbol is required." });
      }
      const keys = resolveProviderKeys(requestUrl.searchParams);
      const payload = await fetchMarketFundamentals(symbol, keys);
      return writeJson(res, 200, payload);
    }

    if (requestUrl.pathname === "/api/options/scorecard") {
      const tickers = (requestUrl.searchParams.get("tickers") || "SPY,AAPL,TSLA")
        .split(",")
        .map((value) => value.trim().toUpperCase())
        .filter(Boolean);
      const keys = resolveProviderKeys(requestUrl.searchParams);
      const payload = await buildOptionsScorecardPayload(tickers, keys);
      return writeJson(res, 200, payload);
    }

    if (requestUrl.pathname === "/api/live") {
      const ticker = (requestUrl.searchParams.get("ticker") || "").trim().toUpperCase();
      const timeframe = requestUrl.searchParams.get("timeframe") || "1D";
      const style = requestUrl.searchParams.get("style") || "Swing";

      if (!ticker) {
        return writeJson(res, 400, { error: "Ticker is required." });
      }

      const payload = await buildLivePayload(ticker, timeframe, style);
      return writeJson(res, 200, payload);
    }

    if (requestUrl.pathname === "/api/ai/market-terminal" || requestUrl.pathname === "/api/ai/report") {
      if (req.method !== "POST") {
        return writeJson(res, 405, { ok: false, error: "Method not allowed. Use POST." });
      }

      const bodyText = await readRequestBody(req);
      let payload = {};
      try {
        payload = bodyText ? JSON.parse(bodyText) : {};
      } catch {
        payload = {};
      }

      const ticker = String(payload.ticker || payload.symbol || "SPY").trim().toUpperCase() || "SPY";
      const mode = String(payload.mode || "market_open").trim() || "market_open";
      const style = String(payload.style || "professional").trim() || "professional";
      const extraContext = String(payload.extraContext || "").trim();
      const prompt = String(payload.prompt || "").trim();
      const finalPrompt = buildAiPrompt({ ticker, mode, extraContext, prompt });

      try {
        const analysis = await runAiTerminalAnalysis({
          ticker,
          mode,
          style,
          extraContext,
          prompt: finalPrompt
        });
        return writeJson(res, 200, analysis);
      } catch (error) {
        return writeJson(res, 500, {
          ok: false,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    if (requestUrl.pathname === "/api/scan/upload") {
      if (req.method !== "POST") {
        return writeJson(res, 405, { error: "Method not allowed. Use POST." });
      }

      let customerName = "";
      let notes = "";
      let pageUrl = "";
      let quickAsk = "";
      let pageText = "";
      let files = [];

      try {
        const contentType = String(req.headers["content-type"] || "");
        if (contentType.toLowerCase().includes("multipart/form-data")) {
          const bodyBuffer = await readRequestBodyBuffer(req, 30 * 1024 * 1024);
          const parsed = parseMultipartFormData(bodyBuffer, contentType);
          customerName = String(parsed.fields.customerName || "").trim();
          notes = String(parsed.fields.notes || "").trim();
          pageUrl = String(parsed.fields.pageUrl || "").trim();
          quickAsk = String(parsed.fields.quickAsk || parsed.fields.query || "").trim();
          pageText = String(parsed.fields.pageText || "").trim();
          files = parsed.files;
        } else {
          const bodyText = await readRequestBody(req);
          let payload = {};
          try {
            payload = bodyText ? JSON.parse(bodyText) : {};
          } catch {
            payload = {};
          }
          customerName = String(payload.customerName || "").trim();
          notes = String(payload.notes || "").trim();
          pageUrl = String(payload.pageUrl || "").trim();
          quickAsk = String(payload.quickAsk || payload.query || "").trim();
          pageText = String(payload.pageText || "").trim();
          files = Array.isArray(payload.files) ? payload.files.map((item) => ({
            originalName: String(item?.originalName || item?.name || "document"),
            mimeType: String(item?.mimeType || item?.type || "application/octet-stream"),
            size: Number(item?.size || 0)
          })) : [];
        }
      } catch (error) {
        return writeJson(res, 400, {
          error: "Could not read upload payload.",
          details: error instanceof Error ? error.message : String(error)
        });
      }

      const scanPayload = await buildScanUploadPayload({ customerName, notes, pageUrl, quickAsk, pageText, files });
      return writeJson(res, 200, scanPayload);
    }

    if (requestUrl.pathname === "/api/scan/page") {
      if (req.method !== "POST") {
        return writeJson(res, 405, { error: "Method not allowed. Use POST." });
      }

      let payload = {};
      try {
        const bodyText = await readRequestBody(req);
        payload = bodyText ? JSON.parse(bodyText) : {};
      } catch {
        payload = {};
      }

      const scanPayload = await buildScanPagePayload({
        customerName: String(payload.customerName || "").trim(),
        notes: String(payload.notes || "").trim(),
        pageUrl: String(payload.pageUrl || "").trim(),
        quickAsk: String(payload.quickAsk || payload.query || "").trim(),
        pageText: String(payload.pageText || "").trim()
      });
      return writeJson(res, 200, scanPayload);
    }

    if (requestUrl.pathname === "/api/submit/reviewed") {
      if (req.method !== "POST") {
        return writeJson(res, 405, { error: "Method not allowed. Use POST." });
      }

      let payload = {};
      try {
        const bodyText = await readRequestBody(req);
        payload = bodyText ? JSON.parse(bodyText) : {};
      } catch {
        payload = {};
      }

      const scanId = String(payload.scanId || "").trim() || `scan-${Date.now()}`;
      const customerName = String(payload.customerName || "").trim();
      const fields = payload.fields && typeof payload.fields === "object"
        ? sanitizeScanFields(payload.fields)
        : buildInitialScanFields();
      const summary = summarizeScanFields(fields);

      return writeJson(res, 200, {
        ok: true,
        status: "submitted",
        scanId,
        customerName,
        submittedAt: new Date().toISOString(),
        completion: summary.completion,
        averageConfidence: summary.averageConfidence,
        missingFields: summary.missingFields,
        lowConfidenceFields: summary.lowConfidenceFields
      });
    }

    return serveStatic(requestUrl.pathname, res);
  } catch (error) {
    return writeJson(res, 500, {
      error: "Server error",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Institutional Trading Analyst running at http://localhost:${PORT}`);
  const ifaces = os.networkInterfaces();
  const lanIps = Object.values(ifaces)
    .flat()
    .filter((x) => x && x.family === "IPv4" && !x.internal)
    .map((x) => x.address);
  for (const ip of lanIps) {
    console.log(`LAN access: http://${ip}:${PORT}`);
  }
  startTelegramPolling()
    .then(() => {
      const creds = resolveTelegramCredentials();
      if (creds.token && creds.chatId) {
        console.log("Telegram chat bot polling enabled.");
      }
    })
    .catch((error) => {
      console.log(`Telegram polling skipped: ${error?.message || String(error)}`);
    });
});

setInterval(() => {
  processDealerflowFacebookSchedules().catch(() => {});
}, 30000);
processDealerflowFacebookSchedules().catch(() => {});

async function proxyFinancialModelingPrep(requestUrl, res) {
  const upstreamPath = requestUrl.pathname.replace("/api/fmp", "");

  if (!upstreamPath.startsWith("/api/") && !upstreamPath.startsWith("/stable/")) {
    return writeJson(res, 400, { error: "Invalid FMP path." });
  }

  const upstreamUrl = `https://financialmodelingprep.com${upstreamPath}${requestUrl.search}`;

  try {
    const response = await fetch(upstreamUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const contentType = response.headers.get("content-type") || "application/json; charset=utf-8";
    const bodyText = await response.text();

    res.writeHead(response.status, {
      "Content-Type": contentType,
      "Cache-Control": "no-store"
    });
    res.end(bodyText);
  } catch (error) {
    writeJson(res, 502, {
      error: "FMP proxy failed",
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

async function proxyTwelveData(requestUrl, res) {
  const upstreamPath = requestUrl.pathname.replace("/api/td", "");

  if (!upstreamPath.startsWith("/")) {
    return writeJson(res, 400, { error: "Invalid Twelve Data path." });
  }

  const upstreamUrl = `https://api.twelvedata.com${upstreamPath}${requestUrl.search}`;

  try {
    const response = await fetch(upstreamUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const contentType = response.headers.get("content-type") || "application/json; charset=utf-8";
    const bodyText = await response.text();

    res.writeHead(response.status, {
      "Content-Type": contentType,
      "Cache-Control": "no-store"
    });
    res.end(bodyText);
  } catch (error) {
    writeJson(res, 502, {
      error: "Twelve Data proxy failed",
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

function resolveProviderKeys(searchParams) {
  return {
    finnhub: (searchParams.get("finnhubKey") || FINNHUB_API_KEY || "").trim(),
    fmp: (searchParams.get("fmpKey") || FMP_API_KEY || "").trim(),
    twelvedata: (searchParams.get("tdKey") || TWELVE_DATA_API_KEY || "").trim(),
    polygon: (searchParams.get("polygonKey") || POLYGON_API_KEY || "").trim(),
    tiingo: (searchParams.get("tiingoKey") || TIINGO_API_KEY || "").trim(),
    unusualWhales: (searchParams.get("uwKey") || UNUSUAL_WHALES_API_KEY || "").trim(),
    tradier: (searchParams.get("tradierKey") || TRADIER_API_KEY || "").trim(),
  };
}

function isTradingViewWebhookAuthorized(requestUrl, req) {
  if (!TV_WEBHOOK_SECRET) return true;
  const queryToken = String(requestUrl.searchParams.get("token") || "").trim();
  const headerToken = String(req.headers["x-axiom-token"] || req.headers["x-webhook-token"] || "").trim();
  const authHeader = String(req.headers.authorization || "").trim();
  let bearer = "";
  if (authHeader.toLowerCase().startsWith("bearer ")) {
    bearer = authHeader.slice(7).trim();
  }
  const provided = queryToken || headerToken || bearer;
  return provided === TV_WEBHOOK_SECRET;
}

function scoreTradingViewPayload(text) {
  const msg = String(text || "").toLowerCase();
  let score = 72;
  if (msg.includes("breakout")) score += 10;
  if (msg.includes("reclaim")) score += 8;
  if (msg.includes("sweep")) score += 8;
  if (msg.includes("unusual")) score += 8;
  if (msg.includes("bearish") || msg.includes("breakdown")) score += 6;
  if (msg.includes("risk") || msg.includes("invalid")) score += 6;
  return Math.max(55, Math.min(99, score));
}

function inferTradingViewSide(rawSide, message) {
  const side = String(rawSide || "").toUpperCase();
  if (["BUY", "LONG", "CALL"].includes(side)) return "BUY";
  if (["SELL", "SHORT", "PUT"].includes(side)) return "SELL";
  const msg = String(message || "").toLowerCase();
  if (msg.includes("buy") || msg.includes("long") || msg.includes("bull")) return "BUY";
  if (msg.includes("sell") || msg.includes("short") || msg.includes("bear")) return "SELL";
  return "INFO";
}

function parseTradingViewPayload(bodyText) {
  const raw = String(bodyText || "").trim();
  if (!raw) return null;

  let data = null;
  try {
    data = JSON.parse(raw);
  } catch {
    data = { message: raw };
  }
  if (!data || typeof data !== "object") return null;

  const message = String(
    data.message ||
    data.text ||
    data.alert_message ||
    data.alertName ||
    data.note ||
    ""
  ).trim();

  const explicitSymbol = String(data.symbol || data.ticker || data.instrument || data.s || "")
    .trim()
    .toUpperCase();
  const tvSymbolMatch = message.match(/(?:NASDAQ|NYSE|AMEX|CBOE|BINANCE|COINBASE):([A-Z0-9.\-]+)/i);
  const rawSymbolMatch = message.match(/\b([A-Z]{1,6}(?:\-[A-Z]{2,5})?)\b/);
  const symbol = explicitSymbol || (tvSymbolMatch ? String(tvSymbolMatch[1] || "").toUpperCase() : "") || (rawSymbolMatch ? String(rawSymbolMatch[1] || "").toUpperCase() : "");
  if (!symbol) return null;

  const side = inferTradingViewSide(data.side || data.action || data.signal, message);
  const priceNum = Number(data.price || data.close || data.last || 0);
  const timeframe = String(data.timeframe || data.tf || "").toUpperCase();
  const exchange = String(data.exchange || data.market || "").toUpperCase();
  const score = scoreTradingViewPayload(message);
  const type = side === "SELL" ? "risk" : "opportunity";

  return {
    id: `tv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    source: "tradingview",
    symbol,
    side,
    type,
    score,
    message: message || `${symbol} TradingView alert`,
    exchange: exchange || null,
    timeframe: timeframe || null,
    price: Number.isFinite(priceNum) && priceNum > 0 ? Number(priceNum.toFixed(4)) : null,
    at: new Date().toISOString(),
    raw: data
  };
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > 1024 * 1024) {
        reject(new Error("Request body too large."));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });
    req.on("error", reject);
  });
}

function readRequestBodyBuffer(req, maxBytes = 30 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error("Request body too large."));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    req.on("error", reject);
  });
}

function parseMultipartFormData(bodyBuffer, contentType) {
  const fields = {};
  const files = [];
  const boundaryMatch = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(String(contentType || ""));
  const boundaryRaw = boundaryMatch ? (boundaryMatch[1] || boundaryMatch[2] || "").trim() : "";
  if (!boundaryRaw) {
    return { fields, files };
  }
  const boundary = `--${boundaryRaw}`;
  const body = bodyBuffer.toString("binary");
  const parts = body.split(boundary).slice(1, -1);

  for (const rawPart of parts) {
    let part = rawPart;
    if (part.startsWith("\r\n")) part = part.slice(2);
    if (part.endsWith("\r\n")) part = part.slice(0, -2);
    const splitIndex = part.indexOf("\r\n\r\n");
    if (splitIndex < 0) continue;
    const headerText = part.slice(0, splitIndex);
    let valueBinary = part.slice(splitIndex + 4);
    if (valueBinary.endsWith("\r\n")) valueBinary = valueBinary.slice(0, -2);

    const dispo = /content-disposition:\s*form-data;\s*name="([^"]+)"(?:;\s*filename="([^"]*)")?/i.exec(headerText);
    if (!dispo) continue;
    const fieldName = String(dispo[1] || "").trim();
    const fileName = String(dispo[2] || "").trim();
    const typeMatch = /content-type:\s*([^\r\n]+)/i.exec(headerText);
    const mimeType = typeMatch ? String(typeMatch[1]).trim() : "application/octet-stream";

    if (fileName) {
      const contentBuffer = Buffer.from(valueBinary, "binary");
      files.push({
        originalName: fileName,
        mimeType,
        size: contentBuffer.length,
        contentBuffer
      });
    } else if (fieldName) {
      fields[fieldName] = Buffer.from(valueBinary, "binary").toString("utf8").trim();
    }
  }
  return { fields, files };
}

function readJsonFileSafe(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, "utf8");
    if (!raw.trim()) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJsonFileSafe(filePath, payload) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf8");
    return true;
  } catch {
    return false;
  }
}

function cheapTripHashSeed(input) {
  const text = String(input || "").trim().toLowerCase();
  const digest = createHash("sha256").update(text).digest("hex").slice(0, 8);
  return parseInt(digest, 16) || 1;
}

function cheapTripRandom(seed, step = 1) {
  const x = Math.sin(seed * 12.9898 + step * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function cheapTripNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function cheapTripNights(body = {}) {
  const dep = new Date(body.departureDate || body.departure || "");
  const ret = new Date(body.returnDate || body.return || "");
  if (Number.isNaN(dep.getTime()) || Number.isNaN(ret.getTime())) return 5;
  const diff = Math.round((ret.getTime() - dep.getTime()) / 86400000);
  return Math.max(1, Math.min(21, diff || 5));
}

function cheapTripNormalizeSearch(body = {}) {
  return {
    origin: String(body.origin || body.originAirport || body.originCity || "JFK").trim().toUpperCase(),
    destination: String(body.destination || body.destinationAirport || body.destinationCity || "CMN").trim().toUpperCase(),
    departureDate: String(body.departureDate || "").trim(),
    returnDate: String(body.returnDate || "").trim(),
    flexibleDates: Boolean(body.flexibleDates),
    travelers: Math.max(1, Math.min(12, Math.round(cheapTripNumber(body.travelers, 1)))),
    maxBudget: Math.max(0, cheapTripNumber(body.maxBudget, 1200)),
    stayType: String(body.stayType || "Any").trim(),
    language: /^ar/i.test(String(body.language || "")) ? "Arabic" : "English"
  };
}

function buildCheapTripFlightUrl(body = {}) {
  const search = cheapTripNormalizeSearch(body);
  const origin = encodeURIComponent(search.origin || "JFK");
  const destination = encodeURIComponent(search.destination || "CMN");
  const departure = encodeURIComponent(search.departureDate || "");
  const returning = encodeURIComponent(search.returnDate || "");
  const travelers = encodeURIComponent(String(search.travelers || 1));
  return `https://www.google.com/travel/flights?hl=en#flt=${origin}.${destination}.${departure}*${destination}.${origin}.${returning};c:USD;e:1;sd:1;t:f;tt:o;px:${travelers}`;
}

function buildCheapTripHotelUrl(body = {}) {
  return buildCheapTripFlightUrl(body);
}

function buildCheapTripStayUrl(body = {}) {
  return buildCheapTripFlightUrl(body);
}

function buildMockFlightResults(input = {}) {
  const body = cheapTripNormalizeSearch(input);
  const seed = cheapTripHashSeed(`${body.origin}-${body.destination}-${body.departureDate}-${body.returnDate}-${body.travelers}`);
  const airlines = ["Delta", "United", "Air France", "Royal Air Maroc", "American Airlines", "Lufthansa"];
  const results = [];
  for (let i = 0; i < 5; i += 1) {
    const rand = cheapTripRandom(seed, i + 1);
    const stops = i === 0 ? 0 : rand > 0.64 ? 2 : 1;
    const basePrice = 320 + Math.round(rand * 330) + i * 28;
    const flexDiscount = body.flexibleDates ? Math.round((18 + rand * 70) * body.travelers) : 0;
    const totalPrice = Math.max(180, basePrice * body.travelers - flexDiscount);
    const durationHours = 8 + Math.round(rand * 11) + stops * 2;
    const score = Math.max(
      40,
      Math.min(
        98,
        Math.round(
          100
          - (totalPrice / Math.max(body.maxBudget || totalPrice, 1)) * 28
          - stops * 11
          + (body.flexibleDates ? 8 : 0)
          + (stops === 0 ? 10 : 0)
        )
      )
    );
    results.push({
      id: `flight-${seed}-${i + 1}`,
      type: "flight",
      airline: airlines[i % airlines.length],
      price: totalPrice,
      stops,
      durationHours,
      flexibleSavings: flexDiscount,
      score,
      dealLabel: score >= 85 ? "Excellent" : score >= 72 ? "Great" : score >= 60 ? "Solid" : "Average",
      affiliateUrl: buildCheapTripFlightUrl(body)
    });
  }
  return results.sort((a, b) => a.price - b.price);
}

function buildMockHotelResults(input = {}) {
  const body = cheapTripNormalizeSearch(input);
  const seed = cheapTripHashSeed(`hotel-${body.destination}-${body.departureDate}-${body.returnDate}-${body.travelers}`);
  const nights = cheapTripNights(body);
  const names = ["Skyline Suites", "Atlas Business Hotel", "Palm Garden Central", "Harbor View Residence", "Medina Premium Stay"];
  const results = [];
  for (let i = 0; i < 5; i += 1) {
    const rand = cheapTripRandom(seed, i + 10);
    const nightlyRate = 68 + Math.round(rand * 130) + i * 12;
    const rating = Number((3.6 + rand * 1.3).toFixed(1));
    const freeCancellation = rand > 0.42;
    const locationQuality = Math.round(70 + rand * 25 - i * 2);
    const totalPrice = nightlyRate * nights;
    const score = Math.max(
      42,
      Math.min(
        98,
        Math.round(
          100
          - (totalPrice / Math.max(body.maxBudget || totalPrice, 1)) * 18
          + rating * 6
          + (freeCancellation ? 8 : 0)
          + (locationQuality - 70) * 0.45
        )
      )
    );
    results.push({
      id: `hotel-${seed}-${i + 1}`,
      type: "hotel",
      name: names[i % names.length],
      nightlyRate,
      totalPrice,
      rating,
      freeCancellation,
      locationQuality,
      score,
      affiliateUrl: buildCheapTripHotelUrl(body),
      notes: freeCancellation ? "Free cancellation included" : "Non-refundable best rate"
    });
  }
  return results.sort((a, b) => a.totalPrice - b.totalPrice);
}

function buildMockStayResults(input = {}) {
  const body = cheapTripNormalizeSearch(input);
  const seed = cheapTripHashSeed(`stay-${body.destination}-${body.departureDate}-${body.returnDate}-${body.stayType}`);
  const nights = cheapTripNights(body);
  const names = ["City Loft Collection", "Ocean View Apartment", "Old Town Family Flat", "Modern Vacation Rental", "Partner Hosted Suite"];
  const results = [];
  for (let i = 0; i < 5; i += 1) {
    const rand = cheapTripRandom(seed, i + 20);
    const nightlyRate = 74 + Math.round(rand * 150) + i * 10;
    const cleaningFee = 20 + Math.round(rand * 55);
    const totalPrice = nightlyRate * nights + cleaningFee;
    const rating = Number((4.0 + rand * 0.9).toFixed(1));
    const freeCancellation = rand > 0.3;
    const locationQuality = Math.round(72 + rand * 22);
    const score = Math.max(
      40,
      Math.min(
        98,
        Math.round(
          100
          - (totalPrice / Math.max(body.maxBudget || totalPrice, 1)) * 20
          + rating * 6
          + (freeCancellation ? 6 : 0)
          + (locationQuality - 70) * 0.5
        )
      )
    );
    results.push({
      id: `stay-${seed}-${i + 1}`,
      type: "stay",
      name: names[i % names.length],
      inventoryLabel: "Vacation rental partner inventory",
      nightlyRate,
      cleaningFee,
      totalPrice,
      rating,
      freeCancellation,
      locationQuality,
      score,
      affiliateUrl: buildCheapTripStayUrl(body)
    });
  }
  return results.sort((a, b) => a.totalPrice - b.totalPrice);
}

function calculateCheapTripSummary(input = {}, flights = [], hotels = [], stays = []) {
  const body = cheapTripNormalizeSearch(input);
  const cheapestFlight = flights[0] || null;
  const bestFlight = [...flights].sort((a, b) => (b.score - a.score) || (a.price - b.price))[0] || null;
  const cheapestHotel = hotels[0] || null;
  const bestHotel = [...hotels].sort((a, b) => (b.score - a.score) || (a.totalPrice - b.totalPrice))[0] || null;
  const bestStay = [...stays].sort((a, b) => (b.score - a.score) || (a.totalPrice - b.totalPrice))[0] || null;
  const bestLodging = body.stayType === "Hotel" ? bestHotel : (body.stayType === "Apartment" || body.stayType === "Vacation Rental" ? bestStay : (bestStay && bestStay.score >= (bestHotel?.score || 0) ? bestStay : bestHotel));
  const totalTripCost = Math.round((cheapestFlight?.price || 0) + (bestLodging?.totalPrice || 0));
  const budgetLeft = Math.round(Math.max(0, body.maxBudget - totalTripCost));
  const scoreCandidates = [cheapestFlight?.score, bestFlight?.score, cheapestHotel?.score, bestHotel?.score, bestStay?.score].filter((x) => Number.isFinite(Number(x)));
  const avgScore = scoreCandidates.length ? scoreCandidates.reduce((sum, item) => sum + Number(item), 0) / scoreCandidates.length : 50;
  const underBudgetBoost = body.maxBudget > 0 && totalTripCost <= body.maxBudget ? 12 : body.maxBudget > 0 ? -8 : 0;
  const flexibleBoost = body.flexibleDates ? 5 : 0;
  const dealScore = Math.max(1, Math.min(100, Math.round(avgScore + underBudgetBoost + flexibleBoost)));
  return {
    search: body,
    cheapestFlight,
    bestFlight,
    cheapestHotel,
    bestHotel,
    bestStay,
    totalTripCost,
    budgetLeft,
    dealScore,
    recommendation: dealScore >= 85 ? "Book fast — standout deal" : dealScore >= 70 ? "Good value — worth tracking" : dealScore >= 55 ? "Decent, but compare more dates" : "Wait for a better drop"
  };
}

function buildCheapTripReport(summary) {
  const s = summary || {};
  const flight = s.cheapestFlight || {};
  const hotel = s.bestHotel || {};
  const stay = s.bestStay || {};
  const search = s.search || {};
  const en = [
    `CheapTrip AI Report`,
    `Destination: ${search.destination || "-"}`,
    `Dates: ${search.departureDate || "-"} to ${search.returnDate || "-"}`,
    `Travelers: ${search.travelers || 1}`,
    `Cheapest flight: $${cheapTripNumber(flight.price, 0).toFixed(0)}`,
    `Best hotel: $${cheapTripNumber(hotel.totalPrice, 0).toFixed(0)}`,
    `Best vacation rental: $${cheapTripNumber(stay.totalPrice, 0).toFixed(0)}`,
    `Total estimated trip cost: $${cheapTripNumber(s.totalTripCost, 0).toFixed(0)}`,
    `Deal score: ${cheapTripNumber(s.dealScore, 0)}/100`,
    `Recommendation: ${s.recommendation || "Review more options."}`
  ].join("\n");
  const ar = [
    `تقرير CheapTrip AI`,
    `الوجهة: ${search.destination || "-"}`,
    `التواريخ: ${search.departureDate || "-"} إلى ${search.returnDate || "-"}`,
    `عدد المسافرين: ${search.travelers || 1}`,
    `أرخص رحلة: $${cheapTripNumber(flight.price, 0).toFixed(0)}`,
    `أفضل فندق: $${cheapTripNumber(hotel.totalPrice, 0).toFixed(0)}`,
    `أفضل إقامة شبيهة بـ Airbnb: $${cheapTripNumber(stay.totalPrice, 0).toFixed(0)}`,
    `إجمالي التكلفة المتوقعة: $${cheapTripNumber(s.totalTripCost, 0).toFixed(0)}`,
    `درجة الصفقة: ${cheapTripNumber(s.dealScore, 0)}/100`,
    `التوصية: ${s.recommendation || "قارن المزيد من الخيارات قبل الحجز."}`
  ].join("\n");
  return {
    english: en,
    arabic: ar,
    rtl: true
  };
}

function loadCheapTripAlerts() {
  const data = readJsonFileSafe(CHEAPTRIP_ALERTS_FILE, []);
  return Array.isArray(data) ? data : [];
}

function saveCheapTripAlerts(alerts) {
  return writeJsonFileSafe(CHEAPTRIP_ALERTS_FILE, Array.isArray(alerts) ? alerts.slice(0, 1000) : []);
}

function createCheapTripTelegramMessage(alert, currentPrice) {
  return [
    "CheapTrip AI Price Alert",
    `Route: ${alert.origin} → ${alert.destination}`,
    `Target price: $${cheapTripNumber(alert.targetPrice, 0).toFixed(0)}`,
    `Current mock price: $${cheapTripNumber(currentPrice, 0).toFixed(0)}`,
    `Dates: ${alert.departureDate || "-"} to ${alert.returnDate || "-"}`,
    `Travelers: ${alert.travelers || 1}`,
    `Stay type: ${alert.stayType || "Any"}`,
    `Triggered: ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })}`
  ].join("\n");
}

async function checkCheapTripAlertsNow() {
  const alerts = loadCheapTripAlerts();
  const creds = resolveTelegramCredentials();
  const results = [];
  for (const alert of alerts) {
    if (!alert || alert.enabled === false) continue;
    const flights = buildMockFlightResults(alert);
    const currentPrice = cheapTripNumber(flights?.[0]?.price, 0);
    let sent = false;
    let skipped = false;
    if (currentPrice > 0 && currentPrice <= cheapTripNumber(alert.targetPrice, 0)) {
      const lastTriggered = new Date(alert.lastTriggeredAt || 0).getTime();
      const now = Date.now();
      if (Number.isFinite(lastTriggered) && now - lastTriggered < 6 * 60 * 60 * 1000) {
        skipped = true;
      } else if (creds.token && creds.chatId) {
        const sentResult = await sendTelegramMessage(creds.token, creds.chatId, createCheapTripTelegramMessage(alert, currentPrice));
        sent = Boolean(sentResult?.ok);
        if (sent) {
          alert.lastTriggeredAt = new Date().toISOString();
          alert.lastSentPrice = currentPrice;
        }
      }
    }
    alert.lastCheckedAt = new Date().toISOString();
    alert.lastCheckedPrice = currentPrice;
    results.push({
      id: alert.id,
      destination: alert.destination,
      targetPrice: alert.targetPrice,
      currentPrice,
      sent,
      skipped
    });
  }
  saveCheapTripAlerts(alerts);
  return results;
}

function buildInitialScanFields() {
  const fields = {};
  for (const key of SCAN_FIELD_KEYS) {
    fields[key] = { value: "", confidence: 0, source: "" };
  }
  return fields;
}

function toTitleCase(value) {
  return String(value || "")
    .replace(/[_\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((chunk) => chunk ? chunk[0].toUpperCase() + chunk.slice(1).toLowerCase() : "")
    .join(" ")
    .trim();
}

function cleanCustomerName(value) {
  return String(value || "")
    .replace(/\.[^.]+$/i, "")
    .replace(/\b(app|application|loan|deal|customer)\b/ig, " ")
    .replace(/[_\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function guessVehicleFromText(text) {
  const lower = String(text || "").toLowerCase();
  const known = [
    "civic", "accord", "camry", "corolla", "fusion", "f-150", "silverado", "colorado", "tahoe",
    "charger", "challenger", "altima", "sentra", "rogue", "rav4", "cr-v", "pilot", "explorer"
  ];
  for (const name of known) {
    if (lower.includes(name)) return name.toUpperCase();
  }
  return "";
}

function firstRegexMatch(text, patterns, groupIndex = 1) {
  for (const pattern of patterns) {
    const match = String(text || "").match(pattern);
    if (match && match[groupIndex]) {
      return String(match[groupIndex]).trim();
    }
  }
  return "";
}

function normalizePhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return `${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return String(value || "").trim();
}

function normalizeDate(value) {
  const raw = String(value || "").trim();
  const m = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (!m) return raw;
  const mm = String(m[1]).padStart(2, "0");
  const dd = String(m[2]).padStart(2, "0");
  let yyyy = String(m[3]);
  if (yyyy.length === 2) {
    const num = Number(yyyy);
    yyyy = String(num > 30 ? 1900 + num : 2000 + num);
  }
  return `${mm}/${dd}/${yyyy}`;
}

function normalizeMoney(value) {
  const cleaned = String(value || "").replace(/[^0-9.\-]/g, "");
  const num = Number(cleaned);
  if (!Number.isFinite(num)) return "";
  return String(Math.round(num));
}

function normalizeSSNLast4(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length >= 4) return digits.slice(-4);
  return "";
}

function normalizeGeneric(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function setFieldIfFound(fields, key, value, confidence, source) {
  const clean = normalizeGeneric(value);
  if (!clean) return;
  fields[key] = {
    value: clean,
    confidence,
    source
  };
}

async function extractTextFromUploadedFile(file) {
  const name = String(file?.originalName || "").toLowerCase();
  const type = String(file?.mimeType || "").toLowerCase();
  const buffer = file?.contentBuffer;
  if (!buffer || !Buffer.isBuffer(buffer) || !buffer.length) return "";

  try {
    if (type.includes("pdf") || name.endsWith(".pdf")) {
      if (!pdfParse) return "";
      const parsed = await pdfParse(buffer);
      return String(parsed?.text || "").trim();
    }
    if (type.startsWith("text/") || name.endsWith(".txt") || name.endsWith(".csv") || name.endsWith(".json")) {
      return buffer.toString("utf8");
    }
  } catch {
    return "";
  }
  return "";
}

async function extractTextFromUploadedFiles(files) {
  const list = Array.isArray(files) ? files : [];
  const chunks = [];
  for (const file of list) {
    const text = await extractTextFromUploadedFile(file);
    if (text) {
      chunks.push(text.slice(0, 40000));
    }
  }
  return chunks.join("\n");
}

function extractLikelyFields({ customerName, notes, files, extractedText }) {
  const fields = buildInitialScanFields();
  const fileNames = Array.isArray(files) ? files.map((item) => String(item?.originalName || "")).filter(Boolean) : [];
  const sourceName = fileNames[0] || "Current Page";
  const joinedText = [customerName, notes, ...fileNames, extractedText].join("\n");
  const textSource = extractedText ? `OCR/PDF - ${sourceName}` : sourceName;
  const name = toTitleCase(
    firstRegexMatch(joinedText, [
      /(?:applicant|customer|name)\s*[:\-]\s*([A-Z][A-Z.'\- ]{3,})/i
    ]) || cleanCustomerName(customerName || fileNames[0] || "")
  );
  const phoneRaw = firstRegexMatch(joinedText, [
    /(?:phone|cell|mobile|telephone)\s*[:\-]?\s*([()\d.\-\s]{10,})/i,
    /(\+?1?\s*\(?[2-9]\d{2}\)?[\s.\-]?\d{3}[\s.\-]?\d{4})/
  ]);
  const emailRaw = firstRegexMatch(joinedText, [
    /([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i
  ]);
  const dobRaw = firstRegexMatch(joinedText, [
    /(?:date of birth|dob|birth date)\s*[:\-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/
  ]);
  const ssnRaw = firstRegexMatch(joinedText, [
    /(?:ssn|social security)(?:\s*number)?\s*[:\-]?\s*(?:\*{0,3}[-\s]?){0,2}(\d{4})/i,
    /\bXXX[-\s]?XX[-\s]?(\d{4})\b/i
  ]);
  const addressRaw = firstRegexMatch(joinedText, [
    /(?:address|street)\s*[:\-]\s*([^\n\r]+)/i
  ]);
  const cityStateZipRaw = firstRegexMatch(joinedText, [
    /(?:city\/state\/zip|city,\s*state,\s*zip|city state zip)\s*[:\-]\s*([^\n\r]+)/i,
    /\b([A-Z][A-Za-z.'\- ]+,\s*[A-Z]{2}\s+\d{5}(?:-\d{4})?)\b/
  ]);
  const employerRaw = firstRegexMatch(joinedText, [
    /(?:employer|company)\s*[:\-]\s*([^\n\r]+)/i
  ]);
  const jobTitleRaw = firstRegexMatch(joinedText, [
    /(?:job title|position|occupation)\s*[:\-]\s*([^\n\r]+)/i
  ]);
  const monthlyIncomeRaw = firstRegexMatch(joinedText, [
    /(?:monthly income|gross income|income)\s*[:\-]?\s*\$?\s*([0-9][0-9,]*(?:\.\d{1,2})?)/i
  ]);
  const housingPaymentRaw = firstRegexMatch(joinedText, [
    /(?:housing payment|rent|mortgage)\s*[:\-]?\s*\$?\s*([0-9][0-9,]*(?:\.\d{1,2})?)/i
  ]);
  const timeAtResidenceRaw = firstRegexMatch(joinedText, [
    /(?:time at residence|residence time|years at residence)\s*[:\-]?\s*([^\n\r]+)/i
  ]);
  const timeOnJobRaw = firstRegexMatch(joinedText, [
    /(?:time on job|years on job|employment length)\s*[:\-]?\s*([^\n\r]+)/i
  ]);
  const vehicleRaw = firstRegexMatch(joinedText, [
    /(?:vehicle interested|desired vehicle|stock#|stock)\s*[:\-]\s*([^\n\r]+)/i
  ]);
  const vinMatch = joinedText.toUpperCase().match(/\b[A-HJ-NPR-Z0-9]{17}\b/);

  if (name) {
    fields.fullName = { value: name, confidence: extractedText ? 90 : 86, source: textSource };
  }
  if (phoneRaw) {
    setFieldIfFound(fields, "phone", normalizePhone(phoneRaw), extractedText ? 88 : 82, textSource);
  }
  if (emailRaw) {
    setFieldIfFound(fields, "email", emailRaw, 92, textSource);
  }
  if (dobRaw) {
    setFieldIfFound(fields, "dob", normalizeDate(dobRaw), 84, textSource);
  }
  if (ssnRaw) {
    const ssnLast4 = normalizeSSNLast4(ssnRaw);
    if (ssnLast4) setFieldIfFound(fields, "ssnLast4", ssnLast4, 80, textSource);
  }
  if (addressRaw) {
    setFieldIfFound(fields, "address", addressRaw, 80, textSource);
  }
  if (cityStateZipRaw) {
    setFieldIfFound(fields, "cityStateZip", cityStateZipRaw, 78, textSource);
  }
  if (employerRaw) {
    setFieldIfFound(fields, "employer", employerRaw, 78, textSource);
  }
  if (jobTitleRaw) {
    setFieldIfFound(fields, "jobTitle", jobTitleRaw, 76, textSource);
  }
  if (monthlyIncomeRaw) {
    setFieldIfFound(fields, "monthlyIncome", normalizeMoney(monthlyIncomeRaw), 76, textSource);
  }
  if (housingPaymentRaw) {
    setFieldIfFound(fields, "housingPayment", normalizeMoney(housingPaymentRaw), 74, textSource);
  }
  if (timeAtResidenceRaw) {
    setFieldIfFound(fields, "timeAtResidence", timeAtResidenceRaw, 72, textSource);
  }
  if (timeOnJobRaw) {
    setFieldIfFound(fields, "timeOnJob", timeOnJobRaw, 72, textSource);
  }
  const vehicle = vehicleRaw || guessVehicleFromText(joinedText);
  if (vehicle || vinMatch) {
    fields.vehicleInterested = {
      value: vehicle || `VIN ${vinMatch[0]}`,
      confidence: vehicle ? 82 : 76,
      source: textSource
    };
  }
  if (!fields.employer.value && String(notes || "").trim()) {
    fields.employer = { value: "Needs Verification", confidence: 58, source: "Internal Notes" };
  }
  return fields;
}

function sanitizeScanFields(rawFields) {
  const fields = buildInitialScanFields();
  for (const key of SCAN_FIELD_KEYS) {
    const raw = rawFields?.[key];
    if (!raw || typeof raw !== "object") continue;
    const value = String(raw.value || "").trim();
    const confidence = Number(raw.confidence || 0);
    fields[key] = {
      value,
      confidence: Number.isFinite(confidence) ? Math.max(0, Math.min(100, confidence)) : 0,
      source: String(raw.source || "").trim()
    };
  }
  return fields;
}

function summarizeScanFields(fields) {
  const missingFields = [];
  const lowConfidenceFields = [];
  let completed = 0;
  let confidenceTotal = 0;
  let confidenceCount = 0;

  for (const key of SCAN_FIELD_KEYS) {
    const label = SCAN_FIELD_LABELS[key];
    const row = fields?.[key] || { value: "", confidence: 0, source: "" };
    const value = String(row.value || "").trim();
    const confidence = Number(row.confidence || 0);
    if (!value) {
      missingFields.push(label);
      continue;
    }
    completed += 1;
    if (confidence > 0) {
      confidenceTotal += confidence;
      confidenceCount += 1;
    }
    if (confidence > 0 && confidence < 80) {
      lowConfidenceFields.push({
        key,
        label,
        confidence,
        source: String(row.source || "Detected")
      });
    }
  }

  return {
    completion: Math.round((completed / SCAN_FIELD_KEYS.length) * 100),
    averageConfidence: confidenceCount ? Math.round(confidenceTotal / confidenceCount) : 0,
    missingFields,
    lowConfidenceFields
  };
}

function buildScanReportPayload({ customerName, pageUrl, quickAsk, scanSource, fields, summary }) {
  const cleanName = String(customerName || "").trim();
  const source = String(scanSource || "Current Page");
  const extracted = SCAN_FIELD_KEYS
    .map((key) => {
      const row = fields?.[key] || { value: "", confidence: 0, source: "" };
      const value = String(row.value || "").trim();
      if (!value) return null;
      return {
        label: SCAN_FIELD_LABELS[key],
        value,
        confidence: Number(row.confidence || 0),
        source: String(row.source || "Detected")
      };
    })
    .filter(Boolean);

  const missing = Array.isArray(summary?.missingFields) ? summary.missingFields : [];
  const lowConfidence = Array.isArray(summary?.lowConfidenceFields) ? summary.lowConfidenceFields : [];
  const confidence = Number(summary?.averageConfidence || 0);
  const mainUpdates = [`Detected ${extracted.length} populated field(s) from scan input.`];
  if (fields?.vehicleInterested?.value) {
    mainUpdates.push(`Vehicle context found: ${fields.vehicleInterested.value}.`);
  }
  if (lowConfidence.length) {
    mainUpdates.push(`${lowConfidence.length} low-confidence field(s) need manual review.`);
  } else {
    mainUpdates.push("No low-confidence fields detected.");
  }
  if (quickAsk) mainUpdates.push(`Quick ask: ${quickAsk}`);

  const issues = [];
  if (lowConfidence.length) {
    lowConfidence.slice(0, 4).forEach((item) => {
      issues.push(`${item.label || "Field"} confidence is ${Number(item.confidence || 0)}%.`);
    });
  }
  if (!issues.length) issues.push("No major scan-confidence issues detected.");
  if (!missing.length) issues.push("All mapped fields currently have values.");

  const nextActions = [];
  if (missing.length) nextActions.push(`Collect missing fields: ${missing.slice(0, 5).join(", ")}.`);
  nextActions.push("Verify low-confidence fields with the customer before lender submission.");
  nextActions.push("Approve and push reviewed payload to backend.");

  return {
    title: `${cleanName || "Customer"} Application Review`,
    summary: `Scan completed${pageUrl ? ` for ${pageUrl}` : ""} with ${confidence}% average confidence.`,
    pageType: "Credit Application / Intake",
    scanSource: source,
    confidence,
    mainUpdates,
    extracted,
    missing,
    issues,
    nextActions,
    generatedAt: new Date().toISOString()
  };
}

async function buildScanUploadPayload({ customerName, notes, pageUrl, quickAsk, pageText, files }) {
  const cleanName = String(customerName || "").trim();
  const cleanNotes = String(notes || "").trim();
  const cleanPageUrl = String(pageUrl || "").trim();
  const cleanQuickAsk = String(quickAsk || "").trim();
  const cleanPageText = String(pageText || "").trim().slice(0, 60000);
  const safeFiles = Array.isArray(files) ? files : [];
  const extractedText = await extractTextFromUploadedFiles(safeFiles);
  const mergedText = [cleanPageText, extractedText].filter(Boolean).join("\n");
  const fields = extractLikelyFields({
    customerName: cleanName,
    notes: [cleanNotes, cleanQuickAsk, cleanPageUrl].filter(Boolean).join("\n"),
    files: safeFiles,
    extractedText: mergedText
  });
  const summary = summarizeScanFields(fields);
  const report = buildScanReportPayload({
    customerName: cleanName,
    pageUrl: cleanPageUrl,
    quickAsk: cleanQuickAsk,
    scanSource: safeFiles.length ? "Uploaded Documents + Page" : "Current Page",
    fields,
    summary
  });

  return {
    scanId: `scan-${Date.now()}`,
    status: "ready_for_review",
    completion: summary.completion,
    averageConfidence: summary.averageConfidence,
    missingFields: summary.missingFields,
    lowConfidenceFields: summary.lowConfidenceFields,
    files: safeFiles.map((item) => ({
      originalName: String(item?.originalName || "document"),
      mimeType: String(item?.mimeType || "application/octet-stream"),
      size: Number(item?.size || 0)
    })),
    fields,
    report
  };
}

async function buildScanPagePayload({ customerName, notes, pageUrl, quickAsk, pageText }) {
  return buildScanUploadPayload({
    customerName,
    notes,
    pageUrl,
    quickAsk,
    pageText,
    files: []
  });
}

async function fetchJsonSafe(url, headers = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        ...headers,
      }
    });
    if (!response.ok) return null;
    const payload = await response.json();
    return payload || null;
  } catch {
    return null;
  }
}

function withTimeout(promise, ms, fallbackValue) {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve(fallbackValue), ms)),
  ]);
}

function normalizeFmpQuoteRow(raw) {
  if (!raw) return null;
  const symbol = String(raw.symbol || "").toUpperCase();
  if (!symbol) return null;
  const price = Number(raw.price);
  const previousClose = Number(raw.previousClose);
  const change = Number(raw.change);
  const changesPercentage = Number(raw.changesPercentage);
  return {
    symbol,
    name: raw.name || raw.companyName || symbol,
    price: Number.isFinite(price) ? price : 0,
    change: Number.isFinite(change) ? change : 0,
    changesPercentage: Number.isFinite(changesPercentage) ? changesPercentage : 0,
    open: Number(raw.open) || 0,
    previousClose: Number.isFinite(previousClose) ? previousClose : 0,
    dayHigh: Number(raw.dayHigh) || 0,
    dayLow: Number(raw.dayLow) || 0,
    volume: Number(raw.volume) || 0,
    avgVolume: Number(raw.avgVolume) || 0,
    yearHigh: Number(raw.yearHigh) || 0,
    yearLow: Number(raw.yearLow) || 0,
    marketCap: Number(raw.marketCap) || 0,
    pe: Number(raw.pe) || 0,
    priceAvg50: Number(raw.priceAvg50) || 0,
    priceAvg200: Number(raw.priceAvg200) || 0,
    preMarketPrice: 0,
    postMarketPrice: 0,
    preMarketChangePercent: 0,
    postMarketChangePercent: 0,
  };
}

async function fetchFmpQuotes(symbols, fmpKey) {
  if (!fmpKey) return [];
  const list = symbols.map((s) => String(s || "").trim()).filter(Boolean).join(",");
  if (!list) return [];
  const url = `https://financialmodelingprep.com/api/v3/quote/${encodeURIComponent(list)}?apikey=${encodeURIComponent(fmpKey)}`;
  const payload = await fetchJsonSafe(url);
  if (!Array.isArray(payload)) return [];
  return payload.map(normalizeFmpQuoteRow).filter(Boolean);
}

async function fetchFinnhubQuotes(symbols, finnhubKey) {
  if (!finnhubKey || !symbols.length) return [];
  const rows = await Promise.all(symbols.map(async (symbol) => {
    const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${encodeURIComponent(finnhubKey)}`;
    const profileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${encodeURIComponent(finnhubKey)}`;
    const [quote, profile] = await Promise.all([
      fetchJsonSafe(quoteUrl),
      fetchJsonSafe(profileUrl),
    ]);
    if (!quote || Number(quote.c) <= 0) return null;
    const price = Number(quote.c) || 0;
    const previousClose = Number(quote.pc) || 0;
    const change = price - previousClose;
    const changesPercentage = previousClose ? ((price - previousClose) / previousClose) * 100 : 0;
    const marketCapM = Number(profile?.marketCapitalization);
    return {
      symbol,
      name: profile?.name || symbol,
      price: round2(price),
      change: round2(change),
      changesPercentage: round2(changesPercentage),
      open: round2(Number(quote.o) || 0),
      previousClose: round2(previousClose),
      dayHigh: round2(Number(quote.h) || 0),
      dayLow: round2(Number(quote.l) || 0),
      volume: 0,
      avgVolume: 0,
      yearHigh: 0,
      yearLow: 0,
      marketCap: Number.isFinite(marketCapM) && marketCapM > 0 ? marketCapM * 1e6 : 0,
      pe: 0,
      priceAvg50: 0,
      priceAvg200: 0,
      preMarketPrice: 0,
      postMarketPrice: 0,
      preMarketChangePercent: 0,
      postMarketChangePercent: 0,
    };
  }));
  return rows.filter(Boolean);
}

async function fetchTiingoQuoteForSymbol(symbol, tiingoKey) {
  if (!tiingoKey || !symbol) return null;
  const clean = String(symbol || "").trim().toUpperCase();
  try {
    const [metaResponse, pricesResponse] = await Promise.all([
      fetch(`https://api.tiingo.com/tiingo/daily/${encodeURIComponent(clean)}?token=${encodeURIComponent(tiingoKey)}`, {
        headers: { "User-Agent": "ADOL22/1.0" }
      }),
      fetch(`https://api.tiingo.com/tiingo/daily/${encodeURIComponent(clean)}/prices?resampleFreq=daily&limit=2&token=${encodeURIComponent(tiingoKey)}`, {
        headers: { "User-Agent": "ADOL22/1.0" }
      })
    ]);
    if (!metaResponse.ok || !pricesResponse.ok) return null;
    const meta = await metaResponse.json();
    const prices = await pricesResponse.json();
    if (!Array.isArray(prices) || !prices.length) return null;
    const latest = prices[prices.length - 1] || {};
    const previous = prices.length > 1 ? prices[prices.length - 2] || {} : latest;
    const price = Number(latest.close ?? latest.adjClose ?? 0);
    const previousClose = Number(previous.close ?? previous.adjClose ?? price);
    if (!Number.isFinite(price) || price <= 0) return null;
    const change = price - (Number.isFinite(previousClose) ? previousClose : price);
    const changesPercentage = previousClose ? ((price - previousClose) / previousClose) * 100 : 0;
    return {
      symbol: clean,
      name: String(meta?.name || clean),
      price: round2(price),
      change: round2(change),
      changesPercentage: round2(changesPercentage),
      open: round2(Number(latest.open ?? latest.adjOpen ?? 0) || 0),
      previousClose: round2(previousClose || 0),
      dayHigh: round2(Number(latest.high ?? latest.adjHigh ?? 0) || 0),
      dayLow: round2(Number(latest.low ?? latest.adjLow ?? 0) || 0),
      volume: Math.round(Number(latest.volume ?? latest.adjVolume ?? 0) || 0),
      avgVolume: 0,
      yearHigh: 0,
      yearLow: 0,
      marketCap: 0,
      pe: 0,
      priceAvg50: 0,
      priceAvg200: 0,
      preMarketPrice: 0,
      postMarketPrice: 0,
      preMarketChangePercent: 0,
      postMarketChangePercent: 0,
      source: "tiingo-daily"
    };
  } catch {
    return null;
  }
}

async function fetchTiingoQuotes(symbols, tiingoKey) {
  if (!tiingoKey || !Array.isArray(symbols) || !symbols.length) return [];
  const rows = await Promise.all(symbols.map((symbol) => fetchTiingoQuoteForSymbol(symbol, tiingoKey)));
  return rows.filter(Boolean);
}

function mergeQuoteRows(primaryRows, overlayRows) {
  const overlay = Object.fromEntries(
    (overlayRows || []).map((row) => [String(row.symbol || "").toUpperCase(), row])
  );

  return (primaryRows || []).map((row) => {
    const key = String(row.symbol || "").toUpperCase();
    const o = overlay[key];
    if (!o) return row;
    return {
      ...row,
      name: row.name || o.name,
      marketCap: Number(row.marketCap) > 0 ? row.marketCap : (Number(o.marketCap) || 0),
      pe: Number(row.pe) > 0 ? row.pe : (Number(o.pe) || 0),
      priceAvg50: Number(row.priceAvg50) > 0 ? row.priceAvg50 : (Number(o.priceAvg50) || 0),
      priceAvg200: Number(row.priceAvg200) > 0 ? row.priceAvg200 : (Number(o.priceAvg200) || 0),
      avgVolume: Number(row.avgVolume) > 0 ? row.avgVolume : (Number(o.avgVolume) || 0),
      yearHigh: Number(row.yearHigh) > 0 ? row.yearHigh : (Number(o.yearHigh) || 0),
      yearLow: Number(row.yearLow) > 0 ? row.yearLow : (Number(o.yearLow) || 0),
    };
  });
}

async function fetchMarketQuotes(symbols, keys) {
  const liveBatch = await withTimeout(fetchYahooQuoteBatch(symbols), 5000, []);
  const quoteFirstRows = normalizeQuoteBatchToRows(symbols, Array.isArray(liveBatch) ? liveBatch : []);
  const yahooRows = quoteFirstRows.length
    ? quoteFirstRows
    : await withTimeout(fetchYahooQuotes(symbols), MARKET_QUOTE_TIMEOUT_MS, []);
  const resolvedYahoo = Array.isArray(yahooRows) ? yahooRows : [];
  const hasGaps = resolvedYahoo.some((row) => !Number.isFinite(Number(row.marketCap)) || Number(row.marketCap) <= 0);

  if (keys.fmp) {
    const fmpRows = await fetchFmpQuotes(symbols, keys.fmp);
    if (fmpRows.length) {
      if (!resolvedYahoo.length) {
        return fmpRows.map((row) => ({
          ...row,
          delta1d: round2(row.changesPercentage || 0),
          delta1w: 0,
          delta5m: 0,
          delta30m: 0,
        }));
      }
      if (hasGaps) return mergeQuoteRows(resolvedYahoo, fmpRows);
    }
  }

  if (!resolvedYahoo.length && keys.finnhub) {
    const fhRows = await fetchFinnhubQuotes(symbols, keys.finnhub);
    if (fhRows.length) {
      return fhRows.map((row) => ({
        ...row,
        delta1d: round2(row.changesPercentage || 0),
        delta1w: 0,
        delta5m: 0,
        delta30m: 0,
      }));
    }
  }

  if (!resolvedYahoo.length && keys.tiingo) {
    const tiingoRows = await fetchTiingoQuotes(symbols, keys.tiingo);
    if (tiingoRows.length) {
      return tiingoRows.map((row) => ({
        ...row,
        delta1d: round2(row.changesPercentage || 0),
        delta1w: 0,
        delta5m: 0,
        delta30m: 0,
      }));
    }
  }

  return resolvedYahoo;
}

function normalizeQuoteBatchToRows(symbols, liveRows) {
  if (!Array.isArray(symbols) || !symbols.length || !Array.isArray(liveRows) || !liveRows.length) return [];
  const bySymbol = Object.fromEntries(
    liveRows.map((row) => [String(row.symbol || "").toUpperCase(), row])
  );
  const rows = symbols.map((symbol) => {
    const live = bySymbol[String(symbol || "").toUpperCase()];
    if (!live) return null;
    const price = Number(live?.regularMarketPrice);
    const previousClose = Number(live?.regularMarketPreviousClose);
    const change = Number(live?.regularMarketChange);
    const chgPct = Number(live?.regularMarketChangePercent);
    if (!Number.isFinite(price) || price <= 0) return null;
    return {
      symbol,
      name: live?.longName || live?.shortName || symbol,
      price: round2(price),
      change: round2(Number.isFinite(change) ? change : (previousClose ? (price - previousClose) : 0)),
      changesPercentage: round2(Number.isFinite(chgPct) ? chgPct : (previousClose ? ((price - previousClose) / previousClose) * 100 : 0)),
      delta1d: round2(Number.isFinite(chgPct) ? chgPct : 0),
      delta1w: 0,
      delta5m: 0,
      delta30m: 0,
      open: round2(Number(live?.regularMarketOpen) || 0),
      previousClose: round2(previousClose || 0),
      dayHigh: round2(Number(live?.regularMarketDayHigh) || price),
      dayLow: round2(Number(live?.regularMarketDayLow) || price),
      volume: Number(live?.regularMarketVolume) || 0,
      avgVolume: Number(live?.averageDailyVolume3Month) || 0,
      yearHigh: round2(Number(live?.fiftyTwoWeekHigh) || 0),
      yearLow: round2(Number(live?.fiftyTwoWeekLow) || 0),
      marketCap: Number(live?.marketCap) || 0,
      priceAvg50: 0,
      priceAvg200: 0,
      preMarketPrice: round2(Number(live?.preMarketPrice) || 0),
      postMarketPrice: round2(Number(live?.postMarketPrice) || 0),
      preMarketChangePercent: round2(Number(live?.preMarketChangePercent) || 0),
      postMarketChangePercent: round2(Number(live?.postMarketChangePercent) || 0),
    };
  }).filter(Boolean);
  return rows;
}

async function fetchFinnhubNews(ticker, finnhubKey) {
  if (!finnhubKey || !ticker) return [];
  const to = new Date();
  const from = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const fromIso = from.toISOString().slice(0, 10);
  const toIso = to.toISOString().slice(0, 10);
  const url = `https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(ticker)}&from=${fromIso}&to=${toIso}&token=${encodeURIComponent(finnhubKey)}`;
  const payload = await fetchJsonSafe(url);
  if (!Array.isArray(payload)) return [];
  return payload.map((item) => ({
    ticker,
    title: item.headline || "Untitled",
    headline: item.headline || "Untitled",
    source: item.source || "Finnhub",
    publishedAt: item.datetime ? new Date(Number(item.datetime) * 1000).toISOString() : null,
    datetime: item.datetime ? new Date(Number(item.datetime) * 1000).toISOString() : null,
    link: item.url || "#",
    url: item.url || "#",
    image: item.image || "",
    category: item.category || "",
    summary: trimText(item.summary || "", 240),
  }));
}

async function fetchTiingoNews(ticker, tiingoKey) {
  if (!tiingoKey || !ticker) return [];
  const symbol = String(ticker || "").trim().toUpperCase();
  const url = `https://api.tiingo.com/tiingo/news?tickers=${encodeURIComponent(symbol)}&limit=10&sortBy=publishedDate`;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(url, {
      headers: {
        "Authorization": `Token ${tiingoKey}`,
        "Content-Type": "application/json",
        "User-Agent": "ADOL22/1.0"
      },
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!response.ok) {
      return [];
    }
    const payload = await response.json();
    if (!Array.isArray(payload)) return [];
    return payload.map((item) => ({
      ticker: symbol,
      title: item?.title || item?.headline || "Untitled",
      headline: item?.title || item?.headline || "Untitled",
      source: item?.source || "Tiingo",
      publishedAt: item?.publishedDate ? new Date(item.publishedDate).toISOString() : null,
      datetime: item?.publishedDate ? new Date(item.publishedDate).toISOString() : null,
      link: item?.url || "#",
      url: item?.url || "#",
      image: item?.image?.url || item?.image || "",
      category: Array.isArray(item?.tags) ? item.tags.join(", ") : "news",
      summary: trimText(item?.description || item?.summary || "", 240),
    }));
  } catch {
    return [];
  }
}

function mcBuildUrl(pathname, params = {}, apiKey = "") {
  const u = new URL(`https://api.marketcheck.com/v2/${String(pathname || "").replace(/^\/+/, "")}`);
  for (const [k, v] of Object.entries(params || {})) {
    if (v === undefined || v === null) continue;
    const s = String(v).trim();
    if (!s) continue;
    u.searchParams.set(k, s);
  }
  u.searchParams.set("api_key", String(apiKey || "").trim());
  return u.toString();
}

async function mcFetch(pathname, params = {}, apiKey = "") {
  if (!apiKey) return { ok: false, statusCode: 401, error: "MarketCheck API key is missing." };
  const url = mcBuildUrl(pathname, params, apiKey);
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "DixieMotors/1.0 (+MarketCheck Proxy)",
        "Accept": "application/json"
      }
    });
    let body = {};
    try {
      body = await response.json();
    } catch {
      body = {};
    }
    if (!response.ok) {
      return {
        ok: false,
        statusCode: response.status,
        error: body?.error || body?.message || "MarketCheck request failed",
        raw: body
      };
    }
    return { ok: true, statusCode: response.status, data: body || {} };
  } catch (error) {
    return { ok: false, statusCode: 500, error: error?.message || "MarketCheck network error" };
  }
}

function mcNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function mcNormalizeCompRows(payload) {
  const rows = Array.isArray(payload?.listings)
    ? payload.listings
    : Array.isArray(payload?.results)
      ? payload.results
      : Array.isArray(payload?.cars)
        ? payload.cars
        : [];
  return rows.map((row) => {
    const price = mcNumber(row?.price, NaN);
    const mileage = mcNumber(row?.miles ?? row?.mileage, NaN);
    const vin = String(row?.vin || "").trim().toUpperCase();
    const year = String(row?.year || "").trim();
    const make = String(row?.make || "").trim();
    const model = String(row?.model || "").trim();
    const trim = String(row?.trim || "").trim();
    const heading = String(row?.heading || row?.title || "").trim();
    const source = String(row?.source || row?.dom || "marketcheck").trim();
    const city = String(row?.city || "").trim();
    const state = String(row?.state || "").trim();
    const dist = mcNumber(row?.dist ?? row?.distance, NaN);
    const vdpUrl = String(row?.vdp_url || row?.link || row?.url || "").trim();
    return {
      vin,
      year,
      make,
      model,
      trim,
      heading,
      price: Number.isFinite(price) ? round2(price) : null,
      miles: Number.isFinite(mileage) ? Math.round(mileage) : null,
      source,
      city,
      state,
      distance: Number.isFinite(dist) ? round2(dist) : null,
      link: vdpUrl
    };
  }).filter((row) => Number.isFinite(row.price));
}

function mcSummary(compRows) {
  const prices = (compRows || []).map((x) => Number(x.price)).filter(Number.isFinite);
  const miles = (compRows || []).map((x) => Number(x.miles)).filter(Number.isFinite);
  if (!prices.length) {
    return {
      count: 0,
      avgPrice: null,
      lowPrice: null,
      highPrice: null,
      medianPrice: null,
      avgMiles: null
    };
  }
  const sorted = [...prices].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  const avg = sorted.reduce((s, n) => s + n, 0) / sorted.length;
  const avgMiles = miles.length ? (miles.reduce((s, n) => s + n, 0) / miles.length) : null;
  return {
    count: sorted.length,
    avgPrice: round2(avg),
    lowPrice: round2(sorted[0]),
    highPrice: round2(sorted[sorted.length - 1]),
    medianPrice: round2(median),
    avgMiles: Number.isFinite(avgMiles) ? Math.round(avgMiles) : null
  };
}

async function fetchMarketNews(tickers, limit, keys) {
  if (keys.finnhub) {
    const rows = await Promise.all(tickers.map((ticker) => fetchFinnhubNews(ticker, keys.finnhub)));
    const merged = rows
      .flat()
      .sort((a, b) => {
        const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
        const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
        return tb - ta;
      })
      .slice(0, limit);
    if (merged.length) return merged;
  }

  if (keys.tiingo) {
    const rows = await Promise.all(tickers.map((ticker) => fetchTiingoNews(ticker, keys.tiingo)));
    const merged = rows
      .flat()
      .sort((a, b) => {
        const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
        const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
        return tb - ta;
      })
      .slice(0, limit);
    if (merged.length) return merged;
  }

  const rows = await Promise.all(
    tickers.map(async (ticker) => {
      const items = await fetchYahooNews(ticker);
      return items.map((item) => ({ ...item, ticker }));
    })
  );
  return rows
    .flat()
    .sort((a, b) => {
      const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
      const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
      return tb - ta;
    })
    .slice(0, limit);
}

async function fetchFmpFundamentals(symbol, fmpKey) {
  if (!fmpKey || !symbol) return null;
  const quoteUrl = `https://financialmodelingprep.com/api/v3/quote/${encodeURIComponent(symbol)}?apikey=${encodeURIComponent(fmpKey)}`;
  const profileUrl = `https://financialmodelingprep.com/api/v3/profile/${encodeURIComponent(symbol)}?apikey=${encodeURIComponent(fmpKey)}`;
  const [quotePayload, profilePayload] = await Promise.all([fetchJsonSafe(quoteUrl), fetchJsonSafe(profileUrl)]);
  const quote = Array.isArray(quotePayload) ? quotePayload[0] : null;
  const profile = Array.isArray(profilePayload) ? profilePayload[0] : null;
  if (!quote && !profile) return null;
  const n = (v) => {
    const parsed = Number(v);
    return Number.isFinite(parsed) ? parsed : null;
  };
  const text = (v) => {
    if (v === null || v === undefined) return null;
    const s = String(v).trim();
    return s ? s : null;
  };
  return {
    symbol,
    marketCap: n(quote?.marketCap) ?? n(profile?.mktCap),
    pe: n(quote?.pe),
    eps: n(quote?.eps),
    sharesOutstanding: n(profile?.sharesOutstanding),
    earningsDate: text(quote?.earningsAnnouncement),
    avgVolume: n(quote?.avgVolume) ?? n(profile?.volAvg),
    fiftyTwoWeekHigh: n(quote?.yearHigh),
    fiftyTwoWeekLow: n(quote?.yearLow),
    beta: n(profile?.beta),
    revenue: n(profile?.revenue),
    dividendYield: n(quote?.dividendYield),
    priceToBook: n(quote?.priceToBookRatio),
    targetMeanPrice: n(quote?.priceTargetAverage),
    recommendation: text(quote?.analystRating),
    sector: text(profile?.sector),
    industry: text(profile?.industry),
    source: "fmp"
  };
}

async function fetchTiingoFundamentals(symbol, tiingoKey) {
  if (!tiingoKey || !symbol) return null;
  const clean = String(symbol || "").trim().toUpperCase();
  try {
    const metaResponse = await fetch(`https://api.tiingo.com/tiingo/daily/${encodeURIComponent(clean)}?token=${encodeURIComponent(tiingoKey)}`, {
      headers: { "User-Agent": "ADOL22/1.0" }
    });
    if (!metaResponse.ok) return null;
    const meta = await metaResponse.json();
    if (!meta || typeof meta !== "object") return null;
    return {
      symbol: clean,
      companyName: String(meta?.name || "").trim() || null,
      description: String(meta?.description || "").trim() || null,
      exchange: String(meta?.exchangeCode || "").trim() || null,
      startDate: String(meta?.startDate || "").trim() || null,
      endDate: String(meta?.endDate || "").trim() || null,
      source: "tiingo"
    };
  } catch {
    return null;
  }
}

async function fetchMarketFundamentals(symbol, keys) {
  const yahoo = await fetchYahooFundamentals(symbol);
  const fmp = keys.fmp ? await fetchFmpFundamentals(symbol, keys.fmp) : null;
  const tiingo = keys.tiingo ? await fetchTiingoFundamentals(symbol, keys.tiingo) : null;
  const merged = { ...(yahoo || {}), ...(fmp || {}), ...(tiingo || {}) };
  for (const sourceChunk of [fmp, tiingo]) {
    for (const [key, value] of Object.entries(sourceChunk || {})) {
      if (value !== null && value !== undefined && value !== "") merged[key] = value;
    }
  }
  const sources = [fmp?.source, tiingo?.source, yahoo?.source].filter(Boolean);
  merged.source = sources.length ? Array.from(new Set(sources)).join("+") : "market";
  return merged;
}

async function fetchOptionsFlow(symbols, options = {}) {
  const limit = Math.max(3, Math.min(60, Number(options?.limit || 20)));
  const flowType = String(options?.flowType || "all").toLowerCase();
  const minNotional = Math.max(0, Number(options?.minNotional || 0));
  const unusualOnly = Boolean(options?.unusualOnly);
  const keys = options?.keys || {};

  let rows = [];
  let source = "estimated-from-price-volume";

  if (keys.tradier) {
    const tradierRows = await withTimeout(fetchTradierOptionsFlow(symbols, keys.tradier), 12000, []);
    if (tradierRows.length) {
      rows = tradierRows;
      source = "tradier-options";
    }
  }

  if (!rows.length) {
    const yahooRows = await Promise.all(
      symbols.map((symbol) => withTimeout(fetchYahooOptionsFlowForSymbol(symbol), 7000, null))
    );
    rows = yahooRows.filter(Boolean);
    if (rows.length) source = "yahoo-options";
  }

  if (!rows.length) {
    rows = await fetchEstimatedOptionsFlow(symbols);
    source = "estimated-from-price-volume";
  }

  const flow = filterFlowRows(
    rows.flatMap((entry) => entry.flowRows || []),
    { flowType, minNotional, unusualOnly }
  )
    .sort((a, b) => (b.notional || 0) - (a.notional || 0))
    .slice(0, limit);

  const summary = {
    totalContracts: flow.reduce((acc, row) => acc + (Number(row.volume) || 0), 0),
    callNotional: round2(flow.filter((row) => row.side === "CALL").reduce((acc, row) => acc + (Number(row.notional) || 0), 0)),
    putNotional: round2(flow.filter((row) => row.side === "PUT").reduce((acc, row) => acc + (Number(row.notional) || 0), 0)),
  };

  return {
    generatedAt: new Date().toISOString(),
    source,
    filters: { flowType, minNotional, unusualOnly },
    symbols,
    summary,
    bySymbol: rows.map((entry) => ({
      symbol: entry.symbol,
      expiration: entry.expiration,
      callPutRatio: entry.callPutRatio,
      topContracts: entry.flowRows.slice(0, 6),
    })),
    flow,
  };
}

function filterFlowRows(rows, filters) {
  const flowType = String(filters?.flowType || "all").toLowerCase();
  const minNotional = Math.max(0, Number(filters?.minNotional || 0));
  const unusualOnly = Boolean(filters?.unusualOnly);
  return (rows || []).filter((row) => {
    const notional = Number(row?.notional || 0);
    if (notional < minNotional) return false;
    if (unusualOnly && !row?.unusual) return false;
    if (flowType === "sweep" && row?.tradeType !== "SWEEP") return false;
    if (flowType === "darkpool" && row?.tradeType !== "DARKPOOL") return false;
    if (flowType === "block" && row?.tradeType !== "BLOCK") return false;
    return true;
  });
}

async function fetchTradierOptionsFlow(symbols, tradierKey) {
  if (!tradierKey || !symbols.length) return [];
  const exp = nextFridayIso();
  const rows = await Promise.all(symbols.map((symbol) => fetchTradierOptionsFlowForSymbol(symbol, exp, tradierKey)));
  return rows.filter(Boolean);
}

async function fetchTradierOptionsFlowForSymbol(symbol, expirationIso, tradierKey) {
  const url = `https://api.tradier.com/v1/markets/options/chains?symbol=${encodeURIComponent(symbol)}&expiration=${encodeURIComponent(expirationIso)}&greeks=false`;
  const payload = await fetchJsonSafe(url, {
    Authorization: `Bearer ${tradierKey}`,
    Accept: "application/json",
  });
  const contracts = payload?.options?.option;
  const list = Array.isArray(contracts) ? contracts : (contracts ? [contracts] : []);
  if (!list.length) return null;

  const normalized = list
    .map((raw) => normalizeTradierOptionContract(symbol, raw))
    .filter(Boolean)
    .sort((a, b) => (b.notional || 0) - (a.notional || 0));
  if (!normalized.length) return null;

  const calls = normalized.filter((x) => x.side === "CALL");
  const puts = normalized.filter((x) => x.side === "PUT");
  const callNotional = calls.reduce((acc, x) => acc + (x.notional || 0), 0);
  const putNotional = puts.reduce((acc, x) => acc + (x.notional || 0), 0);
  const callPutRatio = putNotional > 0 ? round2(callNotional / putNotional) : (callNotional > 0 ? 9.99 : 0);
  return {
    symbol,
    expiration: expirationIso,
    callPutRatio,
    flowRows: normalized.slice(0, 14),
  };
}

function normalizeTradierOptionContract(symbol, raw) {
  const side = String(raw?.option_type || "").toUpperCase() === "CALL" ? "CALL" : "PUT";
  const strike = Number(raw?.strike);
  const volume = Number(raw?.volume || 0);
  const openInterest = Number(raw?.open_interest || 0);
  const lastPrice = Number(raw?.last || raw?.mark || raw?.bid || 0);
  if (!Number.isFinite(strike) || strike <= 0) return null;
  const notional = lastPrice > 0 ? lastPrice * Math.max(volume, 0) * 100 : 0;
  let tradeType = volume >= 1200 ? "BLOCK" : volume >= 200 ? "SWEEP" : "TAPE";
  if (notional >= 500000 && volume >= 300) tradeType = "DARKPOOL";
  return {
    symbol,
    side,
    strike: round2(strike),
    volume: Math.max(0, Math.round(volume)),
    openInterest: Math.max(0, Math.round(openInterest)),
    lastPrice: round2(lastPrice),
    notional: round2(notional),
    expiry: raw?.expiration_date || null,
    tradeType,
    unusual: volume >= 50 && volume > openInterest * 1.2,
    estimated: false,
  };
}

function nextFridayIso() {
  const d = new Date();
  const day = d.getUTCDay();
  const add = (5 - day + 7) % 7 || 7;
  d.setUTCDate(d.getUTCDate() + add);
  return d.toISOString().slice(0, 10);
}

async function fetchEstimatedOptionsFlow(symbols) {
  const quotes = await withTimeout(fetchYahooQuotes(symbols), 20000, []);
  const rows = (Array.isArray(quotes) ? quotes : []).map((q) => {
    const price = Number(q.price || 0);
    const chg = Number(q.changesPercentage || 0);
    const vol = Number(q.volume || 0);
    const avgVol = Number(q.avgVolume || 0);
    const rvol = avgVol > 0 ? vol / avgVol : 1;
    const base = Math.max(80, Math.round((vol || avgVol || 1000000) / 60000));
    const bias = Math.max(0.12, Math.min(0.88, 0.5 + chg / 12 + (rvol - 1) * 0.25));
    const callContracts = Math.max(20, Math.round(base * bias));
    const putContracts = Math.max(20, base - callContracts);
    const strikeStep = price > 500 ? 10 : price > 200 ? 5 : 2.5;
    const strikeCall = round2(Math.ceil(price / strikeStep) * strikeStep);
    const strikePut = round2(Math.floor(price / strikeStep) * strikeStep);
    const estPremium = Math.max(0.5, price * 0.018);
    const expiration = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const callRow = {
      symbol: q.symbol,
      side: "CALL",
      strike: strikeCall,
      volume: callContracts,
      openInterest: Math.round(callContracts * 0.72),
      lastPrice: round2(estPremium),
      notional: round2(estPremium * callContracts * 100),
      expiry: expiration,
      tradeType: callContracts > 900 ? "BLOCK" : callContracts > 250 ? "SWEEP" : "TAPE",
      unusual: rvol > 1.2 && chg > 0,
      estimated: true,
    };
    const putRow = {
      symbol: q.symbol,
      side: "PUT",
      strike: strikePut,
      volume: putContracts,
      openInterest: Math.round(putContracts * 0.78),
      lastPrice: round2(estPremium * 0.95),
      notional: round2(estPremium * 0.95 * putContracts * 100),
      expiry: expiration,
      tradeType: putContracts > 900 ? "BLOCK" : putContracts > 250 ? "SWEEP" : "TAPE",
      unusual: rvol > 1.2 && chg < 0,
      estimated: true,
    };
    return {
      symbol: q.symbol,
      expiration,
      callPutRatio: putContracts > 0 ? round2(callContracts / putContracts) : 9.99,
      flowRows: [callRow, putRow].sort((a, b) => (b.notional || 0) - (a.notional || 0)),
    };
  });
  return rows.filter(Boolean);
}

async function fetchYahooOptionsFlowForSymbol(symbol) {
  const url = `https://query2.finance.yahoo.com/v7/finance/options/${encodeURIComponent(symbol)}`;
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    if (!response.ok) return null;
    const payload = await response.json();
    const optionRoot = payload?.optionChain?.result?.[0];
    const optionSet = optionRoot?.options?.[0];
    const calls = Array.isArray(optionSet?.calls) ? optionSet.calls : [];
    const puts = Array.isArray(optionSet?.puts) ? optionSet.puts : [];
    if (!calls.length && !puts.length) return null;

    const normalizedCalls = calls.map((c) => normalizeOptionContract(symbol, c, "CALL")).filter(Boolean);
    const normalizedPuts = puts.map((p) => normalizeOptionContract(symbol, p, "PUT")).filter(Boolean);
    const all = [...normalizedCalls, ...normalizedPuts];
    const unusual = all
      .filter((row) => Number(row.volume) >= 50 && Number(row.volume) > Number(row.openInterest || 0) * 1.2)
      .sort((a, b) => (b.notional || 0) - (a.notional || 0));
    const fallbackTop = all.sort((a, b) => (b.notional || 0) - (a.notional || 0));
    const flowRows = (unusual.length ? unusual : fallbackTop).slice(0, 12);

    const callNotional = normalizedCalls.reduce((acc, row) => acc + (row.notional || 0), 0);
    const putNotional = normalizedPuts.reduce((acc, row) => acc + (row.notional || 0), 0);
    const callPutRatio = putNotional > 0 ? round2(callNotional / putNotional) : (callNotional > 0 ? 9.99 : 0);
    const expiration = optionSet?.expirationDate ? new Date(optionSet.expirationDate * 1000).toISOString().slice(0, 10) : null;

    return {
      symbol,
      expiration,
      callPutRatio,
      flowRows,
    };
  } catch {
    return null;
  }
}

function normalizeOptionContract(symbol, raw, side) {
  if (!raw) return null;
  const strike = Number(raw.strike);
  const volume = Number(raw.volume || 0);
  const oi = Number(raw.openInterest || 0);
  const last = Number(raw.lastPrice || 0);
  if (!Number.isFinite(strike) || strike <= 0) return null;
  const notional = last > 0 ? last * Math.max(volume, 0) * 100 : 0;
  let tradeType = volume >= 1000 ? "BLOCK" : volume >= 200 ? "SWEEP" : "TAPE";
  if (notional >= 500000 && volume >= 300) tradeType = "DARKPOOL";
  return {
    symbol,
    side,
    strike: round2(strike),
    volume: Math.max(0, Math.round(volume)),
    openInterest: Math.max(0, Math.round(oi)),
    lastPrice: round2(last),
    notional: round2(notional),
    expiry: raw.expiration ? new Date(raw.expiration * 1000).toISOString().slice(0, 10) : null,
    tradeType,
    unusual: volume >= 50 && volume > oi * 1.2,
  };
}

async function fetchYahooQuotes(symbols) {
  const liveRows = await fetchYahooQuoteBatch(symbols);
  const liveBySymbol = Object.fromEntries(
    liveRows.map((row) => [String(row.symbol || "").toUpperCase(), row])
  );

  const rows = await Promise.all(symbols.map(async (symbol) => {
    try {
      const live = liveBySymbol[String(symbol || "").toUpperCase()] || null;
      const bars = await fetchYahooBars(symbol, "5d", "1d");
      if (!bars.length) return null;

      const latest = bars.at(-1);
      const prev = bars.at(-2) || latest;
      const highs = bars.map((b) => b.high || 0);
      const lows = bars.map((b) => b.low || 0);
      const vols = bars.map((b) => b.volume || 0);
      const avg20 = average(vols.slice(-20));
      const avg50 = average(bars.slice(-5).map((b) => b.close));
      const avg200 = average(bars.slice(-5).map((b) => b.close));
      const chgPctBars = prev?.close ? ((latest.close - prev.close) / prev.close) * 100 : 0;
      const weekRef = bars.at(-6) || prev;
      const weekPct = weekRef?.close ? ((latest.close - weekRef.close) / weekRef.close) * 100 : 0;
      const d5m = 0;
      const d30m = 0;

      const livePrice = Number(live?.regularMarketPrice);
      const livePrevClose = Number(live?.regularMarketPreviousClose);
      const liveChg = Number(live?.regularMarketChange);
      const liveChgPct = Number(live?.regularMarketChangePercent);

      const price = Number.isFinite(livePrice) ? livePrice : (latest.close || 0);
      const previousClose = Number.isFinite(livePrevClose) ? livePrevClose : (prev?.close || 0);
      const change = Number.isFinite(liveChg) ? liveChg : ((latest.close || 0) - (prev?.close || 0));
      const chgPct = Number.isFinite(liveChgPct)
        ? liveChgPct
        : (previousClose ? ((price - previousClose) / previousClose) * 100 : chgPctBars);
      const marketCap = await resolveMarketCap(
        symbol,
        Number(live?.marketCap),
        Number(live?.sharesOutstanding),
        price
      );

      return {
        symbol,
        name: live?.longName || live?.shortName || symbol,
        price: round2(price),
        change: round2(change),
        changesPercentage: round2(chgPct),
        delta1d: round2(chgPct),
        delta1w: round2(weekPct),
        delta5m: round2(d5m),
        delta30m: round2(d30m),
        open: round2(Number.isFinite(Number(live?.regularMarketOpen)) ? Number(live?.regularMarketOpen) : (latest.open || 0)),
        previousClose: round2(previousClose),
        dayHigh: round2(Number.isFinite(Number(live?.regularMarketDayHigh)) ? Number(live?.regularMarketDayHigh) : (latest.high || 0)),
        dayLow: round2(Number.isFinite(Number(live?.regularMarketDayLow)) ? Number(live?.regularMarketDayLow) : (latest.low || 0)),
        volume: Number.isFinite(Number(live?.regularMarketVolume)) ? Number(live?.regularMarketVolume) : (latest.volume || 0),
        avgVolume: Math.round(Number.isFinite(Number(live?.averageDailyVolume3Month)) ? Number(live?.averageDailyVolume3Month) : (avg20 || 0)),
        yearHigh: round2(Number.isFinite(Number(live?.fiftyTwoWeekHigh)) ? Number(live?.fiftyTwoWeekHigh) : Math.max(...highs)),
        yearLow: round2(Number.isFinite(Number(live?.fiftyTwoWeekLow)) ? Number(live?.fiftyTwoWeekLow) : Math.min(...lows)),
        marketCap,
        priceAvg50: round2(avg50 || 0),
        priceAvg200: round2(avg200 || 0),
        preMarketPrice: round2(Number(live?.preMarketPrice) || 0),
        postMarketPrice: round2(Number(live?.postMarketPrice) || 0),
        preMarketChangePercent: round2(Number(live?.preMarketChangePercent) || 0),
        postMarketChangePercent: round2(Number(live?.postMarketChangePercent) || 0),
      };
    } catch {
      return null;
    }
  }));

  return rows.filter(Boolean);
}

async function fetchYahooQuoteBatch(symbols) {
  try {
    const list = symbols.map((s) => String(s || "").trim()).filter(Boolean).join(",");
    if (!list) return [];
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(list)}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });
    if (!response.ok) return [];
    const payload = await response.json();
    return Array.isArray(payload?.quoteResponse?.result) ? payload.quoteResponse.result : [];
  } catch {
    return [];
  }
}

async function resolveMarketCap(symbol, liveMarketCap, liveShares, price) {
  if (Number.isFinite(liveMarketCap) && liveMarketCap > 0) {
    MARKET_CAP_CACHE.set(symbol, { value: liveMarketCap, ts: Date.now() });
    return liveMarketCap;
  }

  if (Number.isFinite(liveShares) && liveShares > 0 && Number.isFinite(price) && price > 0) {
    const fromShares = liveShares * price;
    MARKET_CAP_CACHE.set(symbol, { value: fromShares, ts: Date.now() });
    return fromShares;
  }

  const cached = MARKET_CAP_CACHE.get(symbol);
  if (cached && Date.now() - cached.ts < 10 * 60 * 1000 && Number.isFinite(cached.value) && cached.value > 0) {
    return cached.value;
  }

  const fetched = await fetchYahooMarketCapFromSummary(symbol, price);
  if (Number.isFinite(fetched) && fetched > 0) {
    MARKET_CAP_CACHE.set(symbol, { value: fetched, ts: Date.now() });
    return fetched;
  }
  return 0;
}

async function fetchYahooMarketCapFromSummary(symbol, price) {
  const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=price,defaultKeyStatistics`;
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });
    if (!response.ok) return 0;
    const payload = await response.json();
    const result = payload?.quoteSummary?.result?.[0] || {};
    const fromPrice = Number(result?.price?.marketCap?.raw);
    if (Number.isFinite(fromPrice) && fromPrice > 0) return fromPrice;

    const shares = Number(result?.defaultKeyStatistics?.sharesOutstanding?.raw);
    if (Number.isFinite(shares) && shares > 0 && Number.isFinite(price) && price > 0) {
      return shares * price;
    }

    const chartMeta = await fetchYahooChartMeta(symbol);
    const chartShares = Number(chartMeta?.sharesOutstanding);
    const chartPrice = Number(chartMeta?.regularMarketPrice ?? price);
    if (Number.isFinite(chartShares) && chartShares > 0 && Number.isFinite(chartPrice) && chartPrice > 0) {
      return chartShares * chartPrice;
    }
    return 0;
  } catch {
    const chartMeta = await fetchYahooChartMeta(symbol);
    const chartShares = Number(chartMeta?.sharesOutstanding);
    const chartPrice = Number(chartMeta?.regularMarketPrice ?? price);
    if (Number.isFinite(chartShares) && chartShares > 0 && Number.isFinite(chartPrice) && chartPrice > 0) {
      return chartShares * chartPrice;
    }
    return 0;
  }
}

async function fetchYahooChartMeta(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=5d&interval=1d&includePrePost=false&events=div%2Csplits`;
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });
    if (!response.ok) return null;
    const payload = await response.json();
    return payload?.chart?.result?.[0]?.meta || null;
  } catch {
    return null;
  }
}

async function buildLivePayload(ticker, timeframe, style) {
  const config = TIMEFRAME_CONFIG[timeframe] || TIMEFRAME_CONFIG["1D"];
  const rawBars = await fetchYahooBars(ticker, config.range, config.interval);
  const bars = config.aggregate > 1 ? aggregateBars(rawBars, config.aggregate) : rawBars;

  if (bars.length < 30) {
    throw new Error(`Not enough market data returned for ${ticker}.`);
  }

  const closes = bars.map((bar) => bar.close);
  const highs = bars.map((bar) => bar.high);
  const lows = bars.map((bar) => bar.low);
  const volumes = bars.map((bar) => bar.volume || 0);
  const current = bars[bars.length - 1];
  const previous = bars[bars.length - 2];

  const ema9 = computeEMA(closes, 9);
  const ema21 = computeEMA(closes, 21);
  const ema200 = computeEMA(closes, Math.min(200, closes.length));
  const rsi = computeRSI(closes, 14);
  const vwap = computeVWAP(bars.slice(-Math.min(30, bars.length)));

  const support = round2(Math.min(...lows.slice(-20)));
  const resistance = round2(Math.max(...highs.slice(-20)));
  const avgVolume = average(volumes.slice(-20));
  const volumeSpike = current.volume > avgVolume * 1.6 ? "Yes" : "No";
  const volumeCharacter = current.close >= previous.close
    ? current.volume >= avgVolume ? "Accumulation" : "Neutral"
    : current.volume >= avgVolume ? "Distribution" : "Neutral";

  const trend = detectTrend(current.close, ema21, ema200, closes);
  const structure = detectStructure(current.close, highs, lows);
  const divergence = detectDivergence(closes, rsi);
  const smartMoney = inferSmartMoney(current, support, resistance, avgVolume, trend, volumeCharacter);
  const news = await fetchYahooNews(ticker);
  const newsSentiment = classifyNewsSentiment(news);
  const macro = await fetchMacroSignals();

  return {
    generatedAt: new Date().toISOString(),
    source: "Yahoo Finance public endpoints",
    formData: {
      ticker,
      timeframe,
      style,
      price: round2(current.close),
      support,
      resistance,
      liquidityZone: smartMoney.liquidityZone,
      trend,
      structure,
      volumeCharacter,
      ema9: round2(ema9),
      ema21: round2(ema21),
      ema200: round2(ema200),
      vwap: round2(vwap),
      rsi: round2(rsi),
      divergence,
      volumeSpike,
      stopClusters: smartMoney.stopClusters,
      fakeoutRisk: smartMoney.fakeoutRisk,
      newsSentiment,
      catalyst: news[0]?.title ? trimText(news[0].title, 90) : "No fresh catalyst found",
      newsNotes: buildNewsNotes(news),
      spyTrend: macro.spyTrend,
      qqqTrend: macro.qqqTrend,
      vix: macro.vix,
      dxy: macro.dxy,
      yield2y: macro.yield2y,
      yield10y: macro.yield10y
    },
    diagnostics: {
      marketDataPoints: bars.length,
      averageVolume: Math.round(avgVolume),
      latestVolume: current.volume,
      latestClose: current.close,
      macro
    },
    news: news.slice(0, 5)
  };
}

function extractSection(text, heading) {
  const content = String(text || "");
  const regex = new RegExp(`${heading}\\s*([\\s\\S]*?)(?:\\n[A-Z][A-Z\\s]+\\n|$)`, "i");
  const match = content.match(regex);
  const value = match?.[1] || "";
  return String(value).trim();
}

function buildAiPrompt({ ticker, mode, extraContext, prompt }) {
  const rawPrompt = String(prompt || "").trim();
  if (rawPrompt) return rawPrompt;
  const preset = PROMPT_PRESETS[String(mode || "").trim()] || null;
  if (preset) return String(preset({ ticker, extraContext })).trim();
  const ctx = String(extraContext || "").trim();
  return `Analyze ${ticker} like an institutional market analyst.${ctx ? `\nExtra context: ${ctx}` : ""}`.trim();
}

function normalizeAiResponse(text) {
  const content = String(text || "");
  const marketBias = extractSection(content, "BIAS") || extractSection(content, "Market Bias");
  const macroRead =
    extractSection(content, "MACRO READ") ||
    extractSection(content, "Momentum Analysis") ||
    extractSection(content, "Macro Tone");
  const sectorRotation =
    extractSection(content, "SECTOR ROTATION") ||
    extractSection(content, "Leading Sectors") ||
    extractSection(content, "Rotation Overview");
  const keyLevels = extractSection(content, "KEY LEVELS") || extractSection(content, "Key Levels");
  const bestSetup =
    extractSection(content, "BEST SETUP") ||
    extractSection(content, "Best Trade Setup") ||
    extractSection(content, "Best Trade Idea") ||
    extractSection(content, "Action Plan");
  const invalidation = extractSection(content, "INVALIDATION") || extractSection(content, "Main Warning");
  return {
    bias: marketBias || "Mixed / cautious",
    macro_read: macroRead || "No macro read returned",
    sector_rotation: sectorRotation || "No sector rotation returned",
    key_levels: keyLevels || "No key levels returned",
    best_setup: bestSetup || "No setup returned",
    invalidation: invalidation || "No invalidation returned",
    confidence: 0.72
  };
}

function buildFallbackAiText({ ticker, mode, style, extraContext }) {
  const extra = extraContext ? `\nContext: ${extraContext}` : "";
  return [
    "BIAS",
    "Mixed / cautious",
    "",
    "MACRO READ",
    "Growth leadership is supporting the tape while rates and the dollar still matter for risk assets.",
    "",
    "SECTOR ROTATION",
    "Leadership remains concentrated in technology and selective energy while defensive sectors are mixed.",
    "",
    "KEY LEVELS",
    `${ticker} should hold VWAP and prior breakout zones. Failed reclaim of session highs weakens momentum.`,
    "",
    "BEST SETUP",
    `Mode: ${mode} | Style: ${style}. Wait for reclaim + breadth confirmation before full size.${extra}`,
    "",
    "INVALIDATION",
    "Break of support with weak breadth and rising volatility invalidates continuation."
  ].join("\n");
}

async function runAiTerminalAnalysis({ ticker, mode, style, extraContext, prompt }) {
  const system = [
    "You are an institutional-grade market analyst.",
    "Be concise, precise, structured, and action-oriented.",
    "Include key levels, risk, invalidation, and confidence when appropriate.",
    "Keep output concise and professional."
  ].join("\n");

  const userInput = [
    `Ticker: ${ticker}`,
    `Mode: ${mode}`,
    `Style: ${style}`,
    extraContext ? `Extra Context: ${extraContext}` : "",
    "",
    prompt
  ].filter(Boolean).join("\n");

  let outputText = "";
  if (OPENAI_API_KEY) {
    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        input: [
          { role: "system", content: [{ type: "input_text", text: system }] },
          { role: "user", content: [{ type: "input_text", text: userInput }] }
        ]
      })
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`OpenAI request failed: ${details}`);
    }

    const json = await response.json();
    outputText =
      String(json.output_text || "").trim() ||
      String(
        (json.output || [])
          .map((item) => (item?.content || []).map((part) => part?.text || "").join("\n"))
          .join("\n")
      ).trim();
  }

  if (!outputText) {
    outputText = buildFallbackAiText({ ticker, mode, style, extraContext });
  }

  const normalized = normalizeAiResponse(outputText);
  return {
    ok: true,
    ticker,
    mode,
    style,
    output: outputText,
    output_text: outputText,
    raw_text: outputText,
    ...normalized,
    source: OPENAI_API_KEY ? "openai" : "fallback"
  };
}

async function buildOptionsScorecardPayload(tickers, keys) {
  const symbols = [...new Set((tickers || [])
    .map((value) => String(value || "").trim().toUpperCase())
    .filter(Boolean))]
    .slice(0, 12);

  if (!symbols.length) {
    return {
      generatedAt: new Date().toISOString(),
      source: "local-market-engine",
      tickers: []
    };
  }

  const [quotesRaw, newsRaw, flowRaw, barBatches] = await Promise.all([
    withTimeout(fetchMarketQuotes(symbols, keys), 15000, []),
    withTimeout(fetchMarketNews(symbols, 40, keys), 12000, []),
    withTimeout(fetchOptionsFlow(symbols, { limit: 60, keys }), 15000, { flow: [], bySymbol: [] }),
    Promise.all(symbols.map((symbol) => withTimeout(fetchYahooBars(symbol, "5d", "15m"), 9000, [])))
  ]);

  const quotes = Array.isArray(quotesRaw) ? quotesRaw : [];
  const newsRows = Array.isArray(newsRaw) ? newsRaw : [];
  const flowPayload = flowRaw && typeof flowRaw === "object" ? flowRaw : { flow: [], bySymbol: [] };

  const quoteBySymbol = Object.fromEntries(
    quotes.map((row) => [String(row.symbol || "").toUpperCase(), row])
  );

  const barsBySymbol = {};
  symbols.forEach((symbol, index) => {
    const bars = Array.isArray(barBatches[index]) ? barBatches[index] : [];
    barsBySymbol[symbol] = bars;
  });

  const newsBySymbol = Object.fromEntries(symbols.map((symbol) => [symbol, []]));
  for (const row of newsRows) {
    const symbol = String(row?.ticker || "").toUpperCase();
    if (newsBySymbol[symbol]) {
      newsBySymbol[symbol].push(row);
    }
  }

  const flowBySymbol = summarizeFlowBySymbol(flowPayload, symbols);
  const rows = symbols.map((symbol) => {
    const quote = quoteBySymbol[symbol] || null;
    const bars = barsBySymbol[symbol] || [];
    const flow = flowBySymbol[symbol] || createEmptyFlowStats(symbol);
    const news = newsBySymbol[symbol] || [];
    return scoreTickerForScorecard(symbol, quote, bars, flow, news);
  });

  return {
    generatedAt: new Date().toISOString(),
    source: "local-market-engine",
    tickers: rows
  };
}

function createEmptyFlowStats(symbol) {
  return {
    symbol,
    callNotional: 0,
    putNotional: 0,
    callVolume: 0,
    putVolume: 0,
    callOI: 0,
    putOI: 0,
    unusualCall: 0,
    unusualPut: 0,
    blockCall: 0,
    blockPut: 0,
    darkCall: 0,
    darkPut: 0,
    callPutRatio: null
  };
}

function summarizeFlowBySymbol(flowPayload, symbols) {
  const out = Object.fromEntries(symbols.map((symbol) => [symbol, createEmptyFlowStats(symbol)]));
  const rows = Array.isArray(flowPayload?.flow) ? flowPayload.flow : [];
  const bySymbolRows = Array.isArray(flowPayload?.bySymbol) ? flowPayload.bySymbol : [];

  for (const row of rows) {
    const symbol = String(row?.symbol || "").toUpperCase();
    if (!out[symbol]) continue;
    const target = out[symbol];
    const side = String(row?.side || "").toUpperCase() === "PUT" ? "PUT" : "CALL";
    const notional = Number(row?.notional || 0);
    const volume = Number(row?.volume || 0);
    const openInterest = Number(row?.openInterest || 0);
    const unusual = Boolean(row?.unusual);
    const tradeType = String(row?.tradeType || "").toUpperCase();

    if (side === "CALL") {
      target.callNotional += notional;
      target.callVolume += volume;
      target.callOI += openInterest;
      if (unusual) target.unusualCall += notional;
      if (tradeType === "BLOCK") target.blockCall += notional;
      if (tradeType === "DARKPOOL") target.darkCall += notional;
    } else {
      target.putNotional += notional;
      target.putVolume += volume;
      target.putOI += openInterest;
      if (unusual) target.unusualPut += notional;
      if (tradeType === "BLOCK") target.blockPut += notional;
      if (tradeType === "DARKPOOL") target.darkPut += notional;
    }
  }

  for (const entry of bySymbolRows) {
    const symbol = String(entry?.symbol || "").toUpperCase();
    if (!out[symbol]) continue;
    const ratio = Number(entry?.callPutRatio);
    out[symbol].callPutRatio = Number.isFinite(ratio) && ratio > 0 ? ratio : null;
  }

  return out;
}

function scoreTickerForScorecard(symbol, quote, bars, flow, newsRows) {
  const latestBar = bars.at(-1) || null;
  const price = Number(quote?.price || latestBar?.close || 0);
  const trend = scoreTrendCategory(price, bars, quote);
  const volume = scoreVolumeCategory(quote, bars);
  const vwap = scoreVWAPCategory(price, bars);
  const momentum = scoreMomentumCategory(price, bars, quote);
  const flowScore = scoreFlowCategory(flow);
  const oi = scoreOICategory(flow);
  const news = scoreNewsCategory(newsRows);
  const institutional = scoreInstitutionalCategory(quote, flow, bars);
  const categories = { trend, volume, vwap, momentum, flow: flowScore, oi, news, institutional };
  const bullTotal = Object.values(categories).reduce((sum, value) => sum + value, 0);
  const netScore = bullTotal - (800 - bullTotal);
  const trade = buildTradeLevels(price, bars, netScore);
  const changePercent = Number(quote?.changesPercentage || 0);
  const analysis = buildScorecardAnalysis(symbol, categories, quote, flow, newsRows);

  return {
    symbol,
    price: price > 0 ? round2(price).toFixed(2) : null,
    change: formatSignedPercent(changePercent),
    trend,
    volume,
    vwap,
    momentum,
    flow: flowScore,
    oi,
    news,
    institutional,
    entry: trade.entry,
    stop: trade.stop,
    tp: trade.tp,
    invalidation: trade.invalidation,
    analysis
  };
}

function scoreTrendCategory(price, bars, quote) {
  if (!Number.isFinite(price) || price <= 0) return 50;
  if (!bars.length) {
    const fallbackMove = Number(quote?.changesPercentage || 0);
    return clampScore(50 + fallbackMove * 5);
  }

  const closes = bars.map((bar) => Number(bar.close || 0)).filter((value) => Number.isFinite(value) && value > 0);
  if (closes.length < 8) return 50;
  const ema21 = computeEMA(closes, Math.min(21, closes.length));
  const ema50 = computeEMA(closes, Math.min(50, closes.length));
  const slopeLookback = Math.min(18, closes.length - 1);
  const ref = closes[closes.length - 1 - slopeLookback] || closes[0];
  const slopePct = ref > 0 ? ((price - ref) / ref) * 100 : 0;

  let score = 50;
  score += price >= ema21 ? 14 : -14;
  score += ema21 >= ema50 ? 10 : -10;
  score += slopePct * 2.2;
  return clampScore(score);
}

function scoreVolumeCategory(quote, bars) {
  const latestBar = bars.at(-1) || {};
  const volume = Number(quote?.volume || latestBar.volume || 0);
  const derivedAvg = average(
    bars
      .slice(-20)
      .map((bar) => Number(bar.volume || 0))
      .filter((value) => Number.isFinite(value) && value >= 0)
  );
  const avgVolume = Number(quote?.avgVolume || derivedAvg || 0);
  const relative = avgVolume > 0 ? volume / avgVolume : 1;
  const dayMove = Number(quote?.changesPercentage || 0);

  let score = 50 + (relative - 1) * 34;
  if (relative >= 1.2) score += dayMove >= 0 ? 8 : -8;
  if (relative <= 0.8) score -= 4;
  return clampScore(score);
}

function scoreVWAPCategory(price, bars) {
  if (!Number.isFinite(price) || price <= 0 || !bars.length) return 50;
  const windowBars = bars.slice(-Math.min(52, bars.length));
  const vwap = computeVWAP(windowBars);
  if (!Number.isFinite(vwap) || vwap <= 0) return 50;
  const deltaPct = ((price - vwap) / vwap) * 100;

  let score = 50 + deltaPct * 28;
  if (deltaPct > 0.6) score += 8;
  if (deltaPct < -0.6) score -= 8;
  return clampScore(score);
}

function scoreMomentumCategory(price, bars, quote) {
  if (!Number.isFinite(price) || price <= 0) return 50;
  const closes = bars.map((bar) => Number(bar.close || 0)).filter((value) => Number.isFinite(value) && value > 0);
  const dayMove = Number(quote?.changesPercentage || 0);
  if (closes.length < 15) {
    return clampScore(50 + dayMove * 4);
  }

  const rsi = computeRSI(closes.slice(-Math.min(80, closes.length)), 14);
  const ref = closes.at(-8) || closes[0];
  const shortMove = ref > 0 ? ((price - ref) / ref) * 100 : 0;
  let score = 50 + dayMove * 2.8 + shortMove * 3 + (rsi - 50) * 0.7;
  if (rsi > 75) score -= 8;
  if (rsi < 25) score += 8;
  return clampScore(score);
}

function scoreFlowCategory(flow) {
  const callNotional = Number(flow?.callNotional || 0);
  const putNotional = Number(flow?.putNotional || 0);
  const total = callNotional + putNotional;
  if (total <= 0) return 50;

  const flowBias = (callNotional - putNotional) / total;
  const unusualCall = Number(flow?.unusualCall || 0);
  const unusualPut = Number(flow?.unusualPut || 0);
  const unusualTotal = unusualCall + unusualPut;

  let score = 50 + flowBias * 38;
  if (unusualTotal > 0) {
    score += ((unusualCall - unusualPut) / unusualTotal) * 18;
  }
  return clampScore(score);
}

function scoreOICategory(flow) {
  const callOi = Number(flow?.callOI || 0);
  const putOi = Number(flow?.putOI || 0);
  const callVolume = Number(flow?.callVolume || 0);
  const putVolume = Number(flow?.putVolume || 0);
  if (callOi + putOi <= 0 && callVolume + putVolume <= 0) return 50;

  const oiRatio = (callOi + 1) / (putOi + 1);
  const volumeRatio = (callVolume + 1) / (putVolume + 1);
  const turnover = (callVolume + putVolume) / Math.max(callOi + putOi, 1);
  let score = 50 + Math.log(oiRatio) * 16 + Math.log(volumeRatio) * 10;
  if (turnover > 0.45) score += 6;
  if (turnover < 0.08) score -= 5;
  return clampScore(score);
}

function scoreNewsCategory(newsRows) {
  if (!newsRows.length) return 50;
  const recent = newsRows.slice(0, 6);
  let weighted = 0;
  recent.forEach((item, index) => {
    const weight = Math.max(0.3, 1 - index * 0.12);
    weighted += scoreHeadline(String(item?.title || "")) * weight;
  });

  let score = 50 + weighted * 7;
  const latestTimestamp = Date.parse(String(recent[0]?.publishedAt || ""));
  if (Number.isFinite(latestTimestamp)) {
    const ageHours = (Date.now() - latestTimestamp) / (1000 * 60 * 60);
    if (ageHours <= 8 && weighted > 0) score += 4;
    if (ageHours <= 8 && weighted < 0) score -= 4;
  }
  return clampScore(score);
}

function scoreInstitutionalCategory(quote, flow, bars) {
  const marketCap = Number(quote?.marketCap || 0);
  const latestBar = bars.at(-1) || {};
  const volume = Number(quote?.volume || latestBar.volume || 0);
  const avgVolume = Number(quote?.avgVolume || average(bars.slice(-20).map((bar) => Number(bar.volume || 0))) || 0);
  const relativeVolume = avgVolume > 0 ? volume / avgVolume : 1;
  const blockCall = Number(flow?.blockCall || 0);
  const blockPut = Number(flow?.blockPut || 0);
  const darkCall = Number(flow?.darkCall || 0);
  const darkPut = Number(flow?.darkPut || 0);
  const blockTotal = blockCall + blockPut;
  const darkTotal = darkCall + darkPut;

  let score = 50;
  if (marketCap >= 200e9) score += 4;
  if (marketCap > 0 && marketCap <= 3e9) score -= 3;
  if (blockTotal > 0) score += ((blockCall - blockPut) / blockTotal) * 20;
  if (darkTotal > 0) score += ((darkCall - darkPut) / darkTotal) * 12;
  if (relativeVolume > 1.4) score += 5;
  return clampScore(score);
}

function buildTradeLevels(price, bars, netScore) {
  if (!Number.isFinite(price) || price <= 0) {
    return {
      entry: "N/A",
      stop: "N/A",
      tp: "N/A",
      invalidation: "N/A"
    };
  }

  const atr = computeATR(bars.slice(-40), 14) || Math.max(price * 0.008, 0.15);
  const bullish = netScore >= 0;
  const entryPad = Math.max(atr * 0.35, price * 0.0025);
  const entryLow = bullish ? price - entryPad : price - (entryPad * 0.45);
  const entryHigh = bullish ? price + (entryPad * 0.45) : price + entryPad;
  const stopLevel = bullish ? price - (atr * 1.15) : price + (atr * 1.15);
  const targetLevel = bullish ? price + (atr * 2.2) : price - (atr * 2.2);

  return {
    entry: `$${round2(entryLow).toFixed(2)} - $${round2(entryHigh).toFixed(2)}`,
    stop: `$${round2(stopLevel).toFixed(2)}`,
    tp: `$${round2(targetLevel).toFixed(2)}`,
    invalidation: bullish
      ? `Close below $${round2(stopLevel).toFixed(2)}`
      : `Close above $${round2(stopLevel).toFixed(2)}`
  };
}

function computeATR(bars, period = 14) {
  if (!bars.length || bars.length < 2) return 0;
  const trueRanges = [];
  for (let i = 1; i < bars.length; i += 1) {
    const high = Number(bars[i]?.high || 0);
    const low = Number(bars[i]?.low || 0);
    const prevClose = Number(bars[i - 1]?.close || 0);
    if (!Number.isFinite(high) || !Number.isFinite(low) || !Number.isFinite(prevClose)) continue;
    const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
    if (Number.isFinite(tr)) trueRanges.push(tr);
  }
  if (!trueRanges.length) return 0;
  const recent = trueRanges.slice(-Math.min(period, trueRanges.length));
  return average(recent);
}

function formatSignedPercent(value) {
  const numeric = Number(value || 0);
  if (!Number.isFinite(numeric)) return "0.00%";
  const rounded = round2(numeric).toFixed(2);
  return `${numeric > 0 ? "+" : ""}${rounded}%`;
}

function buildScorecardAnalysis(symbol, categories, quote, flow, newsRows) {
  const bullTotal = Object.values(categories).reduce((sum, value) => sum + value, 0);
  const bearTotal = 800 - bullTotal;
  const net = bullTotal - bearTotal;
  const bias = net >= 150 ? "Call-side bias" : net <= -150 ? "Put-side bias" : "Balanced tape";

  const volume = Number(quote?.volume || 0);
  const avgVolume = Number(quote?.avgVolume || 0);
  const relativeVolume = avgVolume > 0 ? round2(volume / avgVolume) : 1;
  const callNotional = Number(flow?.callNotional || 0);
  const putNotional = Number(flow?.putNotional || 0);
  const flowBias = callNotional + putNotional > 0
    ? ((callNotional - putNotional) / (callNotional + putNotional))
    : 0;
  const flowLabel = flowBias >= 0.15 ? "call-dominant" : flowBias <= -0.15 ? "put-dominant" : "two-way";
  const headline = newsRows[0]?.title ? trimText(String(newsRows[0].title), 90) : "No fresh headline catalyst.";

  return `${bias} on ${symbol} with RVOL ${relativeVolume}x and ${flowLabel} options flow. Catalyst watch: ${headline}`;
}

function clampScore(value) {
  const numeric = Number(value || 0);
  if (!Number.isFinite(numeric)) return 50;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

async function fetchMacroSignals() {
  const [spyBars, qqqBars, vixQuote, dxyQuote, us10yQuote, us2yQuote] = await Promise.all([
    fetchFirstAvailableBars(MACRO_SYMBOLS.SPY),
    fetchFirstAvailableBars(MACRO_SYMBOLS.QQQ),
    fetchFirstAvailableBars(MACRO_SYMBOLS.VIX),
    fetchFirstAvailableBars(MACRO_SYMBOLS.DXY),
    fetchFirstAvailableBars(MACRO_SYMBOLS.US10Y),
    fetchFirstAvailableBars(MACRO_SYMBOLS.US2Y)
  ]);

  return {
    spyTrend: detectSimpleTrend(spyBars),
    qqqTrend: detectSimpleTrend(qqqBars),
    vix: round2(vixQuote.at(-1)?.close ?? 18),
    dxy: round2(dxyQuote.at(-1)?.close ?? 104),
    yield10y: normalizeYield(us10yQuote.at(-1)?.close),
    yield2y: normalizeYield(us2yQuote.at(-1)?.close)
  };
}

async function fetchFirstAvailableBars(symbols) {
  for (const symbol of symbols) {
    try {
      const bars = await fetchYahooBars(symbol, "1mo", "1d");
      if (bars.length) {
        return bars;
      }
    } catch {
      continue;
    }
  }

  return [];
}

async function fetchYahooBars(symbol, range, interval) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false&events=div%2Csplits`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  if (!response.ok) {
    throw new Error(`Yahoo chart request failed for ${symbol}: ${response.status}`);
  }

  const payload = await response.json();
  const result = payload?.chart?.result?.[0];
  const quote = result?.indicators?.quote?.[0];
  const timestamps = result?.timestamp || [];

  if (!quote || !timestamps.length) {
    throw new Error(`No chart data returned for ${symbol}.`);
  }

  const bars = [];
  for (let i = 0; i < timestamps.length; i += 1) {
    const open = quote.open?.[i];
    const high = quote.high?.[i];
    const low = quote.low?.[i];
    const close = quote.close?.[i];
    const volume = quote.volume?.[i] ?? 0;

    if ([open, high, low, close].some((value) => value == null)) {
      continue;
    }

    bars.push({
      time: timestamps[i] * 1000,
      open,
      high,
      low,
      close,
      volume
    });
  }

  return bars;
}

function dedupeAndSortNewsItems(items, limit = 20) {
  const map = new Map();
  for (const item of Array.isArray(items) ? items : []) {
    const title = String(item?.title || item?.headline || "").trim();
    const link = String(item?.link || item?.url || "").trim();
    const key = title ? title.toLowerCase() : link.toLowerCase();
    if (!title || map.has(key)) continue;
    map.set(key, {
      title,
      publisher: item?.publisher || item?.source || "Unknown",
      source: item?.source || item?.publisher || "Unknown",
      link,
      publishedAt: item?.publishedAt || item?.datetime || null,
      summary: item?.summary || ""
    });
  }
  return Array.from(map.values())
    .sort((a, b) => {
      const at = a?.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bt = b?.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return bt - at;
    })
    .slice(0, limit);
}

async function fetchYahooNews(ticker) {
  const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(ticker)}&quotesCount=1&newsCount=8&enableFuzzyQuery=false`;
  let yahooApiRows = [];
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      },
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (response.ok) {
      const payload = await response.json();
      yahooApiRows = (payload.news || []).map((item) => ({
        title: item.title || "Untitled",
        publisher: item.publisher || "Yahoo Finance",
        source: item.publisher || "Yahoo Finance",
        link: item.link || "",
        publishedAt: item.providerPublishTime ? new Date(item.providerPublishTime * 1000).toISOString() : null,
        summary: item.summary || ""
      }));
    }
  } catch {}

  const [tiingoRows, yahooRssRows, googleRows] = await Promise.allSettled([
    fetchTiingoNews(ticker, TIINGO_API_KEY),
    fetchYahooRssNews(ticker),
    fetchGoogleNewsRss(ticker)
  ]);

  return dedupeAndSortNewsItems([
    ...yahooApiRows,
    ...(tiingoRows.status === "fulfilled" ? tiingoRows.value : []),
    ...(yahooRssRows.status === "fulfilled" ? yahooRssRows.value : []),
    ...(googleRows.status === "fulfilled" ? googleRows.value : [])
  ], 20);
}

async function fetchYahooRssNews(ticker) {
  const url = `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(ticker)}&region=US&lang=en-US`;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!response.ok) return [];
    const xml = await response.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)]
      .slice(0, 8)
      .map((match) => {
        const block = match[1] || "";
        const title = extractXmlTag(block, "title") || "Untitled";
        const link = extractXmlTag(block, "link") || "";
        const published = extractXmlTag(block, "pubDate");
        const description = extractXmlTag(block, "description") || "";
        return {
          title,
          publisher: "Yahoo Finance",
          source: "Yahoo Finance",
          link,
          publishedAt: published ? new Date(published).toISOString() : null,
          summary: trimText(stripHtml(description), 220)
        };
      });
    return items;
  } catch {
    return [];
  }
}

async function fetchGoogleNewsRss(ticker) {
  const query = `${String(ticker || "").trim().toUpperCase()} stock`;
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!response.ok) return [];
    const xml = await response.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)]
      .slice(0, 12)
      .map((match) => {
        const block = match[1] || "";
        const title = extractXmlTag(block, "title") || "Untitled";
        const link = extractXmlTag(block, "link") || "";
        const published = extractXmlTag(block, "pubDate");
        const description = extractXmlTag(block, "description") || "";
        const sourceMatch = String(block).match(/<source\b[^>]*>([\s\S]*?)<\/source>/i);
        const source = sourceMatch?.[1] ? decodeXmlEntities(sourceMatch[1].trim()) : "Google News";
        return {
          title,
          publisher: source,
          source: `Google News · ${source}`,
          link,
          publishedAt: published ? new Date(published).toISOString() : null,
          summary: trimText(stripHtml(description), 220)
        };
      });
    return items;
  } catch {
    return [];
  }
}

function extractXmlTag(xmlBlock, tag) {
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = String(xmlBlock || "").match(regex);
  return m?.[1] ? decodeXmlEntities(m[1].trim()) : "";
}

function stripHtml(value) {
  return String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeXmlEntities(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

async function fetchYahooCandlesWithIndicators(symbol, timeframe) {
  const config = CANDLE_TIMEFRAME_CONFIG[timeframe] || CANDLE_TIMEFRAME_CONFIG["1D"];
  const rawBars = await fetchYahooBars(symbol, config.range, config.interval);
  const bars = config.aggregate > 1 ? aggregateBars(rawBars, config.aggregate) : rawBars;

  if (!bars.length) {
    throw new Error(`No candle data returned for ${symbol}.`);
  }

  const ema9 = computeEMASeries(bars, 9);
  const ema21 = computeEMASeries(bars, 21);
  const vwap = computeVWAPSeries(bars);
  const rsi = computeRSISeries(bars, 14);
  const macd = computeMACDSeries(bars, 12, 26, 9);

  return {
    symbol,
    timeframe,
    bars: bars.map((bar) => ({
      time: bar.time,
      open: round2(bar.open),
      high: round2(bar.high),
      low: round2(bar.low),
      close: round2(bar.close),
      volume: Math.round(bar.volume || 0)
    })),
    indicators: {
      ema9,
      ema21,
      vwap,
      rsi,
      macd
    }
  };
}

async function fetchYahooFundamentals(symbol) {
  const quoteRows = await fetchYahooQuoteBatch([symbol]);
  const live = quoteRows.find((r) => String(r?.symbol || "").toUpperCase() === symbol) || null;

  const livePrice = Number(live?.regularMarketPrice);
  const liveShares = Number(live?.sharesOutstanding);
  const liveMarketCap = Number(live?.marketCap);
  const livePE = Number(live?.trailingPE ?? live?.forwardPE);
  const liveEPS = Number(live?.epsTrailingTwelveMonths ?? live?.epsForward);
  const liveEarningsTs = Number((Array.isArray(live?.earningsTimestamp) ? live.earningsTimestamp[0] : live?.earningsTimestamp) || 0);
  const resolvedMarketCap = await resolveMarketCap(symbol, liveMarketCap, liveShares, livePrice);
  const n = (v) => {
    const parsed = Number(v);
    return Number.isFinite(parsed) ? parsed : null;
  };
  const t = (v) => {
    if (v === null || v === undefined) return null;
    const s = String(v).trim();
    return s ? s : null;
  };
  const fallbackFromLive = () => ({
    symbol,
    marketCap: Number.isFinite(resolvedMarketCap) && resolvedMarketCap > 0 ? resolvedMarketCap : null,
    pe: Number.isFinite(livePE) ? livePE : null,
    eps: Number.isFinite(liveEPS) ? liveEPS : null,
      sharesOutstanding: Number.isFinite(liveShares) ? liveShares : null,
      earningsDate: liveEarningsTs > 0 ? new Date(liveEarningsTs * 1000).toISOString() : null,
      epsCurrentYearEstimate: n(live?.epsCurrentYear),
      epsNextQuarterEstimate: n(live?.epsNextQuarter),
      whisperEstimate: null,
      avgVolume: n(live?.averageDailyVolume3Month) ?? n(live?.averageDailyVolume10Day),
    fiftyTwoWeekHigh: n(live?.fiftyTwoWeekHigh),
    fiftyTwoWeekLow: n(live?.fiftyTwoWeekLow),
    beta: n(live?.beta),
    recommendation: t(live?.recommendationKey),
    source: "yahoo-live"
  });

  const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=price,summaryDetail,defaultKeyStatistics,calendarEvents,financialData,assetProfile`;
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });
    if (!response.ok) {
      return fallbackFromLive();
    }
    const payload = await response.json();
    const result = payload?.quoteSummary?.result?.[0] || {};
    const price = result?.price || {};
    const summary = result?.summaryDetail || {};
    const stats = result?.defaultKeyStatistics || {};
    const financial = result?.financialData || {};
    const profile = result?.assetProfile || {};
    const earningsRaw = result?.calendarEvents?.earnings?.earningsDate || [];
    const earningsTs = Array.isArray(earningsRaw) && earningsRaw.length
      ? Number(earningsRaw[0]?.raw || 0)
      : 0;

    const marketCap = n(price?.marketCap?.raw) ?? n(liveMarketCap) ?? (Number.isFinite(resolvedMarketCap) && resolvedMarketCap > 0 ? resolvedMarketCap : null);
    const pe = n(summary?.trailingPE?.raw ?? financial?.forwardPE?.raw ?? livePE);
    const eps = n(stats?.trailingEps?.raw ?? stats?.forwardEps?.raw ?? liveEPS);
    const sharesOutstanding = n(stats?.sharesOutstanding?.raw ?? liveShares);

    return {
      symbol,
      marketCap,
      pe,
      eps,
      sharesOutstanding,
      earningsDate: earningsTs > 0
        ? new Date(earningsTs * 1000).toISOString()
        : (liveEarningsTs > 0 ? new Date(liveEarningsTs * 1000).toISOString() : null),
      epsCurrentYearEstimate: n(live?.epsCurrentYear),
      epsNextQuarterEstimate: n(live?.epsNextQuarter),
      whisperEstimate: null,
      avgVolume: n(summary?.averageVolume?.raw) ?? n(summary?.averageVolume10days?.raw) ?? n(live?.averageDailyVolume3Month),
      fiftyTwoWeekHigh: n(summary?.fiftyTwoWeekHigh?.raw) ?? n(live?.fiftyTwoWeekHigh),
      fiftyTwoWeekLow: n(summary?.fiftyTwoWeekLow?.raw) ?? n(live?.fiftyTwoWeekLow),
      beta: n(summary?.beta?.raw) ?? n(stats?.beta?.raw) ?? n(live?.beta),
      priceToBook: n(stats?.priceToBook?.raw),
      dividendYield: n(summary?.dividendYield?.raw),
      revenue: n(financial?.totalRevenue?.raw),
      grossMargin: n(financial?.grossMargins?.raw),
      operatingMargin: n(financial?.operatingMargins?.raw),
      profitMargin: n(financial?.profitMargins?.raw),
      debtToEquity: n(financial?.debtToEquity?.raw),
      currentRatio: n(financial?.currentRatio?.raw),
      quickRatio: n(financial?.quickRatio?.raw),
      returnOnEquity: n(financial?.returnOnEquity?.raw),
      returnOnAssets: n(financial?.returnOnAssets?.raw),
      targetMeanPrice: n(financial?.targetMeanPrice?.raw),
      recommendation: t(financial?.recommendationKey) ?? t(live?.recommendationKey),
      sector: t(profile?.sector),
      industry: t(profile?.industry),
      source: "yahoo-summary"
    };
  } catch {
    return fallbackFromLive();
  }
}

function serveStatic(pathname, res) {
  const cleanPath = pathname === "/" ? "/market-ai-platform-web/index.html" : pathname;
  const filePath = path.join(ROOT, cleanPath);

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(error.code === "ENOENT" ? 404 : 500);
      res.end(error.code === "ENOENT" ? "Not found" : "Server error");
      return;
    }

    const ext = path.extname(filePath);
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
      "Cache-Control": "no-store, max-age=0"
    });
    res.end(content);
  });
}

function writeJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

function aggregateBars(bars, size) {
  const aggregated = [];

  for (let index = 0; index < bars.length; index += size) {
    const chunk = bars.slice(index, index + size);
    if (chunk.length < size) {
      continue;
    }

    aggregated.push({
      time: chunk[chunk.length - 1].time,
      open: chunk[0].open,
      high: Math.max(...chunk.map((bar) => bar.high)),
      low: Math.min(...chunk.map((bar) => bar.low)),
      close: chunk[chunk.length - 1].close,
      volume: chunk.reduce((total, bar) => total + (bar.volume || 0), 0)
    });
  }

  return aggregated;
}

function computeEMA(values, period) {
  if (!values.length) return 0;
  const smoothing = 2 / (period + 1);
  let ema = values[0];

  for (let i = 1; i < values.length; i += 1) {
    ema = values[i] * smoothing + ema * (1 - smoothing);
  }

  return ema;
}

function computeRSI(values, period) {
  if (values.length <= period) return 50;

  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i += 1) {
    const delta = values[i] - values[i - 1];
    if (delta >= 0) gains += delta;
    else losses += Math.abs(delta);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period || 0.0001;

  for (let i = period + 1; i < values.length; i += 1) {
    const delta = values[i] - values[i - 1];
    const gain = Math.max(delta, 0);
    const loss = Math.max(-delta, 0);
    avgGain = ((avgGain * (period - 1)) + gain) / period;
    avgLoss = ((avgLoss * (period - 1)) + loss) / period;
  }

  const rs = avgGain / (avgLoss || 0.0001);
  return 100 - (100 / (1 + rs));
}

function computeVWAP(bars) {
  let totalPriceVolume = 0;
  let totalVolume = 0;

  for (const bar of bars) {
    const typicalPrice = (bar.high + bar.low + bar.close) / 3;
    const volume = bar.volume || 0;
    totalPriceVolume += typicalPrice * volume;
    totalVolume += volume;
  }

  return totalVolume ? totalPriceVolume / totalVolume : bars.at(-1)?.close || 0;
}

function computeEMASeries(bars, period) {
  if (!bars.length) return [];
  const smoothing = 2 / (period + 1);
  let ema = bars[0].close;
  const out = [];
  for (let i = 0; i < bars.length; i += 1) {
    const close = bars[i].close;
    if (i === 0) ema = close;
    else ema = close * smoothing + ema * (1 - smoothing);
    out.push({ time: bars[i].time, value: round2(ema) });
  }
  return out;
}

function computeVWAPSeries(bars) {
  let totalPV = 0;
  let totalV = 0;
  return bars.map((bar) => {
    const typical = (bar.high + bar.low + bar.close) / 3;
    const vol = bar.volume || 0;
    totalPV += typical * vol;
    totalV += vol;
    const value = totalV ? (totalPV / totalV) : bar.close;
    return { time: bar.time, value: round2(value) };
  });
}

function computeRSISeries(bars, period = 14) {
  const closes = bars.map((b) => b.close);
  if (!closes.length) return [];
  const out = [];
  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 1; i < closes.length; i += 1) {
    const delta = closes[i] - closes[i - 1];
    const gain = Math.max(delta, 0);
    const loss = Math.max(-delta, 0);

    if (i <= period) {
      avgGain += gain;
      avgLoss += loss;
      if (i < period) {
        out.push({ time: bars[i].time, value: 50 });
        continue;
      }
      avgGain /= period;
      avgLoss /= period;
    } else {
      avgGain = ((avgGain * (period - 1)) + gain) / period;
      avgLoss = ((avgLoss * (period - 1)) + loss) / period;
    }

    const rs = avgGain / (avgLoss || 0.0001);
    const rsi = 100 - (100 / (1 + rs));
    out.push({ time: bars[i].time, value: round2(rsi) });
  }

  if (!out.length) return bars.map((b) => ({ time: b.time, value: 50 }));
  return out;
}

function computeMACDSeries(bars, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  if (!bars.length) return { line: [], signal: [], histogram: [] };
  const closes = bars.map((b) => b.close);
  const fast = computeEMASeriesFromValues(closes, fastPeriod);
  const slow = computeEMASeriesFromValues(closes, slowPeriod);
  const lineValues = closes.map((_, i) => fast[i] - slow[i]);
  const signalValues = computeEMASeriesFromValues(lineValues, signalPeriod);

  const line = [];
  const signal = [];
  const histogram = [];
  for (let i = 0; i < bars.length; i += 1) {
    line.push({ time: bars[i].time, value: round2(lineValues[i]) });
    signal.push({ time: bars[i].time, value: round2(signalValues[i]) });
    histogram.push({ time: bars[i].time, value: round2(lineValues[i] - signalValues[i]) });
  }
  return { line, signal, histogram };
}

function computeEMASeriesFromValues(values, period) {
  if (!values.length) return [];
  const smoothing = 2 / (period + 1);
  const out = [];
  let ema = values[0];
  for (let i = 0; i < values.length; i += 1) {
    if (i === 0) ema = values[0];
    else ema = values[i] * smoothing + ema * (1 - smoothing);
    out.push(ema);
  }
  return out;
}

function detectTrend(price, ema21, ema200, closes) {
  const recent = closes.slice(-10);
  const first = recent[0] || price;
  const slope = ((price - first) / first) * 100;

  if (price > ema21 && ema21 > ema200 && slope > 1) return "Uptrend";
  if (price < ema21 && ema21 < ema200 && slope < -1) return "Downtrend";
  return "Range";
}

function detectStructure(price, highs, lows) {
  const priorHigh = Math.max(...highs.slice(-12, -2));
  const priorLow = Math.min(...lows.slice(-12, -2));

  if (price > priorHigh) return "Bullish BOS";
  if (price < priorLow) return "Bearish BOS";
  return "No clear BOS";
}

function detectDivergence(closes, rsi) {
  const recentCloses = closes.slice(-6);
  const earlierCloses = closes.slice(-12, -6);
  const recentDirection = recentCloses.at(-1) - recentCloses[0];
  const earlierDirection = earlierCloses.at(-1) - earlierCloses[0];

  if (recentDirection < 0 && earlierDirection >= 0 && rsi > 40) return "Bullish";
  if (recentDirection > 0 && earlierDirection <= 0 && rsi < 60) return "Bearish";
  return "None";
}

function inferSmartMoney(current, support, resistance, avgVolume, trend, volumeCharacter) {
  const upsideStops = round2(resistance + (resistance - support) * 0.12);
  const downsideStops = round2(support - (resistance - support) * 0.12);
  const fakeoutRisk = current.volume < avgVolume * 0.85 || trend === "Range"
    ? "High"
    : volumeCharacter === "Neutral"
      ? "Medium"
      : "Low";

  return {
    liquidityZone: `Above ${resistance} breakout highs and below ${support} swing lows`,
    stopClusters: `Buy stops near ${upsideStops}, sell stops near ${downsideStops}`,
    fakeoutRisk
  };
}

function classifyNewsSentiment(newsItems) {
  if (!newsItems.length) return "Neutral";

  const score = newsItems.slice(0, 5).reduce((total, item) => total + scoreHeadline(item.title), 0);
  if (score >= 2) return "Bullish";
  if (score <= -2) return "Bearish";
  return "Neutral";
}

function buildNewsNotes(newsItems) {
  if (!newsItems.length) {
    return "No current Yahoo Finance headlines were returned for this ticker.";
  }

  return newsItems
    .slice(0, 3)
    .map((item) => `${item.publisher}: ${trimText(item.title, 110)}`)
    .join(" | ");
}

function scoreHeadline(headline) {
  const text = headline.toLowerCase();
  const bullishWords = ["beat", "surge", "upgrade", "growth", "record", "bull", "rally", "wins", "strong", "expands"];
  const bearishWords = ["miss", "drop", "downgrade", "cuts", "probe", "lawsuit", "bear", "weak", "fall", "slump"];

  let score = 0;
  bullishWords.forEach((word) => {
    if (text.includes(word)) score += 1;
  });
  bearishWords.forEach((word) => {
    if (text.includes(word)) score -= 1;
  });
  return score;
}

function detectSimpleTrend(bars) {
  if (bars.length < 8) return "Range";
  const closes = bars.map((bar) => bar.close);
  const price = closes.at(-1);
  const ema20 = computeEMA(closes, Math.min(20, closes.length));
  const ema50 = computeEMA(closes, Math.min(50, closes.length));

  if (price > ema20 && ema20 >= ema50) return "Uptrend";
  if (price < ema20 && ema20 <= ema50) return "Downtrend";
  return "Range";
}

function normalizeYield(value) {
  if (!value) return 0;
  return round2(value > 20 ? value / 10 : value);
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

function trimText(value, maxLength) {
  if (!value || value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1)}...`;
}

function initDealSpotterDb() {
  try {
    const db = new DatabaseSync(DEAL_SPOTTER_DB_PATH);
    db.exec(`
      CREATE TABLE IF NOT EXISTS deal_spotter_deals (
        id TEXT PRIMARY KEY,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        title TEXT NOT NULL,
        category TEXT DEFAULT 'Other',
        source TEXT DEFAULT '',
        status TEXT DEFAULT 'new',
        condition TEXT DEFAULT 'unknown',
        link TEXT DEFAULT '',
        image_url TEXT DEFAULT '',
        notes TEXT DEFAULT '',
        keyword TEXT DEFAULT '',
        distance_miles REAL DEFAULT 0,
        asking_price REAL DEFAULT 0,
        market_value REAL DEFAULT 0,
        fees REAL DEFAULT 0,
        repair_cost REAL DEFAULT 0,
        pickup_cost REAL DEFAULT 0,
        risk_penalty REAL DEFAULT 0,
        profit REAL DEFAULT 0,
        margin REAL DEFAULT 0,
        score INTEGER DEFAULT 0,
        grade TEXT DEFAULT 'Skip',
        explanation TEXT DEFAULT '',
        suggested_offer REAL DEFAULT 0,
        seller_template TEXT DEFAULT '',
        comps_json TEXT DEFAULT '[]'
      );
      CREATE INDEX IF NOT EXISTS idx_deal_spotter_grade ON deal_spotter_deals(grade);
      CREATE INDEX IF NOT EXISTS idx_deal_spotter_status ON deal_spotter_deals(status);
      CREATE INDEX IF NOT EXISTS idx_deal_spotter_source ON deal_spotter_deals(source);
      CREATE TABLE IF NOT EXISTS deal_spotter_alerts (
        fingerprint TEXT PRIMARY KEY,
        sent_at INTEGER NOT NULL,
        deal_title TEXT,
        deal_link TEXT
      );
    `);
    return db;
  } catch (error) {
    console.error("Deal Spotter DB init failed:", error?.message || error);
    return null;
  }
}

function dsSafeNum(value, fallback = 0) {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const normalized = String(value).replace(/[^0-9.\-]/g, "");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : fallback;
}

function dsMedian(values) {
  const nums = values
    .map((v) => dsSafeNum(v, NaN))
    .filter((v) => Number.isFinite(v))
    .sort((a, b) => a - b);
  if (!nums.length) return 0;
  const mid = Math.floor(nums.length / 2);
  if (nums.length % 2 === 0) return (nums[mid - 1] + nums[mid]) / 2;
  return nums[mid];
}

function dsCleanTitle(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/\b(free shipping|ship free|new listing|buy now|best offer|obo|click here)\b/gi, "")
    .replace(/\[[^\]]+\]/g, "")
    .trim();
}

function dsNormalizeCategory(value) {
  const t = String(value || "").toLowerCase();
  if (/(iphone|ios|apple phone)/.test(t)) return "iPhones";
  if (/(macbook|imac|mac mini)/.test(t)) return "MacBooks";
  if (/(ps5|ps4|xbox|switch|console)/.test(t)) return "Game consoles";
  if (/(dewalt|milwaukee|drill|tool|saw)/.test(t)) return "Tools";
  if (/(sofa|couch|table|dresser|chair|furniture)/.test(t)) return "Furniture";
  if (/(washer|dryer|fridge|stove|appliance)/.test(t)) return "Appliances";
  if (/(sneaker|jordan|nike|adidas|yeezy)/.test(t)) return "Sneakers";
  if (/(watch|rolex|omega|seiko)/.test(t)) return "Watches";
  if (/(camera|canon|nikon|sony|dslr)/.test(t)) return "Cameras";
  if (/(gpu|laptop|tablet|monitor|tv|electronic)/.test(t)) return "Electronics";
  return "Other";
}

function dsConditionBucket(value) {
  const t = String(value || "").toLowerCase();
  if (/(brand new|new|sealed|unused)/.test(t)) return "new";
  if (/(excellent|mint|like new)/.test(t)) return "excellent";
  if (/(fair|used fair|wear|scratch)/.test(t)) return "fair";
  if (/(parts|broken|as is|not working)/.test(t)) return "parts";
  return "good";
}

function dsConditionWeight(condition) {
  const map = { new: 1, excellent: 0.95, good: 0.86, fair: 0.72, parts: 0.4 };
  return map[String(condition || "good").toLowerCase()] || 0.8;
}

function dsGrade(profit, marginPct) {
  if (profit >= 250 && marginPct >= 30) return "A+";
  if (profit >= 150 && marginPct >= 20) return "A";
  if (profit >= 75 && marginPct >= 15) return "B";
  if (profit > 0) return "C";
  return "Skip";
}

function dsScore({ profit, marginPct, condition, riskPenalty, demandScore = 60, easeScore = 60 }) {
  const profitComponent = Math.max(0, Math.min(100, profit / 4));
  const marginComponent = Math.max(0, Math.min(100, marginPct * 2));
  const conditionComponent = Math.round(dsConditionWeight(condition) * 100);
  const riskComponent = Math.max(0, Math.min(100, 100 - (riskPenalty * 2)));
  return Math.round(
    profitComponent * 0.26 +
    marginComponent * 0.24 +
    conditionComponent * 0.16 +
    riskComponent * 0.14 +
    demandScore * 0.1 +
    easeScore * 0.1
  );
}

function dsReason(grade, profit, marginPct, marketValue, askingPrice) {
  if (grade === "A+") return `Large spread vs market value with strong margin (${marginPct.toFixed(1)}%).`;
  if (grade === "A") return `Strong upside with healthy margin (${marginPct.toFixed(1)}%).`;
  if (grade === "B") return `Decent spread, still needs clean execution and negotiation.`;
  if (grade === "C") return `Positive edge but thin margin; only with strict risk control.`;
  if (marketValue <= 0) return "No reliable market comps found.";
  if (askingPrice >= marketValue) return "Asking price is too close to market value.";
  if (profit <= 0) return "Estimated total costs remove the trade edge.";
  return "Low edge or elevated risk.";
}

function dsSuggestedOffer(asking, grade) {
  const pct = grade === "A+" ? 0.05 : grade === "A" ? 0.08 : grade === "B" ? 0.12 : 0.15;
  return Math.max(0, round2(asking * (1 - pct)));
}

function dsSellerTemplate(item) {
  return `Hi, is "${item.title}" still available? I can pick up soon and pay cash. Would you consider $${item.suggestedOffer.toFixed(0)} if everything checks out?`;
}

function dsListingFingerprint(item) {
  const raw = `${String(item.source || "").toLowerCase()}|${String(item.title || "").toLowerCase()}|${String(item.link || "").toLowerCase()}|${dsSafeNum(item.askingPrice, 0).toFixed(2)}`;
  return createHash("sha1").update(raw).digest("hex");
}

function dsParsePriceFromText(value) {
  const match = String(value || "").match(/(?:\$|USD\s*)\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)/i);
  return match ? dsSafeNum(match[1], 0) : 0;
}

function dsTryParseJson(text, fallback = []) {
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function dsNormalizeSerpListing(raw, sourceName = "SerpApi") {
  const title = dsCleanTitle(raw?.title || raw?.name || raw?.snippet || "");
  let price = dsSafeNum(raw?.price || raw?.extracted_price || raw?.price_from || raw?.price_value || raw?.price_str || raw?.snippet, 0);
  if (!(price > 0)) {
    price = dsParsePriceFromText(`${raw?.title || ""} ${raw?.snippet || ""}`);
  }
  const link = String(raw?.link || raw?.product_link || raw?.url || "").trim();
  if (!title || !link) return null;
  return {
    id: `serp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    source: sourceName,
    title,
    askingPrice: price,
    condition: dsConditionBucket(raw?.condition || raw?.snippet || ""),
    link,
    imageUrl: String(raw?.thumbnail || raw?.image || raw?.image_url || "").trim(),
    distanceMiles: 0,
    notes: String(raw?.snippet || "").trim()
  };
}

function dsInferSourceFromLink(link, fallback = "Google Search") {
  const text = String(link || "").toLowerCase();
  if (!text) return fallback;
  if (text.includes("facebook.com/marketplace")) return "Facebook Marketplace (Search)";
  if (text.includes("craigslist.org")) return "Craigslist (Search)";
  if (text.includes("ebay.com")) return "eBay (Search)";
  if (text.includes("slickdeals.net")) return "Slickdeals (Search)";
  if (text.includes("dealslist.com")) return "Dealslist (Search)";
  if (text.includes("dealnews.com")) return "DealNews (Search)";
  return fallback;
}

function dsBuildSerpSourceQueries(keyword, sources = {}) {
  const q = String(keyword || "").trim();
  const list = [];
  if (!q) return list;
  if (sources.facebook !== false) list.push(`site:facebook.com/marketplace ${q}`);
  if (sources.craigslist !== false) list.push(`site:craigslist.org ${q} "for sale"`);
  if (sources.ebay === true) list.push(`site:ebay.com/itm ${q}`);
  list.push(`site:slickdeals.net ${q}`);
  list.push(`site:dealslist.com ${q}`);
  list.push(`site:dealnews.com ${q}`);
  return Array.from(new Set(list));
}

function dsNormalizeApifyListing(raw, sourceName) {
  const title = dsCleanTitle(raw?.title || raw?.name || raw?.headline || "");
  const link = String(raw?.url || raw?.link || raw?.itemUrl || raw?.listingUrl || "").trim();
  if (!title || !link) return null;
  const price = dsSafeNum(raw?.price || raw?.listingPrice || raw?.currentPrice || raw?.amount, 0);
  return {
    id: `ap_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    source: sourceName,
    title,
    askingPrice: price,
    condition: dsConditionBucket(raw?.condition || raw?.description || ""),
    link,
    imageUrl: String(raw?.image || raw?.thumbnail || raw?.imageUrl || raw?.picture || "").trim(),
    distanceMiles: dsSafeNum(raw?.distance || raw?.distanceMiles || 0, 0),
    notes: String(raw?.description || raw?.details || "").replace(/\s+/g, " ").trim().slice(0, 500)
  };
}

async function dsFetchSerpApi(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 18000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    const text = await res.text();
    if (!res.ok) return { ok: false, error: `SerpApi HTTP ${res.status}`, raw: text };
    let json = {};
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      json = {};
    }
    return { ok: true, json };
  } catch (error) {
    return { ok: false, error: error?.message || String(error) };
  } finally {
    clearTimeout(timer);
  }
}

async function dsFetchSerpListings({ keyword, maxPrice, limit = 25, sources = {} }) {
  if (!SERPAPI_KEY) return { rows: [], warnings: ["SerpApi key missing."] };
  const safeKeyword = String(keyword || "").trim() || "best deals";
  const rows = [];
  const warnings = [];

  const shoppingUrl = new URL("https://serpapi.com/search.json");
  shoppingUrl.searchParams.set("engine", "google_shopping");
  shoppingUrl.searchParams.set("q", safeKeyword);
  shoppingUrl.searchParams.set("api_key", SERPAPI_KEY);
  shoppingUrl.searchParams.set("num", String(Math.max(10, Math.min(50, limit))));
  const shopping = await dsFetchSerpApi(shoppingUrl.toString());
  if (shopping.ok) {
    const items = Array.isArray(shopping.json?.shopping_results) ? shopping.json.shopping_results : [];
    for (const raw of items) {
      const item = dsNormalizeSerpListing(raw, "Google Shopping");
      if (!item) continue;
      if (maxPrice > 0 && item.askingPrice > maxPrice) continue;
      rows.push(item);
    }
  } else {
    warnings.push(`Google Shopping: ${shopping.error}`);
  }

  const perQueryLimit = Math.max(8, Math.min(20, Math.floor(limit / 2) || 10));
  const targetedQueries = dsBuildSerpSourceQueries(safeKeyword, sources);
  for (const query of targetedQueries) {
    const searchUrl = new URL("https://serpapi.com/search.json");
    searchUrl.searchParams.set("engine", "google");
    searchUrl.searchParams.set("q", query);
    searchUrl.searchParams.set("api_key", SERPAPI_KEY);
    searchUrl.searchParams.set("num", String(perQueryLimit));
    const search = await dsFetchSerpApi(searchUrl.toString());
    if (!search.ok) {
      warnings.push(`Google Search (${query}): ${search.error}`);
      continue;
    }
    const items = Array.isArray(search.json?.organic_results) ? search.json.organic_results : [];
    for (const raw of items) {
      const sourceName = dsInferSourceFromLink(raw?.link || raw?.url || "", "Google Search");
      const item = dsNormalizeSerpListing(raw, sourceName);
      if (!item) continue;
      if (maxPrice > 0 && item.askingPrice > maxPrice) continue;
      rows.push(item);
    }
  }

  return { rows, warnings };
}

async function dsRunApifyActor(actorId, input) {
  if (!APIFY_TOKEN) return { ok: false, error: "Apify token missing." };
  if (!actorId) return { ok: false, error: "Actor id missing." };
  const url = `https://api.apify.com/v2/acts/${encodeURIComponent(actorId)}/run-sync-get-dataset-items?token=${encodeURIComponent(APIFY_TOKEN)}&timeout=180`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input || {}),
      signal: controller.signal
    });
    const text = await response.text();
    if (!response.ok) {
      return { ok: false, error: `Apify HTTP ${response.status}`, bodyPreview: text.slice(0, 220) };
    }
    const parsed = dsTryParseJson(text, []);
    return { ok: true, items: Array.isArray(parsed) ? parsed : [] };
  } catch (error) {
    return { ok: false, error: error?.message || String(error) };
  } finally {
    clearTimeout(timer);
  }
}

async function dsFetchApifyListings({ keyword, maxPrice, sources = {}, limit = 30, category }) {
  const rows = [];
  const warnings = [];
  const safeKeyword = String(keyword || "").trim() || String(category || "").trim() || "deals";
  const tasks = [];

  if (sources.facebook !== false) {
    tasks.push(
      dsRunApifyActor(APIFY_FACEBOOK_ACTOR_ID, {
        searchQueries: [safeKeyword],
        maxItems: limit,
        sortBy: "newest",
        maxPrice: maxPrice > 0 ? maxPrice : undefined
      }).then((result) => {
        if (!result.ok) {
          warnings.push(`Facebook (Apify): ${result.error}`);
          return;
        }
        for (const raw of result.items || []) {
          const item = dsNormalizeApifyListing(raw, "Facebook Marketplace");
          if (!item) continue;
          if (maxPrice > 0 && item.askingPrice > maxPrice) continue;
          rows.push(item);
        }
      })
    );
  }

  if (sources.craigslist !== false) {
    tasks.push(
      dsRunApifyActor(APIFY_CRAIGSLIST_ACTOR_ID, {
        query: safeKeyword,
        maxItems: limit,
        sortBy: "newest",
        maxPrice: maxPrice > 0 ? maxPrice : undefined
      }).then((result) => {
        if (!result.ok) {
          warnings.push(`Craigslist (Apify): ${result.error}`);
          return;
        }
        for (const raw of result.items || []) {
          const item = dsNormalizeApifyListing(raw, "Craigslist");
          if (!item) continue;
          if (maxPrice > 0 && item.askingPrice > maxPrice) continue;
          rows.push(item);
        }
      })
    );
  }

  if (sources.ebay === true) {
    tasks.push(
      dsRunApifyActor(APIFY_EBAY_ACTOR_ID, {
        queries: [safeKeyword],
        maxItems: limit,
        sort: "newlyListed",
        maxPrice: maxPrice > 0 ? maxPrice : undefined
      }).then((result) => {
        if (!result.ok) {
          warnings.push(`eBay (Apify): ${result.error}`);
          return;
        }
        for (const raw of result.items || []) {
          const item = dsNormalizeApifyListing(raw, "eBay Scraper");
          if (!item) continue;
          if (maxPrice > 0 && item.askingPrice > maxPrice) continue;
          rows.push(item);
        }
      })
    );
  }

  await Promise.all(tasks);
  return { rows, warnings };
}

async function dsFetchCompsForTitle(title) {
  if (!SERPAPI_KEY) return { marketValue: 0, comps: [], warning: "SerpApi disabled." };
  const q = dsCleanTitle(title).slice(0, 120);
  if (!q) return { marketValue: 0, comps: [], warning: "Missing title." };
  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google_shopping");
  url.searchParams.set("q", q);
  url.searchParams.set("api_key", SERPAPI_KEY);
  url.searchParams.set("num", "12");
  const result = await dsFetchSerpApi(url.toString());
  if (!result.ok) return { marketValue: 0, comps: [], warning: result.error };
  const comps = [];
  const rows = Array.isArray(result.json?.shopping_results) ? result.json.shopping_results : [];
  for (const row of rows) {
    const price = dsSafeNum(row?.price || row?.extracted_price || row?.price_from || row?.snippet, 0);
    const text = `${row?.title || ""} ${row?.snippet || ""}`.toLowerCase();
    if (!price || price <= 0) continue;
    if (/(case|charger|cable|screen protector|cover only|parts only)/.test(text)) continue;
    comps.push({
      title: dsCleanTitle(row?.title || ""),
      price: round2(price),
      link: String(row?.link || "").trim(),
      source: "Google Shopping"
    });
  }
  const marketValue = round2(dsMedian(comps.map((c) => c.price)));
  return { marketValue, comps: comps.slice(0, 8), warning: "" };
}

function dsComputeDealFromListing(listing, options = {}) {
  const askingPrice = round2(dsSafeNum(listing.askingPrice, 0));
  const marketValue = round2(dsSafeNum(listing.marketValue, 0));
  const feePct = dsSafeNum(options.feePct, 13);
  const repairCost = round2(dsSafeNum(options.repairCost, 0));
  const pickupCost = round2(dsSafeNum(options.pickupCost, 0));
  const riskPenalty = round2(dsSafeNum(options.riskPenalty, 0));
  const fees = round2(marketValue * (feePct / 100));
  const profit = round2(marketValue - askingPrice - fees - repairCost - pickupCost - riskPenalty);
  const marginPct = marketValue > 0 ? round2((profit / marketValue) * 100) : 0;
  const grade = dsGrade(profit, marginPct);
  const score = dsScore({
    profit,
    marginPct,
    condition: listing.condition,
    riskPenalty,
    demandScore: dsSafeNum(options.demandScore, 60),
    easeScore: dsSafeNum(options.easeScore, 60)
  });
  const suggestedOffer = dsSuggestedOffer(askingPrice, grade);
  return {
    ...listing,
    category: listing.category || dsNormalizeCategory(listing.title || ""),
    askingPrice,
    marketValue,
    fees,
    repairCost,
    pickupCost,
    riskPenalty,
    profit,
    margin: marginPct,
    score,
    grade,
    explanation: dsReason(grade, profit, marginPct, marketValue, askingPrice),
    suggestedOffer,
    sellerTemplate: dsSellerTemplate({ ...listing, suggestedOffer }),
    updatedAtIso: new Date().toISOString()
  };
}

function dsBuildTelegramMessage(item) {
  return [
    "ðŸ”¥ FLIP DEAL FOUND",
    "",
    `Item: ${item.title || "-"}`,
    `Buy Price: $${dsSafeNum(item.askingPrice, 0).toFixed(2)}`,
    `Estimated Sold Price: $${dsSafeNum(item.marketValue, 0).toFixed(2)}`,
    `Net Profit: $${dsSafeNum(item.profit, 0).toFixed(2)}`,
    `ROI: ${dsSafeNum(item.margin, 0).toFixed(2)}%`,
    `Grade: ${item.grade || "Skip"}`,
    `Risk: ${dsSafeNum(item.riskPenalty, 0).toFixed(2)}`,
    `Link: ${item.link || "-"}`
  ].join("\n");
}

function dsShouldAlert(item) {
  const grade = String(item?.grade || "").toUpperCase();
  return grade === "A+" || grade === "A";
}

function dsMarkAlertSent(fingerprint, item) {
  if (!dealSpotterDb) return;
  const now = Date.now();
  dealSpotterDb.prepare(`
    INSERT INTO deal_spotter_alerts (fingerprint, sent_at, deal_title, deal_link)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(fingerprint) DO UPDATE SET
      sent_at = excluded.sent_at,
      deal_title = excluded.deal_title,
      deal_link = excluded.deal_link
  `).run(
    String(fingerprint || ""),
    now,
    String(item?.title || ""),
    String(item?.link || "")
  );
}

function dsAlreadyAlerted(fingerprint) {
  if (!dealSpotterDb) return false;
  const row = dealSpotterDb.prepare("SELECT fingerprint FROM deal_spotter_alerts WHERE fingerprint = ? LIMIT 1").get(String(fingerprint || ""));
  return Boolean(row?.fingerprint);
}

function dsMapDealDbRow(row) {
  if (!row) return null;
  return {
    id: String(row.id || ""),
    createdAt: Number(row.created_at || 0),
    updatedAt: Number(row.updated_at || 0),
    title: String(row.title || ""),
    category: String(row.category || "Other"),
    source: String(row.source || ""),
    status: String(row.status || "new"),
    condition: String(row.condition || "good"),
    link: String(row.link || ""),
    imageUrl: String(row.image_url || ""),
    notes: String(row.notes || ""),
    keyword: String(row.keyword || ""),
    distanceMiles: dsSafeNum(row.distance_miles, 0),
    askingPrice: dsSafeNum(row.asking_price, 0),
    marketValue: dsSafeNum(row.market_value, 0),
    fees: dsSafeNum(row.fees, 0),
    repairCost: dsSafeNum(row.repair_cost, 0),
    pickupCost: dsSafeNum(row.pickup_cost, 0),
    riskPenalty: dsSafeNum(row.risk_penalty, 0),
    profit: dsSafeNum(row.profit, 0),
    margin: dsSafeNum(row.margin, 0),
    score: dsSafeNum(row.score, 0),
    grade: String(row.grade || "Skip"),
    explanation: String(row.explanation || ""),
    suggestedOffer: dsSafeNum(row.suggested_offer, 0),
    sellerTemplate: String(row.seller_template || ""),
    comps: dsTryParseJson(String(row.comps_json || "[]"), [])
  };
}

function upsertDealSpotterDeal(payload = {}) {
  if (!dealSpotterDb) return null;
  const now = Date.now();
  const id = String(payload.id || `ds_${now}_${Math.random().toString(36).slice(2, 8)}`);
  const listing = dsComputeDealFromListing({
    id,
    source: String(payload.source || "Manual"),
    title: dsCleanTitle(payload.title || "Untitled listing"),
    category: String(payload.category || dsNormalizeCategory(payload.title || "")),
    condition: dsConditionBucket(payload.condition || ""),
    link: String(payload.link || ""),
    imageUrl: String(payload.imageUrl || ""),
    notes: String(payload.notes || ""),
    distanceMiles: dsSafeNum(payload.distanceMiles, 0),
    askingPrice: dsSafeNum(payload.askingPrice ?? payload.buyPrice ?? 0, 0),
    marketValue: dsSafeNum(payload.marketValue ?? payload.soldPrice ?? 0, 0)
  }, {
    feePct: payload.feePct,
    repairCost: payload.repairCost,
    pickupCost: payload.pickupCost,
    riskPenalty: payload.riskPenalty,
    demandScore: payload.demandScore,
    easeScore: payload.easeScore
  });
  const status = String(payload.status || "new").toLowerCase();
  const compsJson = JSON.stringify(Array.isArray(payload.comps) ? payload.comps : listing.comps || []);

  dealSpotterDb.prepare(`
    INSERT INTO deal_spotter_deals (
      id, created_at, updated_at, title, category, source, status, condition, link, image_url, notes, keyword, distance_miles,
      asking_price, market_value, fees, repair_cost, pickup_cost, risk_penalty, profit, margin, score, grade, explanation, suggested_offer, seller_template, comps_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      updated_at = excluded.updated_at,
      title = excluded.title,
      category = excluded.category,
      source = excluded.source,
      status = excluded.status,
      condition = excluded.condition,
      link = excluded.link,
      image_url = excluded.image_url,
      notes = excluded.notes,
      keyword = excluded.keyword,
      distance_miles = excluded.distance_miles,
      asking_price = excluded.asking_price,
      market_value = excluded.market_value,
      fees = excluded.fees,
      repair_cost = excluded.repair_cost,
      pickup_cost = excluded.pickup_cost,
      risk_penalty = excluded.risk_penalty,
      profit = excluded.profit,
      margin = excluded.margin,
      score = excluded.score,
      grade = excluded.grade,
      explanation = excluded.explanation,
      suggested_offer = excluded.suggested_offer,
      seller_template = excluded.seller_template,
      comps_json = excluded.comps_json
  `).run(
    id, now, now, listing.title, listing.category, listing.source, status, listing.condition, listing.link, listing.imageUrl, listing.notes,
    String(payload.keyword || ""), dsSafeNum(listing.distanceMiles, 0),
    dsSafeNum(listing.askingPrice, 0), dsSafeNum(listing.marketValue, 0), dsSafeNum(listing.fees, 0), dsSafeNum(listing.repairCost, 0),
    dsSafeNum(listing.pickupCost, 0), dsSafeNum(listing.riskPenalty, 0), dsSafeNum(listing.profit, 0), dsSafeNum(listing.margin, 0),
    dsSafeNum(listing.score, 0), String(listing.grade || "Skip"), String(listing.explanation || ""), dsSafeNum(listing.suggestedOffer, 0),
    String(listing.sellerTemplate || ""), compsJson
  );

  const row = dealSpotterDb.prepare("SELECT * FROM deal_spotter_deals WHERE id = ? LIMIT 1").get(id);
  return dsMapDealDbRow(row);
}

function listDealSpotterDeals(filters = {}) {
  if (!dealSpotterDb) return [];
  const where = [];
  const params = [];
  const search = String(filters.search || "").trim().toLowerCase();
  const grade = String(filters.grade || "").trim().toUpperCase();
  const source = String(filters.source || "").trim().toLowerCase();
  const status = String(filters.status || "").trim().toLowerCase();

  if (search) {
    where.push("(LOWER(title) LIKE ? OR LOWER(category) LIKE ? OR LOWER(notes) LIKE ? OR LOWER(link) LIKE ?)");
    const token = `%${search}%`;
    params.push(token, token, token, token);
  }
  if (grade && grade !== "ALL") {
    where.push("UPPER(grade) = ?");
    params.push(grade);
  }
  if (source && source !== "all") {
    where.push("LOWER(source) = ?");
    params.push(source);
  }
  if (status && status !== "all") {
    where.push("LOWER(status) = ?");
    params.push(status);
  }

  const sortMap = {
    created_at: "created_at",
    updated_at: "updated_at",
    profit: "profit",
    margin: "margin",
    score: "score",
    asking_price: "asking_price",
    market_value: "market_value"
  };
  const sortBy = sortMap[String(filters.sortBy || "created_at").toLowerCase()] || "created_at";
  const sortDir = String(filters.sortDir || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";
  const sql = `SELECT * FROM deal_spotter_deals ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY ${sortBy} ${sortDir} LIMIT 1000`;
  const rows = dealSpotterDb.prepare(sql).all(...params);
  return rows.map(dsMapDealDbRow).filter(Boolean);
}

function updateDealSpotterStatus(id, status) {
  if (!dealSpotterDb) return false;
  const out = dealSpotterDb.prepare("UPDATE deal_spotter_deals SET status = ?, updated_at = ? WHERE id = ?").run(String(status || ""), Date.now(), String(id || ""));
  return Number(out?.changes || 0) > 0;
}

function deleteDealSpotterDeal(id) {
  if (!dealSpotterDb) return false;
  const out = dealSpotterDb.prepare("DELETE FROM deal_spotter_deals WHERE id = ?").run(String(id || ""));
  return Number(out?.changes || 0) > 0;
}

function analyzeManualListing(payload = {}) {
  const text = String(payload.text || payload.raw || "").trim();
  const title = dsCleanTitle(payload.title || text.split(/\r?\n/)[0] || "");
  const askingPrice = dsSafeNum(payload.askingPrice || payload.buyPrice || dsParsePriceFromText(text), 0);
  const condition = dsConditionBucket(payload.condition || text);
  const category = payload.category || dsNormalizeCategory(`${title} ${text}`);
  const linkMatch = text.match(/https?:\/\/[^\s)]+/i);
  const link = String(payload.link || (linkMatch ? linkMatch[0] : "")).trim();
  const notes = String(payload.notes || "").trim() || text.slice(0, 500);
  const soldPrice = dsSafeNum(payload.marketValue || payload.estimatedSoldPrice || 0, 0);
  const listing = dsComputeDealFromListing({
    id: `manual_${Date.now()}`,
    source: "Manual Analyzer",
    title,
    category,
    condition,
    link,
    notes,
    imageUrl: "",
    distanceMiles: dsSafeNum(payload.distanceMiles, 0),
    askingPrice,
    marketValue: soldPrice
  }, {
    feePct: payload.feePct,
    repairCost: payload.repairCost,
    pickupCost: payload.pickupCost,
    riskPenalty: payload.riskPenalty
  });
  return listing;
}

async function runDealSpotterScan(payload = {}) {
  const keyword = String(payload.keyword || payload.query || "").trim();
  const category = String(payload.category || "").trim() || "Other";
  const maxPrice = dsSafeNum(payload.maxPrice, 0);
  const minProfit = dsSafeNum(payload.minProfit, 0);
  const distance = dsSafeNum(payload.distance, 0);
  const feePct = dsSafeNum(payload.feePct, 13);
  const repairCost = dsSafeNum(payload.repairCost, 0);
  const pickupCost = dsSafeNum(payload.pickupCost, 0);
  const riskPenalty = dsSafeNum(payload.riskPenalty, 0);
  const sources = {
    facebook: payload?.sources?.facebook !== false,
    craigslist: payload?.sources?.craigslist !== false,
    ebay: payload?.sources?.ebay === true,
    serp: payload?.sources?.serp !== false
  };
  const autoAlert = payload.autoAlert !== false;
  const warnings = [];

  if (!keyword) {
    return { ok: false, error: "keyword is required.", candidates: [] };
  }

  const [apifyRows, serpRows] = await Promise.all([
    dsFetchApifyListings({ keyword, maxPrice, sources, limit: 40, category }),
    sources.serp ? dsFetchSerpListings({ keyword, maxPrice, limit: 35, sources }) : Promise.resolve({ rows: [], warnings: [] })
  ]);
  warnings.push(...(apifyRows.warnings || []), ...(serpRows.warnings || []));

  const combined = [...(apifyRows.rows || []), ...(serpRows.rows || [])];
  const seen = new Set();
  const unique = [];
  for (const item of combined) {
    if (!item || !item.title || !item.link) continue;
    const key = `${String(item.link || "").toLowerCase()}|${String(item.title || "").toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
  }

  // Diversify candidates so one source (for example Google Shopping)
  // does not crowd out Craigslist/eBay/Facebook search rows.
  const bySource = new Map();
  for (const row of unique) {
    const src = String(row?.source || "Unknown");
    if (!bySource.has(src)) bySource.set(src, []);
    bySource.get(src).push(row);
  }
  const sourceOrder = Array.from(bySource.keys()).sort((a, b) => {
    const aIsShopping = /google shopping/i.test(a);
    const bIsShopping = /google shopping/i.test(b);
    if (aIsShopping && !bIsShopping) return 1;
    if (!aIsShopping && bIsShopping) return -1;
    return a.localeCompare(b);
  });
  const diversified = [];
  const usedRow = new Set();
  for (const src of sourceOrder) {
    const rows = bySource.get(src) || [];
    const cap = /google shopping/i.test(src) ? 20 : 12;
    for (const row of rows.slice(0, cap)) {
      const key = `${String(row.link || "").toLowerCase()}|${String(row.title || "").toLowerCase()}`;
      if (usedRow.has(key)) continue;
      usedRow.add(key);
      diversified.push(row);
    }
  }
  if (diversified.length < 60) {
    for (const row of unique) {
      const key = `${String(row.link || "").toLowerCase()}|${String(row.title || "").toLowerCase()}`;
      if (usedRow.has(key)) continue;
      usedRow.add(key);
      diversified.push(row);
      if (diversified.length >= 60) break;
    }
  }
  const topInput = diversified.slice(0, 60);
  const compCache = new Map();
  const tasks = topInput.map(async (item) => {
    const cacheKey = dsCleanTitle(item.title || "").toLowerCase().split(/\s+/).slice(0, 6).join(" ");
    let comp = compCache.get(cacheKey);
    if (!comp) {
      comp = await dsFetchCompsForTitle(item.title);
      compCache.set(cacheKey, comp);
    }
    if (comp?.warning) warnings.push(`${item.title.slice(0, 24)}: ${comp.warning}`);
    const marketValue = comp?.marketValue > 0 ? comp.marketValue : round2(item.askingPrice * 1.25);
    const computed = dsComputeDealFromListing({
      ...item,
      marketValue
    }, {
      feePct,
      repairCost,
      pickupCost,
      riskPenalty
    });
    computed.comps = comp?.comps || [];
    if (distance > 0 && dsSafeNum(computed.distanceMiles, 0) > 0 && dsSafeNum(computed.distanceMiles, 0) > distance) return null;
    if (maxPrice > 0 && computed.askingPrice > maxPrice) return null;
    if (computed.profit < minProfit) return null;
    return computed;
  });
  const evaluated = (await Promise.all(tasks)).filter(Boolean);

  evaluated.sort((a, b) => {
    const scoreDiff = dsSafeNum(b.score, 0) - dsSafeNum(a.score, 0);
    if (scoreDiff !== 0) return scoreDiff;
    return dsSafeNum(b.profit, 0) - dsSafeNum(a.profit, 0);
  });

  const alerts = [];
  const creds = resolveTelegramCredentials();
  if (autoAlert && creds.token && creds.chatId) {
    for (const item of evaluated) {
      if (!dsShouldAlert(item)) continue;
      const fingerprint = dsListingFingerprint(item);
      if (dsAlreadyAlerted(fingerprint)) continue;
      const msg = dsBuildTelegramMessage(item);
      const sent = await sendTelegramMessage(creds.token, creds.chatId, msg);
      if (sent.ok) {
        dsMarkAlertSent(fingerprint, item);
        alerts.push({ ok: true, title: item.title, grade: item.grade });
      } else {
        alerts.push({ ok: false, title: item.title, grade: item.grade, error: sent?.body?.description || `HTTP ${sent.statusCode}` });
      }
    }
  }

  const top = evaluated.slice(0, 120).map((item) => ({
    ...item,
    distanceMiles: dsSafeNum(item.distanceMiles, 0),
    status: "new"
  }));

  return {
    ok: true,
    keyword,
    category,
    filters: { maxPrice, minProfit, distance, feePct },
    providers: {
      serpapi: Boolean(SERPAPI_KEY),
      apify: Boolean(APIFY_TOKEN),
      telegram: Boolean(creds.token && creds.chatId)
    },
    counts: {
      raw: combined.length,
      unique: unique.length,
      scored: top.length,
      alerts: alerts.filter((x) => x.ok).length
    },
    warnings: Array.from(new Set(warnings)).slice(0, 30),
    alerts: alerts.slice(0, 20),
    candidates: top
  };
}

