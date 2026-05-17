
    const WATCHLIST_DEFAULT = ["SPY","QQQ","NVDA","TSLA","AAPL","AMD","META","XOM"];
    const MOCK_HEATMAP = [
      { sector: "Technology", value: 78, leader: "MSFT", tone: "Risk-On" },
      { sector: "Consumer", value: 58, leader: "AMZN", tone: "Mixed" },
      { sector: "Financials", value: 49, leader: "JPM", tone: "Neutral" },
      { sector: "Healthcare", value: 43, leader: "LLY", tone: "Defensive" },
      { sector: "Energy", value: 66, leader: "XOM", tone: "Strong" },
      { sector: "Industrials", value: 54, leader: "GE", tone: "Steady" },
      { sector: "Utilities", value: 31, leader: "NEE", tone: "Weak" },
      { sector: "Materials", value: 37, leader: "LIN", tone: "Weak" },
      { sector: "Communication", value: 64, leader: "GOOGL", tone: "Strong" },
      { sector: "Real Estate", value: 41, leader: "PLD", tone: "Cautious" },
      { sector: "Staples", value: 47, leader: "PG", tone: "Stable" },
      { sector: "Semiconductors", value: 82, leader: "NVDA", tone: "Momentum" },
      { sector: "Software", value: 76, leader: "MSFT", tone: "Risk-On" },
      { sector: "Banks", value: 52, leader: "BAC", tone: "Mixed" },
      { sector: "Biotech", value: 45, leader: "REGN", tone: "Neutral" },
      { sector: "Aerospace", value: 57, leader: "BA", tone: "Steady" }
    ];
    const HEATMAP_FALLBACK_EXTRA = [
      { sector: "Retail", value: 55, leader: "WMT", tone: "Steady" },
      { sector: "Cybersecurity", value: 71, leader: "CRWD", tone: "Strong" },
      { sector: "Cloud", value: 69, leader: "AMZN", tone: "Strong" },
      { sector: "Travel", value: 50, leader: "BKNG", tone: "Mixed" },
      { sector: "Media", value: 48, leader: "NFLX", tone: "Neutral" },
      { sector: "Payments", value: 53, leader: "V", tone: "Steady" }
    ];
    const MOCK_MACRO = [
      { name: "SPY", value: "Bullish above VWAP", delta: "+0.84%" },
      { name: "QQQ", value: "Tech leadership intact", delta: "+1.15%" },
      { name: "VIX", value: "Compressed, watch expansion", delta: "-2.91%" },
      { name: "DXY", value: "Firm dollar", delta: "+0.22%" },
      { name: "Oil", value: "Holding bid", delta: "+0.66%" },
      { name: "2Y Yield", value: "Elevated", delta: "+0.04" }
    ];
    const MOCK_NEWS = [
      { title: "Mega-cap tech leads while volatility stays contained", source: "Market Wire", tag: "Equities", impact: "Bullish" },
      { title: "Treasury yields remain firm ahead of economic data", source: "Macro Desk", tag: "Rates", impact: "Mixed" },
      { title: "Crude oil stays bid as supply concerns return", source: "Energy Brief", tag: "Commodities", impact: "Inflationary" },
      { title: "Breadth improves, but leadership remains narrow", source: "Breadth Lab", tag: "Internals", impact: "Cautious" }
    ];
    const QURAN_RECITERS = [
      { name: "Ahmad Al-Ajmy", url: "https://backup.qurango.net/radio/ahmad_alajmy" },
      { name: "Ibrahim Al-Akdar", url: "https://backup.qurango.net/radio/ibrahim_alakdar" },
      { name: "Mishary Alafasi", url: "https://backup.qurango.net/radio/mishary_alafasi" },
      { name: "Maher Al-Muaiqly", url: "https://backup.qurango.net/radio/maher" },
      { name: "Saad Al-Ghamdi", url: "https://backup.qurango.net/radio/saad_alghamdi" },
      { name: "Yasser Al-Dosari", url: "https://backup.qurango.net/radio/yasser_aldosari" },
      { name: "Saud Al-Shuraim", url: "https://backup.qurango.net/radio/saud_alshuraim" },
      { name: "Idrees Abkar", url: "https://backup.qurango.net/radio/idrees_abkr" },
      { name: "Bandar Baleela", url: "https://backup.qurango.net/radio/bandar_balilah" },
      { name: "Badr Al-Turki", url: "https://backup.qurango.net/radio/bader" },
      { name: "Mohammed Al-Minshawi", url: "https://backup.qurango.net/radio/mohammed_siddiq_alminshawi" },
      { name: "Minshawi (Mojawwad)", url: "https://backup.qurango.net/radio/mohammed_siddiq_alminshawi_mojawwad" }
    ];
    const ARABIC_MUSIC_PLAYLISTS = [
      { name: "George Wassouf", url: "https://open.spotify.com/embed/artist/7Ddov9nbJDbpgzvBVb7cU1?utm_source=generator" },
      { name: "Mohamed Abdo", url: "https://open.spotify.com/embed/artist/3byKtMzSP9AhdnWbWz7geB?utm_source=generator" }
    ];
    const INTRADAY = Array.from({ length: 40 }).map((_, i) => ({ i, time: `${String(9 + Math.floor((30 + i * 10) / 60)).padStart(2, "0")}:${String((30 + i * 10) % 60).padStart(2, "0")}`, price: 100 + Math.sin(i / 4) * 2 + i * 0.2 + (i % 6 === 0 ? 0.6 : -0.12), volume: 80 + ((i * 13) % 60) }));
    const DEFAULT_BLOOMBERG_EMBED = "https://www.youtube.com/embed/live_stream?channel=UCIALMKvObZNtJ6AmdCLP7Lg&autoplay=0";
    const DEFAULT_CNBC_EMBED = "https://www.youtube.com/embed/live_stream?channel=UCrp_UI8XtuYfpiqluWLD7Lw&autoplay=0";
    const DEFAULT_FINVIZ_EMBED = "https://finviz.com/";
    const DEFAULT_FINVIZ_MAP = "https://image.thum.io/get/width/1800/noanimate/https://finviz.com/map.ashx?t=sec";
    const AI_CHAT_WELCOME = "Market AI Copilot is ready. Ask follow-up questions and I will keep context from this chat.";
    const PRO_TRADER_SECTIONS = [
      { id: "technical", label: "1. Technical", tone: "#22d3ee", bg: "rgba(34,211,238,0.16)" },
      { id: "institutional", label: "2. Institutional", tone: "#60a5fa", bg: "rgba(96,165,250,0.16)" },
      { id: "options", label: "3. Options Flow", tone: "#a78bfa", bg: "rgba(167,139,250,0.17)" },
      { id: "levels", label: "4. S/R Levels", tone: "#f59e0b", bg: "rgba(245,158,11,0.17)" },
      { id: "liquidity", label: "5. Liquidity", tone: "#2dd4bf", bg: "rgba(45,212,191,0.16)" },
      { id: "long", label: "6. Long Setup", tone: "#22c55e", bg: "rgba(34,197,94,0.16)" },
      { id: "short", label: "7. Short Setup", tone: "#f43f5e", bg: "rgba(244,63,94,0.17)" },
      { id: "swing", label: "8. Swing", tone: "#8b5cf6", bg: "rgba(139,92,246,0.17)" },
      { id: "daytrade", label: "9. Day Trade", tone: "#6366f1", bg: "rgba(99,102,241,0.17)" },
      { id: "risk", label: "10. Risk", tone: "#f97316", bg: "rgba(249,115,22,0.17)" },
      { id: "livenews", label: "11. Live News", tone: "#0ea5e9", bg: "rgba(14,165,233,0.18)" },
      { id: "flowdecoder", label: "12. Flow Decoder", tone: "#eab308", bg: "rgba(234,179,8,0.17)" }
    ];
    const PRO_TRADER_SECTION_IDS = PRO_TRADER_SECTIONS.map((x) => x.id);

    const app = {
      user: null,
      token: "",
      watchlist: [...WATCHLIST_DEFAULT],
      selected: "SPY",
      auto: true,
      dark: true,
      timer: null,
      prayerAlertTimer: null,
      prayerRefreshTimer: null,
      prayerPopupTimer: null,
      lastPrayerMinuteKey: "",
      lastPrayerAlertKey: "",
      api: {
        marketDataBaseUrl: "http://127.0.0.1:3001/api/market",
        newsBaseUrl: "http://127.0.0.1:3001/api/news",
        aiBaseUrl: "http://127.0.0.1:3001/api/ai/report",
        websocketUrl: "ws://127.0.0.1:3001"
      },
      apiKeys: {
        marketData: "",
        finnhub: "",
        fmp: "",
        td: ""
      },
      apiLive: false,
      prompt: "Build a sharp institutional-style market report using price action, trend, momentum, liquidity, sector rotation, macro, and news. Output bias, key levels, best setup, and invalidation.",
      output: "AI agent ready. Connect backend endpoints, then request market bias, macro pressure, trade setups, or a full daily report.",
      mainNotes: "Daily plan:\n- Confirm market bias before first trade.\n- Wait for A+ setup with breadth confirmation.\n- Respect invalidation and risk limits.",
      aiConversation: [{ role: "assistant", content: AI_CHAT_WELCOME, at: new Date().toISOString() }],
      aiConversationMax: 24,
      aiMode: "market_open",
      aiStyle: "professional",
      aiRoute: "/api/ai/market-terminal",
      aiExtraContext: "",
      log: ["Auth ready", "Settings loaded", "Heatmap feed loaded", "Macro feed loaded", "AI agent standby"],
      heatItems: [...MOCK_HEATMAP],
      macroItems: [...MOCK_MACRO],
      newsItems: [...MOCK_NEWS],
      chartSeries: [...INTRADAY],
      prayer: {
        zip: "45014",
        date: "",
        location: "",
        timezone: "",
        timings: { Fajr: "--", Sunrise: "--", Dhuhr: "--", Asr: "--", Maghrib: "--", Isha: "--" }
      },
      quranUrl: QURAN_RECITERS[0].url,
      arabicMusicUrl: ARABIC_MUSIC_PLAYLISTS[0].url,
      quranLastFailedUrl: "",
      quranFallbackAttempts: 0,
      quote: { price: 103.82, changePct: 1.28, volume: 12400000, score: 78, grade: "A" },
      deepDive: {
        ticker: "SPY",
        timeframe: "1D",
        quote: null,
        fundamentals: null,
        technical: null,
        updatedAt: ""
      },
      proTrader: {
        symbol: "TSLA",
        horizon: "0DTE",
        activeSection: "technical",
        source: "fallback",
        lastFetchTs: 0,
        updatedAt: "",
        quote: {},
        fundamentals: {},
        technical: {},
        bars: [],
        news: [],
        snapshot: {
          callPremium: 0,
          putPremium: 0,
          totalPremium: 0,
          putCallRatio: 1,
          netPremium: 0,
          ivRank: 0,
          flowBias: "Neutral",
          flowScore: 50
        },
        sweeps: [],
        levels: [],
        summary: ""
      },
      liveTv: {
        bloombergEmbed: DEFAULT_BLOOMBERG_EMBED,
        cnbcEmbed: DEFAULT_CNBC_EMBED,
        finvizEmbed: DEFAULT_FINVIZ_EMBED,
        finvizMap: DEFAULT_FINVIZ_MAP,
        bloombergExternal: "https://www.bloomberg.com/live/us",
        cnbcExternal: "https://www.cnbc.com/live-tv/",
        finvizExternal: "https://finviz.com/"
      },
      tvViewer: {
        open: false,
        symbol: "SPY",
        interval: "1D"
      },
      reportMode: "full",
      reportTheme: "vivid",
      reportSource: "Live data",
      reportGeneratedAt: "",
      reportData: null,
      scanReport: {
        symbol: "SPY",
        source: "Waiting for scan",
        generatedAt: "",
        rawOutput: "",
        payload: null
      },
      scanner: {
        apiUrl: "http://127.0.0.1:3012",
        minScore: 70,
        watchlistText: "SPY,QQQ,TSLA,AMD,NVDA,AAPL,MSFT,META,AMZN",
        status: "Idle",
        output: "Press \"Check Health\" then \"Run Scanner\"."
      },
      activeTab: "overview"
    };

    const $ = (id) => document.getElementById(id);
    const el = {
      loginShell: $("loginShell"), app: $("app"), loginEmail: $("loginEmail"), loginPassword: $("loginPassword"), loginBtn: $("loginBtn"),
      auto: $("autoRefreshToggle"), dark: $("darkModeToggle"), cfgM: $("cfgMarketData"), cfgN: $("cfgNews"), cfgA: $("cfgAi"), cfgW: $("cfgWs"),
      cfgMarketDataKey: $("cfgMarketDataKey"),
      cfgFinnhubKey: $("cfgFinnhubKey"), cfgFmpKey: $("cfgFmpKey"), cfgTdKey: $("cfgTdKey"), apiStatusText: $("apiStatusText"), apiTestBtn: $("apiTestBtn"),
      save: $("saveSettingsBtn"), watchIn: $("watchInput"), watchAdd: $("watchAddBtn"), watchTags: $("watchTags"), watchList: $("watchList"),
      summary: $("summaryPills"), chartTitle: $("chartTitle"), metrics: $("metrics"),
      chart: $("priceChart"), bars: $("volumeBars"), macro: $("macroList"), news: $("newsList"), prompt: $("aiPrompt"), run: $("aiRunBtn"),
      out: $("aiOutput"), aiTicker: $("aiTicker"), aiMode: $("aiMode"), aiStyle: $("aiStyle"), aiRoute: $("aiRoute"), aiExtraContext: $("aiExtraContext"),
      aiPresetBtn: $("aiPresetBtn"), aiDemoBtn: $("aiDemoBtn"), aiClearBtn: $("aiClearBtn"), aiNewChatBtn: $("aiNewChatBtn"), aiStatus: $("aiStatus"), aiChatThread: $("aiChatThread"),
      globalSymbolSearch: $("globalSymbolSearch"), globalSymbolBtn: $("globalSymbolBtn"), globalDeepDiveBtn: $("globalDeepDiveBtn"),
      deepTicker: $("deepTicker"), deepTimeframe: $("deepTimeframe"), deepRunBtn: $("deepRunBtn"), deepStatus: $("deepStatus"),
      deepSummary: $("deepSummary"), deepFundGrid: $("deepFundGrid"), deepFundText: $("deepFundText"),
      deepTechGrid: $("deepTechGrid"), deepTechText: $("deepTechText"), deepAiOut: $("deepAiOut"), deepAiBtn: $("deepAiBtn"),
      overviewSymbol: $("overviewSymbol"), overviewSymbolTv: $("overviewSymbolTv"), overviewSetup: $("overviewSetup"),
      overviewRegime: $("overviewRegime"), overviewReport: $("overviewReport"), mainScreenNotes: $("mainScreenNotes"), mainNotesSaveBtn: $("mainNotesSaveBtn"), mainNotesStatus: $("mainNotesStatus"),
      overviewReportBtn: $("overviewReportBtn"), overviewReportMode: $("overviewReportMode"),
      overviewReportTheme: $("overviewReportTheme"), overviewReportStatus: $("overviewReportStatus"),
      scanReport: $("scanReport"), scanReportStatus: $("scanReportStatus"), scanReportBadge: $("scanReportBadge"),
      scanReportMode: $("scanReportMode"), scanReportTheme: $("scanReportTheme"), scanReportRefreshBtn: $("scanReportRefreshBtn"),
      scannerApiUrl: $("scannerApiUrl"), scannerMinScore: $("scannerMinScore"), scannerWatchlist: $("scannerWatchlist"),
      scannerHealthBtn: $("scannerHealthBtn"), scannerRunBtn: $("scannerRunBtn"), scannerStatus: $("scannerStatus"), scannerOutput: $("scannerOutput"),
      prayerZip: $("prayerZip"), prayerRefresh: $("prayerRefreshBtn"), prayerMeta: $("prayerMeta"), prayerStatus: $("prayerStatus"), prayerGrid: $("prayerGrid"),
      athanLine: $("athanLine"), athanBoxes: $("athanBoxes"),
      prayerPopup: $("prayerPopup"), prayerPopupMsg: $("prayerPopupMsg"), prayerPopupClose: $("prayerPopupClose"),
      quranReciter: $("quranReciter"), quranAudioMain: $("quranAudioMain"), quranSourceMain: $("quranSourceMain"),
      arabicMusicQuery: $("arabicMusicQuery"), arabicMusicFrame: $("arabicMusicFrame"),
      themeQuickToggle: $("themeQuickToggle"),
      tvBloombergFrame: $("tvBloombergFrame"), tvBloombergUrl: $("tvBloombergUrl"), tvBloombergReload: $("tvBloombergReload"), tvBloombergExternal: $("tvBloombergExternal"),
      tvCnbcFrame: $("tvCnbcFrame"), tvCnbcUrl: $("tvCnbcUrl"), tvCnbcReload: $("tvCnbcReload"), tvCnbcExternal: $("tvCnbcExternal"),
      finvizFrame: $("finvizFrame"), finvizUrl: $("finvizUrl"), finvizReload: $("finvizReload"), finvizExternal: $("finvizExternal"),
      finvizMapImg: $("finvizMapImg"), finvizMapReload: $("finvizMapReload"),
      proFlowSymbol: $("proFlowSymbol"), proFlowHorizon: $("proFlowHorizon"), proFlowRefresh: $("proFlowRefresh"),
      proFlowOpenTv: $("proFlowOpenTv"), proFlowStatus: $("proFlowStatus"), proFlowQuick: $("proFlowQuick"), proFlowHero: $("proFlowHero"), proFlowMetrics: $("proFlowMetrics"),
      proFlowSectionTabs: $("proFlowSectionTabs"), proFlowSectionBody: $("proFlowSectionBody"),
      tvViewer: $("tvViewer"), tvViewerBackdrop: $("tvViewerBackdrop"), tvViewerTitle: $("tvViewerTitle"),
      tvViewerFrame: $("tvViewerFrame"), tvViewerClose: $("tvViewerClose"), tvViewerOpenNew: $("tvViewerOpenNew"), tvViewerScan: $("tvViewerScan"), tvViewerScanStatus: $("tvViewerScanStatus"),
      v3WatchTags: $("v3WatchTags"), v3WatchRows: $("v3WatchRows"), v3Metrics: $("v3Metrics"),
      v3Macro: $("v3MacroList"), v3News: $("v3NewsList"), v3AiOut: $("v3AiOut")
    };

    const tabButtons = Array.from(document.querySelectorAll(".tab-btn[data-tab]"));
    const tabPanels = Array.from(document.querySelectorAll(".tab-panel[data-panel]"));

    function pushLog(line) { app.log = [line, ...app.log].slice(0, 8); renderLog(); }
    function sectorBias() { const avg = app.heatItems.reduce((s, x) => s + Number(x.value || 0), 0) / Math.max(app.heatItems.length, 1); if (avg >= 60) return { label: "Risk-On", cls: "ok" }; if (avg <= 42) return { label: "Defensive", cls: "warn" }; return { label: "Mixed", cls: "info" }; }
    function macroBias() { const s = (app.macroItems[0]?.value || "").toLowerCase().includes("bullish"); const q = (app.macroItems[1]?.value || "").toLowerCase().includes("lead"); const v = (app.macroItems[2]?.value || "").toLowerCase().includes("compress"); if (s && q && v) return { label: "Bullish", cls: "ok" }; return { label: "Cautious", cls: "warn" }; }
    function topSetup() { if (app.selected === "QQQ" || app.selected === "NVDA") return "Buy strong pullbacks above VWAP"; if (app.selected === "XOM") return "Momentum continuation with tight invalidation"; return "Wait for reclaim + breadth confirmation"; }
    function saveSettingsLocal() {
      localStorage.setItem("market-ai-platform-settings", JSON.stringify({
        watchlist: app.watchlist,
        api: app.api,
        apiKeys: app.apiKeys,
        auto: app.auto,
        dark: app.dark,
        prayerZip: app.prayer.zip,
        quranUrl: app.quranUrl,
        arabicMusicUrl: app.arabicMusicUrl,
        scanner: app.scanner,
        reportMode: app.reportMode,
        reportTheme: app.reportTheme,
        aiMode: app.aiMode,
        aiStyle: app.aiStyle,
        aiRoute: app.aiRoute,
        aiExtraContext: app.aiExtraContext,
        mainNotes: app.mainNotes,
        aiConversation: (Array.isArray(app.aiConversation) ? app.aiConversation : []).slice(-app.aiConversationMax).map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: String(m.content || "").slice(0, 4000),
          at: m.at || new Date().toISOString()
        })),
        deepDive: { ticker: app.deepDive.ticker, timeframe: app.deepDive.timeframe },
        proTrader: {
          symbol: app.proTrader.symbol,
          horizon: app.proTrader.horizon,
          activeSection: app.proTrader.activeSection
        },
        liveTv: {
          bloombergEmbed: app.liveTv.bloombergEmbed,
          cnbcEmbed: app.liveTv.cnbcEmbed,
          finvizEmbed: app.liveTv.finvizEmbed,
          finvizMap: app.liveTv.finvizMap,
          bloombergExternal: app.liveTv.bloombergExternal,
          cnbcExternal: app.liveTv.cnbcExternal,
          finvizExternal: app.liveTv.finvizExternal
        }
      }));
    }
    function loadSettingsLocal() {
      const raw = localStorage.getItem("market-ai-platform-settings");
      if (!raw) return;
      try {
        const p = JSON.parse(raw);
        if (Array.isArray(p.watchlist) && p.watchlist.length) app.watchlist = p.watchlist;
        if (p.api) app.api = { ...app.api, ...p.api };
        if (p.apiKeys) app.apiKeys = { ...app.apiKeys, ...p.apiKeys };
        if (typeof p.auto === "boolean") app.auto = p.auto;
        if (typeof p.dark === "boolean") app.dark = p.dark;
        if (typeof p.prayerZip === "string" && p.prayerZip.trim()) app.prayer.zip = p.prayerZip.trim();
        if (typeof p.quranUrl === "string" && p.quranUrl.trim()) app.quranUrl = p.quranUrl.trim();
        if (typeof p.arabicMusicUrl === "string" && p.arabicMusicUrl.trim()) app.arabicMusicUrl = p.arabicMusicUrl.trim();
        if (p.scanner && typeof p.scanner === "object") {
          if (typeof p.scanner.apiUrl === "string" && p.scanner.apiUrl.trim()) app.scanner.apiUrl = p.scanner.apiUrl.trim();
          const scannerScore = Number(p.scanner.minScore);
          if (Number.isFinite(scannerScore)) app.scanner.minScore = Math.max(0, Math.min(100, Math.round(scannerScore)));
          if (typeof p.scanner.watchlistText === "string" && p.scanner.watchlistText.trim()) app.scanner.watchlistText = p.scanner.watchlistText.trim();
          if (typeof p.scanner.status === "string") app.scanner.status = p.scanner.status;
          if (typeof p.scanner.output === "string" && p.scanner.output.trim()) app.scanner.output = p.scanner.output;
        }
        if (p.reportMode === "quick" || p.reportMode === "full") app.reportMode = p.reportMode;
        if (["vivid", "ocean", "sunrise", "neon"].includes(String(p.reportTheme || ""))) app.reportTheme = p.reportTheme;
        if (typeof p.aiMode === "string" && p.aiMode.trim()) app.aiMode = p.aiMode.trim();
        if (typeof p.aiStyle === "string" && p.aiStyle.trim()) app.aiStyle = p.aiStyle.trim();
        if (typeof p.aiRoute === "string" && p.aiRoute.trim()) app.aiRoute = p.aiRoute.trim();
        if (typeof p.aiExtraContext === "string") app.aiExtraContext = p.aiExtraContext;
        if (typeof p.mainNotes === "string") app.mainNotes = p.mainNotes;
        if (Array.isArray(p.aiConversation)) {
          const restored = p.aiConversation
            .map((m) => ({
              role: m?.role === "user" ? "user" : "assistant",
              content: String(m?.content || "").trim(),
              at: String(m?.at || "")
            }))
            .filter((m) => m.content.length > 0)
            .slice(-app.aiConversationMax);
          if (restored.length) {
            app.aiConversation = restored;
          }
        }
        if (p.deepDive && typeof p.deepDive === "object") {
          const t = String(p.deepDive.ticker || "").trim().toUpperCase();
          const tf = String(p.deepDive.timeframe || "").trim().toUpperCase();
          if (t) app.deepDive.ticker = t;
          if (["15M", "1H", "1D", "1W"].includes(tf)) app.deepDive.timeframe = tf;
        }
        if (p.proTrader && typeof p.proTrader === "object") {
          const ps = String(p.proTrader.symbol || "").trim().toUpperCase();
          const ph = String(p.proTrader.horizon || "").trim().toUpperCase();
          const pa = String(p.proTrader.activeSection || "").trim().toLowerCase();
          if (ps) app.proTrader.symbol = ps;
          if (["0DTE", "WEEKLY", "MONTHLY"].includes(ph)) app.proTrader.horizon = ph;
          if (PRO_TRADER_SECTION_IDS.includes(pa)) app.proTrader.activeSection = pa;
        }
        if (p.liveTv && typeof p.liveTv === "object") {
          if (typeof p.liveTv.bloombergEmbed === "string" && p.liveTv.bloombergEmbed.trim()) app.liveTv.bloombergEmbed = p.liveTv.bloombergEmbed.trim();
          if (typeof p.liveTv.cnbcEmbed === "string" && p.liveTv.cnbcEmbed.trim()) app.liveTv.cnbcEmbed = p.liveTv.cnbcEmbed.trim();
          if (typeof p.liveTv.finvizEmbed === "string" && p.liveTv.finvizEmbed.trim()) app.liveTv.finvizEmbed = p.liveTv.finvizEmbed.trim();
          if (typeof p.liveTv.finvizMap === "string" && p.liveTv.finvizMap.trim()) app.liveTv.finvizMap = p.liveTv.finvizMap.trim();
          if (typeof p.liveTv.bloombergExternal === "string" && p.liveTv.bloombergExternal.trim()) app.liveTv.bloombergExternal = p.liveTv.bloombergExternal.trim();
          if (typeof p.liveTv.cnbcExternal === "string" && p.liveTv.cnbcExternal.trim()) app.liveTv.cnbcExternal = p.liveTv.cnbcExternal.trim();
          if (typeof p.liveTv.finvizExternal === "string" && p.liveTv.finvizExternal.trim()) app.liveTv.finvizExternal = p.liveTv.finvizExternal.trim();
        }
      } catch {}
    }

    function directMarketOrigin() {
      if (typeof window === "undefined") return "http://127.0.0.1:3001";
      return `${window.location.protocol}//${window.location.hostname}:3001`;
    }

    function providerQuerySuffix() {
      // Keep provider keys on backend env only: FINNHUB_API_KEY / POLYGON_API_KEY / ...
      // Frontend never appends keys to query params.
      return "";
    }

    async function directFetch(path) {
      const response = await fetch(`${directMarketOrigin()}${path}`);
      if (!response.ok) throw new Error(`API ${response.status}`);
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    }

    async function directPost(path, payload = {}) {
      const response = await fetch(`${directMarketOrigin()}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload || {})
      });
      if (!response.ok) {
        const body = await response.text();
        throw new Error(`API ${response.status}${body ? ` ${body}` : ""}`);
      }
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    }

    async function directFetchSafe(path, fallback = null) {
      try {
        const data = await directFetch(path);
        return data ?? fallback;
      } catch {
        return fallback;
      }
    }

    function toFiniteNumber(value) {
      const n = Number(value);
      return Number.isFinite(n) ? n : null;
    }

    function pickFilled(...values) {
      for (const value of values) {
        if (value === null || value === undefined) continue;
        if (typeof value === "number") {
          if (Number.isFinite(value)) return value;
          continue;
        }
        if (typeof value === "string" && value.trim()) return value.trim();
        if (typeof value === "boolean") return value;
        if (typeof value === "object") return value;
      }
      return null;
    }

    function mergeDeepFundamentals(symbol, marketFund, yahooFund, quoteRow, yahooQuoteRow) {
      const market = marketFund && typeof marketFund === "object" ? marketFund : {};
      const yahoo = yahooFund && typeof yahooFund === "object" ? yahooFund : {};
      const quote = quoteRow && typeof quoteRow === "object" ? quoteRow : {};
      const yq = yahooQuoteRow && typeof yahooQuoteRow === "object" ? yahooQuoteRow : {};

      const marketCap = pickFilled(
        toFiniteNumber(market.marketCap),
        toFiniteNumber(yahoo.marketCap),
        toFiniteNumber(quote.marketCap),
        toFiniteNumber(yq.marketCap)
      );
      const pe = pickFilled(
        toFiniteNumber(market.pe),
        toFiniteNumber(market.trailingPE),
        toFiniteNumber(yahoo.pe),
        toFiniteNumber(yq.trailingPE),
        toFiniteNumber(yq.forwardPE)
      );
      const eps = pickFilled(
        toFiniteNumber(market.eps),
        toFiniteNumber(yahoo.eps),
        toFiniteNumber(yq.epsTrailingTwelveMonths),
        toFiniteNumber(yq.epsForward)
      );
      const sharesOutstanding = pickFilled(
        toFiniteNumber(market.sharesOutstanding),
        toFiniteNumber(yahoo.sharesOutstanding),
        toFiniteNumber(yq.sharesOutstanding)
      );
      const avgVolume = pickFilled(
        toFiniteNumber(market.avgVolume),
        toFiniteNumber(yahoo.avgVolume),
        toFiniteNumber(quote.avgVolume),
        toFiniteNumber(yq.averageDailyVolume3Month),
        toFiniteNumber(yq.averageDailyVolume10Day),
        toFiniteNumber(quote.volume),
        toFiniteNumber(yq.regularMarketVolume)
      );
      const fiftyTwoWeekHigh = pickFilled(
        toFiniteNumber(market.fiftyTwoWeekHigh),
        toFiniteNumber(yahoo.fiftyTwoWeekHigh),
        toFiniteNumber(quote.yearHigh),
        toFiniteNumber(yq.fiftyTwoWeekHigh)
      );
      const fiftyTwoWeekLow = pickFilled(
        toFiniteNumber(market.fiftyTwoWeekLow),
        toFiniteNumber(yahoo.fiftyTwoWeekLow),
        toFiniteNumber(quote.yearLow),
        toFiniteNumber(yq.fiftyTwoWeekLow)
      );

      return {
        symbol: symbol || market.symbol || yahoo.symbol || quote.symbol || yq.symbol || "",
        marketCap,
        pe,
        eps,
        sharesOutstanding,
        earningsDate: pickFilled(market.earningsDate, yahoo.earningsDate),
        avgVolume,
        fiftyTwoWeekHigh,
        fiftyTwoWeekLow,
        beta: pickFilled(toFiniteNumber(market.beta), toFiniteNumber(yahoo.beta), toFiniteNumber(yq.beta)),
        priceToBook: pickFilled(toFiniteNumber(market.priceToBook), toFiniteNumber(yahoo.priceToBook)),
        dividendYield: pickFilled(toFiniteNumber(market.dividendYield), toFiniteNumber(yahoo.dividendYield)),
        revenue: pickFilled(toFiniteNumber(market.revenue), toFiniteNumber(yahoo.revenue)),
        grossMargin: pickFilled(toFiniteNumber(market.grossMargin), toFiniteNumber(yahoo.grossMargin)),
        operatingMargin: pickFilled(toFiniteNumber(market.operatingMargin), toFiniteNumber(yahoo.operatingMargin)),
        profitMargin: pickFilled(toFiniteNumber(market.profitMargin), toFiniteNumber(yahoo.profitMargin)),
        debtToEquity: pickFilled(toFiniteNumber(market.debtToEquity), toFiniteNumber(yahoo.debtToEquity)),
        currentRatio: pickFilled(toFiniteNumber(market.currentRatio), toFiniteNumber(yahoo.currentRatio)),
        quickRatio: pickFilled(toFiniteNumber(market.quickRatio), toFiniteNumber(yahoo.quickRatio)),
        returnOnEquity: pickFilled(toFiniteNumber(market.returnOnEquity), toFiniteNumber(yahoo.returnOnEquity)),
        returnOnAssets: pickFilled(toFiniteNumber(market.returnOnAssets), toFiniteNumber(yahoo.returnOnAssets)),
        targetMeanPrice: pickFilled(toFiniteNumber(market.targetMeanPrice), toFiniteNumber(yahoo.targetMeanPrice)),
        recommendation: pickFilled(market.recommendation, yahoo.recommendation),
        sector: pickFilled(market.sector, yahoo.sector),
        industry: pickFilled(market.industry, yahoo.industry),
        source: pickFilled(market.source, yahoo.source, "market+yahoo")
      };
    }

    function applyQuranReciter(url, tryPlay = false) {
      if (!el.quranSourceMain || !el.quranAudioMain || !el.quranReciter) return;
      const pick = QURAN_RECITERS.find((r) => r.url === url) || QURAN_RECITERS[0];
      app.quranUrl = pick.url;
      app.quranLastFailedUrl = "";
      el.quranReciter.value = pick.url;
      if (el.quranSourceMain.getAttribute("src") !== pick.url) {
        const wasPlaying = !el.quranAudioMain.paused;
        el.quranSourceMain.setAttribute("src", pick.url);
        el.quranAudioMain.load();
        if (tryPlay || wasPlaying) el.quranAudioMain.play().catch(() => {});
      }
    }

    function nextQuranReciterUrl(currentUrl) {
      if (!Array.isArray(QURAN_RECITERS) || !QURAN_RECITERS.length) return "";
      const idx = QURAN_RECITERS.findIndex((r) => r.url === currentUrl);
      if (idx < 0) return QURAN_RECITERS[0].url;
      for (let step = 1; step < QURAN_RECITERS.length; step += 1) {
        const candidate = QURAN_RECITERS[(idx + step) % QURAN_RECITERS.length]?.url || "";
        if (candidate && candidate !== currentUrl) return candidate;
      }
      return "";
    }

    function renderQuranReciters() {
      if (!el.quranReciter) return;
      el.quranReciter.innerHTML = QURAN_RECITERS.map((r) => `<option value="${r.url}">${r.name}</option>`).join("");
      applyQuranReciter(app.quranUrl, false);
    }

    function applyArabicMusicSource(url) {
      if (!el.arabicMusicFrame || !el.arabicMusicQuery) return;
      const pick = ARABIC_MUSIC_PLAYLISTS.find((x) => x.url === url) || ARABIC_MUSIC_PLAYLISTS[0];
      app.arabicMusicUrl = pick.url;
      el.arabicMusicQuery.value = pick.url;
      const nextSrc = pick.url;
      if (el.arabicMusicFrame.getAttribute("src") !== nextSrc) {
        el.arabicMusicFrame.setAttribute("src", nextSrc);
      }
    }

    function renderArabicMusicQueries() {
      if (!el.arabicMusicQuery) return;
      el.arabicMusicQuery.innerHTML = ARABIC_MUSIC_PLAYLISTS.map((x) => `<option value="${x.url}">${x.name}</option>`).join("");
      applyArabicMusicSource(app.arabicMusicUrl);
    }

    function backendOrigin() {
      const candidates = [app.api.aiBaseUrl, app.api.marketDataBaseUrl, app.api.newsBaseUrl];
      for (const c of candidates) {
        try { return new URL(c).origin; } catch {}
      }
      return directMarketOrigin();
    }

    async function apiFetch(path, init = {}, useAuth = true) {
      const headers = { "Content-Type": "application/json", ...(init.headers || {}) };
      if (useAuth && app.token) headers.Authorization = `Bearer ${app.token}`;
      const response = await fetch(`${backendOrigin()}${path}`, { ...init, headers });
      if (!response.ok) {
        const body = await response.text();
        throw new Error(`${response.status} ${body}`);
      }
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    }

    async function tryLoginBackend(email, password) {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      }, false);
      app.token = data.token || "";
      app.user = data?.user?.email || email;
    }

    async function syncSettingsFromBackend() {
      const s = await apiFetch("/api/settings");
      if (!s) return;
      app.auto = Boolean(s.auto_refresh ?? app.auto);
      app.dark = Boolean(s.dark_mode ?? app.dark);
      app.api.marketDataBaseUrl = s.market_data_base_url || app.api.marketDataBaseUrl;
      app.api.newsBaseUrl = s.news_base_url || app.api.newsBaseUrl;
      app.api.aiBaseUrl = s.ai_base_url || app.api.aiBaseUrl;
      app.api.websocketUrl = s.websocket_url || app.api.websocketUrl;
    }

    async function syncWatchlistFromBackend() {
      const data = await apiFetch("/api/watchlist");
      if (Array.isArray(data.symbols) && data.symbols.length) {
        app.watchlist = data.symbols;
        if (!app.watchlist.includes(app.selected)) app.selected = app.watchlist[0];
      }
    }

    async function refreshBackendMarketViews() {
      let liveNewsLoaded = false;
      try {
        const watch = (app.watchlist || []).slice(0, 6).join(",") || "SPY,QQQ,NVDA,TSLA,AAPL,AMD";
        const liveNews = await directFetch(`/api/market/news?tickers=${encodeURIComponent(watch)}&limit=12${providerQuerySuffix()}`);
        if (Array.isArray(liveNews) && liveNews.length) {
          app.newsItems = liveNews.map((n) => ({
            title: String(n.title || "Market headline"),
            source: String(n.source || n.publisher || "Live feed"),
            tag: String(n.ticker || "Live"),
            impact: "Live"
          }));
          liveNewsLoaded = true;
          app.apiLive = true;
        }
      } catch {}

      try {
        const [heat, macro, news] = await Promise.all([
          apiFetch("/api/market/heatmap"),
          apiFetch("/api/macro"),
          apiFetch("/api/news")
        ]);
        if (Array.isArray(heat.items)) app.heatItems = heat.items;
        if (Array.isArray(macro.items)) app.macroItems = macro.items;
        if (Array.isArray(news.items)) app.newsItems = news.items;
      } catch {
        app.heatItems = [...MOCK_HEATMAP];
        app.macroItems = [...MOCK_MACRO];
      }
      if (!Array.isArray(app.newsItems) || !app.newsItems.length) {
        app.newsItems = liveNewsLoaded ? app.newsItems : [...MOCK_NEWS];
      }
      if (!liveNewsLoaded && !app.token) {
        app.apiLive = false;
      }
    }

    async function refreshSelectedSymbol() {
      try {
        const symbol = app.selected;
        const [rows, candles] = await Promise.all([
          directFetch(`/api/market/quote?symbols=${encodeURIComponent(symbol)}${providerQuerySuffix()}`),
          directFetch(`/api/yahoo/candles?symbol=${encodeURIComponent(symbol)}&timeframe=1D`)
        ]);
        const q = Array.isArray(rows) ? rows[0] : null;
        if (q) {
          app.quote = {
            price: Number(q.price || 0),
            changePct: Number(q.changesPercentage || 0),
            volume: Number(q.volume || 0),
            score: Math.max(0, Math.min(99, Math.round(60 + Number(q.changesPercentage || 0) * 6))),
            grade: Number(q.changesPercentage || 0) >= 0 ? "A" : "B"
          };
        }
        const bars = Array.isArray(candles?.bars) ? candles.bars : [];
        if (bars.length) {
          app.chartSeries = bars.slice(-40).map((b) => ({
            time: String(b.time || "").slice(11, 16) || "00:00",
            price: Number(b.close || 0),
            volume: Number(b.volume || 0)
          }));
        }
        app.apiLive = true;
      } catch {
        try {
          const symbol = app.selected;
          const [quote, chart] = await Promise.all([
            apiFetch(`/api/market/quote/${encodeURIComponent(symbol)}`),
            apiFetch(`/api/market/chart/${encodeURIComponent(symbol)}`)
          ]);
          app.quote = {
            price: Number(quote.price || 0),
            changePct: Number(quote.changePct || 0),
            volume: Number(quote.volume || 0),
            score: Number(quote.score || 0),
            grade: String(quote.grade || "-")
          };
          if (Array.isArray(chart.series) && chart.series.length) app.chartSeries = chart.series;
          app.apiLive = true;
        } catch {
          app.quote = { price: 103.82, changePct: 1.28, volume: 12400000, score: 78, grade: "A" };
          app.chartSeries = [...INTRADAY];
          app.apiLive = false;
        }
      }
      await refreshProTraderFlow(app.selected, true);
      renderMetrics();
      renderChart();
      renderOverview();
      renderWebV3();
      if (el.apiStatusText) el.apiStatusText.textContent = app.apiLive ? "Live API connected" : "Fallback / not tested";
    }

    function renderSummary() {
      if (!el.summary) return;
      const s = sectorBias();
      const m = macroBias();
      el.summary.innerHTML = `<div class="pill">User: <b>${app.user || "-"}</b></div><div class="pill">Macro Bias: <b class="${m.cls}">${m.label}</b></div><div class="pill">Sector: <b class="${s.cls}">${s.label}</b></div><div class="pill">Setup: <b>${topSetup()}</b></div>`;
    }

    function renderOverview() {
      if (el.overviewSymbol) el.overviewSymbol.textContent = app.selected;
      if (el.overviewSymbolTv) {
        el.overviewSymbolTv.setAttribute("data-tv-open", app.selected || "SPY");
        el.overviewSymbolTv.setAttribute("data-tv-interval", app.deepDive?.timeframe || "1D");
      }
      if (el.mainScreenNotes && el.mainScreenNotes.value !== String(app.mainNotes || "")) {
        el.mainScreenNotes.value = String(app.mainNotes || "");
      }
      if (el.mainNotesStatus && !String(el.mainNotesStatus.textContent || "").trim()) {
        el.mainNotesStatus.textContent = "Ready";
      }
      if (el.overviewSetup) el.overviewSetup.textContent = topSetup();
      if (el.overviewReportMode) el.overviewReportMode.value = app.reportMode;
      if (el.overviewReportTheme) el.overviewReportTheme.value = app.reportTheme;
      renderOverviewRegime();
      renderOverviewReport();
    }

    function renderOverviewRegime() {
      if (!el.overviewRegime) return;
      const quote = app.quote || {};
      const change = Number(quote.changePct || 0);
      const macro = macroBias();
      const sector = sectorBias();
      const trendLabel = (change >= 0 || macro.label === "Bullish") ? "Bullish" : "Bearish";
      const trendCls = trendLabel === "Bullish" ? "good" : "bad";
      let riskLabel = "Risk-Off";
      if (sector.label === "Risk-On") riskLabel = "Risk-On";
      else if (sector.label === "Mixed") riskLabel = change >= 0 ? "Risk-On" : "Risk-Off";
      const riskCls = riskLabel === "Risk-On" ? "good" : "bad";
      const postureLabel = riskLabel === "Risk-On" ? "Offensive" : "Defensive";
      const postureCls = postureLabel === "Offensive" ? "good" : "bad";
      el.overviewRegime.innerHTML = `
        <div class="k">Market Regime</div>
        <div class="regime-grid">
          <div class="regime-pill ${trendCls}"><div class="n">Trend</div><div class="v">${escapeHtml(trendLabel)}</div></div>
          <div class="regime-pill ${riskCls}"><div class="n">Risk Mode</div><div class="v">${escapeHtml(riskLabel)}</div></div>
          <div class="regime-pill ${postureCls}"><div class="n">Positioning</div><div class="v">${escapeHtml(postureLabel)}</div></div>
        </div>
      `;
    }

    function reportPalette(theme) {
      const palettes = {
        vivid: [
          { accent: "#f472b6", bg: "rgba(244,114,182,0.16)" },
          { accent: "#60a5fa", bg: "rgba(96,165,250,0.14)" },
          { accent: "#34d399", bg: "rgba(52,211,153,0.14)" },
          { accent: "#a78bfa", bg: "rgba(167,139,250,0.16)" },
          { accent: "#f59e0b", bg: "rgba(245,158,11,0.16)" },
          { accent: "#22d3ee", bg: "rgba(34,211,238,0.16)" },
          { accent: "#fb7185", bg: "rgba(251,113,133,0.15)" },
          { accent: "#2dd4bf", bg: "rgba(45,212,191,0.14)" }
        ],
        ocean: [
          { accent: "#38bdf8", bg: "rgba(56,189,248,0.16)" },
          { accent: "#0ea5e9", bg: "rgba(14,165,233,0.16)" },
          { accent: "#06b6d4", bg: "rgba(6,182,212,0.15)" },
          { accent: "#3b82f6", bg: "rgba(59,130,246,0.14)" },
          { accent: "#22d3ee", bg: "rgba(34,211,238,0.14)" },
          { accent: "#2dd4bf", bg: "rgba(45,212,191,0.14)" },
          { accent: "#7dd3fc", bg: "rgba(125,211,252,0.14)" },
          { accent: "#67e8f9", bg: "rgba(103,232,249,0.14)" }
        ],
        sunrise: [
          { accent: "#fb923c", bg: "rgba(251,146,60,0.16)" },
          { accent: "#fbbf24", bg: "rgba(251,191,36,0.14)" },
          { accent: "#f59e0b", bg: "rgba(245,158,11,0.16)" },
          { accent: "#f97316", bg: "rgba(249,115,22,0.14)" },
          { accent: "#fb7185", bg: "rgba(251,113,133,0.14)" },
          { accent: "#d946ef", bg: "rgba(217,70,239,0.14)" },
          { accent: "#f43f5e", bg: "rgba(244,63,94,0.13)" },
          { accent: "#fda4af", bg: "rgba(253,164,175,0.13)" }
        ],
        neon: [
          { accent: "#22d3ee", bg: "rgba(34,211,238,0.20)" },
          { accent: "#a78bfa", bg: "rgba(167,139,250,0.20)" },
          { accent: "#f472b6", bg: "rgba(244,114,182,0.18)" },
          { accent: "#34d399", bg: "rgba(52,211,153,0.18)" },
          { accent: "#f59e0b", bg: "rgba(245,158,11,0.18)" },
          { accent: "#60a5fa", bg: "rgba(96,165,250,0.18)" },
          { accent: "#fb7185", bg: "rgba(251,113,133,0.18)" },
          { accent: "#2dd4bf", bg: "rgba(45,212,191,0.18)" }
        ]
      };
      return palettes[theme] || palettes.vivid;
    }

    function formatReportStamp() {
      if (!app.reportGeneratedAt) return "Auto";
      const d = new Date(app.reportGeneratedAt);
      if (Number.isNaN(d.getTime())) return "Auto";
      return d.toLocaleString();
    }

    function renderOverviewReport() {
      if (!el.overviewReport) return;
      const quote = app.quote || {};
      const macro = app.macroItems || [];
      const news = app.newsItems || [];
      const ai = app.reportData || {};
      const sector = sectorBias();
      const macroB = macroBias();
      const price = Number(quote.price || 0);
      const dayRange = app.chartSeries?.length ? {
        low: Math.min(...app.chartSeries.map((x) => Number(x.price || 0))),
        high: Math.max(...app.chartSeries.map((x) => Number(x.price || 0)))
      } : { low: 0, high: 0 };
      const support = dayRange.low ? (dayRange.low + (dayRange.high - dayRange.low) * 0.24) : 0;
      const resistance = dayRange.low ? (dayRange.low + (dayRange.high - dayRange.low) * 0.78) : 0;
      const macroLines = ai.macro_read
        ? `- ${String(ai.macro_read || "").trim()}`
        : (macro.slice(0, 3).map((m) => `- ${m.name}: ${m.value} (${m.delta})`).join("\n") || "- Waiting for macro feed");
      const catalystLines = news.slice(0, 4).map((n, i) => `${i + 1}. ${n.title}`).join("\n") || "No live catalysts yet.";
      const sectorLines = ai.sector_rotation
        ? `- ${String(ai.sector_rotation || "").trim()}`
        : (app.heatItems || [])
            .slice()
            .sort((a, b) => Number(b.value || 0) - Number(a.value || 0))
            .slice(0, 3)
            .map((s) => `- ${s.sector}: ${s.leader} (${s.tone})`)
            .join("\n");
      const riskText = Number(quote.changePct || 0) < -1
        ? "Volatility pressure rising. Reduce size and wait for reclaim."
        : Number(quote.changePct || 0) > 1
          ? "Momentum expansion in play. Avoid chasing late entries."
          : "Balanced tape. Trade only at levels with confirmation.";
      const invalidationText = ai.invalidation || "Break of support + weaker breadth invalidates long continuation.";
      const setupText = ai.best_setup || topSetup();
      const confidence = Number.isFinite(Number(ai.confidence)) ? Number(ai.confidence) : Math.max(0.45, Math.min(0.95, Number(quote.score || 65) / 100));
      const isQuick = app.reportMode === "quick";
      const reportMetaText = `Source: ${app.reportSource}\nGenerated: ${formatReportStamp()}\nTheme: ${app.reportTheme}`;
      const heatAvg = (app.heatItems || []).reduce((sum, item) => sum + Number(item.value || 0), 0) / Math.max((app.heatItems || []).length, 1);
      const breadthText = heatAvg >= 60
        ? "Broad participation"
        : heatAvg <= 42
          ? "Narrow / defensive"
          : "Mixed breadth";
      const flowText = Number(quote.volume || 0) >= 10000000 ? "High-volume session" : "Normal volume session";
      const executionText = [
        `Now: ${Number(quote.changePct || 0) >= 0 ? "Favor long setups above support." : "Wait for reclaim before long exposure."}`,
        `Trigger: ${setupText}`,
        `Stop logic: Invalidate on support break + weak breadth.`
      ].join("\n");
      const cards = [
        {
          t: "Section 1 • Success Brief",
          h: `${app.selected} Trade Report`,
          b: `Goal: Build a high-probability plan before execution.\nPrimary setup: ${setupText}\nSuccess criteria: Trend, breadth, and volume all confirm.`,
          size: "wide",
          side: {
            n: "Report Meta",
            v: `${Math.round(confidence * 100)}%`,
            m: reportMetaText
          }
        },
        {
          t: "Section 2 • Market Bias",
          h: ai.bias || `${macroB.label} | ${sector.label}`,
          b: `Symbol: ${app.selected}\nChange: ${Number(quote.changePct || 0) >= 0 ? "+" : ""}${Number(quote.changePct || 0).toFixed(2)}%\nA+ Score: ${quote.score || 0}/${quote.grade || "-"}`
        },
        {
          t: "Section 3 • Key Levels",
          h: `${app.selected} Price Map`,
          b: ai.key_levels || `Support: ${support ? `$${support.toFixed(2)}` : "--"}\nCurrent: ${price ? `$${price.toFixed(2)}` : "--"}\nResistance: ${resistance ? `$${resistance.toFixed(2)}` : "--"}`
        },
        {
          t: "Section 4 • Setup Blueprint",
          h: setupText,
          b: "Execution plan:\n1) Wait for key level reaction\n2) Confirm with breadth + volume\n3) Define invalidation before entry"
        },
        {
          t: "Section 5 • Risk Plan",
          h: "Position Discipline",
          b: `${riskText}\nSizing rule: Start smaller until follow-through confirms.`
        },
        {
          t: "Section 6 • Catalysts",
          h: "Top News Drivers",
          b: catalystLines
        },
        {
          t: "Section 7 • Breadth + Flow",
          h: `${breadthText}`,
          b: `Heatmap average: ${Number.isFinite(heatAvg) ? heatAvg.toFixed(1) : "--"}\nVolume state: ${flowText}\nLeadership: ${(app.heatItems || []).slice().sort((a, b) => Number(b.value || 0) - Number(a.value || 0)).slice(0, 2).map((s) => s.sector).join(" / ") || "Waiting feed"}`
        },
        {
          t: "Section 8 • Action Plan",
          h: "Execution Today",
          b: executionText
        }
      ];

      if (!isQuick) {
        cards.push(
          { t: "Section 9 • Macro Read", h: "Cross-Asset Pressure", b: macroLines },
          { t: "Section 10 • Sector Rotation", h: "Leaders vs Laggards", b: sectorLines || "- Waiting for sector feed" },
          { t: "Section 11 • Invalidation", h: "Thesis Break Trigger", b: invalidationText }
        );
      }

      const palette = reportPalette(app.reportTheme);
      const reportHtml = `<div class="report-stack">${cards.map((c, i) => {
        const swatch = palette[i % palette.length] || palette[0];
        const accent = swatch.accent || "#38bdf8";
        const bg = swatch.bg || "rgba(56,189,248,0.14)";
        const sizeClass = c.size === "wide" ? "wide" : (c.size === "full" ? "full" : "");
        const splitClass = c.side ? "split" : "";
        const sideHtml = c.side
          ? `<aside class="report-side"><div class="n">${escapeHtml(c.side.n || "")}</div><div class="v">${escapeHtml(c.side.v || "")}</div><div class="m">${escapeHtml(c.side.m || "")}</div></aside>`
          : "";
        return `<article class="report-section ${sizeClass} ${splitClass}" style="--section-accent:${accent};--section-bg:${bg};"><div class="t">${escapeHtml(c.t)}</div><div class="h">${escapeHtml(c.h)}</div><div class="report-section-body"><div class="b">${escapeHtml(c.b)}</div>${sideHtml}</div></article>`;
      }).join("")}</div>`;
      el.overviewReport.innerHTML = reportHtml;
      if (el.scanReport) {
        el.scanReport.innerHTML = reportHtml;
      }
      if (el.overviewReportStatus) {
        el.overviewReportStatus.textContent = `${app.reportSource} • ${formatReportStamp()} • ${isQuick ? "Quick (8)" : "Full (11)"}`;
      }
      if (el.scanReportStatus) {
        const scanStamp = app.scanReport?.generatedAt ? new Date(app.scanReport.generatedAt).toLocaleString() : formatReportStamp();
        const scanCompletion = Number(app.scanReport?.payload?.completion || 0);
        const scanConfidence = Number(app.scanReport?.payload?.averageConfidence || 0);
        const scanMeta = scanConfidence > 0
          ? ` • Scan ${scanCompletion}% complete • Confidence ${scanConfidence}%`
          : "";
        el.scanReportStatus.textContent = `${app.scanReport?.source || app.reportSource} • ${scanStamp} • ${isQuick ? "Quick (8)" : "Full (11)"}${scanMeta}`;
      }
      if (el.scanReportBadge) {
        const hasScan = Boolean(app.scanReport?.payload);
        el.scanReportBadge.textContent = app.scanReport?.symbol ? `${app.scanReport.symbol} • ${hasScan ? "Scanned" : "Ready"}` : "Ready";
      }
      if (el.scanReportMode && el.scanReportMode.value !== app.reportMode) {
        el.scanReportMode.value = app.reportMode;
      }
      if (el.scanReportTheme && el.scanReportTheme.value !== app.reportTheme) {
        el.scanReportTheme.value = app.reportTheme;
      }
    }

    function escapeHtml(value) {
      return String(value || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
    }

    function tradingViewSymbol(symbol) {
      const s = String(symbol || "").trim().toUpperCase();
      if (!s) return "";
      if (s.includes(":")) return s;
      if (s === "^VIX") return "CBOE:VIX";
      if (s === "^TNX" || s === "^US10Y") return "TVC:US10Y";
      if (s === "^UST2Y" || s === "^US2Y") return "TVC:US02Y";
      if (s === "SPY" || s === "QQQ" || s === "DIA" || s === "IWM") return `AMEX:${s}`;
      if (s.endsWith("-USD")) return `CRYPTO:${s.replace("-", "")}`;
      return `NASDAQ:${s}`;
    }

    function tradingViewUrl(symbol) {
      const tvSymbol = tradingViewSymbol(symbol);
      if (!tvSymbol) return "https://www.tradingview.com/";
      return `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(tvSymbol)}`;
    }

    function normalizeTvInterval(interval) {
      const raw = String(interval || "1D").trim().toUpperCase();
      if (["15", "15M"].includes(raw)) return "15";
      if (["60", "1H"].includes(raw)) return "60";
      if (["240", "4H"].includes(raw)) return "240";
      if (["W", "1W"].includes(raw)) return "W";
      return "D";
    }

    function tradingViewEmbedUrl(symbol, interval = "1D") {
      const tvSymbol = tradingViewSymbol(symbol) || "AMEX:SPY";
      const params = new URLSearchParams({
        symbol: tvSymbol,
        interval: normalizeTvInterval(interval),
        theme: app.dark ? "dark" : "light",
        style: "1",
        locale: "en",
        withdateranges: "1",
        details: "1",
        calendar: "1",
        hotlist: "1",
        hideideas: "1",
        allow_symbol_change: "1",
        saveimage: "1",
        toolbarbg: app.dark ? "#0b1220" : "#ffffff"
      });
      return `https://s.tradingview.com/widgetembed/?${params.toString()}`;
    }

    function openTradingViewViewer(symbol, interval = "1D") {
      const s = String(symbol || "").trim().toUpperCase();
      if (!s) return;
      app.tvViewer.open = true;
      app.tvViewer.symbol = s;
      app.tvViewer.interval = String(interval || "1D").toUpperCase();
      if (el.tvViewerScanStatus) {
        el.tvViewerScanStatus.textContent = "Ready";
        el.tvViewerScanStatus.classList.remove("ok", "err");
      }
      if (el.tvViewerScan) {
        el.tvViewerScan.disabled = false;
        el.tvViewerScan.textContent = "Scan Page";
      }
      if (el.tvViewerTitle) {
        el.tvViewerTitle.textContent = `${s} • TradingView`;
      }
      if (el.tvViewerOpenNew) {
        el.tvViewerOpenNew.href = tradingViewUrl(s);
      }
      if (el.tvViewerFrame) {
        el.tvViewerFrame.src = tradingViewEmbedUrl(s, app.tvViewer.interval);
      }
      if (el.tvViewer) {
        el.tvViewer.classList.remove("hidden");
        el.tvViewer.setAttribute("aria-hidden", "false");
      }
    }

    function closeTradingViewViewer() {
      app.tvViewer.open = false;
      if (el.tvViewer) {
        el.tvViewer.classList.add("hidden");
        el.tvViewer.setAttribute("aria-hidden", "true");
      }
    }

    function buildTradingViewScanContext(symbol, interval = "1D") {
      const quote = app.quote || {};
      const flow = app.proTrader?.snapshot || {};
      const recent = (app.chartSeries || []).slice(-6);
      const closes = recent.map((x) => Number(x.price || 0)).filter((x) => Number.isFinite(x));
      const recentHigh = closes.length ? Math.max(...closes) : null;
      const recentLow = closes.length ? Math.min(...closes) : null;
      return [
        `Symbol: ${symbol}`,
        `Timeframe: ${String(interval || "1D").toUpperCase()}`,
        `TradingView URL: ${tradingViewUrl(symbol)}`,
        `Price: ${Number(quote.price || 0).toFixed(2)}`,
        `ChangePct: ${Number(quote.changePct || 0).toFixed(2)}%`,
        `Volume: ${Number(quote.volume || 0).toLocaleString()}`,
        `RecentHigh(6): ${recentHigh !== null ? recentHigh.toFixed(2) : "--"}`,
        `RecentLow(6): ${recentLow !== null ? recentLow.toFixed(2) : "--"}`,
        `FlowBias: ${flow.flowBias || "Unknown"}`,
        `PutCallRatio: ${Number(flow.putCallRatio || 0).toFixed(2)}`,
        `FlowScore: ${Number(flow.flowScore || 0)}`
      ].join("\n");
    }

    async function scanTradingViewPageContext(symbol, interval = "1D") {
      const pageText = buildTradingViewScanContext(symbol, interval);
      const payload = await directPost("/api/scan/page", {
        customerName: `${symbol} TradingView`,
        pageUrl: tradingViewUrl(symbol),
        quickAsk: "Scan this TradingView page and build a structured trading report.",
        notes: `Chart scan context for ${symbol} on ${String(interval || "1D").toUpperCase()}.`,
        pageText
      });
      return payload && typeof payload === "object" ? payload : null;
    }

    async function scanTradingViewSymbol() {
      const symbol = String(app.tvViewer?.symbol || app.selected || "SPY").trim().toUpperCase() || "SPY";
      if (el.tvViewerScan) {
        el.tvViewerScan.disabled = true;
        el.tvViewerScan.textContent = "Scanning...";
      }
      if (el.tvViewerScanStatus) {
        el.tvViewerScanStatus.textContent = `Scanning ${symbol}...`;
        el.tvViewerScanStatus.classList.remove("ok", "err");
      }

      try {
        app.selected = symbol;
        if (el.aiTicker) el.aiTicker.value = symbol;
        if (el.aiMode) el.aiMode.value = "stock_sniper";
        if (el.aiStyle) el.aiStyle.value = "professional";
        app.aiMode = "stock_sniper";
        app.aiStyle = "professional";
        const preset = aiPromptPreset("stock_sniper", symbol);
        if (el.prompt) el.prompt.value = preset;
        app.prompt = preset;
        if (el.aiStatus) el.aiStatus.textContent = `Scanning TradingView chart page for ${symbol}...`;

        await refreshSelectedSymbol();
        if (el.tvViewerScanStatus) {
          el.tvViewerScanStatus.textContent = `Scanning page context for ${symbol}...`;
        }
        let pageScanPayload = null;
        try {
          pageScanPayload = await scanTradingViewPageContext(symbol, app.tvViewer?.interval || "1D");
        } catch {}
        const result = await runAiAgent();
        app.scanReport = {
          symbol,
          source: result?.ok ? "TradingView page scan + AI" : "TradingView page scan fallback",
          generatedAt: new Date().toISOString(),
          rawOutput: String(app.output || ""),
          payload: pageScanPayload
        };
        if (pageScanPayload?.report?.summary && !app.reportData) {
          app.reportData = {
            bias: result?.ok ? "" : "Mixed / cautious",
            macro_read: String(pageScanPayload.report.summary || ""),
            sector_rotation: String((pageScanPayload.report.mainUpdates || []).join(" | ")),
            key_levels: "",
            best_setup: topSetup(),
            invalidation: String((pageScanPayload.report.issues || []).slice(0, 2).join(" | "))
          };
          app.reportSource = "TradingView page scan";
          app.reportGeneratedAt = new Date().toISOString();
        }
        renderOverviewReport();
        setActiveTab("report");
        if (result?.ok) {
          if (el.tvViewerScanStatus) {
            el.tvViewerScanStatus.textContent = `Page scan complete for ${symbol} • report ready`;
            el.tvViewerScanStatus.classList.remove("err");
            el.tvViewerScanStatus.classList.add("ok");
          }
          closeTradingViewViewer();
        } else if (el.tvViewerScanStatus) {
          el.tvViewerScanStatus.textContent = `Scan fallback used for ${symbol}`;
          el.tvViewerScanStatus.classList.remove("ok");
          el.tvViewerScanStatus.classList.add("err");
          closeTradingViewViewer();
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        if (el.tvViewerScanStatus) {
          el.tvViewerScanStatus.textContent = `Scan failed for ${symbol}: ${msg}`;
          el.tvViewerScanStatus.classList.remove("ok");
          el.tvViewerScanStatus.classList.add("err");
        }
        if (el.aiStatus) {
          el.aiStatus.textContent = `Scan failed for ${symbol}. ${msg}`;
        }
        app.scanReport = {
          symbol,
          source: "TradingView scan failed",
          generatedAt: new Date().toISOString(),
          rawOutput: msg,
          payload: null
        };
        renderOverviewReport();
        setActiveTab("report");
        closeTradingViewViewer();
      } finally {
        if (el.tvViewerScan) {
          el.tvViewerScan.disabled = false;
          el.tvViewerScan.textContent = "Scan Page";
        }
      }
    }

    function refreshTradingViewViewerTheme() {
      if (!app.tvViewer.open || !el.tvViewerFrame) return;
      el.tvViewerFrame.src = tradingViewEmbedUrl(app.tvViewer.symbol || app.selected || "SPY", app.tvViewer.interval || "1D");
    }

    function tradingViewLinkHtml(symbol, label = "TradingView", interval = "1D") {
      const s = String(symbol || "").trim().toUpperCase();
      if (!s) return "";
      const text = escapeHtml(label);
      return `<button type="button" class="ghost tv-link" data-tv-open="${escapeHtml(s)}" data-tv-interval="${escapeHtml(String(interval || "1D").toUpperCase())}" title="Open ${escapeHtml(s)} in TradingView">${text}</button>`;
    }

    const AI_SECTION_PRIORITY = [
      "market bias", "bias", "macro read", "sector rotation", "key levels",
      "technical thesis", "fundamental valuation read", "best setup", "trade setup",
      "invalidation", "risk warning", "confidence", "grade", "a score", "a+ score", "action plan", "institutional read"
    ];

    function normalizeAiSectionKey(value) {
      return String(value || "").toLowerCase().replace(/[_-]+/g, " ").replace(/[^a-z0-9+/& ]+/g, " ").replace(/\s+/g, " ").trim();
    }

    function beautifyAiSectionTitle(value) {
      const raw = String(value || "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
      if (!raw) return "Analysis";
      if (/^[A-Z0-9 /&+]+$/.test(raw)) {
        return raw.toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase());
      }
      return raw;
    }

    function aiSectionPriority(title) {
      const key = normalizeAiSectionKey(title);
      const idx = AI_SECTION_PRIORITY.indexOf(key);
      return idx >= 0 ? idx : 999;
    }

    function aiSectionToneClass(title) {
      const key = normalizeAiSectionKey(title);
      if (key.includes("bias") || key.includes("trend")) return "tone-bias";
      if (key.includes("macro")) return "tone-macro";
      if (key.includes("sector") || key.includes("rotation")) return "tone-rotation";
      if (key.includes("level") || key.includes("support") || key.includes("resistance")) return "tone-levels";
      if (key.includes("setup") || key.includes("entry") || key.includes("trade")) return "tone-setup";
      if (key.includes("invalid") || key.includes("risk") || key.includes("warning")) return "tone-risk";
      if (key.includes("confidence") || key.includes("grade") || key.includes("score")) return "tone-confidence";
      return "";
    }

    const AI_SECTION_TITLE_MAP = {
      "bias": "Bias",
      "market bias": "Market Bias",
      "macro read": "Macro Read",
      "sector rotation": "Sector Rotation",
      "key levels": "Key Levels",
      "best setup": "Best Setup",
      "setup": "Best Setup",
      "trade setup": "Best Setup",
      "invalidation": "Invalidation",
      "risk warning": "Risk Warning",
      "confidence": "Confidence",
      "grade": "Grade",
      "a score": "A Score",
      "a+ score": "A+ Score",
      "institutional read": "Institutional Read",
      "technical thesis": "Technical Thesis",
      "fundamental valuation read": "Fundamental Valuation Read",
      "action plan": "Action Plan"
    };

    function normalizeAiHeadingTitle(value) {
      const key = normalizeAiSectionKey(value);
      if (AI_SECTION_TITLE_MAP[key]) return AI_SECTION_TITLE_MAP[key];
      return beautifyAiSectionTitle(value);
    }

    function isLikelyAiHeading(line) {
      const clean = String(line || "").trim();
      if (!clean) return false;
      const normalized = normalizeAiSectionKey(clean.replace(/:\s*$/, ""));
      if (AI_SECTION_TITLE_MAP[normalized]) return true;
      const words = clean.split(/\s+/).filter(Boolean);
      if (words.length === 0 || words.length > 6) return false;
      if (clean.length > 54) return false;
      const alphaOnly = clean.replace(/[^A-Za-z]/g, "");
      if (!alphaOnly) return false;
      const upperRatio = alphaOnly.replace(/[^A-Z]/g, "").length / alphaOnly.length;
      return upperRatio >= 0.78;
    }

    function aiBodyToHtml(body) {
      const blocks = String(body || "").split(/\n\s*\n/g).map((x) => x.trim()).filter(Boolean);
      if (!blocks.length) return `<div class="ai-report-text">--</div>`;
      return blocks.map((block) => {
        const lines = block.split("\n").map((x) => x.trim()).filter(Boolean);
        if (!lines.length) return "";
        const bulletCount = lines.filter((x) => /^[-*•]\s+/.test(x)).length;
        if (bulletCount && bulletCount >= Math.ceil(lines.length / 2)) {
          return `<ul class="ai-report-list">${lines.map((x) => `<li>${escapeHtml(x.replace(/^[-*•]\s+/, ""))}</li>`).join("")}</ul>`;
        }
        return `<div class="ai-report-text">${escapeHtml(lines.join("\n")).replaceAll("\n", "<br />")}</div>`;
      }).join("");
    }

    function parseAiSections(rawText) {
      const text = String(rawText || "").replace(/\r/g, "").trim();
      if (!text) return [];

      const structured = normalizeReportPayload(tryParseJsonObject(text) || {}, text);
      if (structured) {
        const rows = [
          { title: "Market Bias", body: structured.bias },
          { title: "Macro Read", body: structured.macro_read },
          { title: "Sector Rotation", body: structured.sector_rotation },
          { title: "Key Levels", body: structured.key_levels },
          { title: "Best Setup", body: structured.best_setup },
          { title: "Invalidation", body: structured.invalidation },
          { title: "Confidence", body: structured.confidence !== undefined ? `${structured.confidence}` : "" }
        ].filter((x) => String(x.body || "").trim());
        if (rows.length) return rows;
      }

      const byParagraph = text.split(/\n\s*\n/g).map((x) => x.trim()).filter(Boolean);
      if (byParagraph.length >= 2) {
        const paragraphSections = byParagraph.map((block, idx) => {
          const lines = block.split("\n").map((x) => x.trim()).filter(Boolean);
          const first = lines[0] || "";
          if (isLikelyAiHeading(first)) {
            return {
              title: normalizeAiHeadingTitle(first.replace(/:\s*$/, "")),
              body: lines.slice(1).join("\n").trim() || "--"
            };
          }
          return {
            title: idx === 0 ? "Summary" : `Section ${idx + 1}`,
            body: block
          };
        });
        const meaningfulTitles = paragraphSections.filter((s) => s.title !== "Summary" && !/^Section \d+$/.test(s.title));
        if (meaningfulTitles.length >= 2) {
          return paragraphSections;
        }
      }

      const sections = [];
      let currentTitle = "Analysis";
      let currentLines = [];
      const pushCurrent = () => {
        const body = currentLines.join("\n").trim();
        if (body) sections.push({ title: currentTitle, body });
        currentLines = [];
      };

      for (const rawLine of text.split("\n")) {
        const line = rawLine.trim();
        if (!line) {
          if (currentLines.length && currentLines[currentLines.length - 1] !== "") currentLines.push("");
          continue;
        }

        const headingWithBody = line.match(/^([A-Za-z][A-Za-z0-9 /&+_-]{2,48})\s*:\s*(.+)$/);
        if (headingWithBody && !/^https?:\/\//i.test(line)) {
          pushCurrent();
          sections.push({ title: normalizeAiHeadingTitle(headingWithBody[1]), body: headingWithBody[2].trim() });
          currentTitle = "Analysis";
          continue;
        }

        const headingOnly = line.match(/^([A-Z][A-Z0-9 /&+_-]{2,60})\s*:?\s*$/);
        if (headingOnly && (isLikelyAiHeading(headingOnly[1]) || !/^([A-Z]{1,5})$/.test(headingOnly[1]))) {
          pushCurrent();
          currentTitle = normalizeAiHeadingTitle(headingOnly[1]);
          continue;
        }

        if (isLikelyAiHeading(line)) {
          pushCurrent();
          currentTitle = normalizeAiHeadingTitle(line.replace(/:\s*$/, ""));
          continue;
        }

        currentLines.push(line);
      }
      pushCurrent();
      if (!sections.length) return [{ title: "Analysis", body: text }];

      const merged = [];
      const seen = new Map();
      sections.forEach((section, idx) => {
        const key = normalizeAiSectionKey(section.title) || `section-${idx}`;
        if (seen.has(key)) {
          const ref = seen.get(key);
          ref.body = `${ref.body}\n${section.body}`.trim();
          return;
        }
        const item = { title: section.title, body: section.body, idx };
        seen.set(key, item);
        merged.push(item);
      });

      merged.sort((a, b) => {
        const pa = aiSectionPriority(a.title);
        const pb = aiSectionPriority(b.title);
        if (pa !== pb) return pa - pb;
        return a.idx - b.idx;
      });

      return merged.map(({ title, body }) => ({ title, body }));
    }

    function extractReportDataFromText(rawText) {
      const sections = parseAiSections(rawText);
      if (!sections.length) return null;
      const report = {};
      sections.forEach((section) => {
        const key = normalizeAiSectionKey(section.title);
        const body = String(section.body || "").trim();
        if (!body) return;
        if (!report.bias && key.includes("bias")) report.bias = body;
        else if (!report.macro_read && key.includes("macro")) report.macro_read = body;
        else if (!report.sector_rotation && (key.includes("sector") || key.includes("rotation"))) report.sector_rotation = body;
        else if (!report.key_levels && (key.includes("level") || key.includes("support") || key.includes("resistance"))) report.key_levels = body;
        else if (!report.best_setup && (key.includes("setup") || key.includes("trade") || key.includes("entry"))) report.best_setup = body;
        else if (!report.invalidation && (key.includes("invalid") || key.includes("risk warning"))) report.invalidation = body;
        else if (report.confidence === undefined && (key.includes("confidence") || key.includes("score") || key.includes("grade"))) {
          const num = body.match(/(\d+(?:\.\d+)?)/);
          if (num) report.confidence = Number(num[1]);
        }
      });
      return Object.keys(report).length ? report : null;
    }

    function renderAiSections(target, rawText) {
      if (!target) return;
      const text = String(rawText || "").trim();
      if (!text) {
        target.innerHTML = `<div class="ai-out-plain">No AI output yet.</div>`;
        return;
      }
      const sections = parseAiSections(text);
      target.innerHTML = `<div class="ai-report-grid">${sections.map((section) => `<article class="ai-report-card ${aiSectionToneClass(section.title)}"><div class="ai-report-title">${escapeHtml(section.title)}</div><div class="ai-report-body">${aiBodyToHtml(section.body)}</div></article>`).join("")}</div>`;
    }

    function formatChatTime(isoValue) {
      const d = new Date(isoValue || Date.now());
      if (Number.isNaN(d.getTime())) return "";
      return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    }

    function ensureAiConversation() {
      if (!Array.isArray(app.aiConversation)) app.aiConversation = [];
      if (!app.aiConversation.length) {
        app.aiConversation = [{ role: "assistant", content: AI_CHAT_WELCOME, at: new Date().toISOString() }];
      }
      if (app.aiConversation.length > app.aiConversationMax) {
        app.aiConversation = app.aiConversation.slice(-app.aiConversationMax);
      }
    }

    function addAiConversationMessage(role, content) {
      const clean = String(content || "").trim();
      if (!clean) return;
      ensureAiConversation();
      app.aiConversation.push({
        role: role === "user" ? "user" : "assistant",
        content: clean.slice(0, 12000),
        at: new Date().toISOString()
      });
      if (app.aiConversation.length > app.aiConversationMax) {
        app.aiConversation = app.aiConversation.slice(-app.aiConversationMax);
      }
    }

    function renderAiConversation() {
      if (!el.aiChatThread) return;
      ensureAiConversation();
      const rows = app.aiConversation;
      if (!rows.length) {
        el.aiChatThread.innerHTML = `<div class="ai-chat-empty">Start by asking a market question.</div>`;
        return;
      }
      el.aiChatThread.innerHTML = rows.map((msg) => {
        const role = msg.role === "user" ? "user" : "assistant";
        const roleLabel = role === "user" ? "You" : "ChatGPT";
        return `<article class="ai-chat-msg ${role}">
          <div class="ai-chat-meta">${roleLabel} • ${formatChatTime(msg.at)}</div>
          <div>${aiBodyToHtml(msg.content)}</div>
        </article>`;
      }).join("");
      el.aiChatThread.scrollTop = el.aiChatThread.scrollHeight;
    }

    function buildAiConversationPrompt({ ticker, mode, style, extraContext, message }) {
      ensureAiConversation();
      const history = app.aiConversation.slice(-12).map((item, idx) => {
        const who = item.role === "user" ? "User" : "Assistant";
        const compact = String(item.content || "").replace(/\s+/g, " ").trim().slice(0, 700);
        return `${idx + 1}. ${who}: ${compact}`;
      }).join("\n");
      const latest = String(message || "").trim();
      return [
        `You are ChatGPT acting as an institutional trading copilot.`,
        `Ticker: ${ticker}`,
        `Mode: ${mode}`,
        `Style: ${style}`,
        `Extra Context: ${extraContext || "None"}`,
        ``,
        `Conversation History (latest 12):`,
        history || "No prior conversation.",
        ``,
        `Latest User Request:`,
        latest,
        ``,
        `Return a clean, readable answer with clear section headers and practical next steps.`
      ].join("\n");
    }

    function cleanPrayerTime(value) {
      return String(value || "--").split(" ")[0];
    }

    function ensureAthanBoxes() {
      if (el.athanBoxes || !el.athanLine?.parentElement) return;
      const div = document.createElement("div");
      div.id = "athanBoxes";
      div.className = "athan-boxes";
      el.athanLine.insertAdjacentElement("afterend", div);
      el.athanBoxes = div;
    }

    function formatTime12h(time24) {
      const clean = cleanPrayerTime(time24);
      const parts = clean.split(":");
      if (parts.length < 2) return clean;
      const h = Number(parts[0]);
      const m = Number(parts[1]);
      if (!Number.isFinite(h) || !Number.isFinite(m)) return clean;
      const suffix = h >= 12 ? "PM" : "AM";
      const hour12 = ((h + 11) % 12) + 1;
      return `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
    }

    function prayerMinutes(time24) {
      const clean = cleanPrayerTime(time24);
      const parts = clean.split(":");
      if (parts.length < 2) return NaN;
      const h = Number(parts[0]);
      const m = Number(parts[1]);
      if (!Number.isFinite(h) || !Number.isFinite(m)) return NaN;
      return h * 60 + m;
    }

    function showPrayerPopup(message) {
      if (!el.prayerPopup || !el.prayerPopupMsg) return;
      el.prayerPopupMsg.textContent = message;
      el.prayerPopup.classList.add("show");
      if (app.prayerPopupTimer) clearTimeout(app.prayerPopupTimer);
      app.prayerPopupTimer = setTimeout(() => {
        if (el.prayerPopup) el.prayerPopup.classList.remove("show");
      }, 45000);
    }

    function playPrayerAlertSound() {
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        const ctx = window.__marketPrayerAudioCtx || new Ctx();
        window.__marketPrayerAudioCtx = ctx;
        if (ctx.state === "suspended") ctx.resume().catch(() => {});
        const pattern = [660, 880, 660, 990];
        let start = ctx.currentTime + 0.03;
        for (const freq of pattern) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.0001, start);
          gain.gain.exponentialRampToValueAtTime(0.16, start + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.28);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 0.3);
          start += 0.24;
        }
      } catch {}
    }

    function triggerPrayerAlert(name, time24) {
      const label = `${name} prayer time is now (${formatTime12h(time24)})`;
      showPrayerPopup(label);
      playPrayerAlertSound();
      pushLog(`${name} prayer alert triggered`);
      try {
        if (!("Notification" in window)) return;
        if (Notification.permission === "granted") {
          new Notification("Prayer Time Alert", { body: label });
        } else if (Notification.permission === "default") {
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              new Notification("Prayer Time Alert", { body: label });
            }
          }).catch(() => {});
        }
      } catch {}
    }

    function checkPrayerAlerts() {
      const now = new Date();
      const minuteKey = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}`;
      if (minuteKey === app.lastPrayerMinuteKey) return;
      app.lastPrayerMinuteKey = minuteKey;
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
      for (const name of prayers) {
        const t = cleanPrayerTime(app.prayer.timings?.[name] || "--");
        const mins = prayerMinutes(t);
        if (!Number.isFinite(mins)) continue;
        if (mins !== nowMinutes) continue;
        const alertKey = `${app.prayer.date || now.toDateString()}|${app.prayer.zip}|${name}|${t}`;
        if (alertKey === app.lastPrayerAlertKey) return;
        app.lastPrayerAlertKey = alertKey;
        try { localStorage.setItem("market-ai-prayer-last-alert", alertKey); } catch {}
        triggerPrayerAlert(name, t);
        return;
      }
    }

    function startPrayerAlertWatcher() {
      if (app.prayerAlertTimer) clearInterval(app.prayerAlertTimer);
      checkPrayerAlerts();
      app.prayerAlertTimer = setInterval(checkPrayerAlerts, 15000);
    }

    function startPrayerRefreshScheduler() {
      if (app.prayerRefreshTimer) clearInterval(app.prayerRefreshTimer);
      app.prayerRefreshTimer = setInterval(() => {
        refreshPrayerTimes(app.prayer.zip, true).catch(() => {});
      }, 1800000);
    }

    function nextAthanInfo() {
      const order = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      for (const name of order) {
        const t = cleanPrayerTime(app.prayer.timings[name]);
        const p = t.split(":");
        if (p.length < 2) continue;
        const mins = Number(p[0]) * 60 + Number(p[1]);
        if (Number.isFinite(mins) && mins >= currentMinutes) return { name, time: t };
      }
      return { name: "Fajr", time: cleanPrayerTime(app.prayer.timings.Fajr), tomorrow: true };
    }

    function renderPrayerTimes() {
      ensureAthanBoxes();
      if (el.prayerZip) el.prayerZip.value = app.prayer.zip;
      const fallbackMeta = `ZIP ${app.prayer.zip}${app.prayer.timezone ? ` - ${app.prayer.timezone}` : ""}`;
      if (el.prayerMeta) el.prayerMeta.textContent = app.prayer.date ? `${app.prayer.date} - ${app.prayer.location || fallbackMeta}` : fallbackMeta;
      const sequence = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
      if (el.prayerGrid) {
        el.prayerGrid.innerHTML = sequence.map((name) => {
          const time = cleanPrayerTime(app.prayer.timings[name]);
          return `<div class="prayer-card"><div class="prayer-name">${escapeHtml(name)}</div><div class="prayer-time">${escapeHtml(time)}</div></div>`;
        }).join("");
      }
      if (el.prayerStatus && !el.prayerStatus.textContent.trim()) {
        el.prayerStatus.textContent = "Using Aladhan API method 2 (ISNA).";
      }
      if (el.athanLine) {
        const next = nextAthanInfo();
        const short = [
          `Fajr ${formatTime12h(app.prayer.timings.Fajr)}`,
          `Dhuhr ${formatTime12h(app.prayer.timings.Dhuhr)}`,
          `Asr ${formatTime12h(app.prayer.timings.Asr)}`,
          `Maghrib ${formatTime12h(app.prayer.timings.Maghrib)}`,
          `Isha ${formatTime12h(app.prayer.timings.Isha)}`
        ].join(" | ");
        const nextText = next?.time ? `Next Athan: ${next.name} ${formatTime12h(next.time)}${next.tomorrow ? " (tomorrow)" : ""}` : "Next Athan: --";
        el.athanLine.textContent = `${nextText} | ZIP ${app.prayer.zip}${app.prayer.timezone ? ` (${app.prayer.timezone})` : ""} | ${short}`;
      }
      if (el.athanBoxes) {
        const palette = [
          "linear-gradient(135deg, rgba(59,130,246,0.55), rgba(30,64,175,0.5))",
          "linear-gradient(135deg, rgba(16,185,129,0.55), rgba(5,150,105,0.5))",
          "linear-gradient(135deg, rgba(245,158,11,0.55), rgba(217,119,6,0.5))",
          "linear-gradient(135deg, rgba(236,72,153,0.55), rgba(190,24,93,0.5))",
          "linear-gradient(135deg, rgba(168,85,247,0.55), rgba(126,34,206,0.5))",
          "linear-gradient(135deg, rgba(6,182,212,0.55), rgba(8,145,178,0.5))"
        ];
        const items = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
        const nextName = nextAthanInfo()?.name || "";
        el.athanBoxes.innerHTML = items.map((name, i) => {
          const timeText = formatTime12h(app.prayer.timings[name]);
          const isNext = name === nextName;
          return `<div class="athan-box ${isNext ? "next" : ""}" style="background:${palette[i % palette.length]};"><div class="n">${escapeHtml(name)}</div><div class="t">${escapeHtml(timeText)}</div></div>`;
        }).join("");
      }
    }

    async function refreshPrayerTimes(forceZip = "", silent = false) {
      const zip = String(forceZip || el.prayerZip?.value || app.prayer.zip || "45014").trim();
      if (!zip) return;
      app.prayer.zip = zip;
      if (!silent && el.prayerStatus) el.prayerStatus.textContent = `Loading prayer times for ${zip}...`;
      try {
        const query = new URLSearchParams({ address: `${zip},US`, method: "2" }).toString();
        const response = await fetch(`https://api.aladhan.com/v1/timingsByAddress?${query}`);
        if (!response.ok) throw new Error(`API ${response.status}`);
        const payload = await response.json();
        const timings = payload?.data?.timings;
        if (!timings || Number(payload.code) !== 200) throw new Error("Invalid prayer API response");
        app.prayer.timings = {
          Fajr: cleanPrayerTime(timings.Fajr),
          Sunrise: cleanPrayerTime(timings.Sunrise),
          Dhuhr: cleanPrayerTime(timings.Dhuhr),
          Asr: cleanPrayerTime(timings.Asr),
          Maghrib: cleanPrayerTime(timings.Maghrib),
          Isha: cleanPrayerTime(timings.Isha)
        };
        app.prayer.date = payload?.data?.date?.readable || new Date().toLocaleDateString();
        app.prayer.timezone = payload?.data?.meta?.timezone || "";
        app.prayer.location = payload?.data?.meta?.address || `ZIP ${zip}`;
        if (el.prayerStatus) el.prayerStatus.textContent = `Updated ${new Date().toLocaleTimeString()} (${app.prayer.timezone || "local"})`;
        renderPrayerTimes();
        checkPrayerAlerts();
        saveSettingsLocal();
        if (!silent) pushLog(`Prayer times refreshed for ${zip}`);
      } catch (error) {
        if (!silent && el.prayerStatus) el.prayerStatus.textContent = `Unable to load prayer times right now. ${error?.message || ""}`.trim();
        renderPrayerTimes();
        if (!silent) pushLog(`Prayer API unavailable for ${zip}`);
      }
    }

    function setActiveTab(tabName) {
      const requested = String(tabName || "").trim();
      const exists = tabButtons.some((btn) => btn.getAttribute("data-tab") === requested);
      const safeTab = exists ? requested : "overview";
      app.activeTab = safeTab;
      tabButtons.forEach((btn) => btn.classList.toggle("active", btn.getAttribute("data-tab") === safeTab));
      tabPanels.forEach((panel) => panel.classList.toggle("active", panel.getAttribute("data-panel") === safeTab));
    }

    function parseScannerWatchlist(value) {
      return String(value || "")
        .split(",")
        .map((x) => x.trim().toUpperCase())
        .filter(Boolean);
    }

    function normalizeScannerBaseUrl(value) {
      const raw = String(value || "").trim().replace(/\/+$/, "");
      if (!raw) return "http://127.0.0.1:3012";
      if (/^https?:\/\//i.test(raw)) return raw;
      return `http://${raw}`;
    }

    function renderScanner() {
      if (el.scannerApiUrl) el.scannerApiUrl.value = app.scanner.apiUrl;
      if (el.scannerMinScore) el.scannerMinScore.value = String(app.scanner.minScore);
      if (el.scannerWatchlist) el.scannerWatchlist.value = app.scanner.watchlistText;
      if (el.scannerStatus) el.scannerStatus.textContent = app.scanner.status || "Idle";
      if (el.scannerOutput) el.scannerOutput.textContent = app.scanner.output || "No scanner output yet.";
    }

    async function scannerFetch(path, init = {}) {
      const base = normalizeScannerBaseUrl(app.scanner.apiUrl);
      const response = await fetch(`${base}${path}`, {
        ...init,
        headers: { "Content-Type": "application/json", ...(init.headers || {}) }
      });
      const text = await response.text();
      let data = null;
      try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
      if (!response.ok) {
        const message = data?.error || data?.message || text || `HTTP ${response.status}`;
        throw new Error(String(message));
      }
      return data;
    }

    async function checkScannerHealth() {
      app.scanner.apiUrl = normalizeScannerBaseUrl(el.scannerApiUrl?.value || app.scanner.apiUrl);
      app.scanner.status = "Checking health...";
      renderScanner();
      try {
        const data = await scannerFetch("/health");
        app.scanner.status = `Online • port ${data?.port || "3012"}`;
        app.scanner.output = JSON.stringify(data, null, 2);
      } catch (error) {
        app.scanner.status = "Offline";
        app.scanner.output = `Health check failed:\n${error?.message || "Unknown error"}\n\nStart service:\npython scanner_telegram.py`;
      }
      saveSettingsLocal();
      renderScanner();
    }

    async function runScannerFromTab() {
      app.scanner.apiUrl = normalizeScannerBaseUrl(el.scannerApiUrl?.value || app.scanner.apiUrl);
      const minScoreInput = Number(el.scannerMinScore?.value || app.scanner.minScore || 70);
      app.scanner.minScore = Number.isFinite(minScoreInput) ? Math.max(0, Math.min(100, Math.round(minScoreInput))) : 70;
      const watchlistText = String(el.scannerWatchlist?.value || app.scanner.watchlistText || "");
      app.scanner.watchlistText = watchlistText;
      const watchlist = parseScannerWatchlist(watchlistText);
      app.scanner.status = "Running scanner...";
      renderScanner();
      try {
        const payload = { watchlist, min_score: app.scanner.minScore };
        const data = await scannerFetch("/run-scanner", { method: "POST", body: JSON.stringify(payload) });
        const alerts = Number(data?.alerts_sent || 0);
        app.scanner.status = `Completed • alerts sent: ${alerts}`;
        app.scanner.output = JSON.stringify(data, null, 2);
        pushLog(`Scanner run complete (${alerts} alerts sent)`);
      } catch (error) {
        app.scanner.status = "Run failed";
        app.scanner.output = `Scanner run failed:\n${error?.message || "Unknown error"}\n\nMake sure scanner service is running on ${app.scanner.apiUrl}.`;
      }
      saveSettingsLocal();
      renderScanner();
    }

    function renderHeat() {
      if (!el.heat) return;
      const existing = Array.isArray(app.heatItems) ? app.heatItems : [];
      const existingSectors = new Set(existing.map((x) => String(x?.sector || "")));
      const expanded = existing.length >= 14
        ? existing
        : [...existing, ...HEATMAP_FALLBACK_EXTRA.filter((x) => !existingSectors.has(x.sector)).slice(0, 14 - existing.length)];
      el.heat.innerHTML = expanded.map((h) => {
        const shade = Math.max(20, Math.min(90, Number(h.value || 50)));
        const leader = String(h.leader || "").trim().toUpperCase();
        return `<div class="heat" style="background:linear-gradient(135deg, rgba(16,185,129,${shade/140}), rgba(15,23,42,.96));"><div class="row"><span class="sec">${escapeHtml(h.sector)}</span><div class="list-actions"><span class="badge">${escapeHtml(h.tone)}</span>${tradingViewLinkHtml(leader, "TV")}</div></div><div class="lead">${escapeHtml(h.leader)}</div><div class="score">${escapeHtml(h.value)}</div><div style="font-size:11px;color:var(--muted);">Sector rotation score</div></div>`;
      }).join("");
    }

    function renderWatch() {
      if (!el.watchTags || !el.watchList) return;
      el.watchTags.innerHTML = app.watchlist.map((s) => `<button class="watch-btn ${s===app.selected?"active":""}" data-s="${s}">${s}</button>`).join("");
      el.watchList.innerHTML = app.watchlist.map((s) => `<div class="list-item"><div>${escapeHtml(s)}</div><div class="list-actions">${tradingViewLinkHtml(s)}<button class="ghost" data-r="${escapeHtml(s)}">Remove</button></div></div>`).join("");
      el.watchTags.querySelectorAll("button[data-s]").forEach((b) => b.addEventListener("click", async () => {
        app.selected = b.getAttribute("data-s");
        renderWatch();
        renderSummary();
        await refreshSelectedSymbol();
      }));
      el.watchList.querySelectorAll("button[data-r]").forEach((b) => b.addEventListener("click", async () => {
        const s = b.getAttribute("data-r");
        app.watchlist = app.watchlist.filter((x) => x !== s);
        if (!app.watchlist.length) app.watchlist = ["SPY"];
        if (!app.watchlist.includes(app.selected)) app.selected = app.watchlist[0];
        saveSettingsLocal();
        renderWatch();
        renderSummary();
        await refreshSelectedSymbol();
        if (app.token) { try { await apiFetch(`/api/watchlist/${encodeURIComponent(s)}`, { method: "DELETE" }); } catch {} }
        pushLog(`${s} removed from watchlist`);
      }));
    }

    function renderMacro() {
      if (!el.macro) return;
      el.macro.innerHTML = app.macroItems.map((m) => `<div class="tile"><div class="row"><div><div class="k">${m.name}</div><div style="font-weight:700;">${m.value}</div></div><span class="badge">${m.delta}</span></div></div>`).join("");
    }
    function renderNews() {
      if (!el.news) return;
      el.news.innerHTML = app.newsItems.map((n) => `<div class="news-item"><div class="badges"><span class="badge">${n.tag}</span><span class="badge">${n.impact}</span></div><div style="font-weight:700;">${n.title}</div><div style="font-size:12px;color:var(--muted2);">${n.source}</div></div>`).join("");
    }
    function normalizeLiveTvUrl(url, fallback) {
      const raw = String(url || "").trim();
      if (!raw) return fallback;
      try {
        const parsed = new URL(raw);
        if (parsed.protocol === "http:" || parsed.protocol === "https:") return parsed.toString();
      } catch {}
      return fallback;
    }
    function setLiveTvFrameSrc(frame, url) {
      if (!frame) return;
      const normalized = String(url || "");
      if (!normalized) return;
      const current = frame.getAttribute("data-src-key") || "";
      if (current === normalized) return;
      frame.src = normalized;
      frame.setAttribute("data-src-key", normalized);
    }
    function forceReloadLiveTvFrame(frame, url) {
      if (!frame) return;
      const normalized = String(url || "");
      if (!normalized) return;
      const sep = normalized.includes("?") ? "&" : "?";
      const bust = `${normalized}${sep}fresh=${Date.now()}`;
      frame.src = bust;
      frame.setAttribute("data-src-key", normalized);
    }
    function renderLiveTv() {
      const bloombergEmbed = normalizeLiveTvUrl(app.liveTv.bloombergEmbed, DEFAULT_BLOOMBERG_EMBED);
      const cnbcEmbed = normalizeLiveTvUrl(app.liveTv.cnbcEmbed, DEFAULT_CNBC_EMBED);
      const finvizEmbed = normalizeLiveTvUrl(app.liveTv.finvizEmbed, DEFAULT_FINVIZ_EMBED);
      let finvizMap = normalizeLiveTvUrl(app.liveTv.finvizMap, DEFAULT_FINVIZ_MAP);
      if (finvizMap.includes("finviz.com/map.ashx")) {
        finvizMap = DEFAULT_FINVIZ_MAP;
      }
      app.liveTv.bloombergEmbed = bloombergEmbed;
      app.liveTv.cnbcEmbed = cnbcEmbed;
      app.liveTv.finvizEmbed = finvizEmbed;
      app.liveTv.finvizMap = finvizMap;

      if (el.tvBloombergUrl) el.tvBloombergUrl.value = bloombergEmbed;
      if (el.tvCnbcUrl) el.tvCnbcUrl.value = cnbcEmbed;
      if (el.finvizUrl) el.finvizUrl.value = finvizEmbed;
      if (el.tvBloombergExternal) el.tvBloombergExternal.href = app.liveTv.bloombergExternal;
      if (el.tvCnbcExternal) el.tvCnbcExternal.href = app.liveTv.cnbcExternal;
      if (el.finvizExternal) el.finvizExternal.href = app.liveTv.finvizExternal;

      setLiveTvFrameSrc(el.tvBloombergFrame, bloombergEmbed);
      setLiveTvFrameSrc(el.tvCnbcFrame, cnbcEmbed);
      setLiveTvFrameSrc(el.finvizFrame, finvizEmbed);
      setLiveTvFrameSrc(el.finvizMapImg, finvizMap);
    }
    function symbolSeed(symbol) {
      const clean = String(symbol || "").trim().toUpperCase();
      let seed = 0;
      for (let i = 0; i < clean.length; i += 1) seed += clean.charCodeAt(i) * (i + 3);
      return seed || 137;
    }
    function optionFlowBias(snapshot) {
      const ratio = Number(snapshot?.putCallRatio || 1);
      const net = Number(snapshot?.netPremium || 0);
      if ((ratio <= 0.9 && net >= 0) || net >= 1000000) return "Bullish";
      if ((ratio >= 1.15 && net < 0) || net <= -1000000) return "Bearish";
      return "Neutral";
    }
    function normalizeFlowSweepRow(row, fallbackPrice = 0) {
      const sideRaw = String(pickFilled(row?.side, row?.direction, row?.type, row?.optionType, "call")).trim().toLowerCase();
      const side = sideRaw.includes("put") || sideRaw === "p" ? "put" : "call";
      const strike = toFiniteNumber(pickFilled(row?.strike, row?.strikePrice, row?.price, fallbackPrice));
      const premium = toFiniteNumber(pickFilled(row?.premium, row?.notional, row?.value, row?.premiumUsd, row?.amount, 0)) || 0;
      const contracts = Math.max(1, Math.round(toFiniteNumber(pickFilled(row?.contracts, row?.size, row?.quantity, row?.volume, 1)) || 1));
      const expiry = String(pickFilled(row?.expiry, row?.expiration, row?.expirationDate, row?.date, "Near-term"));
      return {
        side,
        strike: Number.isFinite(strike) ? strike : Number(fallbackPrice || 0),
        expiry,
        premium,
        contracts
      };
    }
    function normalizeOptionFlowPayload(payload, symbol, horizon) {
      const data = payload && typeof payload === "object" ? payload : null;
      if (!data) return null;
      const summary = (data.summary && typeof data.summary === "object")
        ? data.summary
        : (data.metrics && typeof data.metrics === "object")
          ? data.metrics
          : data;

      const callPremium = toFiniteNumber(pickFilled(summary.callPremium, summary.callsPremium, summary.callsNotional, summary.call_notional, summary.callValue));
      const putPremium = toFiniteNumber(pickFilled(summary.putPremium, summary.putsPremium, summary.putsNotional, summary.put_notional, summary.putValue));
      const callPremiumAlt = toFiniteNumber(pickFilled(summary.callNotional, summary.callsNotionalUsd));
      const putPremiumAlt = toFiniteNumber(pickFilled(summary.putNotional, summary.putsNotionalUsd));
      const totalPremiumRaw = toFiniteNumber(pickFilled(summary.totalPremium, summary.totalNotional, summary.totalFlow, summary.premiumTotal));
      const putCallRatio = toFiniteNumber(pickFilled(summary.putCallRatio, summary.pcr, summary.put_call_ratio, summary.callPutRatio, data?.bySymbol?.[0]?.callPutRatio));
      const netPremium = toFiniteNumber(pickFilled(summary.netPremium, summary.netFlow, summary.net_notional));
      const ivRank = toFiniteNumber(pickFilled(summary.ivRank, summary.iv_rank, summary.impliedVolRank, summary.ivr));
      const flowScore = toFiniteNumber(pickFilled(summary.flowScore, summary.score, summary.confidence, summary.flow_strength));

      const sweepsRaw = Array.isArray(data.sweeps)
        ? data.sweeps
        : (Array.isArray(data.trades)
          ? data.trades
          : (Array.isArray(data.rows)
            ? data.rows
            : (Array.isArray(data.flow)
              ? data.flow
              : (Array.isArray(data?.bySymbol?.[0]?.topContracts) ? data.bySymbol[0].topContracts : []))));
      const refPrice = Number(app.quote?.price || 0);
      const sweeps = sweepsRaw.slice(0, 20).map((row) => normalizeFlowSweepRow(row, refPrice)).filter((row) => row.premium > 0 || row.contracts > 0);

      const resolvedCallPremium = Number.isFinite(callPremium)
        ? callPremium
        : (Number.isFinite(callPremiumAlt) ? callPremiumAlt : null);
      const callPremiumResolved = Number.isFinite(resolvedCallPremium)
        ? resolvedCallPremium
        : sweeps.filter((x) => x.side === "call").reduce((sum, x) => sum + Number(x.premium || 0), 0);
      const resolvedPutPremium = Number.isFinite(putPremium)
        ? putPremium
        : (Number.isFinite(putPremiumAlt) ? putPremiumAlt : null);
      const putPremiumResolved = Number.isFinite(resolvedPutPremium)
        ? resolvedPutPremium
        : sweeps.filter((x) => x.side === "put").reduce((sum, x) => sum + Number(x.premium || 0), 0);
      const resolvedTotal = Number.isFinite(totalPremiumRaw) ? totalPremiumRaw : (callPremiumResolved + putPremiumResolved);
      const resolvedRatio = Number.isFinite(putCallRatio)
        ? putCallRatio
        : (callPremiumResolved > 0 ? putPremiumResolved / callPremiumResolved : 1);
      const resolvedNet = Number.isFinite(netPremium) ? netPremium : (callPremiumResolved - putPremiumResolved);
      const resolvedScore = Number.isFinite(flowScore)
        ? Math.max(0, Math.min(100, Math.round(flowScore <= 1 ? flowScore * 100 : flowScore)))
        : Math.max(0, Math.min(100, Math.round((1.35 - Math.min(1.35, Math.max(0.65, resolvedRatio))) * 100)));

      const flow = {
        symbol,
        horizon,
        source: "live",
        updatedAt: new Date().toISOString(),
        snapshot: {
          callPremium: callPremiumResolved,
          putPremium: putPremiumResolved,
          totalPremium: resolvedTotal,
          putCallRatio: resolvedRatio,
          netPremium: resolvedNet,
          ivRank: Number.isFinite(ivRank) ? ivRank : 0,
          flowScore: resolvedScore
        },
        sweeps,
        levels: Array.isArray(data.levels) ? data.levels : [],
        summary: String(pickFilled(data.summaryText, data.commentary, data.note, "") || "")
      };
      flow.snapshot.flowBias = optionFlowBias(flow.snapshot);
      if (!Number.isFinite(flow.snapshot.callPremium) && !Number.isFinite(flow.snapshot.putPremium) && !flow.sweeps.length) return null;
      return flow;
    }
    function buildFallbackOptionFlow(symbol, horizon) {
      const seed = symbolSeed(symbol);
      const price = Number(app.quote?.price || 100);
      const basePremium = Math.max(350000, Math.round((Number(app.quote?.volume || 2000000) * Math.max(price, 20)) / 28));
      const callPremium = Math.round(basePremium * (0.84 + ((seed % 19) / 100)));
      const putPremium = Math.round(basePremium * (0.66 + ((seed % 23) / 120)));
      const putCallRatio = callPremium > 0 ? putPremium / callPremium : 1;
      const netPremium = callPremium - putPremium;
      const ivRank = Math.max(8, Math.min(92, 24 + (seed % 61)));
      const flowScore = Math.max(0, Math.min(100, Math.round((1.35 - Math.min(1.35, Math.max(0.65, putCallRatio))) * 100)));
      const atm = Math.max(1, Math.round(price));
      const step = price >= 300 ? 10 : price >= 100 ? 5 : 2.5;
      const strikes = [atm - 2 * step, atm - step, atm, atm + step, atm + 2 * step].map((x) => Number(x.toFixed(2)));
      const sweeps = [
        { side: "call", strike: strikes[3], expiry: horizon === "0DTE" ? "Today" : "Near-term", premium: Math.round(callPremium * 0.21), contracts: 920 + (seed % 240) },
        { side: "call", strike: strikes[4], expiry: horizon === "MONTHLY" ? "30D" : "14D", premium: Math.round(callPremium * 0.14), contracts: 610 + (seed % 170) },
        { side: "put", strike: strikes[1], expiry: horizon === "0DTE" ? "Today" : "7D", premium: Math.round(putPremium * 0.16), contracts: 670 + (seed % 190) },
        { side: "call", strike: strikes[2], expiry: "Weekly", premium: Math.round(callPremium * 0.12), contracts: 720 + (seed % 220) },
        { side: "put", strike: strikes[0], expiry: horizon === "MONTHLY" ? "45D" : "21D", premium: Math.round(putPremium * 0.13), contracts: 540 + (seed % 140) }
      ];
      const levels = [
        { name: "Call Wall", value: strikes[4], note: "Likely resistance where dealer hedging can cap upside." },
        { name: "Put Wall", value: strikes[0], note: "Key downside strike where protection demand concentrates." },
        { name: "Gamma Flip", value: strikes[2], note: "Above this level, gamma typically supports trend continuation." },
        { name: "Max Pain", value: strikes[2], note: "Pinning zone into expiration if flows balance out." }
      ];
      const snapshot = {
        callPremium,
        putPremium,
        totalPremium: callPremium + putPremium,
        putCallRatio,
        netPremium,
        ivRank,
        flowScore,
        flowBias: optionFlowBias({ putCallRatio, netPremium })
      };
      return {
        symbol,
        horizon,
        source: "fallback",
        updatedAt: new Date().toISOString(),
        snapshot,
        sweeps,
        levels,
        summary: `Fallback model for ${symbol}: ${snapshot.flowBias} flow with ${putCallRatio.toFixed(2)} put/call ratio and ${formatCompact(callPremium + putPremium)} total premium.`
      };
    }
    function proHorizonToTimeframe(horizon) {
      const h = String(horizon || "0DTE").toUpperCase();
      if (h === "0DTE") return "15M";
      if (h === "WEEKLY") return "1H";
      return "1D";
    }

    function proSectionMeta(sectionId) {
      const section = PRO_TRADER_SECTIONS.find((x) => x.id === sectionId);
      return section || PRO_TRADER_SECTIONS[0];
    }

    function proSignedPct(value, digits = 2) {
      const n = Number(value);
      if (!Number.isFinite(n)) return "--";
      return `${n >= 0 ? "+" : ""}${n.toFixed(digits)}%`;
    }

    function proLevelValue(levels, matcher) {
      if (!Array.isArray(levels)) return null;
      for (const level of levels) {
        const name = String(pickFilled(level?.name, level?.label, level?.title, "") || "").toLowerCase();
        if (!name || !matcher.test(name)) continue;
        const value = toFiniteNumber(pickFilled(level?.value, level?.strike, level?.price));
        if (Number.isFinite(value)) return value;
      }
      return null;
    }

    function proFormatBand(low, high) {
      const l = Number(low);
      const h = Number(high);
      if (!Number.isFinite(l) && !Number.isFinite(h)) return "--";
      if (Number.isFinite(l) && Number.isFinite(h)) return `${formatMoney(Math.min(l, h))} - ${formatMoney(Math.max(l, h))}`;
      return Number.isFinite(l) ? `>= ${formatMoney(l)}` : `<= ${formatMoney(h)}`;
    }

    function proRr(entry, stop, target, side = "long") {
      const e = Number(entry);
      const s = Number(stop);
      const t = Number(target);
      if (!Number.isFinite(e) || !Number.isFinite(s) || !Number.isFinite(t)) return "--";
      const risk = Math.max(0.01, Math.abs(e - s));
      const reward = side === "short" ? Math.max(0, e - t) : Math.max(0, t - e);
      return `${(reward / risk).toFixed(2)}:1`;
    }

    function proTwo(value) {
      const n = Number(value);
      return Number.isFinite(n) ? Number(n.toFixed(2)) : null;
    }

    function proRangePct(low, high, current) {
      const l = Number(low);
      const h = Number(high);
      const c = Number(current);
      if (!Number.isFinite(l) || !Number.isFinite(h) || !Number.isFinite(c) || h <= l) return 50;
      const pct = ((c - l) / (h - l)) * 100;
      return Math.max(0, Math.min(100, pct));
    }

    function buildProTraderViewModel() {
      const pro = app.proTrader || {};
      const symbol = String(pro.symbol || app.selected || "SPY").toUpperCase();
      const horizon = String(pro.horizon || "0DTE").toUpperCase();
      const quote = (pro.quote && typeof pro.quote === "object") ? pro.quote : {};
      const technical = (pro.technical && typeof pro.technical === "object") ? pro.technical : {};
      const fundamentals = (pro.fundamentals && typeof pro.fundamentals === "object") ? pro.fundamentals : {};
      const snapshot = (pro.snapshot && typeof pro.snapshot === "object") ? pro.snapshot : {};
      const levels = Array.isArray(pro.levels) ? pro.levels : [];
      const sweeps = Array.isArray(pro.sweeps) ? pro.sweeps : [];
      const news = Array.isArray(pro.news) ? pro.news : [];
      const bars = Array.isArray(pro.bars) ? pro.bars : [];
      const price = Number(quote.price || technical.close || app.quote?.price || 0);
      const prevClose = Number(quote.previousClose || quote.prevClose || quote.open || 0);

      const highs = bars.map((b) => Number(b.high || b.close || b.price)).filter((x) => Number.isFinite(x));
      const lows = bars.map((b) => Number(b.low || b.close || b.price)).filter((x) => Number.isFinite(x));
      const barHigh = highs.length ? Math.max(...highs) : null;
      const barLow = lows.length ? Math.min(...lows) : null;
      const dayHighRaw = pickFilled(quote.dayHigh, quote.high, barHigh);
      const dayLowRaw = pickFilled(quote.dayLow, quote.low, barLow);
      const dayHigh = Number.isFinite(Number(dayHighRaw)) ? Number(dayHighRaw) : (Number.isFinite(price) ? price * 1.02 : null);
      const dayLow = Number.isFinite(Number(dayLowRaw)) ? Number(dayLowRaw) : (Number.isFinite(price) ? price * 0.98 : null);
      const week52HighRaw = pickFilled(quote.yearHigh, quote["52WeekHigh"], fundamentals.yearHigh, technical.high52Week, barHigh);
      const week52LowRaw = pickFilled(quote.yearLow, quote["52WeekLow"], fundamentals.yearLow, technical.low52Week, barLow);
      const week52High = Number.isFinite(Number(week52HighRaw)) ? Number(week52HighRaw) : (Number.isFinite(dayHigh) ? dayHigh * 1.18 : null);
      const week52Low = Number.isFinite(Number(week52LowRaw)) ? Number(week52LowRaw) : (Number.isFinite(dayLow) ? dayLow * 0.82 : null);
      const range = (Number.isFinite(dayHigh) && Number.isFinite(dayLow) && dayHigh > dayLow)
        ? dayHigh - dayLow
        : (Number.isFinite(price) && price > 0 ? price * 0.04 : 5);
      const pivot = Number.isFinite(price) ? (Number.isFinite(dayHigh) && Number.isFinite(dayLow) ? (dayHigh + dayLow + price) / 3 : price) : 0;

      const callWall = proLevelValue(levels, /call wall|resistance|call/) ?? (pivot + range * 0.34);
      const putWall = proLevelValue(levels, /put wall|support|put/) ?? (pivot - range * 0.34);
      const gammaFlip = proLevelValue(levels, /gamma/) ?? pivot;
      const maxPain = proLevelValue(levels, /max pain|pain/) ?? pivot;
      const support1 = proTwo(Math.min(putWall, gammaFlip - range * 0.18));
      const support2 = proTwo((support1 ?? putWall) - range * 0.26);
      const resistance1 = proTwo(Math.max(callWall, gammaFlip + range * 0.18));
      const resistance2 = proTwo((resistance1 ?? callWall) + range * 0.26);

      const flowBias = String(snapshot.flowBias || optionFlowBias(snapshot));
      const putCallRatio = Number(snapshot.putCallRatio || 0);
      const netPremium = Number(snapshot.netPremium || 0);
      const callPremium = Number(snapshot.callPremium || 0);
      const putPremium = Number(snapshot.putPremium || 0);
      const totalPremium = Number(snapshot.totalPremium || (callPremium + putPremium) || 0);
      const flowScore = Number(snapshot.flowScore || 0);
      const trend = String(technical.trend || "Mixed");
      const momentum = String(technical.momentum || "Neutral");

      const topSweeps = sweeps
        .map((row) => ({
          side: String(row.side || "call").toLowerCase().includes("put") ? "put" : "call",
          strike: Number(row.strike || 0),
          premium: Number(row.premium || 0),
          contracts: Number(row.contracts || 0),
          expiry: String(row.expiry || "Near-term")
        }))
        .sort((a, b) => Number(b.premium || 0) - Number(a.premium || 0));
      const topStrike = topSweeps.find((x) => Number.isFinite(x.strike));

      const otmCallPremium = topSweeps
        .filter((x) => x.side === "call" && Number.isFinite(x.strike) && Number.isFinite(price) && x.strike > price)
        .reduce((sum, x) => sum + Number(x.premium || 0), 0);
      const gammaRatio = totalPremium > 0 ? otmCallPremium / totalPremium : 0;
      const gammaLabel = gammaRatio >= 0.4 ? "High" : (gammaRatio >= 0.22 ? "Moderate" : "Low");

      const longEntryLow = proTwo((support1 ?? putWall) + range * 0.06);
      const longEntryHigh = proTwo(gammaFlip);
      const longStop = proTwo((support1 ?? putWall) - range * 0.16);
      const longT1 = proTwo(resistance1 ?? callWall);
      const longT2 = proTwo((resistance2 ?? callWall) + range * 0.16);
      const longT3 = proTwo((resistance2 ?? callWall) + range * 0.4);

      const shortEntryLow = proTwo(gammaFlip);
      const shortEntryHigh = proTwo((resistance1 ?? callWall) - range * 0.06);
      const shortStop = proTwo((resistance1 ?? callWall) + range * 0.16);
      const shortT1 = proTwo(support1 ?? putWall);
      const shortT2 = proTwo((support2 ?? putWall) - range * 0.1);
      const shortT3 = proTwo((support2 ?? putWall) - range * 0.32);

      const r1 = proTwo(pivot + range * 0.48);
      const r2 = proTwo(pivot + range * 0.82);
      const r3 = proTwo(pivot + range * 1.12);
      const s1 = proTwo(pivot - range * 0.48);
      const s2 = proTwo(pivot - range * 0.82);
      const s3 = proTwo(pivot - range * 1.12);

      const institutionalRead = [
        `Market cap ${formatCompact(fundamentals.marketCap || 0)} • Avg volume ${formatCompact(fundamentals.avgVolume || quote.volume || 0)}.`,
        `Valuation: P/E ${Number.isFinite(Number(fundamentals.pe)) ? Number(fundamentals.pe).toFixed(2) : "--"} | EPS ${Number.isFinite(Number(fundamentals.eps)) ? Number(fundamentals.eps).toFixed(2) : "--"} | Beta ${Number.isFinite(Number(fundamentals.beta)) ? Number(fundamentals.beta).toFixed(2) : "--"}.`,
        `${fundamentals.sector || "Sector N/A"}${fundamentals.industry ? ` / ${fundamentals.industry}` : ""}.`
      ].join("\n");

      return {
        symbol,
        horizon,
        source: String(pro.source || "fallback"),
        updatedAt: pro.updatedAt || "",
        name: String(pickFilled(quote.name, fundamentals.companyName, fundamentals.name, "") || ""),
        price,
        prevClose,
        dayHigh,
        dayLow,
        week52High,
        week52Low,
        pivot,
        range,
        trend,
        momentum,
        quote,
        technical,
        fundamentals,
        snapshot: {
          flowBias,
          putCallRatio,
          netPremium,
          callPremium,
          putPremium,
          totalPremium,
          flowScore,
          ivRank: Number(snapshot.ivRank || 0)
        },
        sweeps: topSweeps.slice(0, 18),
        levels,
        news: news.slice(0, 20),
        support1,
        support2,
        resistance1,
        resistance2,
        callWall: proTwo(callWall),
        putWall: proTwo(putWall),
        gammaFlip: proTwo(gammaFlip),
        maxPain: proTwo(maxPain),
        longSetup: {
          entryLow: longEntryLow,
          entryHigh: longEntryHigh,
          stop: longStop,
          t1: longT1,
          t2: longT2,
          t3: longT3,
          rr: proRr(longEntryHigh ?? price, longStop ?? ((support1 ?? putWall) - range * 0.16), longT2 ?? (resistance2 ?? callWall), "long"),
          thesis: `Hold ${formatMoney(gammaFlip)} and confirm breadth before sizing up.`
        },
        shortSetup: {
          entryLow: shortEntryLow,
          entryHigh: shortEntryHigh,
          stop: shortStop,
          t1: shortT1,
          t2: shortT2,
          t3: shortT3,
          rr: proRr(shortEntryLow ?? price, shortStop ?? ((resistance1 ?? callWall) + range * 0.16), shortT2 ?? (support2 ?? putWall), "short"),
          thesis: `Reject ${formatMoney(resistance1 ?? callWall)} with weak momentum for downside continuation.`
        },
        dayTrade: { r3, r2, r1, pivot: proTwo(pivot), s1, s2, s3 },
        swingBull: [
          proTwo((resistance2 ?? callWall) + range * 0.3),
          proTwo((resistance2 ?? callWall) + range * 0.65),
          proTwo((resistance2 ?? callWall) + range * 1.0)
        ],
        swingBear: [
          proTwo((support2 ?? putWall) - range * 0.28),
          proTwo((support2 ?? putWall) - range * 0.62),
          proTwo((support2 ?? putWall) - range * 0.96)
        ],
        topStrike,
        gammaLabel,
        institutionalRead
      };
    }

    function buildProTraderSectionHtml(sectionId, model) {
      const section = proSectionMeta(sectionId);
      const toneStyle = `--tone:${section.tone};--tone-bg:${section.bg};`;
      const kv = (k, v) => `<div class="pro-terminal-kv"><div class="k">${escapeHtml(k)}</div><div class="v">${escapeHtml(String(v))}</div></div>`;
      const sweepRows = model.sweeps.length
        ? model.sweeps.slice(0, 12).map((row) => `<article class="pro-terminal-row"><div class="topline"><span>${escapeHtml(model.symbol)} ${Number.isFinite(row.strike) ? row.strike.toFixed(2) : "--"} ${escapeHtml(row.expiry)}</span><span class="pro-pill ${row.side}">${row.side}</span></div><div class="subline">Premium ${escapeHtml(formatCompact(row.premium || 0))} • Contracts ${escapeHtml(formatLarge(row.contracts || 0))}</div></article>`).join("")
        : `<article class="pro-terminal-row"><div class="subline">No unusual sweeps returned yet.</div></article>`;

      if (sectionId === "technical") {
        return `<article class="pro-terminal-section-card" style="${toneStyle}">
          <div class="pro-terminal-section-head"><div class="title">${escapeHtml(model.symbol)} Technical Structure</div><span class="pro-pill warn">${escapeHtml(model.horizon)}</span></div>
          <div class="pro-terminal-grid-3">
            ${kv("Trend", model.trend)}
            ${kv("Momentum", model.momentum)}
            ${kv("Price", formatMoney(model.price))}
            ${kv("EMA 9", Number.isFinite(Number(model.technical.ema9)) ? Number(model.technical.ema9).toFixed(2) : "--")}
            ${kv("EMA 21", Number.isFinite(Number(model.technical.ema21)) ? Number(model.technical.ema21).toFixed(2) : "--")}
            ${kv("VWAP", Number.isFinite(Number(model.technical.vwap)) ? Number(model.technical.vwap).toFixed(2) : "--")}
            ${kv("RSI", Number.isFinite(Number(model.technical.rsi)) ? Number(model.technical.rsi).toFixed(2) : "--")}
            ${kv("MACD", Number.isFinite(Number(model.technical.macdLine)) ? Number(model.technical.macdLine).toFixed(3) : "--")}
            ${kv("Signal", Number.isFinite(Number(model.technical.macdSignal)) ? Number(model.technical.macdSignal).toFixed(3) : "--")}
          </div>
          <div class="pro-terminal-note">Session range ${proFormatBand(model.dayLow, model.dayHigh)} • Pivot ${formatMoney(model.pivot)}.
${model.symbol} is ${model.trend.toLowerCase()} with ${model.momentum.toLowerCase()} momentum. Confirm reclaim/reject behavior at ${formatMoney(model.gammaFlip)} before full size.</div>
        </article>`;
      }

      if (sectionId === "institutional") {
        const newsRows = model.news.length
          ? model.news.slice(0, 5).map((n, i) => `<article class="pro-terminal-row"><div class="topline"><span>${i + 1}. ${escapeHtml(n.title || "Market headline")}</span></div><div class="subline">${escapeHtml(n.source || "Live feed")} • ${escapeHtml(n.tag || model.symbol)}</div></article>`).join("")
          : `<article class="pro-terminal-row"><div class="subline">No live headlines returned.</div></article>`;
        return `<article class="pro-terminal-section-card" style="${toneStyle}">
          <div class="pro-terminal-section-head"><div class="title">Institutional Positioning</div><span class="pro-pill warn">${escapeHtml(model.fundamentals.recommendation || "Live read")}</span></div>
          <div class="pro-terminal-grid-2">
            <div class="pro-terminal-card">
              <div class="k">Fundamental Snapshot</div>
              <div class="pro-terminal-grid-2">
                ${kv("Market Cap", formatCompact(model.fundamentals.marketCap || 0))}
                ${kv("P/E", Number.isFinite(Number(model.fundamentals.pe)) ? Number(model.fundamentals.pe).toFixed(2) : "--")}
                ${kv("EPS", Number.isFinite(Number(model.fundamentals.eps)) ? Number(model.fundamentals.eps).toFixed(2) : "--")}
                ${kv("Beta", Number.isFinite(Number(model.fundamentals.beta)) ? Number(model.fundamentals.beta).toFixed(2) : "--")}
                ${kv("Avg Volume", formatCompact(model.fundamentals.avgVolume || model.quote.volume || 0))}
                ${kv("Earnings", formatDateShort(model.fundamentals.earningsDate))}
              </div>
              <div class="pro-terminal-note">${escapeHtml(model.institutionalRead)}</div>
            </div>
            <div class="pro-terminal-card">
              <div class="k">Top Catalysts</div>
              <div class="pro-terminal-list">${newsRows}</div>
            </div>
          </div>
        </article>`;
      }

      if (sectionId === "options") {
        return `<article class="pro-terminal-section-card" style="${toneStyle}">
          <div class="pro-terminal-section-head"><div class="title">Options Flow Tape</div><span class="pro-pill ${model.snapshot.flowBias === "Bearish" ? "put" : "call"}">${escapeHtml(model.snapshot.flowBias)}</span></div>
          <div class="pro-terminal-grid-3">
            ${kv("Call Premium", formatCompact(model.snapshot.callPremium || 0))}
            ${kv("Put Premium", formatCompact(model.snapshot.putPremium || 0))}
            ${kv("Net Premium", formatCompact(model.snapshot.netPremium || 0))}
            ${kv("Put/Call", Number.isFinite(model.snapshot.putCallRatio) ? model.snapshot.putCallRatio.toFixed(2) : "--")}
            ${kv("Flow Score", `${Math.round(model.snapshot.flowScore || 0)}`)}
            ${kv("IV Rank", Number.isFinite(model.snapshot.ivRank) ? model.snapshot.ivRank.toFixed(0) : "--")}
          </div>
          <div class="pro-terminal-note">${escapeHtml(String(app.proTrader.summary || `Flow read for ${model.symbol}: ${model.snapshot.flowBias} with ${Number.isFinite(model.snapshot.putCallRatio) ? model.snapshot.putCallRatio.toFixed(2) : "--"} put/call ratio.`))}</div>
          <div class="pro-terminal-list">${sweepRows}</div>
        </article>`;
      }

      if (sectionId === "levels") {
        return `<article class="pro-terminal-section-card" style="${toneStyle}">
          <div class="pro-terminal-section-head"><div class="title">${escapeHtml(model.symbol)} Support / Resistance Map</div><span class="pro-pill warn">${escapeHtml(model.horizon)}</span></div>
          <div class="pro-terminal-grid-3">
            ${kv("Support 1", formatMoney(model.support1))}
            ${kv("Support 2", formatMoney(model.support2))}
            ${kv("Pivot", formatMoney(model.pivot))}
            ${kv("Gamma Flip", formatMoney(model.gammaFlip))}
            ${kv("Resistance 1", formatMoney(model.resistance1))}
            ${kv("Resistance 2", formatMoney(model.resistance2))}
            ${kv("Put Wall", formatMoney(model.putWall))}
            ${kv("Call Wall", formatMoney(model.callWall))}
            ${kv("Max Pain", formatMoney(model.maxPain))}
          </div>
          <div class="pro-terminal-note">Use this map as the reaction framework. Break + hold above resistance confirms continuation. Rejection under gamma flip shifts to defensive posture.</div>
        </article>`;
      }

      if (sectionId === "liquidity") {
        const zones = [
          { zone: proFormatBand(model.support2, model.support1), type: "BUY-SIDE", desc: "Demand zone from recent lows and protection flow." },
          { zone: proFormatBand(model.gammaFlip - model.range * 0.12, model.gammaFlip + model.range * 0.12), type: "EQUILIBRIUM", desc: "Balance zone where momentum decides direction." },
          { zone: proFormatBand(model.resistance1, model.resistance2), type: "SELL-SIDE", desc: "Supply zone near call wall and overhead liquidity." }
        ];
        const zoneRows = zones.map((z) => `<article class="pro-terminal-row"><div class="topline"><span>${escapeHtml(z.zone)}</span><span class="pro-pill ${z.type === "SELL-SIDE" ? "put" : (z.type === "BUY-SIDE" ? "call" : "warn")}">${escapeHtml(z.type)}</span></div><div class="subline">${escapeHtml(z.desc)}</div></article>`).join("");
        return `<article class="pro-terminal-section-card" style="${toneStyle}">
          <div class="pro-terminal-section-head"><div class="title">Liquidity Zones</div><span class="pro-pill warn">Execution map</span></div>
          <div class="pro-terminal-grid-2">
            <div class="pro-terminal-card">
              <div class="k">Zones</div>
              <div class="pro-terminal-list">${zoneRows}</div>
            </div>
            <div class="pro-terminal-card">
              <div class="k">Largest Sweeps</div>
              <div class="pro-terminal-list">${sweepRows}</div>
            </div>
          </div>
        </article>`;
      }

      if (sectionId === "long") {
        const ls = model.longSetup;
        return `<article class="pro-terminal-section-card" style="${toneStyle}">
          <div class="pro-terminal-section-head"><div class="title">Best Long Setup</div><span class="pro-pill call">Long Bias</span></div>
          <div class="pro-terminal-grid-2">
            ${kv("Entry", proFormatBand(ls.entryLow, ls.entryHigh))}
            ${kv("Trigger", `Hold ${formatMoney(model.gammaFlip)} + breadth confirm`)}
            ${kv("Stop", formatMoney(ls.stop))}
            ${kv("Target 1", formatMoney(ls.t1))}
            ${kv("Target 2", formatMoney(ls.t2))}
            ${kv("Target 3", formatMoney(ls.t3))}
            ${kv("R:R", ls.rr)}
            ${kv("Timeframe", model.horizon === "0DTE" ? "Intraday" : (model.horizon === "WEEKLY" ? "1-5 sessions" : "2-4 weeks"))}
          </div>
          <div class="pro-terminal-note">${escapeHtml(ls.thesis)}</div>
        </article>`;
      }

      if (sectionId === "short") {
        const ss = model.shortSetup;
        return `<article class="pro-terminal-section-card" style="${toneStyle}">
          <div class="pro-terminal-section-head"><div class="title">Best Short Setup</div><span class="pro-pill put">Short Bias</span></div>
          <div class="pro-terminal-grid-2">
            ${kv("Entry", proFormatBand(ss.entryLow, ss.entryHigh))}
            ${kv("Trigger", `Reject ${formatMoney(model.resistance1)} with weak reclaim`)}
            ${kv("Stop", formatMoney(ss.stop))}
            ${kv("Target 1", formatMoney(ss.t1))}
            ${kv("Target 2", formatMoney(ss.t2))}
            ${kv("Target 3", formatMoney(ss.t3))}
            ${kv("R:R", ss.rr)}
            ${kv("Timeframe", model.horizon === "MONTHLY" ? "1-4 weeks" : "Intraday to swing")}
          </div>
          <div class="pro-terminal-note">${escapeHtml(ss.thesis)}</div>
        </article>`;
      }

      if (sectionId === "swing") {
        const bullRows = model.swingBull.map((target, idx) => `<article class="pro-terminal-row"><div class="topline"><span>Bull Target ${idx + 1}</span><span class="pro-pill call">${formatMoney(target)}</span></div><div class="subline">Continuation objective if ${formatMoney(model.resistance1)} breaks on volume.</div></article>`).join("");
        const bearRows = model.swingBear.map((target, idx) => `<article class="pro-terminal-row"><div class="topline"><span>Bear Target ${idx + 1}</span><span class="pro-pill put">${formatMoney(target)}</span></div><div class="subline">Downside objective if ${formatMoney(model.support1)} fails.</div></article>`).join("");
        return `<article class="pro-terminal-section-card" style="${toneStyle}">
          <div class="pro-terminal-section-head"><div class="title">Swing Targets</div><span class="pro-pill warn">Multi-session</span></div>
          <div class="pro-terminal-grid-2">
            <div class="pro-terminal-card"><div class="k">Bullish Path</div><div class="pro-terminal-list">${bullRows}</div></div>
            <div class="pro-terminal-card"><div class="k">Bearish Path</div><div class="pro-terminal-list">${bearRows}</div></div>
          </div>
        </article>`;
      }

      if (sectionId === "daytrade") {
        const levels = [
          { label: "R3", price: model.dayTrade.r3, note: "Extended upside objective", cls: "put" },
          { label: "R2", price: model.dayTrade.r2, note: "Momentum continuation zone", cls: "put" },
          { label: "R1", price: model.dayTrade.r1, note: "First resistance", cls: "put" },
          { label: "PVT", price: model.dayTrade.pivot, note: "Balance pivot", cls: "warn" },
          { label: "S1", price: model.dayTrade.s1, note: "First support", cls: "call" },
          { label: "S2", price: model.dayTrade.s2, note: "Secondary support", cls: "call" },
          { label: "S3", price: model.dayTrade.s3, note: "Capitulation support", cls: "call" }
        ];
        const rows = levels.map((x) => `<article class="pro-terminal-row"><div class="topline"><span>${x.label}</span><span class="pro-pill ${x.cls}">${formatMoney(x.price)}</span></div><div class="subline">${x.note}</div></article>`).join("");
        return `<article class="pro-terminal-section-card" style="${toneStyle}">
          <div class="pro-terminal-section-head"><div class="title">Day Trade Levels</div><span class="pro-pill warn">${escapeHtml(model.horizon)}</span></div>
          <div class="pro-terminal-list">${rows}</div>
        </article>`;
      }

      if (sectionId === "livenews") {
        const rows = model.news.length
          ? model.news.slice(0, 14).map((n, i) => {
              const link = String(n.url || n.link || "#");
              const when = n.publishedAt ? (() => {
                const d = new Date(n.publishedAt);
                return Number.isNaN(d.getTime()) ? "--" : d.toLocaleString();
              })() : "--";
              const summary = String(n.summary || "").trim();
              const image = String(n.image || "").trim();
              const canOpen = /^https?:\/\//i.test(link);
              return `<article class="pro-terminal-row">
                <div class="topline"><span>${i + 1}. ${escapeHtml(n.title || "Market headline")}</span><span class="pro-pill warn">${escapeHtml(String(n.category || n.tag || model.symbol))}</span></div>
                <div class="subline">${escapeHtml(String(n.source || "Live feed"))} • ${escapeHtml(when)}</div>
                ${summary ? `<div class="subline">${escapeHtml(summary)}</div>` : ""}
                ${image ? `<div><img src="${escapeHtml(image)}" alt="news image" style="width:100%;max-width:300px;border:1px solid var(--line);border-radius:10px;display:block;" /></div>` : ""}
                ${canOpen ? `<div><a class="ghost tv-link" href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">Open Story</a></div>` : ""}
              </article>`;
            }).join("")
          : `<article class="pro-terminal-row"><div class="subline">No live headlines returned yet. Check API key in Platform Controls, then refresh Pro Trader.</div></article>`;
        return `<article class="pro-terminal-section-card" style="${toneStyle}">
          <div class="pro-terminal-section-head"><div class="title">${escapeHtml(model.symbol)} Live News Feed</div><span class="pro-pill warn">Backend proxy</span></div>
          <div class="pro-terminal-note">Headlines are pulled through your backend proxy endpoint to avoid browser CORS issues and keep API keys out of the frontend.</div>
          <div class="pro-terminal-list">${rows}</div>
        </article>`;
      }

      if (sectionId === "risk") {
        const longRisks = [
          `Failure to hold ${formatMoney(model.support1)} with declining breadth.`,
          `Put/Call ratio above 1.15 while net premium flips negative.`,
          `Macro shock around rates/dollar that compresses risk appetite.`
        ];
        const shortRisks = [
          `Violent reclaim above ${formatMoney(model.resistance1)} with call sweep acceleration.`,
          `Flow score above 70 with improving momentum.`,
          `Headline catalyst squeezes weak shorts into close.`
        ];
        return `<article class="pro-terminal-section-card" style="${toneStyle}">
          <div class="pro-terminal-section-head"><div class="title">Risk Matrix</div><span class="pro-pill warn">Discipline first</span></div>
          <div class="pro-terminal-grid-2">
            <div class="pro-terminal-card">
              <div class="k">Long Failure Risks</div>
              <ul class="pro-risk-list">${longRisks.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
              <div class="pro-terminal-note">Max long loss trigger: close under ${formatMoney(model.support2)} with negative flow follow-through.</div>
            </div>
            <div class="pro-terminal-card">
              <div class="k">Short Failure Risks</div>
              <ul class="pro-risk-list">${shortRisks.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
              <div class="pro-terminal-note">Max short loss trigger: sustained trade above ${formatMoney(model.resistance2)} and rising call premium.</div>
            </div>
          </div>
        </article>`;
      }

      const decoderLabel = model.snapshot.flowBias === "Bullish"
        ? "Aggressive buying"
        : (model.snapshot.flowBias === "Bearish" ? "Aggressive selling" : "Neutral / hedging");
      const decoderClass = model.snapshot.flowBias === "Bullish" ? "call" : (model.snapshot.flowBias === "Bearish" ? "put" : "warn");
      return `<article class="pro-terminal-section-card" style="${toneStyle}">
        <div class="pro-terminal-section-head"><div class="title">Flow Decoder</div><span class="pro-pill ${decoderClass}">${escapeHtml(decoderLabel)}</span></div>
        <div class="pro-terminal-grid-3">
          ${kv("Total Premium", formatCompact(model.snapshot.totalPremium || 0))}
          ${kv("Call / Put", `${formatCompact(model.snapshot.callPremium || 0)} / ${formatCompact(model.snapshot.putPremium || 0)}`)}
          ${kv("Net Premium", formatCompact(model.snapshot.netPremium || 0))}
          ${kv("Flow Score", `${Math.round(model.snapshot.flowScore || 0)}/100`)}
          ${kv("Gamma Squeeze", model.gammaLabel)}
          ${kv("Top Strike", model.topStrike ? `${formatMoney(model.topStrike.strike)} ${String(model.topStrike.side || "").toUpperCase()}` : "--")}
        </div>
        <div class="pro-terminal-note">${model.topStrike
          ? `Top concentration at ${formatMoney(model.topStrike.strike)} (${String(model.topStrike.side || "").toUpperCase()}) with ${formatCompact(model.topStrike.premium || 0)} premium. Use this level as the key reaction zone.`
          : "No concentrated strike returned yet. Wait for larger sweeps to confirm directional intent."}</div>
        <div class="pro-terminal-list">${sweepRows}</div>
      </article>`;
    }

    function renderProTrader() {
      if (!el.proFlowMetrics || !el.proFlowStatus || !el.proFlowSectionTabs || !el.proFlowSectionBody) return;
      const pro = app.proTrader || {};
      const symbol = String(pro.symbol || app.selected || "SPY").toUpperCase();
      const horizon = String(pro.horizon || "0DTE").toUpperCase();
      const updated = pro.updatedAt ? new Date(pro.updatedAt).toLocaleTimeString() : "--";
      const model = buildProTraderViewModel();
      const sectionId = PRO_TRADER_SECTION_IDS.includes(String(pro.activeSection || "").toLowerCase())
        ? String(pro.activeSection).toLowerCase()
        : PRO_TRADER_SECTIONS[0].id;
      const bias = String(model.snapshot.flowBias || "Neutral");
      const biasClass = bias === "Bullish" ? "good" : (bias === "Bearish" ? "bad" : "mid");
      const pcr = Number(model.snapshot.putCallRatio || 0);
      const score = Number(model.snapshot.flowScore || 0);
      const scoreClass = score >= 67 ? "good" : (score <= 40 ? "bad" : "mid");
      const metrics = [
        { k: "Price", v: formatMoney(model.price), cls: Number(model.quote.changesPercentage || model.quote.changePct || 0) >= 0 ? "good" : "bad" },
        { k: "Change", v: proSignedPct(model.quote.changesPercentage ?? model.quote.changePct ?? ((model.price && model.prevClose) ? ((model.price - model.prevClose) / model.prevClose) * 100 : 0)), cls: Number(model.quote.changesPercentage || model.quote.changePct || 0) >= 0 ? "good" : "bad" },
        { k: "Trend", v: model.trend, cls: model.trend === "Bullish" ? "good" : (model.trend === "Bearish" ? "bad" : "mid") },
        { k: "Flow Bias", v: bias, cls: biasClass },
        { k: "Put / Call", v: Number.isFinite(pcr) ? pcr.toFixed(2) : "--", cls: pcr <= 0.9 ? "good" : (pcr >= 1.15 ? "bad" : "mid") },
        { k: "Flow Score", v: `${Math.round(score || 0)}`, cls: scoreClass }
      ];
      if (el.proFlowQuick) {
        const quickSymbols = [...new Set([symbol, ...(Array.isArray(app.watchlist) ? app.watchlist : []), "SPY", "QQQ", "NVDA", "TSLA", "AAPL", "AMZN", "META", "MSFT"])]
          .map((x) => String(x || "").trim().toUpperCase())
          .filter(Boolean)
          .slice(0, 12);
        el.proFlowQuick.innerHTML = quickSymbols.map((s) => `<button type="button" class="pro-quick-btn ${s === symbol ? "active" : ""}" data-pro-quick="${escapeHtml(s)}">${escapeHtml(s)}</button>`).join("");
        el.proFlowQuick.querySelectorAll("button[data-pro-quick]").forEach((btn) => {
          btn.addEventListener("click", async () => {
            const next = String(btn.getAttribute("data-pro-quick") || "").trim().toUpperCase();
            if (!next) return;
            app.selected = next;
            if (!app.watchlist.includes(next)) app.watchlist.unshift(next);
            try {
              await refreshSelectedSymbol();
              await refreshProTraderFlow(next, false);
              renderAll();
              saveSettingsLocal();
            } catch {
              renderProTrader();
            }
          });
        });
      }
      if (el.proFlowHero) {
        const dayPct = proRangePct(model.dayLow, model.dayHigh, model.price);
        const y52Pct = proRangePct(model.week52Low, model.week52High, model.price);
        const heroStats = [
          { k: "P/E", v: Number.isFinite(Number(model.fundamentals.pe)) ? Number(model.fundamentals.pe).toFixed(2) : "--", c: "" },
          { k: "Beta", v: Number.isFinite(Number(model.fundamentals.beta)) ? Number(model.fundamentals.beta).toFixed(2) : "--", c: "" },
          { k: "RSI", v: Number.isFinite(Number(model.technical.rsi)) ? Number(model.technical.rsi).toFixed(2) : "--", c: Number(model.technical.rsi) >= 60 ? "color:#10b981;" : (Number(model.technical.rsi) <= 40 ? "color:#f43f5e;" : "") },
          { k: "IV Rank", v: Number.isFinite(Number(model.snapshot.ivRank)) ? `${Number(model.snapshot.ivRank).toFixed(0)}%` : "--", c: "" },
          { k: "Market Cap", v: formatCompact(model.fundamentals.marketCap || 0), c: "" },
          { k: "Avg Vol", v: formatCompact(model.fundamentals.avgVolume || model.quote.volume || 0), c: "" }
        ];
        el.proFlowHero.innerHTML = `
          <div class="pro-hero-head">
            <div>
              <div class="pro-hero-title">${escapeHtml(model.symbol)}</div>
              <div class="pro-hero-sub">${escapeHtml(model.name || "Hedge Fund Analysis Terminal")} • ${escapeHtml(horizon)} Focus</div>
            </div>
            <span class="pro-pill ${bias === "Bullish" ? "call" : (bias === "Bearish" ? "put" : "warn")}">${escapeHtml(bias)} Bias</span>
          </div>
          <div class="pro-range-grid">
            <div class="pro-range-wrap">
              <div class="pro-range-meta"><span>Day Range</span><span>${escapeHtml(formatMoney(model.price))}</span></div>
              <div class="pro-range-track" style="--pct:${dayPct.toFixed(2)}%;"><div class="pro-range-fill"></div><div class="pro-range-dot"></div></div>
              <div class="pro-range-values"><span>${escapeHtml(formatMoney(model.dayLow))}</span><span>${escapeHtml(formatMoney(model.dayHigh))}</span></div>
            </div>
            <div class="pro-range-wrap">
              <div class="pro-range-meta"><span>52-Week Range</span><span>${escapeHtml(formatMoney(model.price))}</span></div>
              <div class="pro-range-track" style="--pct:${y52Pct.toFixed(2)}%;"><div class="pro-range-fill"></div><div class="pro-range-dot"></div></div>
              <div class="pro-range-values"><span>${escapeHtml(formatMoney(model.week52Low))}</span><span>${escapeHtml(formatMoney(model.week52High))}</span></div>
            </div>
          </div>
          <div class="pro-terminal-grid-3">
            ${heroStats.map((s) => `<div class="pro-terminal-kv"><div class="k">${escapeHtml(s.k)}</div><div class="v" style="${s.c}">${escapeHtml(String(s.v))}</div></div>`).join("")}
          </div>`;
      }
      el.proFlowMetrics.innerHTML = metrics.map((m) => `<div class="pro-terminal-metric ${m.cls}"><div class="k">${escapeHtml(m.k)}</div><div class="v">${escapeHtml(String(m.v))}</div></div>`).join("");

      el.proFlowSectionTabs.innerHTML = PRO_TRADER_SECTIONS.map((s) => `<button type="button" class="pro-terminal-tab ${s.id === sectionId ? "active" : ""}" style="--tone:${s.tone};--tone-bg:${s.bg};" data-pro-sec="${s.id}">${escapeHtml(s.label)}</button>`).join("");
      el.proFlowSectionTabs.querySelectorAll("button[data-pro-sec]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const next = String(btn.getAttribute("data-pro-sec") || "").toLowerCase();
          if (!PRO_TRADER_SECTION_IDS.includes(next)) return;
          app.proTrader.activeSection = next;
          renderProTrader();
          saveSettingsLocal();
        });
      });

      el.proFlowSectionBody.innerHTML = buildProTraderSectionHtml(sectionId, model);
      el.proFlowStatus.textContent = `${pro.source === "live" ? "Live Data" : "Fallback"} • ${symbol} • ${horizon} • ${updated}`;
      if (el.proFlowSymbol) el.proFlowSymbol.value = symbol;
      if (el.proFlowHorizon) el.proFlowHorizon.value = horizon;
      if (el.proFlowOpenTv) {
        el.proFlowOpenTv.setAttribute("data-tv-open", symbol);
        el.proFlowOpenTv.setAttribute("data-tv-interval", "1D");
      }
    }

    async function refreshProTraderFlow(forceSymbol = "", silent = false) {
      const symbol = String(forceSymbol || el.proFlowSymbol?.value || app.selected || "SPY").trim().toUpperCase();
      const horizon = String(el.proFlowHorizon?.value || app.proTrader.horizon || "0DTE").trim().toUpperCase();
      if (!symbol) return;
      const now = Date.now();
      if (silent && symbol === app.proTrader.symbol && horizon === app.proTrader.horizon && now - Number(app.proTrader.lastFetchTs || 0) < 60000) {
        renderProTrader();
        return;
      }
      if (!silent && el.proFlowStatus) el.proFlowStatus.textContent = `Loading live data • ${symbol}...`;

      const encodedSymbol = encodeURIComponent(symbol);
      const encodedHorizon = encodeURIComponent(horizon);
      const timeframe = proHorizonToTimeframe(horizon);
      const suffix = providerQuerySuffix();

      const [quoteRows, marketFundamentals, yahooFundamentals, yahooQuoteRows, candles, newsRows, liveNewsPayload] = await Promise.all([
        directFetchSafe(`/api/market/quote?symbols=${encodedSymbol}${suffix}`, []),
        directFetchSafe(`/api/market/fundamentals?symbol=${encodedSymbol}${suffix}`, {}),
        directFetchSafe(`/api/yahoo/fundamentals?symbol=${encodedSymbol}`, {}),
        directFetchSafe(`/api/yahoo/quote?symbols=${encodedSymbol}`, []),
        directFetchSafe(`/api/yahoo/candles?symbol=${encodedSymbol}&timeframe=${encodeURIComponent(timeframe)}`, { bars: [], indicators: {} }),
        directFetchSafe(`/api/market/news?tickers=${encodedSymbol}&limit=8${suffix}`, []),
        directFetchSafe(`/api/news/${encodedSymbol}?limit=20${suffix}`, null)
      ]);

      let flow = null;
      const attempts = [
        `/api/market/options-flow?symbols=${encodedSymbol}&limit=24${suffix}`,
        `/api/options/flow?symbol=${encodedSymbol}&horizon=${encodedHorizon}${suffix}`,
        `/api/yahoo/options-flow?symbol=${encodedSymbol}&horizon=${encodedHorizon}`
      ];
      for (const route of attempts) {
        try {
          const payload = await directFetch(route);
          flow = normalizeOptionFlowPayload(payload, symbol, horizon);
          if (flow) break;
        } catch {}
      }
      if (!flow && app.token) {
        for (const route of [
          `/api/market/options-flow?symbols=${encodedSymbol}&limit=24`,
          `/api/options/flow?symbol=${encodedSymbol}&horizon=${encodedHorizon}`
        ]) {
          try {
            const payload = await apiFetch(route);
            flow = normalizeOptionFlowPayload(payload, symbol, horizon);
            if (flow) break;
          } catch {}
        }
      }
      if (!flow) flow = buildFallbackOptionFlow(symbol, horizon);

      const directQuote = Array.isArray(quoteRows) && quoteRows.length ? quoteRows[0] : null;
      const yahooQuote = Array.isArray(yahooQuoteRows) && yahooQuoteRows.length ? yahooQuoteRows[0] : null;
      const quote = (directQuote || yahooQuote || {});
      const fundamentals = mergeDeepFundamentals(symbol, marketFundamentals, yahooFundamentals, quote, yahooQuote || {});
      const technical = buildTechnicalSnapshot(candles, quote);
      const bars = Array.isArray(candles?.bars) ? candles.bars.slice(-180) : [];
      const marketNews = Array.isArray(newsRows)
        ? newsRows.map((n) => ({
            title: String(n?.title || n?.headline || "Market headline"),
            source: String(n?.source || n?.publisher || "Live feed"),
            tag: String(n?.ticker || n?.category || symbol),
            summary: String(n?.summary || ""),
            url: String(n?.link || n?.url || "#"),
            image: String(n?.image || ""),
            publishedAt: String(n?.publishedAt || n?.datetime || ""),
            category: String(n?.category || "")
          }))
        : [];
      const proxyNews = Array.isArray(liveNewsPayload?.news)
        ? liveNewsPayload.news.map((n) => ({
            title: String(n?.headline || n?.title || "Market headline"),
            source: String(n?.source || "Live feed"),
            tag: String(n?.category || symbol),
            summary: String(n?.summary || ""),
            url: String(n?.url || "#"),
            image: String(n?.image || ""),
            publishedAt: String(n?.datetime || ""),
            category: String(n?.category || "")
          }))
        : [];
      const seenNews = new Set();
      const news = [...proxyNews, ...marketNews]
        .filter((n) => {
          const key = `${String(n.url || "")}|${String(n.title || "")}`.trim();
          if (!key || seenNews.has(key)) return false;
          seenNews.add(key);
          return true;
        })
        .slice(0, 20);

      const directLive = Boolean(directQuote || bars.length || news.length || (flow && flow.source === "live"));
      const mergedQuotePrice = Number(quote.price || technical.close || app.quote?.price || 0);
      const mergedQuoteChange = Number(quote.changesPercentage || quote.changePct || app.quote?.changePct || 0);
      const mergedQuoteVolume = Number(quote.volume || app.quote?.volume || 0);

      app.proTrader = {
        ...app.proTrader,
        symbol,
        horizon,
        source: directLive ? "live" : "fallback",
        lastFetchTs: now,
        updatedAt: new Date().toISOString(),
        quote,
        fundamentals,
        technical,
        bars,
        news,
        snapshot: flow.snapshot || app.proTrader.snapshot,
        sweeps: Array.isArray(flow.sweeps) ? flow.sweeps : [],
        levels: Array.isArray(flow.levels) ? flow.levels : [],
        summary: String(flow.summary || ""),
        activeSection: PRO_TRADER_SECTION_IDS.includes(String(app.proTrader.activeSection || "").toLowerCase())
          ? String(app.proTrader.activeSection).toLowerCase()
          : PRO_TRADER_SECTIONS[0].id
      };

      app.selected = symbol;
      if (!app.watchlist.includes(symbol)) app.watchlist.unshift(symbol);
      if (Number.isFinite(mergedQuotePrice) && mergedQuotePrice > 0) {
        app.quote = {
          ...app.quote,
          price: mergedQuotePrice,
          changePct: mergedQuoteChange,
          volume: mergedQuoteVolume,
          score: Math.max(0, Math.min(99, Math.round(60 + mergedQuoteChange * 6))),
          grade: mergedQuoteChange >= 0 ? "A" : "B"
        };
      }
      app.apiLive = app.apiLive || directLive;
      if (!silent) pushLog(`Pro trader refreshed for ${symbol}`);
      renderProTrader();
      saveSettingsLocal();
    }
    function renderLog() {}
    function renderWebV3() {
      if (!el.v3WatchTags) return;
      const quote = app.quote || {};
      const metrics = [
        { k: "Price", v: quote.price ? `$${Number(quote.price).toFixed(2)}` : "--" },
        { k: "Change", v: `${Number(quote.changePct || 0) >= 0 ? "+" : ""}${Number(quote.changePct || 0).toFixed(2)}%` },
        { k: "Volume", v: Number(quote.volume || 0).toLocaleString() },
        { k: "A+ Read", v: `${quote.score || 0} / ${quote.grade || "-"}` }
      ];
      if (el.v3Metrics) el.v3Metrics.innerHTML = metrics.map((x) => `<div class="metric"><div class="k">${x.k}</div><div class="v">${x.v}</div></div>`).join("");

      if (el.v3Macro) el.v3Macro.innerHTML = app.macroItems.slice(0, 6).map((m) => `<div class="tile"><div class="row"><div><div class="k">${escapeHtml(m.name)}</div><div style="font-weight:700;">${escapeHtml(m.value)}</div></div><span class="badge">${escapeHtml(m.delta)}</span></div></div>`).join("");
      if (el.v3News) el.v3News.innerHTML = app.newsItems.slice(0, 6).map((n) => `<div class="news-item"><div class="badges"><span class="badge">${escapeHtml(n.tag)}</span><span class="badge">${escapeHtml(n.impact)}</span></div><div style="font-weight:700;">${escapeHtml(n.title)}</div><div style="font-size:12px;color:var(--muted2);">${escapeHtml(n.source)}</div></div>`).join("");
      renderAiSections(el.v3AiOut, app.output || "AI agent ready.");

      el.v3WatchTags.innerHTML = app.watchlist.map((s) => `<button class="watch-btn ${s===app.selected?"active":""}" data-v3s="${s}">${s}</button>`).join("");
      if (el.v3WatchRows) el.v3WatchRows.innerHTML = app.watchlist.map((s) => `<div class="list-item"><div>${escapeHtml(s)}</div><div class="list-actions">${tradingViewLinkHtml(s)}<button class="ghost" data-v3r="${escapeHtml(s)}">Remove</button></div></div>`).join("");

      el.v3WatchTags.querySelectorAll("button[data-v3s]").forEach((b) => b.addEventListener("click", async () => {
        app.selected = b.getAttribute("data-v3s");
        await refreshSelectedSymbol();
        renderAll();
      }));
      if (el.v3WatchRows) {
        el.v3WatchRows.querySelectorAll("button[data-v3r]").forEach((b) => b.addEventListener("click", async () => {
          const s = b.getAttribute("data-v3r");
          app.watchlist = app.watchlist.filter((x) => x !== s);
          if (!app.watchlist.length) app.watchlist = ["SPY"];
          if (!app.watchlist.includes(app.selected)) app.selected = app.watchlist[0];
          saveSettingsLocal();
          if (app.token) { try { await apiFetch(`/api/watchlist/${encodeURIComponent(s)}`, { method: "DELETE" }); } catch {} }
          await refreshSelectedSymbol();
          renderAll();
        }));
      }
    }

    function renderMetrics() {
      const quote = app.quote || {};
      const m = [
        { k: "Price", v: quote.price ? `$${Number(quote.price).toFixed(2)}` : "--" },
        { k: "Change", v: `${Number(quote.changePct || 0) >= 0 ? "+" : ""}${Number(quote.changePct || 0).toFixed(2)}%` },
        { k: "Volume", v: Number(quote.volume || 0).toLocaleString() },
        { k: "A+ Read", v: `${quote.score || 0} / ${quote.grade || "-"}` }
      ];
      el.metrics.innerHTML = m.map((x) => `<div class="metric"><div class="k">${x.k}</div><div class="v">${x.v}</div></div>`).join("");
    }

    function renderChart() {
      if (!el.chartTitle || !el.chart || !el.bars) return;
      el.chartTitle.textContent = `Live Chart Data - ${app.selected}`;
      const series = app.chartSeries?.length ? app.chartSeries : INTRADAY;
      const pts = series.map((d, i) => ({ x: (i / Math.max(series.length - 1, 1)) * 890 + 5, y: Number(d.price || d.close || 0), v: Number(d.volume || 0) }));
      const min = Math.min(...pts.map((p) => p.y));
      const max = Math.max(...pts.map((p) => p.y));
      const ny = (y) => max === min ? 110 : 12 + ((max - y) / (max - min)) * 194;
      const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)} ${ny(p.y).toFixed(2)}`).join(" ");
      const area = `${line} L ${pts[pts.length - 1].x.toFixed(2)} 210 L ${pts[0].x.toFixed(2)} 210 Z`;
      el.chart.innerHTML = `<defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#10b981" stop-opacity=".46"></stop><stop offset="100%" stop-color="#10b981" stop-opacity=".02"></stop></linearGradient></defs><path d="${area}" fill="url(#f)"></path><path d="${line}" fill="none" stroke="#34d399" stroke-width="2.8"></path>`;
      const maxV = Math.max(...pts.map((p) => p.v), 1);
      el.bars.innerHTML = pts.map((p) => `<div class="bar" style="height:${Math.max(8, (p.v / maxV) * 95)}%"></div>`).join("");
    }

    function applyTheme() {
      const theme = app.dark ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", theme);
      document.documentElement.style.colorScheme = theme;
      if (el.dark) el.dark.checked = app.dark;
      if (el.themeQuickToggle) {
        el.themeQuickToggle.textContent = app.dark ? "Switch to Light" : "Switch to Dark";
        el.themeQuickToggle.setAttribute("aria-label", app.dark ? "Switch to light mode" : "Switch to dark mode");
        el.themeQuickToggle.classList.toggle("is-dark", app.dark);
        el.themeQuickToggle.classList.toggle("is-light", !app.dark);
      }
      refreshTradingViewViewerTheme();
    }
    function renderConfig() {
      el.cfgM.value = app.api.marketDataBaseUrl;
      el.cfgN.value = app.api.newsBaseUrl;
      el.cfgA.value = app.api.aiBaseUrl;
      el.cfgW.value = app.api.websocketUrl;
      if (el.cfgMarketDataKey) el.cfgMarketDataKey.value = app.apiKeys.marketData || "";
      if (el.cfgFinnhubKey) el.cfgFinnhubKey.value = app.apiKeys.finnhub || "";
      if (el.cfgFmpKey) el.cfgFmpKey.value = app.apiKeys.fmp || "";
      if (el.cfgTdKey) el.cfgTdKey.value = app.apiKeys.td || "";
      if (el.apiStatusText) el.apiStatusText.textContent = app.apiLive ? "Live API connected" : "Fallback / not tested";
      el.auto.checked = app.auto;
      el.dark.checked = app.dark;
      el.prompt.value = app.prompt;
      renderAiSections(el.out, app.output);
      renderAiConversation();
      if (el.aiTicker) el.aiTicker.value = app.selected;
      if (el.aiMode) el.aiMode.value = app.aiMode || "market_open";
      if (el.aiStyle) el.aiStyle.value = app.aiStyle || "professional";
      if (el.aiRoute) el.aiRoute.value = app.aiRoute || "/api/ai/market-terminal";
      if (el.aiExtraContext) el.aiExtraContext.value = app.aiExtraContext || "";
      if (el.aiStatus) el.aiStatus.textContent = `Ready. ${Math.max((app.aiConversation || []).length - 1, 0)} prior messages in memory.`;
      if (el.deepTicker) el.deepTicker.value = app.deepDive.ticker || app.selected || "SPY";
      if (el.deepTimeframe) el.deepTimeframe.value = app.deepDive.timeframe || "1D";
      if (el.proFlowSymbol) el.proFlowSymbol.value = app.proTrader.symbol || app.selected || "SPY";
      if (el.proFlowHorizon) el.proFlowHorizon.value = app.proTrader.horizon || "0DTE";
    }

    function formatMoney(value) {
      const n = Number(value);
      if (!Number.isFinite(n)) return "--";
      return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    }

    function formatLarge(value) {
      const n = Number(value);
      if (!Number.isFinite(n)) return "--";
      return n.toLocaleString();
    }

    function formatCompact(value) {
      const n = Number(value);
      if (!Number.isFinite(n)) return "--";
      return new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 2 }).format(n);
    }

    function formatDateShort(value) {
      if (!value) return "--";
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? "--" : d.toLocaleDateString();
    }

    function formatPercent(value, digits = 2) {
      const n = Number(value);
      if (!Number.isFinite(n)) return "--";
      const pct = Math.abs(n) <= 1 ? n * 100 : n;
      return `${pct.toFixed(digits)}%`;
    }

    function formatRange(low, high) {
      const l = Number(low);
      const h = Number(high);
      if (!Number.isFinite(l) && !Number.isFinite(h)) return "--";
      if (Number.isFinite(l) && Number.isFinite(h)) return `${formatMoney(l)} - ${formatMoney(h)}`;
      return Number.isFinite(h) ? `<= ${formatMoney(h)}` : `>= ${formatMoney(l)}`;
    }

    function latestIndicatorValue(series) {
      if (!Array.isArray(series) || !series.length) return null;
      const last = series[series.length - 1];
      const value = Number(last?.value);
      return Number.isFinite(value) ? value : null;
    }

    function buildTechnicalSnapshot(candlesPayload, quoteRow) {
      const bars = Array.isArray(candlesPayload?.bars) ? candlesPayload.bars : [];
      const indicators = candlesPayload?.indicators || {};
      const latestBar = bars.length ? bars[bars.length - 1] : null;
      const close = Number(latestBar?.close ?? quoteRow?.price ?? app.quote?.price ?? 0);
      const ema9 = latestIndicatorValue(indicators.ema9);
      const ema21 = latestIndicatorValue(indicators.ema21);
      const vwap = latestIndicatorValue(indicators.vwap);
      const rsi = latestIndicatorValue(indicators.rsi);
      const macdLine = latestIndicatorValue(indicators?.macd?.line);
      const macdSignal = latestIndicatorValue(indicators?.macd?.signal);
      const macdHist = latestIndicatorValue(indicators?.macd?.histogram);

      let trend = "Mixed";
      if (Number.isFinite(close) && Number.isFinite(ema9) && Number.isFinite(ema21)) {
        if (close > ema9 && ema9 > ema21) trend = "Bullish";
        else if (close < ema9 && ema9 < ema21) trend = "Bearish";
      }
      const momentum = Number.isFinite(rsi)
        ? (rsi >= 65 ? "Strong" : rsi <= 40 ? "Weak" : "Neutral")
        : "Neutral";

      return {
        barsCount: bars.length,
        close,
        ema9,
        ema21,
        vwap,
        rsi,
        macdLine,
        macdSignal,
        macdHist,
        trend,
        momentum
      };
    }

    function renderDeepDive() {
      if (!el.deepSummary || !el.deepFundGrid || !el.deepTechGrid || !el.deepFundText || !el.deepTechText) return;
      const deep = app.deepDive || {};
      const fund = deep.fundamentals || {};
      const tech = deep.technical || {};
      const ticker = deep.ticker || app.selected || "SPY";
      const quote = deep.quote || app.quote || {};
      const updated = deep.updatedAt ? new Date(deep.updatedAt).toLocaleString() : "Not updated";

      const summaryPrice = Number(quote.price || app.quote?.price || 0);
      const summaryChangeRaw = Number(quote.changesPercentage || quote.changePct || app.quote?.changePct || 0);
      const summaryChange = Number.isFinite(summaryChangeRaw) ? summaryChangeRaw : 0;
      el.deepSummary.textContent = `${ticker} • ${deep.timeframe || "1D"} • Price ${formatMoney(summaryPrice)} • Change ${summaryChange >= 0 ? "+" : ""}${summaryChange.toFixed(2)}% • Updated ${updated}`;

      const fundMetrics = [
        { k: "Market Cap", v: fund.marketCap ? formatCompact(fund.marketCap) : "--" },
        { k: "P/E", v: Number.isFinite(Number(fund.pe)) ? Number(fund.pe).toFixed(2) : "--" },
        { k: "EPS", v: Number.isFinite(Number(fund.eps)) ? Number(fund.eps).toFixed(2) : "--" },
        { k: "Revenue", v: Number.isFinite(Number(fund.revenue)) ? formatCompact(fund.revenue) : "--" },
        { k: "52W Range", v: formatRange(fund.fiftyTwoWeekLow, fund.fiftyTwoWeekHigh) },
        { k: "Avg Volume", v: Number.isFinite(Number(fund.avgVolume)) ? formatCompact(fund.avgVolume) : formatLarge(quote.volume || app.quote?.volume || 0) },
        { k: "Shares Out", v: fund.sharesOutstanding ? formatCompact(fund.sharesOutstanding) : "--" },
        { k: "Beta", v: Number.isFinite(Number(fund.beta)) ? Number(fund.beta).toFixed(2) : "--" },
        { k: "Profit Margin", v: Number.isFinite(Number(fund.profitMargin)) ? formatPercent(fund.profitMargin) : "--" },
        { k: "ROE", v: Number.isFinite(Number(fund.returnOnEquity)) ? formatPercent(fund.returnOnEquity) : "--" },
        { k: "Earnings Date", v: formatDateShort(fund.earningsDate) },
        { k: "Target Price", v: Number.isFinite(Number(fund.targetMeanPrice)) ? formatMoney(fund.targetMeanPrice) : "--" }
      ];
      el.deepFundGrid.innerHTML = fundMetrics.map((m) => `<div class="deep-metric"><div class="k">${escapeHtml(m.k)}</div><div class="v">${escapeHtml(String(m.v))}</div></div>`).join("");
      const fundamentalsMissing = [
        !Number.isFinite(Number(fund.marketCap)) || Number(fund.marketCap) <= 0,
        !Number.isFinite(Number(fund.pe)),
        !Number.isFinite(Number(fund.eps)),
        !fund.earningsDate
      ].filter(Boolean).length;
      el.deepFundText.textContent = [
        `Valuation: ${Number.isFinite(Number(fund.pe)) ? `P/E ${Number(fund.pe).toFixed(2)}` : "P/E unavailable"} | ${Number.isFinite(Number(fund.priceToBook)) ? `P/B ${Number(fund.priceToBook).toFixed(2)}` : "P/B unavailable"}.`,
        `Business profile: ${fund.sector || "Sector N/A"}${fund.industry ? ` / ${fund.industry}` : ""}.`,
        `Margins: Gross ${Number.isFinite(Number(fund.grossMargin)) ? formatPercent(fund.grossMargin) : "--"}, Operating ${Number.isFinite(Number(fund.operatingMargin)) ? formatPercent(fund.operatingMargin) : "--"}, Net ${Number.isFinite(Number(fund.profitMargin)) ? formatPercent(fund.profitMargin) : "--"}.`,
        `Balance sheet: Debt/Equity ${Number.isFinite(Number(fund.debtToEquity)) ? Number(fund.debtToEquity).toFixed(2) : "--"}, Current ratio ${Number.isFinite(Number(fund.currentRatio)) ? Number(fund.currentRatio).toFixed(2) : "--"}.`,
        `Source: ${fund.source || "market+yahoo"}${fundamentalsMissing >= 3 ? " (limited fields; add market API keys for full fundamentals)." : ""}`
      ].join("\n");

      const techMetrics = [
        { k: "Trend", v: tech.trend || "--" },
        { k: "Momentum", v: tech.momentum || "--" },
        { k: "Close", v: formatMoney(tech.close) },
        { k: "EMA 9", v: Number.isFinite(Number(tech.ema9)) ? Number(tech.ema9).toFixed(2) : "--" },
        { k: "EMA 21", v: Number.isFinite(Number(tech.ema21)) ? Number(tech.ema21).toFixed(2) : "--" },
        { k: "VWAP", v: Number.isFinite(Number(tech.vwap)) ? Number(tech.vwap).toFixed(2) : "--" },
        { k: "RSI", v: Number.isFinite(Number(tech.rsi)) ? Number(tech.rsi).toFixed(2) : "--" },
        { k: "MACD", v: Number.isFinite(Number(tech.macdLine)) ? Number(tech.macdLine).toFixed(3) : "--" },
        { k: "Signal", v: Number.isFinite(Number(tech.macdSignal)) ? Number(tech.macdSignal).toFixed(3) : "--" }
      ];
      el.deepTechGrid.innerHTML = techMetrics.map((m) => `<div class="deep-metric"><div class="k">${escapeHtml(m.k)}</div><div class="v">${escapeHtml(String(m.v))}</div></div>`).join("");
      el.deepTechText.textContent = [
        `RSI: ${Number.isFinite(Number(tech.rsi)) ? Number(tech.rsi).toFixed(2) : "--"} | MACD histogram: ${Number.isFinite(Number(tech.macdHist)) ? Number(tech.macdHist).toFixed(3) : "--"}.`,
        `Structure: ${tech.trend || "Mixed"} trend with ${tech.momentum || "Neutral"} momentum.`,
        `Data points: ${Number(tech.barsCount || 0)} candles.`
      ].join("\n");
    }

    async function runDeepDive(symbolOverride = "", timeframeOverride = "") {
      const symbol = String(symbolOverride || el.deepTicker?.value || app.selected || "SPY").trim().toUpperCase();
      const timeframe = String(timeframeOverride || el.deepTimeframe?.value || app.deepDive.timeframe || "1D").trim().toUpperCase();
      if (!symbol) return;
      if (el.deepStatus) el.deepStatus.textContent = "Loading...";
      try {
        const [quoteRows, marketFundamentals, yahooFundamentals, yahooQuoteRows, candles] = await Promise.all([
          directFetchSafe(`/api/market/quote?symbols=${encodeURIComponent(symbol)}${providerQuerySuffix()}`, []),
          directFetchSafe(`/api/market/fundamentals?symbol=${encodeURIComponent(symbol)}${providerQuerySuffix()}`, {}),
          directFetchSafe(`/api/yahoo/fundamentals?symbol=${encodeURIComponent(symbol)}`, {}),
          directFetchSafe(`/api/yahoo/quote?symbols=${encodeURIComponent(symbol)}`, []),
          directFetchSafe(`/api/yahoo/candles?symbol=${encodeURIComponent(symbol)}&timeframe=${encodeURIComponent(timeframe)}`, { bars: [], indicators: {} })
        ]);

        const quote = Array.isArray(quoteRows) && quoteRows.length
          ? quoteRows[0]
          : (Array.isArray(yahooQuoteRows) && yahooQuoteRows.length ? yahooQuoteRows[0] : {});
        const yahooQuote = Array.isArray(yahooQuoteRows) && yahooQuoteRows.length ? yahooQuoteRows[0] : {};
        const fundamentals = mergeDeepFundamentals(symbol, marketFundamentals, yahooFundamentals, quote, yahooQuote);
        const technical = buildTechnicalSnapshot(candles, quote);
        app.deepDive = {
          ticker: symbol,
          timeframe,
          quote: quote || {},
          fundamentals: fundamentals || {},
          technical,
          updatedAt: new Date().toISOString()
        };

        app.selected = symbol;
        app.quote = {
          price: Number(quote.price || technical.close || app.quote?.price || 0),
          changePct: Number(quote.changesPercentage || quote.changePct || app.quote?.changePct || 0),
          volume: Number(quote.volume || app.quote?.volume || 0),
          score: Math.max(0, Math.min(99, Math.round(60 + Number(quote.changesPercentage || 0) * 6))),
          grade: Number(quote.changesPercentage || 0) >= 0 ? "A" : "B"
        };
        if (Array.isArray(candles?.bars) && candles.bars.length) {
          app.chartSeries = candles.bars.slice(-40).map((b) => ({
            time: String(b.time || "").slice(11, 16) || "00:00",
            price: Number(b.close || 0),
            volume: Number(b.volume || 0)
          }));
        }

        if (!app.watchlist.includes(symbol)) app.watchlist.unshift(symbol);
        if (el.aiTicker) el.aiTicker.value = symbol;
        if (el.deepTicker) el.deepTicker.value = symbol;
        if (el.globalSymbolSearch) el.globalSymbolSearch.value = symbol;
        await refreshProTraderFlow(symbol, true);
        saveSettingsLocal();
        renderAll();
        renderDeepDive();
        if (el.deepStatus) el.deepStatus.textContent = `Loaded ${symbol}`;
        pushLog(`Deep dive loaded for ${symbol}`);
      } catch (error) {
        if (el.deepStatus) el.deepStatus.textContent = "Load failed";
        if (el.deepSummary) el.deepSummary.textContent = `Unable to load deep dive data right now for ${symbol}. ${error?.message || ""}`.trim();
        pushLog(`Deep dive failed for ${symbol}`);
      }
    }

    async function applySymbolSearch(openDeepDive = false) {
      const symbol = String(el.globalSymbolSearch?.value || "").trim().toUpperCase();
      if (!symbol) return;
      app.selected = symbol;
      if (!app.watchlist.includes(symbol)) app.watchlist.unshift(symbol);
      if (el.aiTicker) el.aiTicker.value = symbol;
      if (el.deepTicker) el.deepTicker.value = symbol;
      await refreshSelectedSymbol();
      renderAll();
      if (openDeepDive) {
        setActiveTab("deepdive");
        await runDeepDive(symbol, String(el.deepTimeframe?.value || app.deepDive.timeframe || "1D"));
      } else {
        pushLog(`Loaded ${symbol}`);
      }
      saveSettingsLocal();
    }

    async function runDeepAi() {
      const symbol = String(app.deepDive?.ticker || app.selected || "SPY").toUpperCase();
      const fund = app.deepDive?.fundamentals || {};
      const tech = app.deepDive?.technical || {};
      const prompt = [
        `Deep dive ${symbol} using fundamentals + technicals.`,
        `Fundamentals: market cap ${fund.marketCap || "N/A"}, PE ${fund.pe ?? "N/A"}, EPS ${fund.eps ?? "N/A"}, earnings ${fund.earningsDate || "N/A"}.`,
        `Technicals: trend ${tech.trend || "N/A"}, momentum ${tech.momentum || "N/A"}, close ${tech.close ?? "N/A"}, EMA9 ${tech.ema9 ?? "N/A"}, EMA21 ${tech.ema21 ?? "N/A"}, VWAP ${tech.vwap ?? "N/A"}, RSI ${tech.rsi ?? "N/A"}, MACD ${tech.macdLine ?? "N/A"}.`,
        "Return: bias, key levels, technical thesis, fundamental valuation read, best setup, invalidation, confidence."
      ].join("\n");

      if (el.aiTicker) el.aiTicker.value = symbol;
      if (el.aiMode) el.aiMode.value = "stock_sniper";
      if (el.aiStyle) el.aiStyle.value = "professional";
      if (el.prompt) el.prompt.value = prompt;
      app.prompt = prompt;
      await runAiAgent();
      renderAiSections(el.deepAiOut, app.output || "No output");
    }

    function renderAll() { renderSummary(); renderOverview(); renderHeat(); renderWatch(); renderMacro(); renderNews(); renderLiveTv(); renderScanner(); renderPrayerTimes(); renderMetrics(); renderChart(); renderLog(); renderWebV3(); renderConfig(); renderDeepDive(); renderProTrader(); applyTheme(); }

    function formatNormalizedReport(data) {
      return [
        "BIAS",
        `- ${data.bias || "N/A"}`,
        "",
        "MACRO READ",
        `- ${data.macro_read || "N/A"}`,
        "",
        "SECTOR ROTATION",
        `- ${data.sector_rotation || "N/A"}`,
        "",
        "KEY LEVELS",
        `- ${data.key_levels || "N/A"}`,
        "",
        "BEST SETUP",
        `- ${data.best_setup || "N/A"}`,
        "",
        "INVALIDATION",
        `- ${data.invalidation || "N/A"}`,
        "",
        `CONFIDENCE: ${data.confidence ?? "N/A"}`
      ].join("\n");
    }

    function aiPromptPreset(mode, ticker) {
      const t = String(ticker || app.selected || "SPY").toUpperCase();
      const presets = {
        market_open: `Act like an institutional market analyst. Scan ${t}, SPY, QQQ, VIX, DXY, 2Y yield, oil, gold, Bitcoin, sector rotation, key macro headlines, and earnings movers. Output market bias, strongest sectors, weakest sectors, key levels, best long idea, best short idea, highest probability setup, and invalidation.`,
        stock_sniper: `Act like a hedge fund trader. Analyze ${t} using EMA 9/21/200 trend, relative strength vs SPY, volume behavior, liquidity pools, breakout quality, fakeout risk, and momentum strength. Output directional bias, entry zone, stop loss, target 1, target 2, A+ score out of 100, and key risk.`,
        options_flow: `Act like a smart money options trader. Analyze unusual options flow for ${t}. Include call sweeps, put sweeps, key strikes, dealer positioning, gamma pressure, and likely institutional direction. Output best trade idea and invalidation.`,
        macro_interpreter: `Act like a macro intelligence analyst. Explain what current macro conditions mean for ${t}, growth stocks, yields, the dollar, oil, gold, and overall risk sentiment. Show who benefits, who gets hurt, and whether setup is bullish, bearish, or mixed.`,
        sector_rotation: `Act like an institutional sector strategist. Rank strongest and weakest sectors today, explain money flow, identify leadership, and tell me where ${t} fits in current market rotation. Output actionable conclusions only.`
      };
      return presets[mode] || presets.market_open;
    }

    function normalizeAiRoute(route) {
      const raw = String(route || "").trim();
      if (!raw) {
        const origin = typeof window !== "undefined" ? window.location.origin : backendOrigin();
        return `${origin}/api/ai/market-terminal`;
      }
      if (/^https?:\/\//i.test(raw)) return raw;
      const path = raw.startsWith("/") ? raw : `/${raw}`;
      const origin = typeof window !== "undefined" ? window.location.origin : backendOrigin();
      return `${origin}${path}`;
    }

    function aiRouteCandidates(route) {
      const raw = String(route || "").trim();
      if (/^https?:\/\//i.test(raw)) return [raw];
      const path = (raw || "/api/ai/market-terminal").startsWith("/") ? (raw || "/api/ai/market-terminal") : `/${raw}`;
      const sameOrigin = typeof window !== "undefined" ? window.location.origin : backendOrigin();
      const backend = backendOrigin();
      const candidates = [
        `${sameOrigin}${path}`,
        `${backend}${path}`
      ];
      if (path === "/api/ai/market-terminal") {
        candidates.push(`${sameOrigin}/api/ai/report`, `${backend}/api/ai/report`);
      }
      return Array.from(new Set(candidates.filter(Boolean)));
    }

    function extractAiOutput(data) {
      if (!data) return "";
      if (typeof data === "string") return data.trim();
      if (typeof data.output === "string" && data.output.trim()) return data.output.trim();
      if (typeof data.output_text === "string" && data.output_text.trim()) return data.output_text.trim();
      if (typeof data.report === "string" && data.report.trim()) return data.report.trim();
      if (typeof data.message === "string" && data.message.trim()) return data.message.trim();
      if (typeof data.text === "string" && data.text.trim()) return data.text.trim();
      if (data.data && typeof data.data === "object") {
        if (typeof data.data.output === "string" && data.data.output.trim()) return data.data.output.trim();
        if (typeof data.data.output_text === "string" && data.data.output_text.trim()) return data.data.output_text.trim();
      }
      const choiceText = data?.choices?.[0]?.message?.content;
      if (typeof choiceText === "string" && choiceText.trim()) return choiceText.trim();
      return JSON.stringify(data, null, 2);
    }

    function tryParseJsonObject(text) {
      const raw = String(text || "").trim();
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : null;
      } catch {}
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      if (start >= 0 && end > start) {
        try {
          const parsed = JSON.parse(raw.slice(start, end + 1));
          return parsed && typeof parsed === "object" ? parsed : null;
        } catch {}
      }
      return null;
    }

    function normalizeReportPayload(data, textFallback = "") {
      const source = (data && typeof data === "object") ? data : tryParseJsonObject(textFallback);
      if (!source || typeof source !== "object") return null;
      const bias = source.bias || source.market_bias || source.marketBias || "";
      const macro_read = source.macro_read || source.macro || source.macroRead || "";
      const sector_rotation = source.sector_rotation || source.sector || source.sectorRotation || "";
      const key_levels = source.key_levels || source.levels || source.keyLevels || "";
      const best_setup = source.best_setup || source.setup || source.trade_setup || "";
      const invalidation = source.invalidation || source.invalid || "";
      const confidenceRaw = source.confidence ?? source.confidence_score ?? source.score;
      const confidence = Number.isFinite(Number(confidenceRaw)) ? Number(confidenceRaw) : undefined;
      const normalized = { bias, macro_read, sector_rotation, key_levels, best_setup, invalidation };
      if (confidence !== undefined) normalized.confidence = confidence;
      if (Object.values(normalized).some((v) => v !== "" && v !== undefined && v !== null)) return normalized;
      return null;
    }

    async function runAiAgent() {
      const runBtn = el.run || null;
      const ticker = String(el.aiTicker?.value || app.selected || "SPY").trim().toUpperCase() || "SPY";
      const mode = String(el.aiMode?.value || "market_open");
      const style = String(el.aiStyle?.value || "professional");
      const route = String(el.aiRoute?.value || app.aiRoute || "/api/ai/market-terminal").trim();
      const extraContext = String(el.aiExtraContext?.value || "").trim();
      const prompt = String(el.prompt?.value || "").trim();
      const userMessage = prompt || aiPromptPreset(mode, ticker);

      app.selected = ticker;
      app.prompt = userMessage;
      app.aiMode = mode;
      app.aiStyle = style;
      app.aiRoute = route || "/api/ai/market-terminal";
      app.aiExtraContext = extraContext;
      addAiConversationMessage("user", userMessage);
      renderAiConversation();
      saveSettingsLocal();

      if (runBtn) {
        runBtn.disabled = true;
        runBtn.textContent = "Sending...";
      }
      if (el.aiStatus) el.aiStatus.textContent = "Sending to ChatGPT...";

      try {
        const headers = { "Content-Type": "application/json" };
        if (app.token) headers.Authorization = `Bearer ${app.token}`;
        const conversationPrompt = buildAiConversationPrompt({
          ticker,
          mode,
          style,
          extraContext,
          message: userMessage
        });
        const payload = {
          ticker,
          symbol: ticker,
          mode,
          style,
          extraContext,
          prompt: conversationPrompt
        };
        const attempts = aiRouteCandidates(app.aiRoute);
        let data = {};
        let outputText = "";
        let lastError = "";
        let hitUrl = normalizeAiRoute(app.aiRoute);
        for (const url of attempts) {
          try {
            hitUrl = url;
            const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });
            const rawText = await response.text();
            try { data = rawText ? JSON.parse(rawText) : {}; } catch { data = rawText; }
            if (!response.ok) {
              const message = typeof data === "string" ? data : JSON.stringify(data);
              lastError = `${response.status} ${message}`;
              continue;
            }
            outputText = extractAiOutput(data) || "AI response received with no output field.";
            if (outputText) break;
          } catch (err) {
            lastError = err instanceof Error ? err.message : String(err);
          }
        }

        if (!outputText) {
          throw new Error(lastError || `Failed to connect to AI routes: ${attempts.join(", ")}`);
        }

        app.output = outputText;
        addAiConversationMessage("assistant", outputText);
        renderAiConversation();
        renderAiSections(el.out, outputText);
        renderAiSections(el.v3AiOut, outputText);

        const normalizedReport = normalizeReportPayload(data, outputText) || extractReportDataFromText(outputText);
        app.reportData = normalizedReport || null;
        app.reportSource = "AI agent + live data";
        app.reportGeneratedAt = new Date().toISOString();
        renderOverviewReport();

        if (el.aiStatus) el.aiStatus.textContent = `Connected • ${ticker} • ${mode} • Memory: ${(app.aiConversation || []).length - 1} messages`;
        saveSettingsLocal();
        pushLog(`AI agent run completed for ${ticker}`);
        return { ok: true, ticker, mode, route: hitUrl };
      } catch (error) {
        const fallback = await genReport();
        app.output = `Backend not connected on ${route || "/api/ai/market-terminal"}.\n\nError: ${error.message || "Request failed"}\n\nFallback report:\n\n${fallback}`;
        addAiConversationMessage("assistant", app.output);
        renderAiConversation();
        renderAiSections(el.out, app.output);
        renderAiSections(el.v3AiOut, app.output);
        app.reportData = extractReportDataFromText(app.output) || extractReportDataFromText(fallback) || null;
        app.reportSource = "AI fallback report";
        app.reportGeneratedAt = new Date().toISOString();
        renderOverviewReport();
        if (el.aiStatus) el.aiStatus.textContent = "Backend unavailable. Fallback used.";
        saveSettingsLocal();
        pushLog("AI agent fallback mode");
        return { ok: false, ticker, mode, error: error?.message || "Request failed" };
      } finally {
        if (runBtn) {
          runBtn.disabled = false;
          runBtn.textContent = "Send to ChatGPT";
        }
      }
    }

    async function genReport() {
      if (app.token) {
        try {
          const data = await apiFetch("/api/ai/report", {
            method: "POST",
            body: JSON.stringify({ prompt: app.prompt, symbol: app.selected })
          });
          return formatNormalizedReport(data);
        } catch {}
      }
      await new Promise((r) => setTimeout(r, 500));
      const sb = sectorBias().label;
      return [
        `BIAS\n- ${sb === "Risk-On" ? "Bullish with selective caution" : "Mixed / cautious"}`,
        `\nMACRO READ\n- Growth leadership is supporting the tape.\n- Volatility remains contained, but rates and dollar strength still matter.`,
        `\nSECTOR ROTATION\n- Leadership remains concentrated in tech and selective energy.\n- Defensive groups are not fully taking control.`,
        `\nKEY LEVELS\n- ${app.selected} should hold intraday VWAP and prior breakout zones.\n- Failed reclaim of morning high turns momentum neutral.`,
        `\nBEST SETUP\n- ${topSetup()}`,
        `\nINVALIDATION\n- Loss of VWAP, weaker breadth, and rising volatility would weaken the long thesis.`
      ].join("\n");
    }

    async function generateOverviewColorReport() {
      if (el.overviewReportBtn) {
        el.overviewReportBtn.disabled = true;
        el.overviewReportBtn.textContent = "Generating...";
      }
      try {
        app.prompt = (el.prompt?.value || app.prompt || "").trim() || app.prompt;
        if (app.token) {
          const data = await apiFetch("/api/ai/report", {
            method: "POST",
            body: JSON.stringify({ prompt: app.prompt, symbol: app.selected })
          });
          app.reportData = data || null;
          app.reportSource = "AI + live data";
          app.output = formatNormalizedReport(data || {});
          renderAiSections(el.out, app.output);
        } else {
          app.reportData = null;
          app.reportSource = "Live data snapshot";
        }
        app.reportGeneratedAt = new Date().toISOString();
        renderOverviewReport();
        pushLog(`Overview report generated for ${app.selected}`);
      } catch {
        app.reportData = null;
        app.reportSource = "Live fallback";
        app.reportGeneratedAt = new Date().toISOString();
        renderOverviewReport();
        pushLog("Overview report generated in fallback mode");
      } finally {
        if (el.overviewReportBtn) {
          el.overviewReportBtn.disabled = false;
          el.overviewReportBtn.textContent = "Generate Color Report";
        }
      }
    }

    function restartTimer() {
      if (app.timer) clearInterval(app.timer);
      app.timer = null;
      if (!app.auto || !app.user) return;
      app.timer = setInterval(async () => {
        pushLog(`Live refresh ${new Date().toLocaleTimeString()}`);
        await refreshSelectedSymbol();
        await refreshBackendMarketViews();
        renderSummary();
        renderMacro();
        renderNews();
        renderOverview();
        renderWebV3();
      }, 12000);
    }

    function bind() {
      tabButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          const tab = btn.getAttribute("data-tab");
          if (!tab) return;
          setActiveTab(tab);
          if (tab === "protrader") {
            refreshProTraderFlow(app.selected, true).catch(() => {});
          }
        });
      });

      if (el.proFlowRefresh) {
        el.proFlowRefresh.addEventListener("click", async () => {
          const symbol = String(el.proFlowSymbol?.value || app.selected || "SPY").trim().toUpperCase();
          if (!symbol) return;
          app.selected = symbol;
          await refreshSelectedSymbol();
          await refreshProTraderFlow(symbol, false);
          renderAll();
        });
      }
      if (el.proFlowSymbol) {
        el.proFlowSymbol.addEventListener("keydown", async (e) => {
          if (e.key !== "Enter") return;
          e.preventDefault();
          const symbol = String(el.proFlowSymbol.value || app.selected || "SPY").trim().toUpperCase();
          if (!symbol) return;
          app.selected = symbol;
          if (!app.watchlist.includes(symbol)) app.watchlist.unshift(symbol);
          await refreshSelectedSymbol();
          await refreshProTraderFlow(symbol, false);
          renderAll();
          saveSettingsLocal();
        });
      }
      if (el.proFlowHorizon) {
        el.proFlowHorizon.addEventListener("change", async () => {
          app.proTrader.horizon = String(el.proFlowHorizon.value || "0DTE").trim().toUpperCase();
          await refreshProTraderFlow(app.selected, false);
          renderProTrader();
          saveSettingsLocal();
        });
      }

      const applyLiveTvInputs = () => {
        app.liveTv.bloombergEmbed = normalizeLiveTvUrl(el.tvBloombergUrl?.value, DEFAULT_BLOOMBERG_EMBED);
        app.liveTv.cnbcEmbed = normalizeLiveTvUrl(el.tvCnbcUrl?.value, DEFAULT_CNBC_EMBED);
        app.liveTv.finvizEmbed = normalizeLiveTvUrl(el.finvizUrl?.value, DEFAULT_FINVIZ_EMBED);
        saveSettingsLocal();
        renderLiveTv();
      };
      if (el.tvBloombergUrl) {
        el.tvBloombergUrl.addEventListener("change", applyLiveTvInputs);
        el.tvBloombergUrl.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            applyLiveTvInputs();
          }
        });
      }
      if (el.tvCnbcUrl) {
        el.tvCnbcUrl.addEventListener("change", applyLiveTvInputs);
        el.tvCnbcUrl.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            applyLiveTvInputs();
          }
        });
      }
      if (el.finvizUrl) {
        el.finvizUrl.addEventListener("change", applyLiveTvInputs);
        el.finvizUrl.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            applyLiveTvInputs();
          }
        });
      }
      if (el.tvBloombergReload) {
        el.tvBloombergReload.addEventListener("click", () => {
          const url = normalizeLiveTvUrl(app.liveTv.bloombergEmbed, DEFAULT_BLOOMBERG_EMBED);
          app.liveTv.bloombergEmbed = url;
          forceReloadLiveTvFrame(el.tvBloombergFrame, url);
        });
      }
      if (el.tvCnbcReload) {
        el.tvCnbcReload.addEventListener("click", () => {
          const url = normalizeLiveTvUrl(app.liveTv.cnbcEmbed, DEFAULT_CNBC_EMBED);
          app.liveTv.cnbcEmbed = url;
          forceReloadLiveTvFrame(el.tvCnbcFrame, url);
        });
      }
      if (el.finvizReload) {
        el.finvizReload.addEventListener("click", () => {
          const url = normalizeLiveTvUrl(app.liveTv.finvizEmbed, DEFAULT_FINVIZ_EMBED);
          const mapUrl = normalizeLiveTvUrl(app.liveTv.finvizMap, DEFAULT_FINVIZ_MAP);
          app.liveTv.finvizEmbed = url;
          app.liveTv.finvizMap = mapUrl;
          forceReloadLiveTvFrame(el.finvizFrame, url);
          forceReloadLiveTvFrame(el.finvizMapImg, mapUrl);
        });
      }
      if (el.finvizMapReload) {
        el.finvizMapReload.addEventListener("click", () => {
          const mapUrl = normalizeLiveTvUrl(app.liveTv.finvizMap, DEFAULT_FINVIZ_MAP);
          app.liveTv.finvizMap = mapUrl;
          forceReloadLiveTvFrame(el.finvizMapImg, mapUrl);
        });
      }

      if (el.overviewReportMode) {
        el.overviewReportMode.addEventListener("change", () => {
          app.reportMode = el.overviewReportMode.value === "quick" ? "quick" : "full";
          saveSettingsLocal();
          renderOverviewReport();
        });
      }

      if (el.overviewReportTheme) {
        el.overviewReportTheme.addEventListener("change", () => {
          app.reportTheme = ["vivid", "ocean", "sunrise", "neon"].includes(el.overviewReportTheme.value) ? el.overviewReportTheme.value : "vivid";
          saveSettingsLocal();
          renderOverviewReport();
        });
      }

      if (el.scanReportMode) {
        el.scanReportMode.addEventListener("change", () => {
          app.reportMode = el.scanReportMode.value === "quick" ? "quick" : "full";
          saveSettingsLocal();
          renderOverviewReport();
        });
      }

      if (el.scanReportTheme) {
        el.scanReportTheme.addEventListener("change", () => {
          app.reportTheme = ["vivid", "ocean", "sunrise", "neon"].includes(el.scanReportTheme.value) ? el.scanReportTheme.value : "vivid";
          saveSettingsLocal();
          renderOverviewReport();
        });
      }

      if (el.scanReportRefreshBtn) {
        el.scanReportRefreshBtn.addEventListener("click", async () => {
          await generateOverviewColorReport();
          setActiveTab("report");
        });
      }

      if (el.scannerHealthBtn) {
        el.scannerHealthBtn.addEventListener("click", async () => {
          await checkScannerHealth();
        });
      }
      if (el.scannerRunBtn) {
        el.scannerRunBtn.addEventListener("click", async () => {
          await runScannerFromTab();
        });
      }

      if (el.overviewReportBtn) {
        el.overviewReportBtn.addEventListener("click", async () => { await generateOverviewColorReport(); });
      }

      if (el.mainScreenNotes) {
        el.mainScreenNotes.addEventListener("input", () => {
          app.mainNotes = String(el.mainScreenNotes.value || "");
          if (el.mainNotesStatus) el.mainNotesStatus.textContent = "Editing...";
        });
        el.mainScreenNotes.addEventListener("blur", () => {
          app.mainNotes = String(el.mainScreenNotes.value || "");
          saveSettingsLocal();
          if (el.mainNotesStatus) el.mainNotesStatus.textContent = `Saved ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
        });
      }
      if (el.mainNotesSaveBtn) {
        el.mainNotesSaveBtn.addEventListener("click", () => {
          app.mainNotes = String(el.mainScreenNotes?.value || "");
          saveSettingsLocal();
          if (el.mainNotesStatus) el.mainNotesStatus.textContent = `Saved ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
          pushLog("Main notes saved");
        });
      }

      if (el.globalSymbolBtn) {
        el.globalSymbolBtn.addEventListener("click", async () => {
          await applySymbolSearch(false);
        });
      }
      if (el.globalDeepDiveBtn) {
        el.globalDeepDiveBtn.addEventListener("click", async () => {
          await applySymbolSearch(true);
        });
      }
      if (el.globalSymbolSearch) {
        el.globalSymbolSearch.addEventListener("keydown", async (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            await applySymbolSearch(false);
          }
        });
      }

      if (el.deepRunBtn) {
        el.deepRunBtn.addEventListener("click", async () => {
          const symbol = String(el.deepTicker?.value || app.selected || "SPY").trim().toUpperCase();
          const timeframe = String(el.deepTimeframe?.value || "1D").trim().toUpperCase();
          await runDeepDive(symbol, timeframe);
        });
      }
      if (el.deepTicker) {
        el.deepTicker.addEventListener("keydown", async (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const symbol = String(el.deepTicker.value || app.selected || "SPY").trim().toUpperCase();
            const timeframe = String(el.deepTimeframe?.value || "1D").trim().toUpperCase();
            await runDeepDive(symbol, timeframe);
          }
        });
      }
      if (el.deepTimeframe) {
        el.deepTimeframe.addEventListener("change", async () => {
          const symbol = String(el.deepTicker?.value || app.selected || "SPY").trim().toUpperCase();
          const timeframe = String(el.deepTimeframe.value || "1D").trim().toUpperCase();
          app.deepDive.timeframe = timeframe;
          saveSettingsLocal();
          await runDeepDive(symbol, timeframe);
        });
      }
      if (el.deepAiBtn) {
        el.deepAiBtn.addEventListener("click", async () => {
          await runDeepAi();
        });
      }

      el.loginBtn.addEventListener("click", async () => {
        const email = (el.loginEmail.value || "stiiladil@gmail.com").trim();
        const password = (el.loginPassword.value || "Dixie123").trim();
        try {
          await tryLoginBackend(email, password);
          pushLog("Backend login connected");
          await syncSettingsFromBackend();
          await syncWatchlistFromBackend();
          await refreshBackendMarketViews();
        } catch {
          app.user = email;
          app.token = "";
          pushLog("Backend unavailable, running in local demo mode");
        }
        el.loginShell.classList.add("hidden");
        el.app.classList.remove("hidden");
        renderAll();
        refreshPrayerTimes().catch(() => {});
        await refreshSelectedSymbol();
        restartTimer();
        startPrayerRefreshScheduler();
        pushLog("User signed in");
      });

      el.save.addEventListener("click", async () => {
        app.api.marketDataBaseUrl = el.cfgM.value.trim();
        app.api.newsBaseUrl = el.cfgN.value.trim();
        app.api.aiBaseUrl = el.cfgA.value.trim();
        app.api.websocketUrl = el.cfgW.value.trim();
        app.apiKeys.marketData = String(el.cfgMarketDataKey?.value || "").trim();
        app.apiKeys.finnhub = String(el.cfgFinnhubKey?.value || "").trim();
        app.apiKeys.fmp = String(el.cfgFmpKey?.value || "").trim();
        app.apiKeys.td = String(el.cfgTdKey?.value || "").trim();
        app.prompt = el.prompt.value;
        app.aiMode = String(el.aiMode?.value || app.aiMode || "market_open");
        app.aiStyle = String(el.aiStyle?.value || app.aiStyle || "professional");
        app.aiRoute = String(el.aiRoute?.value || app.aiRoute || "/api/ai/market-terminal").trim() || "/api/ai/market-terminal";
        app.aiExtraContext = String(el.aiExtraContext?.value || app.aiExtraContext || "");
        saveSettingsLocal();
        if (app.token) {
          try {
            await apiFetch("/api/settings", {
              method: "PUT",
              body: JSON.stringify({
                auto_refresh: app.auto,
                dark_mode: app.dark,
                market_data_base_url: app.api.marketDataBaseUrl,
                news_base_url: app.api.newsBaseUrl,
                ai_base_url: app.api.aiBaseUrl,
                websocket_url: app.api.websocketUrl
              })
            });
          } catch {}
        }
        pushLog("Settings saved");
      });

      if (el.apiTestBtn) {
        el.apiTestBtn.addEventListener("click", async () => {
          if (el.apiStatusText) el.apiStatusText.textContent = "Testing...";
          try {
            app.apiKeys.marketData = String(el.cfgMarketDataKey?.value || "").trim();
            app.apiKeys.finnhub = String(el.cfgFinnhubKey?.value || "").trim();
            app.apiKeys.fmp = String(el.cfgFmpKey?.value || "").trim();
            app.apiKeys.td = String(el.cfgTdKey?.value || "").trim();
            const symbols = (app.watchlist || []).slice(0, 2).join(",") || "SPY,QQQ";
            const rows = await directFetch(`/api/market/quote?symbols=${encodeURIComponent(symbols)}${providerQuerySuffix()}`);
            app.apiLive = Array.isArray(rows) && rows.length > 0;
            if (el.apiStatusText) el.apiStatusText.textContent = app.apiLive ? "Live API connected" : "No data returned";
            saveSettingsLocal();
          } catch {
            app.apiLive = false;
            if (el.apiStatusText) el.apiStatusText.textContent = "Connection failed";
          }
        });
      }

      el.auto.addEventListener("change", () => { app.auto = el.auto.checked; saveSettingsLocal(); restartTimer(); pushLog(`Auto refresh ${app.auto ? "enabled" : "disabled"}`); });
      el.dark.addEventListener("change", () => { app.dark = el.dark.checked; saveSettingsLocal(); applyTheme(); pushLog(`Theme ${app.dark ? "dark" : "light"}`); });
      if (el.themeQuickToggle) {
        el.themeQuickToggle.addEventListener("click", () => {
          app.dark = !app.dark;
          saveSettingsLocal();
          applyTheme();
          pushLog(`Theme ${app.dark ? "dark" : "light"}`);
        });
      }

      document.addEventListener("click", (event) => {
        const target = event.target instanceof Element ? event.target.closest("[data-tv-open]") : null;
        if (!target) return;
        event.preventDefault();
        const symbol = String(target.getAttribute("data-tv-open") || "").trim().toUpperCase();
        const interval = String(target.getAttribute("data-tv-interval") || "1D").trim().toUpperCase();
        if (!symbol) return;
        openTradingViewViewer(symbol, interval);
      });

      if (el.tvViewerClose) {
        el.tvViewerClose.addEventListener("click", () => {
          closeTradingViewViewer();
        });
      }
      if (el.tvViewerScan) {
        el.tvViewerScan.addEventListener("click", async (event) => {
          event.preventDefault();
          event.stopPropagation();
          try {
            await scanTradingViewSymbol();
          } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            if (el.tvViewerScanStatus) {
              el.tvViewerScanStatus.textContent = `Scan failed: ${msg}`;
              el.tvViewerScanStatus.classList.remove("ok");
              el.tvViewerScanStatus.classList.add("err");
            }
          }
        });
      }
      if (el.tvViewerBackdrop) {
        el.tvViewerBackdrop.addEventListener("click", () => {
          closeTradingViewViewer();
        });
      }
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && app.tvViewer.open) {
          closeTradingViewViewer();
        }
      });

      if (el.watchAdd && el.watchIn) {
        el.watchAdd.addEventListener("click", async () => {
          const c = el.watchIn.value.trim().toUpperCase();
          if (!c) return;
          if (!app.watchlist.includes(c)) {
            app.watchlist.push(c);
            app.selected = c;
            el.watchIn.value = "";
            saveSettingsLocal();
            renderWatch();
            renderSummary();
            await refreshSelectedSymbol();
            if (app.token) { try { await apiFetch("/api/watchlist", { method: "POST", body: JSON.stringify({ symbol: c }) }); } catch {} }
            pushLog(`${c} added to watchlist`);
          }
        });
        el.watchIn.addEventListener("keydown", (e) => { if (e.key === "Enter") el.watchAdd.click(); });
      }

      if (el.heatRefresh) {
        el.heatRefresh.addEventListener("click", async () => {
          if (app.token) {
            try {
              const heat = await apiFetch("/api/market/heatmap");
              if (Array.isArray(heat.items)) app.heatItems = heat.items;
            } catch {
              for (const h of app.heatItems) h.value = Math.max(20, Math.min(92, Math.round(Number(h.value || 0) + (Math.random() * 8 - 4))));
            }
          } else {
            for (const h of app.heatItems) h.value = Math.max(20, Math.min(92, Math.round(Number(h.value || 0) + (Math.random() * 8 - 4))));
          }
          renderHeat();
          renderSummary();
          pushLog("Heatmap refreshed");
        });
      }

      if (el.aiPresetBtn) {
        el.aiPresetBtn.addEventListener("click", () => {
          const ticker = String(el.aiTicker?.value || app.selected || "SPY").trim().toUpperCase() || "SPY";
          const mode = String(el.aiMode?.value || app.aiMode || "market_open");
          const preset = aiPromptPreset(mode, ticker);
          if (el.prompt) el.prompt.value = preset;
          app.prompt = preset;
          if (el.aiStatus) el.aiStatus.textContent = `Preset loaded • ${mode}`;
        });
      }

      if (el.aiDemoBtn) {
        el.aiDemoBtn.addEventListener("click", () => {
          const ticker = String(el.aiTicker?.value || app.selected || "SPY").trim().toUpperCase() || "SPY";
          const demoPrompt = `Give me a fast market read for ${ticker} with bias, levels, setup, and invalidation.`;
          const demo = [
            `Market Bias: Bullish`,
            ``,
            `Ticker: ${ticker}`,
            `Key Levels:`,
            `- Support: 518.20`,
            `- Current: 521.10`,
            `- Resistance: 523.80`,
            ``,
            `Best Setup:`,
            `Buy constructive pullback above support with breadth confirmation.`,
            ``,
            `Invalidation:`,
            `Loss of support with expanding downside volume.`,
            ``,
            `Confidence: 0.86`
          ].join("\n");
          addAiConversationMessage("user", demoPrompt);
          addAiConversationMessage("assistant", demo);
          app.output = demo;
          renderAiConversation();
          renderAiSections(el.out, demo);
          if (el.aiStatus) el.aiStatus.textContent = "Demo response loaded into chat.";
          saveSettingsLocal();
        });
      }

      if (el.aiClearBtn) {
        el.aiClearBtn.addEventListener("click", () => {
          app.output = "AI agent ready. Connect backend endpoints, then request market bias, macro pressure, trade setups, or a full daily report.";
          renderAiSections(el.out, app.output);
          if (el.prompt) el.prompt.value = "";
          if (el.aiStatus) el.aiStatus.textContent = "Input/output cleared. Conversation kept.";
        });
      }

      if (el.aiNewChatBtn) {
        el.aiNewChatBtn.addEventListener("click", () => {
          app.aiConversation = [{ role: "assistant", content: AI_CHAT_WELCOME, at: new Date().toISOString() }];
          app.output = "New chat started. Ask your first market question.";
          renderAiConversation();
          renderAiSections(el.out, app.output);
          if (el.aiStatus) el.aiStatus.textContent = "New chat started.";
          saveSettingsLocal();
        });
      }

      if (el.aiMode) {
        el.aiMode.addEventListener("change", () => {
          app.aiMode = String(el.aiMode.value || "market_open");
          const ticker = String(el.aiTicker?.value || app.selected || "SPY").trim().toUpperCase() || "SPY";
          if (el.prompt && !String(el.prompt.value || "").trim()) {
            el.prompt.value = aiPromptPreset(app.aiMode, ticker);
            app.prompt = el.prompt.value;
          }
          saveSettingsLocal();
        });
      }

      if (el.aiTicker) {
        el.aiTicker.addEventListener("change", () => {
          const ticker = String(el.aiTicker.value || "").trim().toUpperCase();
          if (ticker) app.selected = ticker;
        });
      }

      el.run.addEventListener("click", async () => {
        await runAiAgent();
      });

      if (el.prompt) {
        el.prompt.addEventListener("keydown", async (e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            e.preventDefault();
            await runAiAgent();
          }
        });
      }

      if (el.prayerRefresh) {
        el.prayerRefresh.addEventListener("click", async () => { await refreshPrayerTimes(); });
      }
      if (el.prayerZip) {
        el.prayerZip.addEventListener("keydown", async (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            await refreshPrayerTimes();
          }
        });
      }

      if (el.quranReciter) {
        el.quranReciter.addEventListener("change", () => {
          applyQuranReciter(el.quranReciter.value, true);
          saveSettingsLocal();
          pushLog("Quran reciter changed");
        });
      }

      if (el.arabicMusicQuery) {
        el.arabicMusicQuery.addEventListener("change", () => {
          applyArabicMusicSource(el.arabicMusicQuery.value);
          saveSettingsLocal();
          pushLog("Arabic music selection changed");
        });
      }

      if (el.quranAudioMain) {
        el.quranAudioMain.addEventListener("canplay", () => {
          app.quranFallbackAttempts = 0;
          app.quranLastFailedUrl = "";
        });
        el.quranAudioMain.addEventListener("error", () => {
          const current = String(el.quranSourceMain?.getAttribute("src") || app.quranUrl || "");
          if (!current) return;
          if (app.quranLastFailedUrl === current) return;
          app.quranLastFailedUrl = current;
          app.quranFallbackAttempts = Number(app.quranFallbackAttempts || 0) + 1;
          const fallbackUrl = nextQuranReciterUrl(current);
          if (fallbackUrl && app.quranFallbackAttempts < Math.max(2, QURAN_RECITERS.length)) {
            applyQuranReciter(fallbackUrl, true);
            pushLog("Quran stream switched to next reciter");
          } else {
            app.quranFallbackAttempts = 0;
            pushLog("Quran stream unavailable right now");
          }
        });
      }

      if (el.prayerPopupClose) {
        el.prayerPopupClose.addEventListener("click", () => {
          if (el.prayerPopup) el.prayerPopup.classList.remove("show");
        });
      }

    }

    function init() {
      loadSettingsLocal();
      try { app.lastPrayerAlertKey = localStorage.getItem("market-ai-prayer-last-alert") || ""; } catch {}
      bind();
      applyTheme();
      renderConfig();
      renderQuranReciters();
      renderArabicMusicQueries();
      ensureAthanBoxes();
      renderPrayerTimes();
      refreshPrayerTimes(app.prayer.zip).catch(() => {});
      startPrayerAlertWatcher();
      startPrayerRefreshScheduler();
      setActiveTab(app.activeTab);
    }
    init();
  
