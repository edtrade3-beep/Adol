"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const DEFAULT_CRON = "*/15 7-20 * * 1-5";
const DEFAULT_TZ = "America/New_York";
const DEFAULT_ETFS = ["SPY", "QQQ", "IWM", "DIA", "SMH", "XLF", "XLK", "XLE", "XLI", "XLY", "XLP", "XLV", "XLU"];
const STATE_FILE = path.join(__dirname, "adol_runtime_state.json");
function clamp(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return Number(min);
  return Math.max(Number(min), Math.min(Number(max), n));
}

function round(value, digits = 2) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  const p = Math.pow(10, digits);
  return Math.round(n * p) / p;
}

function safeNum(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function uniqSymbols(input) {
  const out = [];
  const seen = new Set();
  const list = Array.isArray(input) ? input : [];
  for (const raw of list) {
    const s = String(raw || "").trim().toUpperCase();
    if (!s) continue;
    if (!/^[A-Z0-9.\-^]+$/.test(s)) continue;
    if (seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

function hashText(text) {
  return crypto.createHash("sha256").update(String(text || "")).digest("hex");
}

function nyDateParts(date = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: DEFAULT_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    weekday: "short"
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]));
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
    weekdayText: String(parts.weekday || "")
  };
}

function isWeekdayNY(parts) {
  const d = String(parts.weekdayText || "").toLowerCase();
  return ["mon", "tue", "wed", "thu", "fri"].includes(d);
}

function getSessionState(now = new Date()) {
  const p = nyDateParts(now);
  if (!isWeekdayNY(p)) {
    return { label: "Closed", code: "CLOSED", marketStatus: "Closed", active: false };
  }
  const hhmm = p.hour * 100 + p.minute;
  if (hhmm >= 700 && hhmm <= 929) {
    return { label: "Premarket", code: "PREMARKET", marketStatus: "Open", active: true };
  }
  if (hhmm >= 930 && hhmm <= 1600) {
    return { label: "Regular Market", code: "REGULAR", marketStatus: "Open", active: true };
  }
  if (hhmm >= 1601 && hhmm <= 2000) {
    return { label: "After Hours", code: "AFTER_HOURS", marketStatus: "Open", active: true };
  }
  return { label: "Closed", code: "CLOSED", marketStatus: "Closed", active: false };
}

function nextScanEta(now = new Date()) {
  const d = new Date(now.getTime());
  d.setSeconds(0, 0);
  const m = d.getMinutes();
  const add = 15 - (m % 15 || 15);
  d.setMinutes(m + add);
  return d.toISOString();
}

function nextScheduledRunIso(now = new Date()) {
  const p = nyDateParts(now);
  const weekdayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const makeUtcDate = (year, month, day, hour, minute) => {
    const guess = new Date(Date.UTC(year, month - 1, day, hour + 4, minute, 0));
    for (let offsetMinutes = -360; offsetMinutes <= 360; offsetMinutes += 15) {
      const candidate = new Date(guess.getTime() + offsetMinutes * 60000);
      const cp = nyDateParts(candidate);
      if (cp.year === year && cp.month === month && cp.day === day && cp.hour === hour && cp.minute === minute) {
        return candidate;
      }
    }
    return guess;
  };

  for (let dayOffset = 0; dayOffset < 10; dayOffset += 1) {
    const dateProbe = new Date(now.getTime() + dayOffset * 86400000);
    const parts = nyDateParts(dateProbe);
    const dow = weekdayNames.indexOf(String(parts.weekdayText || "").toLowerCase());
    if (dow < 1 || dow > 5) continue;
    for (let hour = 7; hour <= 20; hour += 1) {
      for (const minute of [0, 15, 30, 45]) {
        const target = makeUtcDate(parts.year, parts.month, parts.day, hour, minute);
        if (target.getTime() > now.getTime()) {
          return target.toISOString();
        }
      }
    }
  }
  return nextScanEta(now);
}

function maskToken(token) {
  const t = String(token || "").trim();
  if (!t) return "";
  if (t.length < 10) return "****";
  return `${t.slice(0, 8)}...${t.slice(-4)}`;
}

function maskId(id) {
  const v = String(id || "").trim();
  if (!v) return "";
  if (v.length <= 4) return "****";
  return `...${v.slice(-4)}`;
}

function formatNyTimestamp(iso) {
  const stamp = String(iso || "").trim();
  if (!stamp) return "";
  try {
    return new Date(stamp).toLocaleString("en-US", {
      timeZone: DEFAULT_TZ,
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  } catch {
    return stamp;
  }
}

function loadState() {
  try {
    if (!fs.existsSync(STATE_FILE)) return { sentHashes: {}, alerts: [], rowStates: {} };
    const parsed = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
    return {
      sentHashes: parsed && parsed.sentHashes && typeof parsed.sentHashes === "object" ? parsed.sentHashes : {},
      alerts: Array.isArray(parsed?.alerts) ? parsed.alerts.slice(-1000) : [],
      rowStates: parsed && parsed.rowStates && typeof parsed.rowStates === "object" ? parsed.rowStates : {}
    };
  } catch {
    return { sentHashes: {}, alerts: [], rowStates: {} };
  }
}

function saveState(state) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
  } catch {
    // ignore
  }
}

function defaultSettings(opts) {
  const baseWatch = uniqSymbols([
    ...(opts?.fallbackSP500 || []),
    ...(opts?.fallbackNasdaq100 || []),
    ...(opts?.fallbackDow30 || []),
    ...DEFAULT_ETFS
  ]);
  return {
    watchlist: baseWatch,
    universeMode: "core",
    minAPlusScore: 70,
    minTradeScore: 70,
    minRvolTrade: 2,
    minPrice: 5,
    minAvgVolume: 1000000,
    maxSpreadPct: 1.2,
    maxUniverseSymbols: 500,
    riskPerTrade: 100,
    dailyMaxLossR: -2,
    sideMode: "both",
    riskMode: "balanced",
    autoScanEnabled: true
  };
}

function getUniverseLimit(settings) {
  const mode = String(settings?.universeMode || "core").toLowerCase();
  const configured = clamp(Number(settings?.maxUniverseSymbols || 500), 25, 1000);
  if (mode === "core") return Math.min(configured, 150);
  if (mode === "extended") return Math.min(configured, 320);
  return Math.min(configured, 500);
}

function pickUniverseModeLabel(mode) {
  const value = String(mode || "core").toLowerCase();
  if (value === "full_market") return "Full Market";
  if (value === "extended") return "Extended";
  return "Core";
}

function shouldKeepLiquidRow(row, settings) {
  const price = safeNum(row?.price, 0);
  const avgVolume = safeNum(row?.avgVolume, 0);
  const spreadPct = safeNum(row?.spreadPct, 0);
  if (price < safeNum(settings?.minPrice, 5)) return false;
  if (avgVolume < safeNum(settings?.minAvgVolume, 1000000)) return false;
  if (spreadPct > 0 && spreadPct > safeNum(settings?.maxSpreadPct, 1.2)) return false;
  return true;
}

function chooseAction(row, settings) {
  const bull = safeNum(row.bullScore);
  const bear = safeNum(row.bearScore);
  const rvol = safeNum(row.rvol, 1);
  const up = bull >= bear;
  const strictLong = isTechnicalLongHit(row, settings);
  const strictShort = isTechnicalShortHit(row, settings);

  if (strictLong) return { action: "Long", setupType: "Trade Setup", decision: "Trade", side: "LONG" };
  if (strictShort) return { action: "Short", setupType: "Trade Setup", decision: "Trade", side: "SHORT" };
  if (safeNum(row.finalAiScore) >= 65) return { action: "WatchOnly", setupType: "Watchlist Setup", decision: "Wait", side: up ? "LONG" : "SHORT" };
  return { action: "Avoid", setupType: "No Trade", decision: "Avoid", side: up ? "LONG" : "SHORT" };
}

