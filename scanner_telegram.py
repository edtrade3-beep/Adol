"""
Premium A+ Trading Scanner + Telegram Alerts (alerts only)

Run on a separate port (default: 3012):
  python scanner_telegram.py

Endpoints:
  GET  /health
  GET  /run-scanner
  POST /run-scanner
  GET  /test-telegram
  POST /test-telegram
  POST /set-telegram-config
"""

from __future__ import annotations

import json
import os
import re
import threading
import time as time_module
from datetime import datetime, timedelta, time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any
from urllib.parse import urlencode

import pandas as pd
import requests

try:
    from alpaca.data.historical import StockHistoricalDataClient
    from alpaca.data.requests import StockBarsRequest
    from alpaca.data.timeframe import TimeFrame, TimeFrameUnit

    ALPACA_SDK_AVAILABLE = True
except Exception:
    StockHistoricalDataClient = None  # type: ignore[assignment]
    StockBarsRequest = None  # type: ignore[assignment]
    TimeFrame = None  # type: ignore[assignment]
    TimeFrameUnit = None  # type: ignore[assignment]
    ALPACA_SDK_AVAILABLE = False

try:
    from zoneinfo import ZoneInfo
except Exception:
    ZoneInfo = None  # type: ignore[assignment]


# =========================================================
# SETTINGS
# =========================================================

ALPACA_API_KEY = os.getenv("ALPACA_API_KEY", "PUT_YOUR_ALPACA_KEY_HERE")
ALPACA_SECRET_KEY = os.getenv("ALPACA_SECRET_KEY", "PUT_YOUR_ALPACA_SECRET_HERE")

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "PUT_YOUR_TELEGRAM_BOT_TOKEN_HERE")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "PUT_YOUR_CHAT_ID_HERE")

SCANNER_PORT = int(os.getenv("SCANNER_PORT", "3012"))
SCANNER_CANDLES_BASE = os.getenv("SCANNER_CANDLES_BASE", "http://127.0.0.1:3001").rstrip("/")
SCANNER_REQUIRE_MARKET_OPEN = os.getenv("SCANNER_REQUIRE_MARKET_OPEN", "1").lower() in ("1", "true", "yes", "on")
SCANNER_CONFIG_FILE = os.path.join(os.path.dirname(__file__), "scanner_runtime_config.json")

WATCHLIST = [
    "SPY",
    "QQQ",
    "TSLA",
    "AMD",
    "NVDA",
    "AAPL",
    "MSFT",
    "META",
    "AMZN",
]

MIN_SCORE = int(os.getenv("SCANNER_MIN_SCORE", "70"))
ALERT_COOLDOWN_MINUTES = int(os.getenv("ALERT_COOLDOWN_MINUTES", "30"))
MIN_BARS_REQUIRED = int(os.getenv("MIN_BARS_REQUIRED", "250"))
ALERT_FILE = os.path.join(os.path.dirname(__file__), "sent_alerts.json")
AUTO_SCAN_ENABLED = os.getenv("AUTO_SCAN_ENABLED", "1").lower() in ("1", "true", "yes", "on")
AUTO_SCAN_MINUTES = int(os.getenv("AUTO_SCAN_MINUTES", "1"))


