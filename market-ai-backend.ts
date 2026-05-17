import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Pool as PgPool } from "pg";
import type { QueryResultRow } from "pg";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";
import http from "http";
import { newDb } from "pg-mem";

/**
 * Market AI Platform Backend - TypeScript / Express starter
 *
 * Covers:
 * - login / JWT auth
 * - saved settings
 * - PostgreSQL database connection
 * - market data endpoints
 * - macro/news feed endpoints
 * - AI report endpoint with structured parsing shape
 * - watchlist persistence
 * - saved reports
 * - WebSocket live updates starter
 *
 * Install:
 * npm i express cors jsonwebtoken bcryptjs pg dotenv ws
 * npm i -D typescript ts-node @types/express @types/cors @types/jsonwebtoken @types/bcryptjs @types/ws @types/node
 *
 * Run:
 * npx ts-node market-ai-backend.ts
 */

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const PORT = Number(process.env.PORT || 8080);
const JWT_SECRET = process.env.JWT_SECRET || "change_me_now";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const OPENAI_URL = process.env.OPENAI_URL || "https://api.openai.com/v1/responses";

const databaseUrl = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/market_ai";

type QueryPool = {
  query: <T extends QueryResultRow = QueryResultRow>(text: string, params?: any[]) => Promise<{ rows: T[]; rowCount: number }>;
  end?: () => Promise<void>;
};

let pool: QueryPool | null = null;
let storageMode: "postgres" | "memory" = "postgres";

type JwtUser = {
  userId: number;
  email: string;
};

type AuthedRequest = express.Request & {
  user?: JwtUser;
};

function signToken(user: JwtUser) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
}

function authMiddleware(req: AuthedRequest, res: express.Response, next: express.NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" });
  }

  const token = auth.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtUser;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

async function query<T extends QueryResultRow = QueryResultRow>(text: string, params: any[] = []) {
  if (!pool) {
    throw new Error("Database pool not initialized.");
  }
  const result = await pool.query<T>(text, params);
  return result;
}

async function initPool() {
  const pgPool = new PgPool({
    connectionString: databaseUrl,
  });

  try {
    await pgPool.query("SELECT 1");
    pool = pgPool as unknown as QueryPool;
    storageMode = "postgres";
  } catch (error) {
    await pgPool.end().catch(() => undefined);
    const memoryDb = newDb({ autoCreateForeignKeyIndices: true });
    const memPg = memoryDb.adapters.createPg();
    pool = new memPg.Pool() as QueryPool;
    storageMode = "memory";
    console.warn("PostgreSQL unavailable. Using in-memory DB fallback.");
    console.warn(String(error));
  }
}