function isTechnicalLongHit(row, settings) {
  const bull = safeNum(row?.bullScore);
  const rvol = safeNum(row?.rvol, 1);
  return (
    bull >= safeNum(settings?.minTradeScore, 70) &&
    rvol >= safeNum(settings?.minRvolTrade, 2) &&
    safeNum(row?.price) > safeNum(row?.vwap) &&
    safeNum(row?.ema9) > safeNum(row?.ema21) &&
    safeNum(row?.ema21) > safeNum(row?.ema200)
  );
}

function isTechnicalShortHit(row, settings) {
  const bear = safeNum(row?.bearScore);
  const rvol = safeNum(row?.rvol, 1);
  return (
    bear >= safeNum(settings?.minTradeScore, 70) &&
    rvol >= safeNum(settings?.minRvolTrade, 2) &&
    safeNum(row?.price) < safeNum(row?.vwap) &&
    safeNum(row?.ema9) < safeNum(row?.ema21) &&
    safeNum(row?.ema21) < safeNum(row?.ema200)
  );
}

function makeReason(row, actionObj) {
  if (actionObj.action === "Long") return "Trend aligned + VWAP hold + RVOL confirmation";
  if (actionObj.action === "Short") return "Downtrend aligned + VWAP reject + RVOL confirmation";
  if (actionObj.action === "WatchOnly") return "Trend + momentum alignment but strict trigger not met";
  return "Weak pressure or low conviction";
}

function normalizeQuoteRow(raw, idx = 0) {
  const ticker = String(raw?.ticker || raw?.symbol || raw?.code || "").toUpperCase();
  const price = safeNum(raw?.price || raw?.last || raw?.close || raw?.c, 0);
  const changePct = safeNum(raw?.changePct ?? raw?.changesPercentage ?? raw?.dp ?? raw?.percent_change, 0);
  const open = safeNum(raw?.open || raw?.o, price > 0 ? price * (1 - changePct / 100) : 0);
  const prevClose = safeNum(raw?.previousClose || raw?.pc, open || price);
  const gapPct = prevClose > 0 ? ((open - prevClose) / prevClose) * 100 : safeNum(raw?.gapPct, 0);
  const volume = safeNum(raw?.volume || raw?.v, 0);
  const avgVolume = safeNum(raw?.avgVolume || raw?.averageVolume || raw?.avg_volume, volume > 0 ? volume / 1.22 : 0);
  const rawRvol = avgVolume > 0 ? volume / avgVolume : safeNum(raw?.rvol, 1.22);
  const rvol = clamp(rawRvol || 1.22, 0.05, 9);
  const bid = safeNum(raw?.bid, 0);
  const ask = safeNum(raw?.ask, 0);
  const spreadPct = bid > 0 && ask > 0 && price > 0 ? ((ask - bid) / price) * 100 : safeNum(raw?.spreadPct, 0);

  const drift = ((idx % 11) - 5) * 0.0025;
  const vwap = safeNum(raw?.vwap, price * (1 - (changePct / 100) * 0.25 + drift));
  const ema9 = safeNum(raw?.ema9, price * (1 - 0.004 + drift));
  const ema21 = safeNum(raw?.ema21, price * (1 - 0.007 + drift * 0.8));
  const ema200 = safeNum(raw?.ema200, price * (1 - 0.012 + drift * 0.6));
  const rsi = clamp(safeNum(raw?.rsi, 52 + (idx % 8) * 3), 15, 90);

  return {
    ticker,
    price: round(price, 2),
    changePct: round(changePct, 2),
    gapPct: round(gapPct, 2),
    volume: Math.max(0, Math.round(volume)),
    avgVolume: Math.max(0, Math.round(avgVolume)),
    bid: round(bid, 2),
    ask: round(ask, 2),
    spreadPct: round(spreadPct, 3),
    rvol: round(rvol, 2),
    vwap: round(vwap, 2),
    ema9: round(ema9, 2),
    ema21: round(ema21, 2),
    ema200: round(ema200, 2),
    rsi: round(rsi, 1)
  };
}

function scoreRow(base, marketBias) {
  const trendUp = base.price > base.ema9 && base.ema9 > base.ema21 && base.ema21 > base.ema200;
  const trendDown = base.price < base.ema9 && base.ema9 < base.ema21 && base.ema21 < base.ema200;
  const aboveVwap = base.price > base.vwap;
  const belowVwap = base.price < base.vwap;
  const rvolStrong = base.rvol >= 1.5;
  const rvolVeryStrong = base.rvol >= 2;

  let bull = 0;
  let bear = 0;

  if (trendUp) bull += 30;
  if (trendDown) bear += 30;
  if (aboveVwap) bull += 20;
  if (belowVwap) bear += 20;
  if (base.rsi >= 55 && base.rsi <= 72) bull += 15;
  if (base.rsi <= 45) bear += 15;
  if (rvolStrong) {
    bull += aboveVwap ? 10 : 0;
    bear += belowVwap ? 10 : 0;
  }
  if (marketBias === "Bullish") bull += 10;
  if (marketBias === "Bearish") bear += 10;

  bull = clamp(Math.round(bull), 0, 100);
  bear = clamp(Math.round(bear), 0, 100);

  const trend = trendUp ? "Uptrend" : trendDown ? "Downtrend" : "Range";
  const social = 50;
  const news = 50;
  const optionsBias = "Options flow disabled";
  const finalAiScore = clamp(Math.round(bull * 0.4 + (rvolVeryStrong ? 80 : base.rvol * 40) * 0.2 + 50 * 0.15 + news * 0.1 + social * 0.15), 0, 100);

  const side = bull >= bear ? 1 : -1;
  const risk = Math.max(base.price * 0.012, 0.1);
  const entry = base.price;
  const stop = side > 0 ? entry - risk : entry + risk;
  const t1 = side > 0 ? entry + risk : entry - risk;
  const t2 = side > 0 ? entry + risk * 2 : entry - risk * 2;
  const t3 = side > 0 ? entry + risk * 3 : entry - risk * 3;

  return {
    ...base,
    trend,
    bullScore: bull,
    bearScore: bear,
    socialSentimentScore: social,
    newsSentimentScore: news,
    finalAiScore,
    entry: round(entry, 2),
    stop: round(stop, 2),
    t1: round(t1, 2),
    t2: round(t2, 2),
    t3: round(t3, 2),
    optionsBias,
    vwapControl: base.price >= base.vwap ? "Buyers in Control (Above VWAP)" : "Sellers in Control (Below VWAP)",
    liquidityEvent: "None",
    trapSignal: "None",
    institutionalPressure: clamp(Math.round((bull - bear + 100) / 2), 0, 100),
    institutionalScore: clamp(Math.round((finalAiScore + Math.max(bull, bear)) / 2), 0, 100),
    topTimingScore: clamp(Math.round(bear + (base.rsi > 75 ? 20 : 0)), 0, 100),
    bottomTimingScore: clamp(Math.round(bull + (base.rsi < 30 ? 20 : 0)), 0, 100),
    stopHuntZones: {
      priorDayHigh: round(base.price * 1.01, 2),
      priorDayLow: round(base.price * 0.99, 2),
      premarketHigh: round(base.price * 1.008, 2),
      premarketLow: round(base.price * 0.992, 2),
      openingRangeHigh: round(base.price * 1.005, 2),
      openingRangeLow: round(base.price * 0.995, 2)
    },
    sector: rawSectorFromTicker(base.ticker)
  };
}