def normalize_watchlist_input(raw_items: list[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for item in raw_items:
        ticker = str(item or "").strip().upper()
        # Allow common US ticker chars: A-Z, numbers, dot, dash
        ticker = re.sub(r"[^A-Z0-9.\-]", "", ticker)
        if not ticker:
            continue
        if ticker in seen:
            continue
        seen.add(ticker)
        out.append(ticker)
    return out


def load_runtime_config() -> None:
    global TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
    if not os.path.exists(SCANNER_CONFIG_FILE):
        return
    try:
        with open(SCANNER_CONFIG_FILE, "r", encoding="utf-8") as f:
            cfg = json.load(f)
        if isinstance(cfg, dict):
            token = str(cfg.get("telegram_bot_token", "") or "").strip()
            chat_id = str(cfg.get("telegram_chat_id", "") or "").strip()
            if token:
                TELEGRAM_BOT_TOKEN = token
            if chat_id:
                TELEGRAM_CHAT_ID = chat_id
    except Exception:
        return


def save_runtime_config() -> None:
    try:
        payload = {
            "telegram_bot_token": TELEGRAM_BOT_TOKEN,
            "telegram_chat_id": TELEGRAM_CHAT_ID,
        }
        with open(SCANNER_CONFIG_FILE, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)
    except Exception:
        return


load_runtime_config()


def is_configured(value: str, marker: str) -> bool:
    return bool(value and value != marker and "PUT_YOUR_" not in value)


ALPACA_READY = is_configured(ALPACA_API_KEY, "PUT_YOUR_ALPACA_KEY_HERE") and is_configured(
    ALPACA_SECRET_KEY, "PUT_YOUR_ALPACA_SECRET_HERE"
)
TELEGRAM_READY = is_configured(TELEGRAM_BOT_TOKEN, "PUT_YOUR_TELEGRAM_BOT_TOKEN_HERE") and is_configured(
    TELEGRAM_CHAT_ID, "PUT_YOUR_CHAT_ID_HERE"
)

client = (
    StockHistoricalDataClient(ALPACA_API_KEY, ALPACA_SECRET_KEY)
    if ALPACA_READY and ALPACA_SDK_AVAILABLE and StockHistoricalDataClient is not None
    else None
)


# =========================================================
# MARKET HOURS
# =========================================================

def market_is_open() -> bool:
    if ZoneInfo is None:
        return True

    now = datetime.now(ZoneInfo("America/New_York"))
    if now.weekday() >= 5:
        return False
    return time(9, 30) <= now.time() <= time(16, 0)


# =========================================================
# TELEGRAM
# =========================================================

def refresh_telegram_ready() -> None:
    global TELEGRAM_READY
    TELEGRAM_READY = is_configured(TELEGRAM_BOT_TOKEN, "PUT_YOUR_TELEGRAM_BOT_TOKEN_HERE") and is_configured(
        TELEGRAM_CHAT_ID, "PUT_YOUR_CHAT_ID_HERE"
    )


def send_telegram(message: str) -> dict[str, Any]:
    if not TELEGRAM_READY:
        return {"ok": False, "reason": "Telegram not configured"}

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": message,
        "disable_web_page_preview": True,
    }

    try:
        response = requests.post(url, json=payload, timeout=15)
        return {
            "ok": response.ok,
            "status_code": response.status_code,
            "body": response.text,
        }
    except Exception as exc:
        return {"ok": False, "reason": str(exc)}




# =========================================================
# ALERT COOLDOWN
# =========================================================

def load_alerts() -> dict[str, str]:
    if not os.path.exists(ALERT_FILE):
        return {}
    try:
        with open(ALERT_FILE, "r", encoding="utf-8") as file:
            data = json.load(file)
            return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def save_alerts(alerts: dict[str, str]) -> None:
    with open(ALERT_FILE, "w", encoding="utf-8") as file:
        json.dump(alerts, file, indent=2, ensure_ascii=False)


def can_send_alert(symbol: str, direction: str) -> tuple[bool, float]:
    alerts = load_alerts()
    key = f"{symbol}_{direction}"
    now = datetime.utcnow()

    if key not in alerts:
        return True, 999999.0

    try:
        last_time = datetime.fromisoformat(alerts[key])
    except Exception:
        last_time = now - timedelta(minutes=ALERT_COOLDOWN_MINUTES + 1)

    minutes_since = (now - last_time).total_seconds() / 60

    if minutes_since >= ALERT_COOLDOWN_MINUTES:
        return True, minutes_since

    return False, minutes_since


def mark_alert_sent(symbol: str, direction: str) -> None:
    alerts = load_alerts()
    key = f"{symbol}_{direction}"
    alerts[key] = datetime.utcnow().isoformat()
    save_alerts(alerts)


# =========================================================
# DATA
# =========================================================

def normalize_bars_df(df: pd.DataFrame, symbol: str) -> pd.DataFrame | None:
    if df is None or df.empty:
        return None

    out = df.copy()
    out = out.reset_index(drop=False)

    if "symbol" in out.columns:
        out = out[out["symbol"] == symbol].copy()

    rename_map = {
        "t": "timestamp",
        "o": "open",
        "h": "high",
        "l": "low",
        "c": "close",
        "v": "volume",
    }
    out = out.rename(columns=rename_map)

    required = ("open", "high", "low", "close", "volume")
    for col in required:
        if col not in out.columns:
            return None

    if "timestamp" not in out.columns:
        out["timestamp"] = range(len(out))

    out = out.sort_values("timestamp").copy()
    for col in required:
        out[col] = pd.to_numeric(out[col], errors="coerce")
    out = out.dropna(subset=["open", "high", "low", "close", "volume"])
    return out if not out.empty else None


def get_bars_alpaca_sdk(symbol: str, days: int = 10) -> pd.DataFrame | None:
    if client is None or StockBarsRequest is None or TimeFrame is None:
        return None

    end_time = datetime.utcnow()
    start_time = end_time - timedelta(days=days)
    request = StockBarsRequest(
        symbol_or_symbols=symbol,
        timeframe=TimeFrame(15, TimeFrameUnit.Minute),
        start=start_time,
        end=end_time,
    )
    try:
        bars = client.get_stock_bars(request).df
        return normalize_bars_df(bars, symbol)
    except Exception:
        return None


def get_bars_alpaca_rest(symbol: str, timeframe: str, days_back: int, limit: int) -> pd.DataFrame | None:
    end_time = datetime.utcnow()
    start_time = end_time - timedelta(days=days_back)
    query = urlencode(
        {
            "timeframe": timeframe,
            "start": start_time.isoformat() + "Z",
            "end": end_time.isoformat() + "Z",
            "adjustment": "raw",
            "feed": "iex",
            "limit": limit,
        }
    )
    url = f"https://data.alpaca.markets/v2/stocks/{symbol}/bars?{query}"
    headers = {
        "APCA-API-KEY-ID": ALPACA_API_KEY,
        "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY,
    }
    try:
        response = requests.get(url, headers=headers, timeout=25)
        if not response.ok:
            return None
        payload = response.json() or {}
        bars = payload.get("bars") or []
        if not bars:
            return None
        df = pd.DataFrame(bars)
        return normalize_bars_df(df, symbol)
    except Exception:
        return None


def get_bars_local_backend(symbol: str, timeframe: str = "1D") -> pd.DataFrame | None:
    try:
        url = f"{SCANNER_CANDLES_BASE}/api/yahoo/candles"
        response = requests.get(url, params={"symbol": symbol, "timeframe": timeframe}, timeout=20)
        if not response.ok:
            return None
        payload = response.json() or {}
        bars = payload.get("bars") or []
        if not bars:
            return None
        rows = []
        for bar in bars:
            o = bar.get("open")
            h = bar.get("high")
            l = bar.get("low")
            c = bar.get("close")
            v = bar.get("volume")
            t = bar.get("time")
            if None in (o, h, l, c, v):
                continue
            rows.append(
                {
                    "timestamp": t,
                    "open": float(o),
                    "high": float(h),
                    "low": float(l),
                    "close": float(c),
                    "volume": float(v),
                }
            )
        if not rows:
            return None
        return pd.DataFrame(rows)
    except Exception:
        return None


def get_bars_yahoo(symbol: str, interval: str = "5m", rng: str = "7d") -> pd.DataFrame | None:
    try:
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
        params = {"range": rng, "interval": interval, "includePrePost": "false"}
        response = requests.get(url, params=params, timeout=25)
        if not response.ok:
            return None
        payload = response.json() or {}
        result = (((payload.get("chart") or {}).get("result") or []) or [None])[0]
        if not result:
            return None
        timestamps = result.get("timestamp") or []
        quote = (((result.get("indicators") or {}).get("quote") or []) or [None])[0] or {}
        opens = quote.get("open") or []
        highs = quote.get("high") or []
        lows = quote.get("low") or []
        closes = quote.get("close") or []
        volumes = quote.get("volume") or []
        rows = []
        for i, ts in enumerate(timestamps):
            o = opens[i] if i < len(opens) else None
            h = highs[i] if i < len(highs) else None
            l = lows[i] if i < len(lows) else None
            c = closes[i] if i < len(closes) else None
            v = volumes[i] if i < len(volumes) else None
            if None in (o, h, l, c, v):
                continue
            rows.append(
                {
                    "timestamp": datetime.utcfromtimestamp(int(ts)).isoformat() + "Z",
                    "open": float(o),
                    "high": float(h),
                    "low": float(l),
                    "close": float(c),
                    "volume": float(v),
                }
            )
        if not rows:
            return None
        return pd.DataFrame(rows)
    except Exception:
        return None


def get_bars_stooq(symbol: str) -> pd.DataFrame | None:
    try:
        ticker = f"{str(symbol).strip().lower()}.us"
        response = requests.get("https://stooq.com/q/d/l/", params={"s": ticker, "i": "d"}, timeout=20)
        if not response.ok:
            return None
        text = response.text.strip()
        if not text or "No data" in text:
            return None
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        if len(lines) < 3:
            return None
        rows = []
        for line in lines[1:]:
            parts = line.split(",")
            if len(parts) < 6:
                continue
            date_val, open_v, high_v, low_v, close_v, vol_v = parts[:6]
            if any(v in ("", "null", "None", "N/D", "-") for v in (open_v, high_v, low_v, close_v, vol_v)):
                continue
            rows.append(
                {
                    "timestamp": f"{date_val}T00:00:00Z",
                    "open": float(open_v),
                    "high": float(high_v),
                    "low": float(low_v),
                    "close": float(close_v),
                    "volume": float(vol_v),
                }
            )
        if not rows:
            return None
        return pd.DataFrame(rows)
    except Exception:
        return None


def get_best_bars(symbol: str) -> tuple[pd.DataFrame | None, str]:
    df = get_bars_alpaca_sdk(symbol, days=10)
    if df is not None and len(df) >= MIN_BARS_REQUIRED:
        return df, "ALPACA-SDK-15Min"

    df = get_bars_alpaca_rest(symbol, timeframe="15Min", days_back=15, limit=10000)
    if df is not None and len(df) >= MIN_BARS_REQUIRED:
        return df, "ALPACA-REST-15Min"

    df = get_bars_alpaca_rest(symbol, timeframe="1Hour", days_back=45, limit=10000)
    if df is not None and len(df) >= MIN_BARS_REQUIRED:
        return df, "ALPACA-REST-1Hour"

    df = get_bars_alpaca_rest(symbol, timeframe="1Day", days_back=400, limit=1000)
    if df is not None and len(df) >= 30:
        return df, "ALPACA-REST-1Day"

    df = get_bars_local_backend(symbol, timeframe="1D")
    if df is not None and len(df) >= 30:
        return df, "LOCAL-1D"

    df = get_bars_yahoo(symbol, interval="5m", rng="7d")
    if df is not None and len(df) >= 30:
        return df, "YF-5m"

    df = get_bars_yahoo(symbol, interval="1d", rng="1y")
    if df is not None and len(df) >= 30:
        return df, "YF-1d"

    df = get_bars_stooq(symbol)
    if df is not None and len(df) >= 30:
        return df, "STOOQ-1d"

    return None, "NONE"


# =========================================================
# INDICATORS
# =========================================================

def add_indicators(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()

    out["ema9"] = out["close"].ewm(span=9, adjust=False).mean()
    out["ema21"] = out["close"].ewm(span=21, adjust=False).mean()
    out["ema200"] = out["close"].ewm(span=200, adjust=False).mean()

    delta = out["close"].diff()
    gain = delta.clip(lower=0).rolling(14).mean()
    loss = -delta.clip(upper=0).rolling(14).mean()
    rs = gain / loss.replace(0, pd.NA)
    out["rsi"] = 100 - (100 / (1 + rs))

    out["avg_volume"] = out["volume"].rolling(50).mean()
    out["rvol"] = out["volume"] / out["avg_volume"].replace(0, pd.NA)

    out["vwap"] = (out["close"] * out["volume"]).cumsum() / out["volume"].cumsum()

    high_low = out["high"] - out["low"]
    high_close = (out["high"] - out["close"].shift()).abs()
    low_close = (out["low"] - out["close"].shift()).abs()
    true_range = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)
    out["atr"] = true_range.rolling(14).mean()

    return out


# =========================================================
# MARKET BIAS
# =========================================================

def get_market_bias() -> str:
    spy_df, _ = get_best_bars("SPY")
    qqq_df, _ = get_best_bars("QQQ")

    if spy_df is None or qqq_df is None:
        return "NEUTRAL"

    spy = add_indicators(spy_df)
    qqq = add_indicators(qqq_df)

    spy_last = spy.iloc[-1]
    qqq_last = qqq.iloc[-1]

    bullish = (
        spy_last["close"] > spy_last["vwap"]
        and qqq_last["close"] > qqq_last["vwap"]
        and spy_last["ema9"] > spy_last["ema21"]
        and qqq_last["ema9"] > qqq_last["ema21"]
    )
    bearish = (
        spy_last["close"] < spy_last["vwap"]
        and qqq_last["close"] < qqq_last["vwap"]
        and spy_last["ema9"] < spy_last["ema21"]
        and qqq_last["ema9"] < qqq_last["ema21"]
    )

    if bullish:
        return "BULLISH"
    if bearish:
        return "BEARISH"
    return "NEUTRAL"


# =========================================================
# SCORING
# =========================================================

def score_bullish(row: pd.Series, market_bias: str) -> tuple[int, list[str]]:
    score = 0
    reasons: list[str] = []

    if row["close"] > row["vwap"]:
        score += 20
        reasons.append("Price above VWAP ✅")

    if row["ema9"] > row["ema21"] > row["ema200"]:
        score += 25
        reasons.append("EMA 9 > EMA 21 > EMA 200 ✅")

    if 50 <= row["rsi"] <= 70:
        score += 15
        reasons.append("RSI bullish zone ✅")

    if row["rvol"] >= 1.5:
        score += 15
        reasons.append("RVOL above 1.5 ✅")

    if row["close"] > row["ema9"]:
        score += 10
        reasons.append("Momentum strong ✅")

    if market_bias == "BULLISH":
        score += 15
        reasons.append("SPY/QQQ bullish ✅")

    return score, reasons


def score_bearish(row: pd.Series, market_bias: str) -> tuple[int, list[str]]:
    score = 0
    reasons: list[str] = []

    if row["close"] < row["vwap"]:
        score += 20
        reasons.append("Price below VWAP ✅")

    if row["ema9"] < row["ema21"] < row["ema200"]:
        score += 25
        reasons.append("EMA 9 < EMA 21 < EMA 200 ✅")

    if 30 <= row["rsi"] <= 50:
        score += 15
        reasons.append("RSI bearish zone ✅")

    if row["rvol"] >= 1.5:
        score += 15
        reasons.append("RVOL above 1.5 ✅")

    if row["close"] < row["ema9"]:
        score += 10
        reasons.append("Downside momentum ✅")

    if market_bias == "BEARISH":
        score += 15
        reasons.append("SPY/QQQ bearish ✅")

    return score, reasons


# =========================================================
# MESSAGE
# =========================================================

def build_message(symbol: str, direction: str, score: int, row: pd.Series, reasons: list[str], market_bias: str) -> str:
    entry = float(row["close"])
    atr = float(row["atr"]) if not pd.isna(row["atr"]) else entry * 0.015
    if atr <= 0:
        atr = entry * 0.015

    if direction == "LONG":
        stop = entry - atr * 1.5
        t1 = entry + atr * 1.5
        t2 = entry + atr * 2.5
        t3 = entry + atr * 4
        emoji = "🟢"
    else:
        stop = entry + atr * 1.5
        t1 = entry - atr * 1.5
        t2 = entry - atr * 2.5
        t3 = entry - atr * 4
        emoji = "🔴"

    safe_symbol = str(symbol)
    safe_direction = str(direction)
    safe_market_bias = str(market_bias)
    reason_text = "\n".join([f"- {str(reason)}" for reason in reasons])

    return f"""
{emoji} A+ {safe_direction} SETUP ALERT

Symbol: {safe_symbol}
Score: {score}/100
Market Bias: {safe_market_bias}

Entry: ${entry:.2f}
Stop: ${stop:.2f}
T1: ${t1:.2f}
T2: ${t2:.2f}
T3: ${t3:.2f}

Indicators:
VWAP: ${float(row["vwap"]):.2f}
EMA9: ${float(row["ema9"]):.2f}
EMA21: ${float(row["ema21"]):.2f}
EMA200: ${float(row["ema200"]):.2f}
RSI: {float(row["rsi"]):.1f}
RVOL: {float(row["rvol"]):.2f}
ATR: ${atr:.2f}

Confirmations:
{reason_text}

⚠️ Alert only. No auto trading. Not financial advice.
""".strip()


# =========================================================
# SCANNER
# =========================================================

def run_scanner(watchlist: list[str] | None = None, min_score: int | None = None) -> dict[str, Any]:
    if not ALPACA_READY:
        return {
            "ok": False,
            "error": "Alpaca keys are not configured. Set ALPACA_API_KEY and ALPACA_SECRET_KEY.",
        }

    if SCANNER_REQUIRE_MARKET_OPEN and not market_is_open():
        return {
            "ok": True,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "market_open": False,
            "message": "Market is closed. Set SCANNER_REQUIRE_MARKET_OPEN=0 to run anytime.",
            "results": [],
            "alerts_sent": 0,
            "telegram_configured": TELEGRAM_READY,
            "alpaca_configured": ALPACA_READY,
        }

    symbols = normalize_watchlist_input([str(s) for s in (watchlist or WATCHLIST)])
    threshold = int(min_score if min_score is not None else MIN_SCORE)

    market_bias = get_market_bias()
    results: list[dict[str, Any]] = []
    alerts_sent = 0

    for symbol in symbols:
        df, source_tf = get_best_bars(symbol)

        if df is None or len(df) < 30:
            results.append(
                {
                    "symbol": symbol,
                    "status": "skipped",
                    "reason": "insufficient_data",
                    "bars": 0 if df is None else int(len(df)),
                }
            )
            continue

        df = add_indicators(df)
        latest = df.iloc[-1]

        required_cols = ["close", "vwap", "ema9", "ema21", "ema200", "rsi", "rvol", "atr"]
        if latest[required_cols].isna().any():
            results.append(
                {
                    "symbol": symbol,
                    "status": "skipped",
                    "reason": "indicators_not_ready",
                    "bars": int(len(df)),
                    "timeframe": source_tf,
                }
            )
            continue

        bull_score, bull_reasons = score_bullish(latest, market_bias)
        bear_score, bear_reasons = score_bearish(latest, market_bias)

        direction = "NONE"
        score = max(bull_score, bear_score)
        reasons: list[str] = []
        if bull_score >= threshold and bull_score >= bear_score:
            direction = "LONG"
            reasons = bull_reasons
        elif bear_score >= threshold and bear_score > bull_score:
            direction = "SHORT"
            reasons = bear_reasons

        if direction == "NONE":
            continue

        item: dict[str, Any] = {
            "symbol": symbol,
            "status": "scanned",
            "market_bias": market_bias,
            "bull_score": int(bull_score),
            "bear_score": int(bear_score),
            "score": int(score),
            "close": float(latest["close"]),
            "bars": int(len(df)),
            "timeframe": source_tf,
            "direction": direction,
        }

        if direction in ("LONG", "SHORT"):
            can_send, minutes_since = can_send_alert(symbol, direction)
            item["cooldown_minutes_since_last"] = round(minutes_since, 2)
            item["cooldown_allowed"] = bool(can_send)

            atr = float(latest["atr"]) if not pd.isna(latest["atr"]) else float(latest["close"]) * 0.015
            if atr <= 0:
                atr = float(latest["close"]) * 0.015

            entry = float(latest["close"])
            if direction == "LONG":
                stop = entry - atr * 1.5
                t1 = entry + atr * 1.5
                t2 = entry + atr * 2.5
                t3 = entry + atr * 4
            else:
                stop = entry + atr * 1.5
                t1 = entry - atr * 1.5
                t2 = entry - atr * 2.5
                t3 = entry - atr * 4

            item["setup"] = {
                "entry": round(entry, 4),
                "stop": round(stop, 4),
                "target1": round(t1, 4),
                "target2": round(t2, 4),
                "target3": round(t3, 4),
                "reasons": reasons,
            }

            if can_send:
                msg = build_message(symbol, direction, score, latest, reasons, market_bias)
                tg = send_telegram(msg)
                item["telegram"] = tg
                alert_ok = bool(tg.get("ok"))
                item["status"] = "alert" if alert_ok else "alert_failed"
                if tg.get("ok"):
                    mark_alert_sent(symbol, direction)
                    alerts_sent += 1
            else:
                item["status"] = "cooldown"
                item["telegram"] = {"ok": False, "reason": "cooldown_active"}

        results.append(item)

    return {
        "ok": True,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "market_open": market_is_open(),
        "market_bias": market_bias,
        "min_score": threshold,
        "watchlist_count": len(symbols),
        "telegram_configured": TELEGRAM_READY,
        "alpaca_configured": ALPACA_READY,
        "alpaca_sdk_available": ALPACA_SDK_AVAILABLE,
        "alerts_sent": alerts_sent,
        "results": results,
    }


def auto_scan_loop() -> None:
    while True:
        try:
            payload = run_scanner()
            alerts = int(payload.get("alerts_sent", 0) or 0)
            count = len(payload.get("results", []) or [])
            ts = payload.get("timestamp", datetime.utcnow().isoformat() + "Z")
            print(f"[AUTO-SCAN] {ts} | scanned={count} | alerts_sent={alerts}")
        except Exception as exc:
            print(f"[AUTO-SCAN] error: {exc}")
        time_module.sleep(max(1, AUTO_SCAN_MINUTES) * 60)


# =========================================================
# HTTP API
# =========================================================

def json_response(handler: BaseHTTPRequestHandler, payload: dict[str, Any], code: int = 200) -> None:
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    handler.send_response(code)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type")
    handler.end_headers()
    handler.wfile.write(body)


class ScannerHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self) -> None:  # noqa: N802
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self) -> None:  # noqa: N802
        if self.path == "/health":
            json_response(
                self,
                {
                    "ok": True,
                    "service": "scanner_telegram",
                    "alpaca_configured": ALPACA_READY,
                    "alpaca_sdk_available": ALPACA_SDK_AVAILABLE,
                    "telegram_configured": TELEGRAM_READY,
                    "market_open": market_is_open(),
                    "port": SCANNER_PORT,
                },
            )
            return

        if self.path == "/run-scanner":
            payload = run_scanner()
            json_response(self, payload, 200 if payload.get("ok") else 500)
            return

        if self.path == "/test-telegram":
            now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
            msg = (
                "✅ <b>Scanner Telegram Test</b>\n\n"
                f"Time: {now}\n"
                "Source: Premium A+ Scanner service\n"
                "Status: Telegram route is working."
            )
            result = send_telegram(msg)
            json_response(
                self,
                {
                    "ok": bool(result.get("ok")),
                    "telegram_configured": TELEGRAM_READY,
                    "result": result,
                },
                200 if result.get("ok") else 500,
            )
            return

        json_response(self, {"ok": False, "error": "Not found"}, 404)

    def do_POST(self) -> None:  # noqa: N802
        if self.path == "/set-telegram-config":
            length = int(self.headers.get("Content-Length", "0"))
            raw = self.rfile.read(length) if length > 0 else b"{}"
            try:
                data = json.loads(raw.decode("utf-8"))
            except Exception:
                data = {}

            token = str(data.get("telegram_bot_token", "") or "").strip()
            chat_id = str(data.get("telegram_chat_id", "") or "").strip()

            if token:
                global TELEGRAM_BOT_TOKEN
                TELEGRAM_BOT_TOKEN = token
            if chat_id:
                global TELEGRAM_CHAT_ID
                TELEGRAM_CHAT_ID = chat_id

            refresh_telegram_ready()
            save_runtime_config()

            token_mask = ""
            if TELEGRAM_BOT_TOKEN:
                token_mask = f"{TELEGRAM_BOT_TOKEN[:7]}...{TELEGRAM_BOT_TOKEN[-4:]}" if len(TELEGRAM_BOT_TOKEN) >= 12 else "***"
            chat_mask = ""
            if TELEGRAM_CHAT_ID:
                chat_mask = f"...{TELEGRAM_CHAT_ID[-4:]}" if len(TELEGRAM_CHAT_ID) > 4 else "***"

            json_response(
                self,
                {
                    "ok": True,
                    "telegram_configured": TELEGRAM_READY,
                    "token_mask": token_mask,
                    "chat_id_mask": chat_mask,
                    "note": "Configuration applied in running scanner service.",
                },
                200,
            )
            return

        if self.path == "/test-telegram":
            now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
            msg = (
                "✅ <b>Scanner Telegram Test</b>\n\n"
                f"Time: {now}\n"
                "Source: Premium A+ Scanner service\n"
                "Status: Telegram route is working."
            )
            result = send_telegram(msg)
            json_response(
                self,
                {
                    "ok": bool(result.get("ok")),
                    "telegram_configured": TELEGRAM_READY,
                    "result": result,
                },
                200 if result.get("ok") else 500,
            )
            return

        if self.path != "/run-scanner":
            json_response(self, {"ok": False, "error": "Not found", "path": self.path}, 404)
            return

        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length) if length > 0 else b"{}"

        try:
            data = json.loads(raw.decode("utf-8"))
        except Exception:
            data = {}

        watchlist: list[str] | None = None
        payload_watchlist = data.get("watchlist")
        if isinstance(payload_watchlist, list):
            watchlist = normalize_watchlist_input([str(x) for x in payload_watchlist])
        elif isinstance(payload_watchlist, str):
            # Accept commas, spaces, newlines, and semicolons in one input box.
            chunks = re.split(r"[\s,;]+", payload_watchlist)
            watchlist = normalize_watchlist_input(chunks)

        min_score: int | None = None
        payload_min_score = data.get("min_score")
        if payload_min_score is not None:
            try:
                min_score = int(payload_min_score)
            except Exception:
                json_response(self, {"ok": False, "error": "min_score must be a number"}, 400)
                return

        payload = run_scanner(watchlist=watchlist, min_score=min_score)
        json_response(self, payload, 200 if payload.get("ok") else 500)

    def log_message(self, fmt: str, *args: Any) -> None:
        return


def main() -> None:
    if AUTO_SCAN_ENABLED:
        thread = threading.Thread(target=auto_scan_loop, daemon=True)
        thread.start()
        print(f"Auto-scan enabled: every {max(1, AUTO_SCAN_MINUTES)} minute(s)")
    else:
        print("Auto-scan disabled")

    server = ThreadingHTTPServer(("0.0.0.0", SCANNER_PORT), ScannerHandler)
    print(f"Scanner API running on http://127.0.0.1:{SCANNER_PORT}")
    print("Endpoints: GET /health, GET|POST /run-scanner, GET|POST /test-telegram, POST /set-telegram-config")
    server.serve_forever()


if __name__ == "__main__":
    main()