async function initDb() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS settings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      auto_refresh BOOLEAN DEFAULT true,
      dark_mode BOOLEAN DEFAULT true,
      market_data_base_url TEXT DEFAULT '',
      news_base_url TEXT DEFAULT '',
      ai_base_url TEXT DEFAULT '',
      websocket_url TEXT DEFAULT '',
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS watchlists (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      symbol TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, symbol)
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS saved_reports (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      symbol TEXT NOT NULL,
      prompt TEXT NOT NULL,
      bias TEXT,
      macro_read TEXT,
      sector_rotation TEXT,
      key_levels TEXT,
      best_setup TEXT,
      invalidation TEXT,
      confidence NUMERIC,
      raw_response JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS market_snapshots (
      id SERIAL PRIMARY KEY,
      symbol TEXT NOT NULL,
      price NUMERIC,
      change_pct NUMERIC,
      volume NUMERIC,
      payload JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS news_items (
      id SERIAL PRIMARY KEY,
      category TEXT,
      title TEXT NOT NULL,
      source TEXT,
      impact TEXT,
      payload JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  const email = process.env.SEED_EMAIL || "stiiladil@gmail.com";
  const password = process.env.SEED_PASSWORD || "Dixie123";
  const existing = await query<{ id: number }>(`SELECT id FROM users WHERE email = $1`, [email]);

  if (existing.rowCount === 0) {
    const hash = await bcrypt.hash(password, 10);
    const inserted = await query<{ id: number }>(
      `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id`,
      [email, hash]
    );
    const userId = inserted.rows[0].id;
    await query(`INSERT INTO settings (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`, [userId]);
    for (const symbol of ["SPY", "QQQ", "NVDA", "TSLA", "AAPL", "AMD", "META", "XOM"]) {
      await query(`INSERT INTO watchlists (user_id, symbol) VALUES ($1, $2) ON CONFLICT (user_id, symbol) DO NOTHING`, [userId, symbol]);
    }
  }
}

app.get("/api/health", async (_req, res) => {
  try {
    await query("SELECT 1");
    return res.json({ ok: true, service: "market-ai-backend", db: true, storage: storageMode, time: new Date().toISOString() });
  } catch (error) {
    return res.status(500).json({ ok: false, db: false, storage: storageMode, error: String(error) });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const result = await query<{ id: number; email: string; password_hash: string }>(
    `SELECT id, email, password_hash FROM users WHERE email = $1`,
    [email]
  );

  if (result.rowCount === 0) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const user = result.rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = signToken({ userId: user.id, email: user.email });
  return res.json({ token, user: { id: user.id, email: user.email } });
});

app.get("/api/me", authMiddleware, async (req: AuthedRequest, res) => {
  return res.json({ user: req.user });
});

app.get("/api/settings", authMiddleware, async (req: AuthedRequest, res) => {
  const result = await query(
    `SELECT auto_refresh, dark_mode, market_data_base_url, news_base_url, ai_base_url, websocket_url
     FROM settings WHERE user_id = $1`,
    [req.user!.userId]
  );

  if (result.rowCount === 0) {
    return res.json({
      auto_refresh: true,
      dark_mode: true,
      market_data_base_url: "",
      news_base_url: "",
      ai_base_url: "",
      websocket_url: "",
    });
  }

  return res.json(result.rows[0]);
});

app.put("/api/settings", authMiddleware, async (req: AuthedRequest, res) => {
  const {
    auto_refresh = true,
    dark_mode = true,
    market_data_base_url = "",
    news_base_url = "",
    ai_base_url = "",
    websocket_url = "",
  } = req.body || {};

  await query(
    `INSERT INTO settings (user_id, auto_refresh, dark_mode, market_data_base_url, news_base_url, ai_base_url, websocket_url, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
     ON CONFLICT (user_id)
     DO UPDATE SET
       auto_refresh = EXCLUDED.auto_refresh,
       dark_mode = EXCLUDED.dark_mode,
       market_data_base_url = EXCLUDED.market_data_base_url,
       news_base_url = EXCLUDED.news_base_url,
       ai_base_url = EXCLUDED.ai_base_url,
       websocket_url = EXCLUDED.websocket_url,
       updated_at = NOW()`,
    [req.user!.userId, auto_refresh, dark_mode, market_data_base_url, news_base_url, ai_base_url, websocket_url]
  );

  return res.json({ ok: true });
});

app.get("/api/watchlist", authMiddleware, async (req: AuthedRequest, res) => {
  const result = await query<{ symbol: string }>(
    `SELECT symbol FROM watchlists WHERE user_id = $1 ORDER BY symbol ASC`,
    [req.user!.userId]
  );
  return res.json({ symbols: result.rows.map((row: { symbol: string }) => row.symbol) });
});

app.post("/api/watchlist", authMiddleware, async (req: AuthedRequest, res) => {
  const symbol = String(req.body?.symbol || "").trim().toUpperCase();
  if (!symbol) return res.status(400).json({ error: "symbol required" });

  await query(
    `INSERT INTO watchlists (user_id, symbol) VALUES ($1, $2)
     ON CONFLICT (user_id, symbol) DO NOTHING`,
    [req.user!.userId, symbol]
  );

  return res.json({ ok: true, symbol });
});

app.delete("/api/watchlist/:symbol", authMiddleware, async (req: AuthedRequest, res) => {
  const symbol = String(req.params.symbol || "").trim().toUpperCase();
  await query(`DELETE FROM watchlists WHERE user_id = $1 AND symbol = $2`, [req.user!.userId, symbol]);
  return res.json({ ok: true, symbol });
});

function normalizeTicker(raw: string) {
  return String(raw || "").trim().toUpperCase();
}

function finiteOrZero(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function scoreFromChange(changePct: number) {
  const raw = 50 + changePct * 10;
  return Math.max(1, Math.min(99, Math.round(raw)));
}

function toneFromChange(changePct: number) {
  if (changePct >= 1) return "Risk-On";
  if (changePct <= -1) return "Risk-Off";
  return "Mixed";
}

function trendFromQuote(price: number, fiftyDayAverage: number, twoHundredDayAverage: number, changePct: number) {
  if (price > fiftyDayAverage && fiftyDayAverage >= twoHundredDayAverage) return "Bullish";
  if (price < fiftyDayAverage && fiftyDayAverage < twoHundredDayAverage) return "Bearish";
  return changePct >= 0 ? "Bullish" : "Bearish";
}

function gradeFromScore(score: number) {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "F";
}

async function fetchYahooQuoteViaChart(symbol: string) {
  const sym = normalizeTicker(symbol);
  const response = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=5d&interval=1d`,
    { headers: { "User-Agent": "market-ai-platform/1.0" } }
  );
  if (!response.ok) {
    throw new Error(`Yahoo chart-quote HTTP ${response.status}`);
  }
  const json: any = await response.json();
  const node = json?.chart?.result?.[0];
  const meta = node?.meta || {};
  const quoteNode = node?.indicators?.quote?.[0] || {};
  const closes: unknown[] = Array.isArray(quoteNode?.close) ? quoteNode.close : [];
  const volumes: unknown[] = Array.isArray(quoteNode?.volume) ? quoteNode.volume : [];
  const validCloses = closes.map((c) => finiteOrZero(c)).filter((v) => v > 0);
  const price = validCloses.length ? validCloses[validCloses.length - 1] : finiteOrZero(meta.regularMarketPrice);
  const prev = validCloses.length > 1
    ? validCloses[validCloses.length - 2]
    : finiteOrZero(meta.regularMarketPreviousClose) || finiteOrZero(meta.chartPreviousClose);
  const changePct = prev > 0 ? ((price - prev) / prev) * 100 : 0;
  const validVolumes = volumes.map((v) => finiteOrZero(v)).filter((v) => v >= 0);
  const volume = validVolumes.length ? validVolumes[validVolumes.length - 1] : 0;

  return {
    symbol: sym,
    regularMarketPrice: price,
    regularMarketPreviousClose: prev,
    regularMarketChangePercent: changePct,
    regularMarketVolume: volume,
    fiftyDayAverage: finiteOrZero(meta.fiftyDayAverage),
    twoHundredDayAverage: finiteOrZero(meta.twoHundredDayAverage),
  };
}

async function fetchYahooQuotes(symbols: string[]) {
  const clean = symbols.map(normalizeTicker).filter(Boolean);
  if (!clean.length) return new Map<string, any>();

  const mapped = new Map<string, any>();
  try {
    const querySymbols = clean.map((s) => encodeURIComponent(s)).join(",");
    const response = await fetch(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${querySymbols}`, {
      headers: { "User-Agent": "market-ai-platform/1.0" },
    });
    if (response.ok) {
      const json: any = await response.json();
      const list = Array.isArray(json?.quoteResponse?.result) ? json.quoteResponse.result : [];
      for (const row of list) {
        const key = normalizeTicker(row?.symbol || "");
        if (key) mapped.set(key, row);
      }
    }
  } catch {}

  if (mapped.size < clean.length) {
    const missing = clean.filter((s) => !mapped.has(s));
    const fallbackRows = await Promise.all(
      missing.map(async (sym) => {
        try {
          return await fetchYahooQuoteViaChart(sym);
        } catch {
          return null;
        }
      })
    );
    for (const row of fallbackRows) {
      const key = normalizeTicker(row?.symbol || "");
      if (key && row) mapped.set(key, row);
    }
  }

  return mapped;
}

async function fetchYahooChart(symbol: string, range = "1d", interval = "5m") {
  const sym = normalizeTicker(symbol) || "SPY";
  const response = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=${encodeURIComponent(range)}&interval=${encodeURIComponent(interval)}`,
    { headers: { "User-Agent": "market-ai-platform/1.0" } }
  );
  if (!response.ok) {
    throw new Error(`Yahoo chart HTTP ${response.status}`);
  }
  const json: any = await response.json();
  const node = json?.chart?.result?.[0];
  const timestamps: number[] = Array.isArray(node?.timestamp) ? node.timestamp : [];
  const quoteNode = node?.indicators?.quote?.[0] || {};
  const closes: unknown[] = Array.isArray(quoteNode?.close) ? quoteNode.close : [];
  const volumes: unknown[] = Array.isArray(quoteNode?.volume) ? quoteNode.volume : [];
  const bars: Array<{ time: string; price: number; volume: number; symbol: string }> = [];

  for (let i = 0; i < timestamps.length; i += 1) {
    const ts = Number(timestamps[i]);
    const close = finiteOrZero(closes[i]);
    if (!Number.isFinite(ts) || close <= 0) continue;
    const dt = new Date(ts * 1000);
    const hh = String(dt.getHours()).padStart(2, "0");
    const mm = String(dt.getMinutes()).padStart(2, "0");
    bars.push({
      time: `${hh}:${mm}`,
      price: close,
      volume: finiteOrZero(volumes[i]),
      symbol: sym,
    });
  }

  return bars;
}

function xmlTagValue(xml: string, tag: string) {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i"));
  const raw = (match?.[1] || "").replace("<![CDATA[", "").replace("]]>", "").trim();
  return raw
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'");
}

async function fetchYahooRssNews(symbols: string[], limit = 12) {
  const clean = symbols.map(normalizeTicker).filter(Boolean);
  const picks = clean.length ? clean : ["SPY", "QQQ", "AAPL"];
  const response = await fetch(
    `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(picks.join(","))}&region=US&lang=en-US`,
    { headers: { "User-Agent": "market-ai-platform/1.0" } }
  );
  if (!response.ok) {
    throw new Error(`Yahoo RSS HTTP ${response.status}`);
  }
  const xml = await response.text();
  const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];
  const items = itemMatches
    .slice(0, limit)
    .map((raw) => ({
      title: xmlTagValue(raw, "title"),
      link: xmlTagValue(raw, "link"),
      publishedAt: xmlTagValue(raw, "pubDate"),
    }))
    .filter((x) => x.title);
  return items;
}

app.get("/api/market/quote/:symbol", authMiddleware, async (req, res) => {
  const symbol = String(req.params.symbol || "SPY").toUpperCase();
  try {
    const map = await fetchYahooQuotes([symbol]);
    const row = map.get(symbol);
    if (!row) throw new Error(`No quote row for ${symbol}`);

    const price = finiteOrZero(row.regularMarketPrice);
    const previousClose = finiteOrZero(row.regularMarketPreviousClose);
    const fallbackChange = previousClose > 0 ? ((price - previousClose) / previousClose) * 100 : 0;
    const changePct = Number.isFinite(Number(row.regularMarketChangePercent))
      ? Number(row.regularMarketChangePercent)
      : fallbackChange;
    const volume = finiteOrZero(row.regularMarketVolume);
    const fifty = finiteOrZero(row.fiftyDayAverage) || price;
    const twoHundred = finiteOrZero(row.twoHundredDayAverage) || fifty;
    const score = scoreFromChange(changePct);

    const liveQuote = {
      symbol,
      price,
      changePct,
      volume,
      vwap: fifty,
      trend: trendFromQuote(price, fifty, twoHundred, changePct),
      score,
      grade: gradeFromScore(score),
      source: "yahoo",
      updatedAt: new Date().toISOString(),
    };

    await query(
      `INSERT INTO market_snapshots (symbol, price, change_pct, volume, payload)
       VALUES ($1, $2, $3, $4, $5)`,
      [symbol, liveQuote.price, liveQuote.changePct, liveQuote.volume, JSON.stringify(liveQuote)]
    );

    return res.json(liveQuote);
  } catch (error) {
    const fallback = {
      symbol,
      price: 103.82,
      changePct: 1.28,
      volume: 12400000,
      vwap: 103.11,
      trend: "Bullish",
      score: 78,
      grade: "A",
      source: "fallback",
      updatedAt: new Date().toISOString(),
      error: String(error),
    };
    return res.json(fallback);
  }
});

app.get("/api/market/chart/:symbol", authMiddleware, async (req, res) => {
  const symbol = String(req.params.symbol || "SPY").toUpperCase();
  try {
    const bars = await fetchYahooChart(symbol, "1d", "5m");
    if (bars.length) {
      return res.json({ symbol, series: bars.slice(-80), source: "yahoo" });
    }
  } catch {}
  const fallback = Array.from({ length: 40 }).map((_, i) => ({
    time: i,
    price: 100 + Math.sin(i / 4) * 2 + i * 0.2 + (i % 6 === 0 ? 0.6 : -0.12),
    volume: 80 + ((i * 13) % 60),
    symbol,
  }));
  return res.json({ symbol, series: fallback, source: "fallback" });
});

app.get("/api/market/heatmap", authMiddleware, async (_req, res) => {
  const sectorMap = [
    { sector: "Technology", symbol: "XLK", leader: "MSFT" },
    { sector: "Consumer", symbol: "XLY", leader: "AMZN" },
    { sector: "Financials", symbol: "XLF", leader: "JPM" },
    { sector: "Healthcare", symbol: "XLV", leader: "LLY" },
    { sector: "Energy", symbol: "XLE", leader: "XOM" },
    { sector: "Industrials", symbol: "XLI", leader: "GE" },
    { sector: "Utilities", symbol: "XLU", leader: "NEE" },
    { sector: "Materials", symbol: "XLB", leader: "LIN" },
  ];

  try {
    const map = await fetchYahooQuotes(sectorMap.map((s) => s.symbol));
    const items = sectorMap.map((item) => {
      const row = map.get(item.symbol);
      const changePct = finiteOrZero(row?.regularMarketChangePercent);
      return {
        sector: item.sector,
        value: scoreFromChange(changePct),
        leader: item.leader,
        tone: toneFromChange(changePct),
      };
    });
    return res.json({ items, source: "yahoo" });
  } catch {
    return res.json({
      items: [
        { sector: "Technology", value: 78, leader: "MSFT", tone: "Risk-On" },
        { sector: "Consumer", value: 58, leader: "AMZN", tone: "Mixed" },
        { sector: "Financials", value: 49, leader: "JPM", tone: "Neutral" },
        { sector: "Healthcare", value: 43, leader: "LLY", tone: "Defensive" },
        { sector: "Energy", value: 66, leader: "XOM", tone: "Strong" },
        { sector: "Industrials", value: 54, leader: "GE", tone: "Steady" },
        { sector: "Utilities", value: 31, leader: "NEE", tone: "Weak" },
        { sector: "Materials", value: 37, leader: "LIN", tone: "Weak" },
      ],
      source: "fallback",
    });
  }
});

app.get("/api/macro", authMiddleware, async (_req, res) => {
  const tracks = [
    { name: "SPY", symbol: "SPY" },
    { name: "QQQ", symbol: "QQQ" },
    { name: "VIX", symbol: "^VIX" },
    { name: "DXY", symbol: "DX-Y.NYB" },
    { name: "Oil", symbol: "CL=F" },
    { name: "10Y Yield", symbol: "^TNX" },
  ];

  try {
    const map = await fetchYahooQuotes(tracks.map((t) => t.symbol));
    const items = tracks.map((t) => {
      const row = map.get(normalizeTicker(t.symbol));
      const chg = finiteOrZero(row?.regularMarketChangePercent);
      let value = "Mixed";
      if (t.name === "VIX") {
        value = chg <= 0 ? "Volatility cooling" : "Volatility rising";
      } else if (t.name === "DXY") {
        value = chg <= 0 ? "Dollar easing" : "Dollar firm";
      } else if (t.name.includes("Yield")) {
        value = chg <= 0 ? "Yields easing" : "Yields firm";
      } else {
        value = chg >= 0 ? "Bullish momentum" : "Bearish pressure";
      }
      return {
        name: t.name,
        value,
        delta: `${chg >= 0 ? "+" : ""}${chg.toFixed(2)}%`,
      };
    });
    return res.json({ items, source: "yahoo" });
  } catch {
    return res.json({
      items: [
        { name: "SPY", value: "Bullish above VWAP", delta: "+0.84%" },
        { name: "QQQ", value: "Tech leadership intact", delta: "+1.15%" },
        { name: "VIX", value: "Compressed, watch expansion", delta: "-2.91%" },
        { name: "DXY", value: "Firm dollar", delta: "+0.22%" },
        { name: "Oil", value: "Holding bid", delta: "+0.66%" },
        { name: "10Y Yield", value: "Elevated", delta: "+0.04" },
      ],
      source: "fallback",
    });
  }
});

app.get("/api/news", authMiddleware, async (req, res) => {
  const queryTickers = String(req.query.tickers || "SPY,QQQ,AAPL,MSFT");
  const symbols = queryTickers
    .split(",")
    .map((s) => normalizeTicker(s))
    .filter(Boolean)
    .slice(0, 8);

  try {
    const live = await fetchYahooRssNews(symbols, 12);
    if (live.length) {
      const items = live.map((x) => ({
        title: x.title,
        source: "Yahoo Finance",
        tag: symbols[0] || "Market",
        impact: "Live",
        url: x.link,
        publishedAt: x.publishedAt,
      }));
      return res.json({ items, source: "yahoo" });
    }
  } catch {}

  return res.json({
    items: [
      {
        title: "Mega-cap tech leads while volatility stays contained",
        source: "Market Wire",
        tag: "Equities",
        impact: "Bullish",
      },
      {
        title: "Treasury yields remain firm ahead of economic data",
        source: "Macro Desk",
        tag: "Rates",
        impact: "Mixed",
      },
      {
        title: "Crude oil stays bid as supply concerns return",
        source: "Energy Brief",
        tag: "Commodities",
        impact: "Inflationary",
      },
      {
        title: "Breadth improves, but leadership remains narrow",
        source: "Breadth Lab",
        tag: "Internals",
        impact: "Cautious",
      },
    ],
    source: "fallback",
  });
});

function normalizeAiResponse(text: string) {
  // Better parsing shape for frontend consumption.
  return {
    bias: extractSection(text, "BIAS") || "Mixed / cautious",
    macro_read: extractSection(text, "MACRO READ") || "No macro read returned",
    sector_rotation: extractSection(text, "SECTOR ROTATION") || "No sector rotation returned",
    key_levels: extractSection(text, "KEY LEVELS") || "No key levels returned",
    best_setup: extractSection(text, "BEST SETUP") || "No setup returned",
    invalidation: extractSection(text, "INVALIDATION") || "No invalidation returned",
    confidence: 0.72,
    raw_text: text,
  };
}

function extractSection(text: string, heading: string) {
  const regex = new RegExp(`${heading}\\s*([\\s\\S]*?)(?:\\n[A-Z][A-Z\\s]+\\n|$)`, "i");
  const match = text.match(regex);
  return match?.[1]?.trim() || "";
}

app.post("/api/ai/report", authMiddleware, async (req: AuthedRequest, res) => {
  const { prompt = "", symbol = "SPY" } = req.body || {};
  if (!prompt) return res.status(400).json({ error: "prompt required" });

  let rawText = "";

  if (OPENAI_API_KEY) {
    const instructions = [
      "You are a sharp institutional-style market assistant.",
      "Return sections exactly with these headings:",
      "BIAS",
      "MACRO READ",
      "SECTOR ROTATION",
      "KEY LEVELS",
      "BEST SETUP",
      "INVALIDATION",
      "Keep it actionable and concise.",
    ].join("\n");

    const payload = {
      model: OPENAI_MODEL,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: instructions }],
        },
        {
          role: "user",
          content: [{ type: "input_text", text: `Symbol: ${symbol}\n\n${prompt}` }],
        },
      ],
    };

    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: `OpenAI request failed: ${err}` });
    }

    const json: any = await response.json();
    rawText =
      json.output_text ||
      json.output?.map((x: any) => x?.content?.map((c: any) => c?.text).join("\n")).join("\n") ||
      "";
  } else {
    rawText = [
      "BIAS",
      "Bullish with selective caution",
      "",
      "MACRO READ",
      "Growth leadership is supporting the tape while yields and the dollar remain a check on upside expansion.",
      "",
      "SECTOR ROTATION",
      "Technology and Energy are leading while Utilities and Materials lag.",
      "",
      "KEY LEVELS",
      `${symbol} should hold VWAP and prior breakout zones. Failed reclaim of morning high weakens momentum.`,
      "",
      "BEST SETUP",
      "Buy strong pullbacks above VWAP in leading names with tight invalidation.",
      "",
      "INVALIDATION",
      "Loss of VWAP, weaker breadth, and rising volatility weaken the long thesis.",
    ].join("\n");
  }

  const normalized = normalizeAiResponse(rawText);

  await query(
    `INSERT INTO saved_reports (
      user_id, symbol, prompt, bias, macro_read, sector_rotation, key_levels, best_setup, invalidation, confidence, raw_response
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
    [
      req.user!.userId,
      symbol,
      prompt,
      normalized.bias,
      normalized.macro_read,
      normalized.sector_rotation,
      normalized.key_levels,
      normalized.best_setup,
      normalized.invalidation,
      normalized.confidence,
      JSON.stringify(normalized),
    ]
  );

  return res.json(normalized);
});

app.get("/api/reports", authMiddleware, async (req: AuthedRequest, res) => {
  const result = await query(
    `SELECT id, symbol, prompt, bias, confidence, created_at
     FROM saved_reports
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 50`,
    [req.user!.userId]
  );
  return res.json({ items: result.rows });
});

wss.on("connection", (ws) => {
  ws.send(JSON.stringify({ type: "connected", message: "live feed connected" }));

  const interval = setInterval(() => {
    ws.send(
      JSON.stringify({
        type: "tick",
        symbol: "SPY",
        price: 100 + Math.random() * 4,
        time: new Date().toISOString(),
      })
    );
  }, 3000);

  ws.on("close", () => clearInterval(interval));
});

async function start() {
  try {
    await initPool();
    await initDb();
    server.listen(PORT, () => {
      console.log(`Market AI backend running on http://localhost:${PORT}`);
      console.log(`Health: http://localhost:${PORT}/api/health`);
      console.log(`Storage mode: ${storageMode}`);
    });
  } catch (error) {
    console.error("Failed to start backend", error);
    process.exit(1);
  }
}

start();