function rawSectorFromTicker(ticker) {
  const s = String(ticker || "").toUpperCase();
  if (["NVDA", "AMD", "INTC", "AVGO", "QCOM", "AMAT", "TSM"].includes(s)) return "Semiconductors";
  if (["AAPL", "MSFT", "GOOGL", "META", "ORCL", "CRM", "ADBE"].includes(s)) return "Software";
  if (["XLF", "JPM", "BAC", "GS", "WFC", "C"].includes(s)) return "Financials";
  if (["XLE", "XOM", "CVX", "SLB"].includes(s)) return "Energy";
  if (["XLV", "LLY", "UNH", "JNJ", "PFE", "MRK"].includes(s)) return "Healthcare";
  if (["XLI", "CAT", "DE", "HON", "GE"].includes(s)) return "Industrials";
  if (["XLY", "AMZN", "TSLA", "HD", "LOW", "MCD"].includes(s)) return "Consumer";
  if (["XLU", "NEE", "DUK", "SO"].includes(s)) return "Utilities";
  return "Broad Market";
}

function buildRankings(rows) {
  const by = (fn) => [...rows].sort(fn).slice(0, 20);
  const topBullishMovers = by((a, b) => (b.bullScore - a.bullScore) || (b.finalAiScore - a.finalAiScore));
  const topBearishMovers = by((a, b) => (b.bearScore - a.bearScore) || (a.finalAiScore - b.finalAiScore));
  const biggestGapUp = by((a, b) => b.gapPct - a.gapPct);
  const biggestGapDown = by((a, b) => a.gapPct - b.gapPct);
  const highestRVOL = by((a, b) => b.rvol - a.rvol);
  const strongestTrend = by((a, b) => (b.bullScore - b.bearScore) - (a.bullScore - a.bearScore));
  const weakestTrend = by((a, b) => (b.bearScore - b.bullScore) - (a.bearScore - a.bullScore));
  const topSessionMoversUp = by((a, b) => b.changePct - a.changePct);
  const topSessionMoversDown = by((a, b) => a.changePct - b.changePct);
  const bestRiskReward = by((a, b) => {
    const rrA = Math.abs((a.t2 - a.entry) / Math.max(0.01, a.entry - a.stop));
    const rrB = Math.abs((b.t2 - b.entry) / Math.max(0.01, b.entry - b.stop));
    return rrB - rrA;
  });
  return {
    topBullishMovers,
    topBearishMovers,
    biggestGapUp,
    biggestGapDown,
    highestRVOL,
    strongestTrend,
    weakestTrend,
    topSessionMoversUp,
    topSessionMoversDown,
    bestRiskReward
  };
}

function buildBigNews(rows) {
  const upgrades = rows
    .filter((r) => r.bullScore >= 75)
    .slice(0, 8)
    .map((r) => ({
      ticker: r.ticker,
      headline: `${r.ticker} upgraded: momentum + trend alignment`,
      category: "Upgrade",
      source: "Scanner",
      sentiment: "Bullish"
    }));
  const downgrades = rows
    .filter((r) => r.bearScore >= 70)
    .slice(0, 8)
    .map((r) => ({
      ticker: r.ticker,
      headline: `${r.ticker} downgraded: bearish pressure + breakdown risk`,
      category: "Downgrade",
      source: "Scanner",
      sentiment: "Bearish"
    }));
  const all = [...upgrades, ...downgrades];
  return {
    rows: all,
    upgrades,
    downgrades,
    source: "Scanner synthetic news"
  };
}

function buildReport(scan) {
  const rows = Array.isArray(scan.rows) ? scan.rows : [];
  const trades = rows.filter((r) => String(r.action).toLowerCase() === "long" || String(r.action).toLowerCase() === "short");
  const waits = rows.filter((r) => String(r.action).toLowerCase() === "watchonly");
  const avoids = rows.filter((r) => String(r.action).toLowerCase() === "avoid");
  const bullish = rows.filter((r) => r.bullScore >= r.bearScore);
  const bearish = rows.filter((r) => r.bearScore > r.bullScore);

  const bestBull = [...bullish].sort((a, b) => b.finalAiScore - a.finalAiScore).slice(0, 5);
  const bestBear = [...bearish].sort((a, b) => b.finalAiScore - a.finalAiScore).slice(0, 5);

  const institutionalModeSummary = {
    buyersInControl: bullish.slice(0, 10).map((r) => r.ticker),
    sellersInControl: bearish.slice(0, 10).map((r) => r.ticker),
    liquidityGrabsDetected: rows.filter((r) => String(r.liquidityEvent || "").toLowerCase().includes("sweep")).map((r) => r.ticker),
    bullTrapsDetected: rows.filter((r) => String(r.trapSignal || "").toLowerCase() === "bull trap").map((r) => r.ticker),
    bearTrapsDetected: rows.filter((r) => String(r.trapSignal || "").toLowerCase() === "bear trap").map((r) => r.ticker),
    quietAccumulationNames: bestBull.filter((r) => r.rvol < 1.5).map((r) => r.ticker),
    hypeTrapNames: rows.filter((r) => r.rvol > 2.5 && r.finalAiScore < 65).map((r) => r.ticker),
    bestAPlusInstitutionalSetup: bestBull[0] ? bestBull[0].ticker : "N/A",
    whatToAvoid: avoids.slice(0, 10).map((r) => r.ticker)
  };

  return {
    marketBias: scan.marketBias,
    riskMode: scan.marketBias === "Bullish" ? "RISK ON" : scan.marketBias === "Bearish" ? "RISK OFF" : "MIXED",
    marketSummary: {
      trade: trades.length,
      wait: waits.length,
      avoid: avoids.length,
      bulls: bullish.length,
      bears: bearish.length
    },
    bestBullishMovers: bestBull,
    bestBearishMovers: bestBear,
    socialLeaders: rows.slice(0, 10).map((r) => ({ ticker: r.ticker, social: r.socialSentimentScore })),
    strongChartLowAttention: rows.filter((r) => r.finalAiScore >= 70 && r.socialSentimentScore <= 45).slice(0, 8),
    hypeWeakChart: rows.filter((r) => r.socialSentimentScore >= 65 && r.finalAiScore < 60).slice(0, 8),
    bestTradeSetups: trades.slice(0, 10),
    avoidList: avoids.slice(0, 10),
    actionPlan: trades.length ? "Focus only on strict Trade setups and ignore Watch/Avoid." : "No high-probability setup right now. Preserve capital.",
    institutionalModeSummary
  };
}

function buildSectorFlow(rows) {
  const map = new Map();
  for (const row of rows || []) {
    const sector = String(row?.sector || "Broad Market");
    if (!map.has(sector)) {
      map.set(sector, { sector, count: 0, bull: 0, bear: 0, final: 0, rvol: 0 });
    }
    const bucket = map.get(sector);
    bucket.count += 1;
    bucket.bull += safeNum(row?.bullScore);
    bucket.bear += safeNum(row?.bearScore);
    bucket.final += safeNum(row?.finalAiScore);
    bucket.rvol += safeNum(row?.rvol, 1);
  }
  return [...map.values()].map((entry) => {
    const count = Math.max(1, entry.count);
    const avgBull = entry.bull / count;
    const avgBear = entry.bear / count;
    const avgFinal = entry.final / count;
    const avgRvol = entry.rvol / count;
    return {
      sector: entry.sector,
      score: round(avgBull - avgBear, 1),
      avgFinal: round(avgFinal, 1),
      avgRvol: round(avgRvol, 2),
      direction: avgBull >= avgBear ? "Inflow" : "Outflow"
    };
  }).sort((a, b) => Math.abs(b.score) - Math.abs(a.score));
}

