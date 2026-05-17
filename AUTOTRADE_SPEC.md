# AM Trading Platform - AI Sniper Auto-Trade Spec (v2)

## 1) Objective
Build an institutional-grade stocks + crypto decision and execution system that ranks opportunities, filters noise, and only acts on high-probability setups with strict risk controls.

This platform is a disciplined process engine, not a guaranteed profit system.

---

## 2) Operating Modes
- `OBSERVE`: scan + score + alerts only.
- `ASSIST`: generate order plans; user confirms.
- `AUTO_EXECUTE`: submit/manage orders when all hard gates pass.
- `AWAY_MODE`: tighter unattended profile (higher quality thresholds, lower size).
- `KILL_SWITCH`: block new entries and optionally flatten risk.

---

## 3) Data Layer Spec

### 3.1 Stocks Inputs
- OHLCV (1m/5m/15m/1h/1D)
- EMA 9/21/200
- VWAP
- RSI, ATR
- intraday and daily change
- relative volume
- relative strength vs SPY and sector ETF

### 3.2 Crypto Inputs
- OHLCV for BTC, ETH, SOL, LINK, SUI, XRP, DOGE, ADA, AVAX, TON
- EMA 9/21/200, VWAP, RSI, ATR
- BTC dominance (proxy or provider field)
- relative strength vs BTC/ETH baseline

### 3.3 Macro Inputs
- SPY, QQQ, IWM
- VIX
- DXY
- 2Y and 10Y Treasury proxies
- Brent/WTI oil, gold
- BTC and ETH risk tone

### 3.4 Events Inputs
- Economic calendar: Fed/CPI/NFP/PCE/PMI
- Earnings calendar and timing (BMO/AMC)
- upgrades/downgrades + major catalyst headlines

---

## 4) Scoring Layer (0-100)

### 4.1 Weights
- Trend: 30
- Relative Strength: 20
- Volume/Participation: 15
- Momentum: 15
- Liquidity/Structure: 10
- Macro Alignment: 10

### 4.2 Buckets
- `80-100`: A+ candidate
- `70-79`: Near trigger / watch
- `50-69`: Neutral
- `<50`: Avoid

### 4.3 Hard Minimums
- Actionable alert requires score `>= 75`
- Auto-execution candidate requires score `>= 80` (or `>= 85` in Away Mode)

---

## 5) Decision Layer

### 5.1 Long Rules
Need most conditions plus all hard gates:
- score above threshold
- bullish structure (EMA 9 > 21 > 200 preferred)
- positive RS
- above VWAP or valid reclaim
- clear trigger above resistance
- stop distance acceptable for risk model

### 5.2 Short Rules
- score above threshold
- bearish structure
- negative RS
- below VWAP / failed reclaim
- trigger below support
- acceptable stop distance

### 5.3 Hard Gates (all required)
- data freshness <= 90s
- spread/slippage below configured max
- no blocked event window
- macro regime compatible with direction
- daily risk lock not active

---

## 6) Alerts Layer

### 6.1 Alert Types
- breakout continuation
- VWAP pullback/reclaim
- EMA reclaim/failure
- RS shift
- volume spike confirmation
- macro conflict warning
- options flow spike / dark-pool sweep (if provider available)

### 6.2 Alert Payload Contract
Every alert payload includes:
- `symbol`
- `assetType` (`stock` or `crypto`)
- `direction` (`LONG`/`SHORT`)
- `entry`
- `stop`
- `target1`
- `target2`
- `score`
- `setupReason`
- `timeframe`
- `timestamp`

If required fields missing -> mark `NOT_ACTIONABLE`.

---

## 7) Risk & Execution Layer

### 7.1 Default Risk Model
- risk per trade: `0.5%` (Away Mode) / `1.0%` (active supervised)
- daily max drawdown lock: `1.5%`
- max open positions: `3` (Away Mode) / `5` (supervised)
- max same sector exposure: `2` names
- correlation cap: `0.65`
- min RVOL for entries: `1.3x`

### 7.2 Position Sizing
- `riskDollars = equity * riskPct`
- `shares = floor(riskDollars / abs(entry - stop))`
- enforce notional cap and liquidity cap

### 7.3 Management Logic
- +1R: take partial + move stop to breakeven
- +2R: second partial + trail remaining
- degrade rule: cut risk if RS weakens or RVOL fades

### 7.4 Kill Switch Triggers
- 3 consecutive losses
- stale data > 90s
- broker/provider degraded
- abnormal slippage > configured ceiling

---

## 8) Review Layer (Learning Loop)
- auto-journal every closed trade
- tag setup type, regime, event proximity, outcome
- track win rate, expectancy, max adverse excursion
- rank best setup types by:
  - asset class
  - timeframe
  - regime
  - day/session
- auto-adjust thresholds with guardrails (never outside risk limits)

---

## 9) Dashboard Tab Blueprint
- `Market Overview`: macro cards + risk-on/off + regime score
- `Winners`: ranked high-score opportunities
- `Avoid / Weak`: laggards + reason-to-avoid
- `Rotation`: capital in/out by sector/coin groups
- `Alerts Feed`: timestamped actionable alerts
- `Journal`: closed trade log + lessons
- `Earnings`: upcoming events + risk windows
- `Flow`: options flow, sweeps, dark-pool concentration
- `AI Agent`: executive brief + do-now/avoid-now plan

---

## 10) AI Agent Output Standard (Executive)
Each run must return:
1. `Market Status` (bullish/neutral/bearish + confidence)
2. `Macro vs Stocks vs Crypto` relationship summary
3. `Top 5 Long` and `Top 5 Avoid/Short` with reasons
4. `Event Risk` in next 24h/72h
5. `Execution Plan` (entry style + risk posture)
6. `Invalidation` conditions that flip the view
7. `One-line command` (`EXECUTE` / `WAIT` / `REDUCE`)

---

## 11) TradingView + External Signal Bridge
- webhook endpoint: `/api/webhooks/tradingview`
- token-protected using `TV_WEBHOOK_SECRET`
- ingest payload into `Alerts`, `AI Agent`, and report engine
- normalize symbol namespace across stocks/crypto
- persist raw payload + normalized signal with timestamp

---

## 12) Implementation Roadmap

### Phase 1: Platform Reliability
- [ ] lock data contracts and validation
- [ ] stale-data guard + visible status badges
- [ ] one-click health diagnostics panel

### Phase 2: Full Sniper Scanner
- [ ] unified stock + crypto scoring pipeline
- [ ] winners/avoid tables fed by same scoring core
- [ ] rotation module + macro alignment module

### Phase 3: Institutional AI Reports
- [ ] executive multi-color report formatting
- [ ] projection blocks (1D / 1W / 1M)
- [ ] confidence + trigger + invalidation matrix

### Phase 4: Assist to Auto
- [ ] assist-mode order tickets
- [ ] broker adapter abstraction
- [ ] guarded auto execution with kill switch

### Phase 5: Performance Intelligence
- [ ] expectancy by setup
- [ ] auto-threshold tuning with limits
- [ ] monthly strategy scorecards

---

## 13) Acceptance Criteria
- zero order submissions when hard gates fail
- all fills mapped to known order intents
- risk lock blocks entries immediately once triggered
- restart-safe state recovery with no orphan orders
- reports generated in < 3s with fresh macro snapshot

---

## 14) Non-Negotiables
- risk first, always
- no alert acts alone without context gates
- event windows override setup quality
- human override available at all times