function buildCotSummary(scan) {
  const bulls = safeNum(scan?.report?.marketSummary?.bulls);
  const bears = safeNum(scan?.report?.marketSummary?.bears);
  const bias = bulls > bears ? "Bullish positioning" : bears > bulls ? "Bearish positioning" : "Balanced positioning";
  const conviction = Math.abs(bulls - bears) >= 20 ? "Strong" : Math.abs(bulls - bears) >= 8 ? "Moderate" : "Mixed";
  return { bias, conviction };
}

function buildLiquiditySummary(rows) {
  const sectorFlow = buildSectorFlow(rows);
  const inflow = sectorFlow.filter((x) => x.direction === "Inflow").slice(0, 3);
  const outflow = sectorFlow.filter((x) => x.direction === "Outflow").slice(0, 3);
  return { inflow, outflow };
}

function buildInstitutionalSummary(rows) {
  const ranked = [...(rows || [])].sort((a, b) => safeNum(b?.institutionalScore) - safeNum(a?.institutionalScore));
  return {
    leaders: ranked.slice(0, 5),
    traps: ranked.filter((x) => String(x?.trapSignal || "").toLowerCase() !== "none").slice(0, 5)
  };
}

function buildSocialSummary(scan) {
  const leaders = Array.isArray(scan?.report?.socialLeaders) ? scan.report.socialLeaders.slice(0, 5) : [];
  return leaders.map((row) => `${row.ticker} ${safeNum(row.social)}`);
}

function scanHash(scan) {
  const picks = (scan.rankings?.topBullishMovers || []).slice(0, 5).map((r) => `${r.ticker}:${r.finalAiScore}:${r.action}`)
    .concat((scan.rankings?.topBearishMovers || []).slice(0, 5).map((r) => `${r.ticker}:${r.finalAiScore}:${r.action}`));
  return hashText(`${scan.session}|${scan.marketBias}|${picks.join("|")}`);
}

async function sendTelegram(token, chatId, text) {
  const url = `https://api.telegram.org/bot${encodeURIComponent(token)}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true })
    });
    const raw = await res.text();
    let body = {};
    try { body = JSON.parse(raw); } catch { body = { raw }; }
    return { ok: res.ok && body?.ok === true, statusCode: res.status, body };
  } catch (error) {
    return { ok: false, statusCode: 0, body: { error: error?.message || String(error) } };
  }
}

function deriveLiquiditySweep(row, side) {
  const explicit = String(row?.liquidityEvent || "").trim();
  if (explicit && explicit.toLowerCase() !== "none") return explicit;
  const gapPct = safeNum(row?.gapPct, 0);
  const rvol = safeNum(row?.rvol, 0);
  const trend = String(row?.trend || "");
  if (side === "LONG" && rvol >= 2 && gapPct >= 1) return "Bullish liquidity reclaim";
  if (side === "SHORT" && rvol >= 2 && gapPct <= -1) return "Bearish liquidity sweep";
  if (/uptrend/i.test(trend)) return "No clean sweep, trend continuation";
  if (/downtrend/i.test(trend)) return "No clean sweep, breakdown continuation";
  return "No clean liquidity event";
}

function getMarketRegime(scan) {
  const bias = String(scan?.marketBias || "Mixed");
  const riskMode = String(scan?.report?.riskMode || "").toUpperCase();
  if (riskMode.includes("RISK ON") || /bull/i.test(bias)) return { label: "Risk-On", emoji: "🟢" };
  if (riskMode.includes("RISK OFF") || /bear/i.test(bias)) return { label: "Risk-Off", emoji: "🔴" };
  return { label: "Mixed", emoji: "🟡" };
}

function marketRegimeAllowsSide(scan, side, row) {
  const regime = getMarketRegime(scan).label;
  const finalScore = safeNum(row?.finalAiScore, 0);
  if (regime === "Risk-Off" && side === "LONG") return finalScore >= 85;
  if (regime === "Risk-On" && side === "SHORT") return finalScore >= 85;
  return true;
}

function isChoppyOrWeak(row, side) {
  const trend = String(row?.trend || "").toLowerCase();
  const rvol = safeNum(row?.rvol, 0);
  const bull = safeNum(row?.bullScore, 0);
  const bear = safeNum(row?.bearScore, 0);
  const price = safeNum(row?.price, 0);
  const vwap = safeNum(row?.vwap, 0);
  const ema9 = safeNum(row?.ema9, 0);
  const ema21 = safeNum(row?.ema21, 0);
  const ema200 = safeNum(row?.ema200, 0);
  if (trend === "range") return true;
  if (rvol < 2) return true;
  if (side === "LONG") {
    if (bull < 70 || price <= vwap || !(ema9 > ema21 && ema21 > ema200)) return true;
  } else {
    if (bear < 70 || price >= vwap || !(ema9 < ema21 && ema21 < ema200)) return true;
  }
  return false;
}

function estimateRiskLabel(row) {
  const rvol = safeNum(row?.rvol, 0);
  const spreadPct = safeNum(row?.spreadPct, 0);
  const gapPct = Math.abs(safeNum(row?.gapPct, 0));
  let risk = "Medium";
  if (rvol >= 4 || spreadPct > 0.75 || gapPct > 3) risk = "High";
  else if (rvol >= 2 && spreadPct <= 0.15 && gapPct <= 1.25) risk = "Low-Medium";
  return risk;
}

function classifyRowStage(row) {
  const action = String(row?.action || "").trim();
  if (action === "Long") return "BUY";
  if (action === "Short") return "SELL";
  if (action === "WatchOnly") return "WAIT";
  return "AVOID";
}

function formatTransitionAlert(scan, row, fromStage, toStage) {
  const ticker = String(row?.ticker || "").toUpperCase();
  const transitionLabel = `${fromStage} -> ${toStage}`;
  const transitionEmoji =
    toStage === "BUY" ? "🟢" :
    toStage === "SELL" ? "🔴" :
    toStage === "WAIT" ? "🟡" :
    "⚪";
  return [
    "🔄 ADOL22 TRANSITION ALERT",
    "",
    `${transitionEmoji} ${ticker}`,
    `Session: ${scan.session}`,
    `Change: ${transitionLabel}`,
    `Market Bias: ${scan.marketBias}`,
    `Price: $${round(row?.price || 0, 2)}`,
    `Bull / Bear / Final: ${round(row?.bullScore || 0, 0)} / ${round(row?.bearScore || 0, 0)} / ${round(row?.finalAiScore || 0, 0)}`,
    `RVOL: ${round(row?.rvol || 0, 2)}`,
    `VWAP: $${round(row?.vwap || 0, 2)} (${String(row?.vwapStatus || "Neutral")})`,
    `Reason: ${String(row?.reason || row?.setupType || row?.liquidityEvent || "State change detected")}`
  ].join("\n");
}

function deriveInstitutionalReasoning(scan, row, side) {
  const pieces = [];
  const vwap = side === "LONG" ? "above VWAP" : "below VWAP";
  const ema = side === "LONG" ? "bullish EMA stack" : "bearish EMA stack";
  const liquidity = deriveLiquiditySweep(row, side).toLowerCase();
  const regime = getMarketRegime(scan).label.toLowerCase();
  if (safeNum(row?.rvol, 0) >= 3) pieces.push("strong participation");
  else if (safeNum(row?.rvol, 0) >= 2) pieces.push("above-average participation");
  pieces.push(ema);
  if (!liquidity.includes("no clean")) pieces.push(liquidity);
  pieces.push(`${regime} backdrop`);
  const tail = side === "LONG"
    ? "continuation probability is improving if price holds structure."
    : "breakdown probability is improving if price stays under structure.";
  return `Institutions appear to be positioning ${vwap} with ${pieces.join(", ")}, and ${tail}`;
}

function buildNewsReactionSummary(scan, row) {
  const items = Array.isArray(scan?.bigNews?.rows) ? scan.bigNews.rows : [];
  const hit = items.find((item) => String(item?.ticker || "").toUpperCase() === String(row?.ticker || "").toUpperCase());
  if (!hit) return "";
  return `${hit.category || "News"}: ${hit.headline || "Headline unavailable"} (${hit.sentiment || "Neutral"})`;
}

function formatMarketAlert(scan, rows) {
  const topBulls = (scan.rankings?.topBullishMovers || []).slice(0, 10);
  const topBears = (scan.rankings?.topBearishMovers || []).slice(0, 10);
  const alertSettings = scan?.settings || {};
  const buyHits = rows.filter((row) => isTechnicalLongHit(row, alertSettings)).slice(0, 5);
  const sellHits = rows.filter((row) => isTechnicalShortHit(row, alertSettings)).slice(0, 5);
  const aPlusCandidates = rows
    .filter((row) => safeNum(row?.finalAiScore, 0) >= 70 && safeNum(row?.rvol, 0) >= 2)
    .sort((a, b) => safeNum(b?.finalAiScore, 0) - safeNum(a?.finalAiScore, 0))
    .slice(0, 5);
  const ms = scan.report?.marketSummary || {};
  const riskTone = getMarketRegime(scan);
  const sectionTitle = (icon, label) => `${icon} ${label}`;
  const actionLabel = (action) => {
    const value = String(action || '').toLowerCase();
    if (value.includes('buy') || value.includes('long') || value.includes('trade')) return 'BUY NOW';
    if (value.includes('sell') || value.includes('short')) return 'SELL NOW';
    if (value.includes('watch') || value.includes('wait')) return 'WAIT';
    return 'AVOID';
  };
  const header = [
    `ADOL22 Alert Center`,
    `${formatNyTimestamp(scan.generatedAt)}`,
    `Session: ${scan.session}`,
    `Market Bias: ${scan.marketBias}`,
    `Risk Tone: ${getMarketRegime(scan).label}`,
    `Universe: ${scan.universeLabel || "Core"} | Scanned: ${scan.universeSize || rows.length || 0} | Liquid: ${scan.liquidUniverseSize || rows.length || 0}`,
    `Trade: ${ms.trade || 0} | Wait: ${ms.wait || 0} | Avoid: ${ms.avoid || 0} | Bulls: ${ms.bulls || 0} | Bears: ${ms.bears || 0}`
  ].join("\n");
  const bullLines = topBulls.map((s, i) => `${i + 1}. ${s.ticker} $${round(s.price,2)} | Bull ${s.bullScore} | Final ${s.finalAiScore} | RVOL ${round(s.rvol,2)} | ${actionLabel(s.action)}`).join("\n");
  const bearLines = topBears.map((s, i) => `${i + 1}. ${s.ticker} $${round(s.price,2)} | Bear ${s.bearScore} | Final ${s.finalAiScore} | RVOL ${round(s.rvol,2)} | ${actionLabel(s.action)}`).join("\n");
  const buyHitLines = buyHits.map((s, i) => `${i + 1}. ${s.ticker} $${round(s.price,2)} | Bull ${round(s.bullScore,0)} | RVOL ${round(s.rvol,2)} | Entry ${round(s.entry,2)} | Stop ${round(s.stop,2)}`).join("\n");
  const sellHitLines = sellHits.map((s, i) => `${i + 1}. ${s.ticker} $${round(s.price,2)} | Bear ${round(s.bearScore,0)} | RVOL ${round(s.rvol,2)} | Entry ${round(s.entry,2)} | Stop ${round(s.stop,2)}`).join("\n");
  const aPlusLines = aPlusCandidates.map((s, i) => `${i + 1}. ${s.ticker} | Final ${round(s.finalAiScore,0)} | RVOL ${round(s.rvol,2)} | ${actionLabel(s.action)}`).join("\n");
  const topBuyLines = topBulls.slice(0, 5).map((s, i) => `${i + 1}. ${s.ticker} $${round(s.price,2)} | Final ${s.finalAiScore} | RVOL ${round(s.rvol,2)} | ${actionLabel(s.action)}`).join("\n");
  const topSellLines = topBears.slice(0, 5).map((s, i) => `${i + 1}. ${s.ticker} $${round(s.price,2)} | Final ${s.finalAiScore} | RVOL ${round(s.rvol,2)} | ${actionLabel(s.action)}`).join("\n");
  const cot = buildCotSummary(scan);
  const liquidity = buildLiquiditySummary(rows);
  const institutional = buildInstitutionalSummary(rows);
  const social = buildSocialSummary(scan);
  const report = scan.report || {};
  const aiPlan = String(report.actionPlan || 'No action plan available.');
  const inflowText = liquidity.inflow.map((x) => `${x.sector} (${x.direction}, ${x.avgFinal})`).join(', ');
  const outflowText = liquidity.outflow.map((x) => `${x.sector} (${x.direction}, ${x.avgFinal})`).join(', ');
  const instText = institutional.leaders.map((x) => `${x.ticker} ${x.institutionalScore}`).join(', ');
  const socialText = social.join(', ');
  return [
    '================================',
    'ADOL22 ALERT CENTER',
    '================================',
    `${formatNyTimestamp(scan.generatedAt)}`,
    '',
    `Session: ${scan.session}`,
    `Market Bias: ${scan.marketBias}`,
    `Risk Tone: ${riskTone.emoji} ${riskTone.label}`,
    `Universe: ${scan.universeLabel || "Core"} | Scanned: ${scan.universeSize || rows.length || 0} | Liquid: ${scan.liquidUniverseSize || rows.length || 0}`,
    `Trade: ${ms.trade || 0} | Wait: ${ms.wait || 0} | Avoid: ${ms.avoid || 0} | Bulls: ${ms.bulls || 0} | Bears: ${ms.bears || 0}`,
    '',
    sectionTitle('🚨', 'A+ ONLY (70+ Score, RVOL 2+)'),
    `${aPlusLines || "- No A+ setups right now"}`,
    '',
    sectionTitle('🟢', 'BUY HITS'),
    `${buyHitLines || "-"}`,
    '',
    sectionTitle('🔴', 'SELL HITS'),
    `${sellHitLines || "-"}`,
    '',
    sectionTitle('✅', 'Top 5 Buy Now'),
    `${topBuyLines || "-"}`,
    '',
    sectionTitle('⛔', 'Top 5 Sell Now'),
    `${topSellLines || "-"}`,
    '',
    sectionTitle('🟢', 'Top Bullish Stocks'),
    `${bullLines || "-"}`,
    '',
    sectionTitle('🔴', 'Top Bearish Stocks'),
    `${bearLines || "-"}`,
    '',
    sectionTitle('🟣', 'COT Data'),
    `${cot.bias} | Conviction: ${cot.conviction}`,
    '',
    sectionTitle('🔵', 'Liquidity Map / Where The Money Flows'),
    `Inflow: ${inflowText || "-"}`,
    `Outflow: ${outflowText || "-"}`,
    '',
    sectionTitle('🟠', 'Institutional Mode'),
    `Leaders: ${instText || "-"}`,
    '',
    sectionTitle('🟡', 'Social Sentiment'),
    `${socialText || "Social sentiment disabled / neutral."}`,
    '',
    sectionTitle('⚪', 'AI Market Report'),
    `${aiPlan}`,
    '',
    'Alerts only. No auto trading.'
  ].join("\n");
}

function formatDetailedScanReport(scan) {
  const rows = Array.isArray(scan?.rows) ? scan.rows : [];
  return formatMarketAlert(scan, rows);
}

function formatTradeAlert(scan, row, side) {
  const sideText = side === "LONG" ? "BUY" : "SELL";
  const score = side === "LONG" ? round(row.bullScore, 0) : round(row.bearScore, 0);
  const rr1 = Math.abs((row.t1 - row.entry) / Math.max(0.01, Math.abs(row.entry - row.stop)));
  const rr2 = Math.abs((row.t2 - row.entry) / Math.max(0.01, Math.abs(row.entry - row.stop)));
  const rr3 = Math.abs((row.t3 - row.entry) / Math.max(0.01, Math.abs(row.entry - row.stop)));
  const regime = getMarketRegime(scan);
  const icon = side === "LONG" ? "🚨" : "🚨";
  const title = side === "LONG" ? "A+ BULLISH SETUP" : "C- BEARISH SETUP";
  const vwapStatus = side === "LONG" ? "Above VWAP" : "Below VWAP";
  const emaTrend = side === "LONG" ? "EMA 9 > EMA 21 > EMA 200" : "EMA 9 < EMA 21 < EMA 200";
  const liquiditySweep = deriveLiquiditySweep(row, side);
  const atrRisk = round(Math.abs(safeNum(row.entry) - safeNum(row.stop)), 2);
  const aiRead = deriveInstitutionalReasoning(scan, row, side);
  const newsReaction = buildNewsReactionSummary(scan, row);
  const lines = [
    `${icon} ${title}`,
    "",
    `Ticker: ${row.ticker}`,
    `Signal: ${side === "LONG" ? "🟢 " : "🔴 "}${sideText}`,
    `Timeframe: 15m`,
    `Score: ${score}/100`,
    "",
    "====================",
    "Market Mode",
    "====================",
    `${regime.emoji} ${regime.label}`,
    "",
    "====================",
    "Technical Summary",
    "====================",
    `• ${vwapStatus}`,
    `• ${emaTrend}`,
    `• RVOL ${round(row.rvol, 2)}`,
    `• ${liquiditySweep}`,
    `• Momentum ${side === "LONG" ? "expanding" : "breaking down"}`,
    "",
    "====================",
    "Trade Plan",
    "====================",
    `Entry: ${round(row.entry, 2)}`,
    `Stop: ${round(row.stop, 2)}`,
    `Target 1: ${round(row.t1, 2)} (${round(rr1, 2)}R)`,
    `Target 2: ${round(row.t2, 2)} (${round(rr2, 2)}R)`,
    `Target 3: ${round(row.t3, 2)} (${round(rr3, 2)}R)`,
    "",
    "====================",
    "AI Read",
    "====================",
    aiRead,
    "",
    `Risk: ${estimateRiskLabel(row)} | ATR Risk: ${atrRisk}`,
    `Invalid if: ${side === "LONG" ? "price loses VWAP or breaks below stop structure" : "price reclaims VWAP or breaks above stop structure"}`
  ];
  if (newsReaction) {
    lines.push("", "News Reaction:", newsReaction);
  }
  lines.push("", "Only high probability setups.");
  return lines.join("\n");
}

function createAdolEngine(opts = {}) {
  const state = loadState();
  const settings = defaultSettings(opts);
  let telegramBotToken = String(opts.telegramBotToken || "").trim();
  let telegramChatId = String(opts.telegramChatId || "").trim();
  let isRunning = false;
  let lastScan = null;
  let lastReport = null;
  let lastError = "";
  let lastRunAt = "";
  let nextRunAt = "";
  let cronTask = [];

  const log = typeof opts.log === "function" ? opts.log : () => {};

  function getBaseUniverseSymbols() {
    const core = uniqSymbols([
      ...(opts?.fallbackDow30 || []),
      ...(opts?.fallbackNasdaq100 || []),
      ...DEFAULT_ETFS
    ]);
    const extended = uniqSymbols([
      ...(opts?.fallbackSP500 || []),
      ...core
    ]);
    return { core, extended };
  }

  async function buildUniverseSymbols(extra = []) {
    const mode = String(settings.universeMode || "core").toLowerCase();
    const limits = getUniverseLimit(settings);
    const { core, extended } = getBaseUniverseSymbols();
    let universe = mode === "core" ? core : extended;

    if ((mode === "extended" || mode === "full_market") && typeof opts.universeFetcher === "function") {
      try {
        const fetched = await opts.universeFetcher({
          mode,
          limit: limits,
          minPrice: settings.minPrice,
          minAvgVolume: settings.minAvgVolume
        });
        if (Array.isArray(fetched) && fetched.length) {
          universe = uniqSymbols([
            ...(mode === "full_market" ? extended : universe),
            ...fetched
          ]);
        }
      } catch {
        // keep fallback universe only
      }
    }

    return uniqSymbols([
      ...universe,
      ...DEFAULT_ETFS,
      ...extra
    ]).slice(0, limits);
  }

  function getCombinedWatchlist(extra = []) {
    return uniqSymbols([
      ...settings.watchlist,
      ...DEFAULT_ETFS,
      ...extra
    ]);
  }

  function getStatus() {
    const session = getSessionState();
    return {
      ok: true,
      session: { label: session.label, code: session.code },
      marketStatus: session.marketStatus,
      scheduler: {
        enabled: Array.isArray(cronTask) ? cronTask.length > 0 : Boolean(cronTask),
        slotCount: Array.isArray(cronTask) ? cronTask.length : 0,
        running: isRunning,
        cron: DEFAULT_CRON,
        timezone: DEFAULT_TZ,
        lastRunAt: lastRunAt || "",
        nextRunAt: nextRunAt || nextScheduledRunIso()
      },
      settings: {
        watchlistCount: settings.watchlist.length,
        universeMode: settings.universeMode,
        minAPlusScore: settings.minAPlusScore,
        minTradeScore: settings.minTradeScore,
        minRvolTrade: settings.minRvolTrade,
        minPrice: settings.minPrice,
        minAvgVolume: settings.minAvgVolume,
        maxSpreadPct: settings.maxSpreadPct,
        maxUniverseSymbols: settings.maxUniverseSymbols,
        sideMode: settings.sideMode,
        riskMode: settings.riskMode,
        autoScanEnabled: settings.autoScanEnabled,
        telegramConfigured: Boolean(telegramBotToken && telegramChatId),
        tokenMasked: maskToken(telegramBotToken),
        chatIdMasked: maskId(telegramChatId)
      },
      performance: lastScan?.performance || {
        winRate: 0,
        avgWin: 0,
        avgLoss: 0,
        profitFactor: 0,
        bestSetupType: "N/A"
      },
      riskManager: {
        riskPerTrade: settings.riskPerTrade,
        dailyMaxLossR: settings.dailyMaxLossR
      },
      lastScanSummary: lastScan?.report?.marketSummary || null,
      error: lastError || ""
    };
  }

  function updateSettings(payload = {}) {
    if (Array.isArray(payload.watchlist)) {
      settings.watchlist = uniqSymbols(payload.watchlist);
    } else if (typeof payload.watchlist === "string") {
      settings.watchlist = uniqSymbols(String(payload.watchlist).split(","));
    }
    if (typeof payload.universeMode === "string") settings.universeMode = String(payload.universeMode).toLowerCase();
    if (Number.isFinite(Number(payload.minAPlusScore))) settings.minAPlusScore = clamp(Math.round(Number(payload.minAPlusScore)), 0, 100);
    if (Number.isFinite(Number(payload.minTradeScore))) settings.minTradeScore = clamp(Math.round(Number(payload.minTradeScore)), 0, 100);
    if (Number.isFinite(Number(payload.minRvolTrade))) settings.minRvolTrade = clamp(Number(payload.minRvolTrade), 0, 20);
    if (Number.isFinite(Number(payload.minPrice))) settings.minPrice = clamp(Number(payload.minPrice), 0, 100000);
    if (Number.isFinite(Number(payload.minAvgVolume))) settings.minAvgVolume = clamp(Number(payload.minAvgVolume), 0, 1000000000);
    if (Number.isFinite(Number(payload.maxSpreadPct))) settings.maxSpreadPct = clamp(Number(payload.maxSpreadPct), 0, 100);
    if (Number.isFinite(Number(payload.maxUniverseSymbols))) settings.maxUniverseSymbols = clamp(Number(payload.maxUniverseSymbols), 25, 1000);
    if (Number.isFinite(Number(payload.riskPerTrade))) settings.riskPerTrade = clamp(Number(payload.riskPerTrade), 1, 100000);
    if (Number.isFinite(Number(payload.dailyMaxLossR))) settings.dailyMaxLossR = Number(payload.dailyMaxLossR);
    if (typeof payload.sideMode === "string") settings.sideMode = payload.sideMode;
    if (typeof payload.riskMode === "string") settings.riskMode = payload.riskMode;
    if (typeof payload.autoScanEnabled === "boolean") settings.autoScanEnabled = payload.autoScanEnabled;
    return { ...settings, watchlistCount: settings.watchlist.length };
  }

  function setTelegramConfig(tokenRaw, chatRaw) {
    const token = String(tokenRaw || "").trim();
    const chat = String(chatRaw || "").trim();
    if (token) telegramBotToken = token;
    if (chat) telegramChatId = chat;
    return {
      configured: Boolean(telegramBotToken && telegramChatId),
      tokenMasked: maskToken(telegramBotToken),
      chatIdMasked: maskId(telegramChatId)
    };
  }

  function filterBySide(rows) {
    const side = String(settings.sideMode || "both").toLowerCase();
    if (side === "both") return rows;
    if (side === "long") return rows.filter((r) => r.action === "Long" || (r.bullScore >= r.bearScore));
    if (side === "short") return rows.filter((r) => r.action === "Short" || (r.bearScore > r.bullScore));
    return rows;
  }

  async function maybeSendAlerts(scan, trigger = "manual") {
    const alerts = { sent: 0, skippedDuplicate: 0, failed: 0, reason: "" };
    if (!telegramBotToken || !telegramChatId) {
      alerts.reason = "telegram_not_configured";
      return alerts;
    }
    alerts.reason = trigger === "auto" ? "detailed_report_and_technical_alerts" : "technical_alerts_only";

    if (trigger === "auto") {
      const reportKey = `detailed_report:${scan.generatedAt || new Date().toISOString()}`;
      const reportHash = hashText(reportKey);
      if (!state.sentHashes[reportHash]) {
        const reportMessage = formatDetailedScanReport(scan);
        const reportSent = await sendTelegram(telegramBotToken, telegramChatId, reportMessage);
        if (reportSent.ok) {
          alerts.sent += 1;
          state.sentHashes[reportHash] = new Date().toISOString();
          state.alerts.push({
            at: new Date().toISOString(),
            type: "detailed_scan_report",
            hash: reportHash,
            session: scan.session
          });
        } else {
          alerts.failed += 1;
        }
      } else {
        alerts.skippedDuplicate += 1;
      }
    }

    const candidates = scan.rows.filter((r) => isTechnicalLongHit(r, settings) || isTechnicalShortHit(r, settings));
    for (const row of candidates) {
      const side = isTechnicalLongHit(row, settings) ? "LONG" : "SHORT";
      const score = side === "LONG" ? safeNum(row?.bullScore, 0) : safeNum(row?.bearScore, 0);
      if (score < 70) continue;
      if (!marketRegimeAllowsSide(scan, side, row)) {
        alerts.skippedDuplicate += 1;
        continue;
      }
      if (isChoppyOrWeak(row, side)) {
        alerts.skippedDuplicate += 1;
        continue;
      }
      const key = `${row.ticker}:technical:${side}:${round(row.entry,2)}:${round(row.stop,2)}:${scan.session}:${score}`;
      const h = hashText(key);
      if (state.sentHashes[h]) {
        alerts.skippedDuplicate += 1;
        continue;
      }
      const msg = formatTradeAlert(scan, row, side);
      const sent = await sendTelegram(telegramBotToken, telegramChatId, msg);
      if (sent.ok) {
        alerts.sent += 1;
        state.sentHashes[h] = new Date().toISOString();
        state.alerts.push({ at: new Date().toISOString(), type: `technical_${side.toLowerCase()}`, ticker: row.ticker, hash: h, score });
      } else {
        alerts.failed += 1;
      }
    }

    const previousStates = state.rowStates && typeof state.rowStates === "object" ? state.rowStates : {};
    const nextRowStates = {};
    const meaningfulTransitions = new Set([
      "WAIT->BUY",
      "AVOID->BUY",
      "BUY->WAIT",
      "BUY->AVOID",
      "SELL->WAIT",
      "SELL->AVOID",
      "WAIT->SELL",
      "AVOID->SELL"
    ]);
    const transitionCandidates = Array.isArray(scan.rows)
      ? [...scan.rows].sort((a, b) => safeNum(b?.finalAiScore, 0) - safeNum(a?.finalAiScore, 0)).slice(0, 100)
      : [];

    for (const row of transitionCandidates) {
      const ticker = String(row?.ticker || "").toUpperCase();
      if (!ticker) continue;
      const currentStage = classifyRowStage(row);
      const currentScore = round(row?.finalAiScore || 0, 0);
      nextRowStates[ticker] = {
        stage: currentStage,
        score: currentScore,
        at: new Date().toISOString()
      };
      const previousStage = String(previousStates?.[ticker]?.stage || "").toUpperCase();
      if (!previousStage || previousStage === currentStage) continue;
      const transitionKey = `${previousStage}->${currentStage}`;
      if (!meaningfulTransitions.has(transitionKey)) continue;

      const dedupeKey = `${ticker}:transition:${transitionKey}:${scan.session}:${currentScore}`;
      const transitionHash = hashText(dedupeKey);
      if (state.sentHashes[transitionHash]) {
        alerts.skippedDuplicate += 1;
        continue;
      }

      const message = formatTransitionAlert(scan, row, previousStage, currentStage);
      const sent = await sendTelegram(telegramBotToken, telegramChatId, message);
      if (sent.ok) {
        alerts.sent += 1;
        state.sentHashes[transitionHash] = new Date().toISOString();
        state.alerts.push({
          at: new Date().toISOString(),
          type: "transition",
          ticker,
          fromStage: previousStage,
          toStage: currentStage,
          hash: transitionHash,
          score: currentScore
        });
      } else {
        alerts.failed += 1;
      }
    }

    state.rowStates = nextRowStates;

    if (Object.keys(state.sentHashes).length > 3000) {
      const entries = Object.entries(state.sentHashes).slice(-1000);
      state.sentHashes = Object.fromEntries(entries);
    }
    state.alerts = state.alerts.slice(-1000);
    saveState(state);
    return alerts;
  }

  async function runScan(payload = {}, trigger = "manual") {
    if (isRunning) {
      return {
        ok: true,
        busy: true,
        message: "Scan already running",
        generatedAt: new Date().toISOString(),
        lastScanTime: lastRunAt || "",
        nextScanTime: nextRunAt || nextScheduledRunIso(),
        session: getSessionState().label,
        marketStatus: getSessionState().marketStatus
      };
    }

    isRunning = true;
    lastError = "";
    const started = new Date();
    lastRunAt = started.toISOString();
    nextRunAt = nextScheduledRunIso(started);

    try {
      if (payload && Array.isArray(payload.watchlist) && payload.watchlist.length) {
        settings.watchlist = uniqSymbols(payload.watchlist);
      }

      const session = getSessionState(started);
      const watchlist = getCombinedWatchlist(payload?.watchlist || []);
      const universeSymbols = await buildUniverseSymbols(payload?.watchlist || []);
      const symbols = uniqSymbols([
        ...universeSymbols,
        ...watchlist
      ]).slice(0, getUniverseLimit(settings));

      let quoteRows = [];
      if (typeof opts.quoteFetcher === "function") {
        try {
          quoteRows = await opts.quoteFetcher(symbols);
        } catch {
          quoteRows = [];
        }
      }

      const bySymbol = new Map();
      const normalizedInput = Array.isArray(quoteRows) ? quoteRows : [];
      normalizedInput.forEach((q, i) => {
        const normalized = normalizeQuoteRow(q, i);
        if (normalized.ticker) bySymbol.set(normalized.ticker, normalized);
      });

      const rows = symbols.map((sym, i) => {
        const base = bySymbol.get(sym) || normalizeQuoteRow({ ticker: sym, price: 100 + (i % 50) * 4, changePct: ((i % 11) - 5) * 0.45, rvol: 1 + ((i % 7) * 0.22), volume: 120000 + i * 1000 }, i);
        const scored = scoreRow(base, session.code === "REGULAR" ? "Bullish" : "Neutral");
        const actionObj = chooseAction(scored, settings);
        return {
          ...scored,
          action: actionObj.action,
          institutionalAction: actionObj.action,
          setupType: actionObj.setupType,
          reason: makeReason(scored, actionObj)
        };
      });

      const liquidRows = rows.filter((row) => shouldKeepLiquidRow(row, settings));
      const filteredRows = filterBySide(liquidRows);
      const rankings = buildRankings(filteredRows);
      const bulls = filteredRows.filter((r) => r.bullScore >= r.bearScore).length;
      const bears = filteredRows.filter((r) => r.bearScore > r.bullScore).length;
      const trade = filteredRows.filter((r) => r.action === "Long" || r.action === "Short").length;
      const wait = filteredRows.filter((r) => r.action === "WatchOnly").length;
      const avoid = filteredRows.filter((r) => r.action === "Avoid").length;
      const marketBias = bulls > bears ? "Bullish" : bears > bulls ? "Bearish" : "Mixed";

      const scan = {
        ok: true,
        generatedAt: new Date().toISOString(),
        lastScanTime: new Date().toISOString(),
        nextScanTime: nextRunAt,
        session: session.label,
        sessionCode: session.code,
        marketStatus: session.marketStatus,
        marketBias,
        universeMode: settings.universeMode,
        universeLabel: pickUniverseModeLabel(settings.universeMode),
        universeSize: symbols.length,
        liquidUniverseSize: liquidRows.length,
        rows: filteredRows,
        rankings,
        bigNews: buildBigNews(filteredRows),
        unusualOptionsFlow: {
          provider: "DISABLED",
          enabled: false,
          rows: [],
          message: "Options flow disabled"
        },
        performance: {
          winRate: 0,
          avgWin: 0,
          avgLoss: 0,
          profitFactor: 0,
          bestSetupType: trade > 0 ? "Trade Setup" : "N/A"
        },
        riskManager: {
          riskPerTrade: settings.riskPerTrade,
          dailyMaxLossR: settings.dailyMaxLossR
        },
        summary: { trade, wait, avoid, bulls, bears }
      };

      scan.report = buildReport(scan);
      if (trigger === "telegram_query" || trigger === "query_only") {
        scan.alerts = {
          sent: 0,
          skippedDuplicate: 0,
          failed: 0,
          reason: "query_only"
        };
      } else {
        scan.alerts = await maybeSendAlerts(scan, trigger === "auto" ? "auto" : "manual");
      }

      lastScan = scan;
      lastReport = scan.report;
      return scan;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      return {
        ok: false,
        error: lastError,
        generatedAt: new Date().toISOString(),
        lastScanTime: `Error: ${lastError}`,
        nextScanTime: nextRunAt || nextScheduledRunIso(),
        session: getSessionState().label,
        marketStatus: getSessionState().marketStatus,
        rows: [],
        rankings: {},
        report: null,
        alerts: { sent: 0, failed: 0 }
      };
    } finally {
      isRunning = false;
    }
  }

  async function sendTestTechnicalAlert(side = "LONG") {
    if (!telegramBotToken || !telegramChatId) {
      return { ok: false, error: "telegram_not_configured" };
    }
    let scan = lastScan;
    if (!scan || !Array.isArray(scan.rows) || !scan.rows.length) {
      scan = await runScan({}, "query_only");
    }
    if (!scan?.ok || !Array.isArray(scan.rows)) {
      return { ok: false, error: scan?.error || "scan_unavailable" };
    }
    const normalizedSide = String(side || "LONG").toUpperCase() === "SHORT" ? "SHORT" : "LONG";
    const candidate = scan.rows.find((row) => normalizedSide === "LONG" ? isTechnicalLongHit(row, settings) : isTechnicalShortHit(row, settings));
    if (!candidate) return { ok: false, error: "no_strict_candidate_available" };
    const message = formatTradeAlert(scan, candidate, normalizedSide);
    const sent = await sendTelegram(telegramBotToken, telegramChatId, message);
    return {
      ok: Boolean(sent?.ok),
      side: normalizedSide,
      ticker: candidate.ticker,
      message,
      telegram: sent
    };
  }

  function getLastScan() {
    return lastScan;
  }

  function getReport() {
    return lastReport;
  }

  function initCron() {
    if (!opts?.cron || typeof opts.cron.schedule !== "function") {
      log("[ADOL] node-cron unavailable; auto scan disabled");
      return;
    }
    try {
      const jobRunner = async () => {
        const session = getSessionState();
        if (!settings.autoScanEnabled || !session.active) return;
        const result = await runScan({}, "auto");
        if (!result?.ok && result?.error) {
          log(`[ADOL] auto scan error: ${result.error}`);
        }
      };
      cronTask = [
        opts.cron.schedule(DEFAULT_CRON, jobRunner, { timezone: DEFAULT_TZ })
      ];
      log(`[ADOL] cron started ${DEFAULT_CRON} ${DEFAULT_TZ}`);
    } catch (error) {
      cronTask = [];
      log(`[ADOL] cron init failed: ${error?.message || String(error)}`);
    }
  }

  initCron();

  return {
    runScan,
    getStatus,
    getLastScan,
    getReport,
    updateSettings,
    setTelegramConfig,
    sendTestTechnicalAlert
  };
}

module.exports = { createAdolEngine };
