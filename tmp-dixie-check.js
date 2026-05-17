
    const panelMeta = {
      vin: { title: "VIN Decoder", sub: "Uses NHTSA vPIC decode data when available." },
      builder: { title: "Ad Builder", sub: "Create cash, finance, and down payment ads from decoded data or CSV rows." },
      cash: { title: "Cash Ad", sub: "Standalone cash ad view." },
      finance: { title: "Finance Ad", sub: "Standalone finance ad view." },
      down: { title: "Down Payment Ad", sub: "Standalone down payment ad view." },
      inventory: { title: "Inventory", sub: "Pull up to 1,000 vehicles from CSV, search any vehicle, save inventory, and view KBB + market value." },
      scanai: { title: "Application Scan AI", sub: "Upload docs, extract fields, review confidence, and submit a verified application payload." },
      saved: { title: "Saved Ads", sub: "Saved ads placeholder tab." },
      compliance: { title: "Compliance Center", sub: "Use actual vehicle details and realistic assumptions." },
      settings: { title: "Settings", sub: "Basic notes and workflow guidance." }
    };

    const state = {
      activeTab: "vin",
      csvRows: [],
      inventorySelectedIndex: -1,
      inventoryLimit: 1000,
      inventorySearch: "",
      inventoryPage: 1,
      inventoryPageSize: 100,
      inventoryDecodeCache: {},
      inventoryDecodePending: {},
      decoded: {
        vin: "",
        year: "--",
        make: "--",
        model: "--",
        trim: "--",
        manufacturer: "--"
      },
      scan: {
        customerName: "",
        notes: "",
        pageUrl: "",
        quickAsk: "",
        uploadedDocs: [],
        isScanning: false,
        isSubmitting: false,
        scanComplete: false,
        scanId: "",
        apiStatus: "unknown",
        errorMessage: "",
        successMessage: "",
        serverSummary: {
          completion: 0,
          averageConfidence: 0,
          missingFields: [],
          lowConfidenceFields: []
        },
        report: null,
        fields: {}
      }
    };

    const els = {
      navBtns: Array.from(document.querySelectorAll(".nav-btn")),
      panels: Array.from(document.querySelectorAll(".panel[data-panel]")),
      panelTitle: document.getElementById("panelTitle"),
      panelSub: document.getElementById("panelSub"),
      themeBtn: document.getElementById("themeBtn"),

      vinInput: document.getElementById("vinInput"),
      demoVinBtn: document.getElementById("demoVinBtn"),
      clearVinBtn: document.getElementById("clearVinBtn"),
      decodeVinBtn: document.getElementById("decodeVinBtn"),
      copyToAdBtn: document.getElementById("copyToAdBtn"),
      vinQuickStatus: document.getElementById("vinQuickStatus"),
      vinStatusPill: document.getElementById("vinStatusPill"),

      summaryArea: document.getElementById("summaryArea"),

      adVin: document.getElementById("adVin"),
      adYear: document.getElementById("adYear"),
      adMake: document.getElementById("adMake"),
      adModel: document.getElementById("adModel"),
      adMiles: document.getElementById("adMiles"),
      adPrice: document.getElementById("adPrice"),
      adApr: document.getElementById("adApr"),
      adTerm: document.getElementById("adTerm"),
      adDown: document.getElementById("adDown"),
      adFeatures: document.getElementById("adFeatures"),
      adSellingPoints: document.getElementById("adSellingPoints"),
      adDealer: document.getElementById("adDealer"),
      adDisclosure: document.getElementById("adDisclosure"),

      csvFileInput: document.getElementById("csvFileInput"),
      csvRowSelect: document.getElementById("csvRowSelect"),
      csvStatus: document.getElementById("csvStatus"),
      inventoryCsvFileInput: document.getElementById("inventoryCsvFileInput"),
      inventoryLimitInput: document.getElementById("inventoryLimitInput"),
      inventoryPullBtn: document.getElementById("inventoryPullBtn"),
      inventoryUseCurrentBtn: document.getElementById("inventoryUseCurrentBtn"),
      inventoryStatus: document.getElementById("inventoryStatus"),
      inventoryCountBadge: document.getElementById("inventoryCountBadge"),
      inventorySearchInput: document.getElementById("inventorySearchInput"),
      inventorySaveBtn: document.getElementById("inventorySaveBtn"),
      inventoryLoadSavedBtn: document.getElementById("inventoryLoadSavedBtn"),
      inventoryClearSavedBtn: document.getElementById("inventoryClearSavedBtn"),
      inventoryList: document.getElementById("inventoryList"),
      inventoryPrevPageBtn: document.getElementById("inventoryPrevPageBtn"),
      inventoryNextPageBtn: document.getElementById("inventoryNextPageBtn"),
      inventoryPageInfo: document.getElementById("inventoryPageInfo"),
      fbAdTypeSelect: document.getElementById("fbAdTypeSelect"),
      fbMarketplaceUrl: document.getElementById("fbMarketplaceUrl"),
      invSelVehicle: document.getElementById("invSelVehicle"),
      invSelVin: document.getElementById("invSelVin"),
      invSelPrice: document.getElementById("invSelPrice"),
      invSelMiles: document.getElementById("invSelMiles"),
      invSelKbb: document.getElementById("invSelKbb"),
      invSelKbbRange: document.getElementById("invSelKbbRange"),
      invSelMarket: document.getElementById("invSelMarket"),
      invSelValuationSource: document.getElementById("invSelValuationSource"),
      invSelLevel: document.getElementById("invSelLevel"),
      inventoryValuationSummary: document.getElementById("inventoryValuationSummary"),
      inventoryUseForAdBtn: document.getElementById("inventoryUseForAdBtn"),

      generateAdsBtn: document.getElementById("generateAdsBtn"),
      pullFromVinBtn: document.getElementById("pullFromVinBtn"),
      fillFromCsvBtn: document.getElementById("fillFromCsvBtn"),

      cashAdOutput: document.getElementById("cashAdOutput"),
      financeAdOutput: document.getElementById("financeAdOutput"),
      downAdOutput: document.getElementById("downAdOutput"),
      cashTabOutput: document.getElementById("cashTabOutput"),
      financeTabOutput: document.getElementById("financeTabOutput"),
      downTabOutput: document.getElementById("downTabOutput"),
      copyCashAdBtn: document.getElementById("copyCashAdBtn"),
      copyFinanceAdBtn: document.getElementById("copyFinanceAdBtn"),
      copyDownAdBtn: document.getElementById("copyDownAdBtn"),
      copyCashTabBtn: document.getElementById("copyCashTabBtn"),
      copyFinanceTabBtn: document.getElementById("copyFinanceTabBtn"),
      copyDownTabBtn: document.getElementById("copyDownTabBtn"),
      adCopyStatus: document.getElementById("adCopyStatus"),

      scanCustomerName: document.getElementById("scanCustomerName"),
      scanApiBase: document.getElementById("scanApiBase"),
      scanPageUrl: document.getElementById("scanPageUrl"),
      scanQuickAsk: document.getElementById("scanQuickAsk"),
      scanUploadInput: document.getElementById("scanUploadInput"),
      scanQueuedFiles: document.getElementById("scanQueuedFiles"),
      scanNotes: document.getElementById("scanNotes"),
      scanCheckBtn: document.getElementById("scanCheckBtn"),
      scanRunBtn: document.getElementById("scanRunBtn"),
      scanApiDot: document.getElementById("scanApiDot"),
      scanApiText: document.getElementById("scanApiText"),
      scanErrorMsg: document.getElementById("scanErrorMsg"),
      scanSuccessMsg: document.getElementById("scanSuccessMsg"),
      scanCompletionValue: document.getElementById("scanCompletionValue"),
      scanCompletionBar: document.getElementById("scanCompletionBar"),
      scanConfidenceValue: document.getElementById("scanConfidenceValue"),
      scanIdValue: document.getElementById("scanIdValue"),
      scanStatusValue: document.getElementById("scanStatusValue"),
      scanLowConfidence: document.getElementById("scanLowConfidence"),
      scanMissingFields: document.getElementById("scanMissingFields"),
      scanFieldEditorGrid: document.getElementById("scanFieldEditorGrid"),
      scanSubmitBtn: document.getElementById("scanSubmitBtn"),
      scanSaveDraftBtn: document.getElementById("scanSaveDraftBtn"),
      scanAuditSummary: document.getElementById("scanAuditSummary"),
      scanAuditRows: document.getElementById("scanAuditRows"),
      scanReportOutput: document.getElementById("scanReportOutput")
    };

    const INVENTORY_STORAGE_KEY = "dixie-motors-inventory-v1";
    const SCAN_DRAFT_STORAGE_KEY = "dixie-motors-scan-draft-v1";
    const DEFAULT_SCAN_API_BASE = window.location.origin;

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

    const SCAN_FIELD_GROUPS = [
      { title: "Personal", fields: ["fullName", "dob", "ssnLast4", "phone", "email"] },
      { title: "Residence", fields: ["address", "cityStateZip", "housingPayment", "timeAtResidence"] },
      { title: "Employment", fields: ["employer", "jobTitle", "monthlyIncome", "timeOnJob"] },
      { title: "Vehicle", fields: ["vehicleInterested"] }
    ];

    const SCAN_FIELD_KEYS = Object.keys(SCAN_FIELD_LABELS);

    function createInitialScanFields() {
      const base = {};
      SCAN_FIELD_KEYS.forEach((key) => {
        base[key] = { value: "", confidence: 0, source: "" };
      });
      return base;
    }

    state.scan.fields = createInitialScanFields();

    function $(id) { return document.getElementById(id); }

    function setText(id, value) {
      const node = $(id);
      if (node) node.textContent = value || "--";
    }

    function cleanVin(value) {
      return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    }

    function parseNumber(value) {
      const n = Number(String(value || "").replace(/[^0-9.]/g, ""));
      return Number.isFinite(n) ? n : 0;
    }

    function currency(value) {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(value || 0));
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function scanConfidenceClass(confidence) {
      const n = Number(confidence || 0);
      if (n >= 90) return "high";
      if (n >= 75) return "med";
      return "low";
    }

    function scanCompletionScore(fields) {
      const total = SCAN_FIELD_KEYS.length;
      const completed = SCAN_FIELD_KEYS.filter((key) => String(fields[key]?.value || "").trim()).length;
      return total ? Math.round((completed / total) * 100) : 0;
    }

    function scanAverageConfidence(fields) {
      const values = SCAN_FIELD_KEYS.map((key) => Number(fields[key]?.confidence || 0)).filter((v) => v > 0);
      if (!values.length) return 0;
      return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    }

    function scanMissingLocal(fields) {
      return SCAN_FIELD_KEYS
        .filter((key) => !String(fields[key]?.value || "").trim())
        .map((key) => SCAN_FIELD_LABELS[key]);
    }

    function scanLowConfidenceLocal(fields) {
      return SCAN_FIELD_KEYS
        .filter((key) => String(fields[key]?.value || "").trim() && Number(fields[key]?.confidence || 0) < 80)
        .map((key) => ({
          key,
          label: SCAN_FIELD_LABELS[key],
          confidence: Number(fields[key]?.confidence || 0),
          source: fields[key]?.source || "Detected"
        }));
    }

    function getScanApiBase() {
      const current = String(els.scanApiBase?.value || "").trim();
      if (!current) return DEFAULT_SCAN_API_BASE;
      return current.replace(/\/+$/, "");
    }

    function setScanMessage(type, message) {
      if (!els.scanErrorMsg || !els.scanSuccessMsg) return;
      if (type === "error") {
        els.scanErrorMsg.textContent = message || "";
        els.scanErrorMsg.style.display = message ? "block" : "none";
        els.scanSuccessMsg.style.display = "none";
      } else if (type === "success") {
        els.scanSuccessMsg.textContent = message || "";
        els.scanSuccessMsg.style.display = message ? "block" : "none";
        els.scanErrorMsg.style.display = "none";
      } else {
        els.scanErrorMsg.style.display = "none";
        els.scanSuccessMsg.style.display = "none";
      }
    }

    function setScanApiStatus(status) {
      state.scan.apiStatus = status;
      if (!els.scanApiDot || !els.scanApiText) return;
      els.scanApiDot.className = "scan-api-dot";
      if (status === "online") els.scanApiDot.classList.add("online");
      if (status === "offline") els.scanApiDot.classList.add("offline");
      const text = status === "online"
        ? "Backend status: online"
        : status === "offline"
          ? "Backend status: offline"
          : "Backend status: Not checked";
      els.scanApiText.textContent = text;
    }

    function renderScanQueuedFiles() {
      if (!els.scanQueuedFiles) return;
      if (!state.scan.uploadedDocs.length) {
        els.scanQueuedFiles.innerHTML = '<div class="scan-file-item">No files queued.</div>';
        return;
      }
      els.scanQueuedFiles.innerHTML = state.scan.uploadedDocs
        .map((file) => `<div class="scan-file-item">${escapeHtml(file.name)} (${Math.round(file.size / 1024)} KB)</div>`)
        .join("");
    }

    function renderScanSummary() {
      const completion = state.scan.serverSummary.completion > 0
        ? state.scan.serverSummary.completion
        : scanCompletionScore(state.scan.fields);
      const avg = state.scan.serverSummary.averageConfidence > 0
        ? state.scan.serverSummary.averageConfidence
        : scanAverageConfidence(state.scan.fields);

      if (els.scanCompletionValue) els.scanCompletionValue.textContent = `${completion}%`;
      if (els.scanCompletionBar) els.scanCompletionBar.style.width = `${Math.max(0, Math.min(100, completion))}%`;
      if (els.scanConfidenceValue) els.scanConfidenceValue.textContent = `${avg}%`;
      if (els.scanIdValue) els.scanIdValue.textContent = state.scan.scanId || "Not created yet";
      if (els.scanStatusValue) {
        els.scanStatusValue.textContent = state.scan.scanComplete ? "Ready for review" : "Waiting for scan";
      }
      if (els.scanRunBtn) {
        els.scanRunBtn.disabled = state.scan.isScanning;
        els.scanRunBtn.textContent = state.scan.isScanning ? "Scanning Page..." : "Scan Page + Report";
      }
      if (els.scanSubmitBtn) {
        els.scanSubmitBtn.disabled = state.scan.isSubmitting || !state.scan.scanComplete;
        els.scanSubmitBtn.textContent = state.scan.isSubmitting ? "Submitting..." : "Approve and Push to Backend";
      }
    }

    function renderScanFlags() {
      if (!els.scanLowConfidence || !els.scanMissingFields) return;
      const lowFields = state.scan.serverSummary.lowConfidenceFields.length
        ? state.scan.serverSummary.lowConfidenceFields
        : scanLowConfidenceLocal(state.scan.fields);
      const missing = state.scan.serverSummary.missingFields.length
        ? state.scan.serverSummary.missingFields
        : scanMissingLocal(state.scan.fields);

      if (!lowFields.length) {
        els.scanLowConfidence.innerHTML = '<div class="scan-flag-item">No low-confidence fields yet.</div>';
      } else {
        els.scanLowConfidence.innerHTML = lowFields.map((item) => {
          const confidence = Number(item.confidence || 0);
          return `<div class="scan-flag-item"><strong>${escapeHtml(item.label || SCAN_FIELD_LABELS[item.key] || item.key)}</strong><br>${confidence}% confidence | ${escapeHtml(item.source || "Detected")}</div>`;
        }).join("");
      }

      if (!missing.length) {
        els.scanMissingFields.innerHTML = '<div class="scan-pill ok">All mapped fields are populated.</div>';
      } else {
        els.scanMissingFields.innerHTML = missing.map((item) => `<div class="scan-pill">${escapeHtml(item)}</div>`).join("");
      }
    }

    function renderScanEditors() {
      if (!els.scanFieldEditorGrid) return;
      els.scanFieldEditorGrid.innerHTML = SCAN_FIELD_GROUPS.map((group) => {
        const items = group.fields.map((key) => {
          const field = state.scan.fields[key] || { value: "", confidence: 0, source: "" };
          const confidence = Number(field.confidence || 0);
          const confidenceClass = scanConfidenceClass(confidence);
          return `
            <div class="scan-field-row">
              <div class="scan-field-head">
                <label>${escapeHtml(SCAN_FIELD_LABELS[key])}</label>
                <span class="scan-confidence ${confidenceClass}">${confidence}%</span>
              </div>
              <input data-scan-field="${key}" value="${escapeHtml(field.value || "")}" placeholder="Enter ${escapeHtml(SCAN_FIELD_LABELS[key].toLowerCase())}" />
              <div class="scan-source">Source: ${escapeHtml(field.source || "Not detected yet")}</div>
            </div>
          `;
        }).join("");
        return `<div class="card"><div class="k">${escapeHtml(group.title)}</div>${items}</div>`;
      }).join("");
    }

    function renderScanAudit() {
      if (!els.scanAuditRows || !els.scanAuditSummary) return;
      els.scanAuditRows.innerHTML = SCAN_FIELD_KEYS.map((key) => {
        const field = state.scan.fields[key] || { value: "", confidence: 0, source: "" };
        return `
          <div class="scan-audit-row">
            <div>${escapeHtml(SCAN_FIELD_LABELS[key])}</div>
            <div>${escapeHtml(field.value || "-")}</div>
            <div>${field.confidence ? `${Number(field.confidence)}%` : "-"}</div>
            <div>${escapeHtml(field.source || "-")}</div>
          </div>
        `;
      }).join("");

      const completion = state.scan.serverSummary.completion > 0
        ? state.scan.serverSummary.completion
        : scanCompletionScore(state.scan.fields);
      const avg = state.scan.serverSummary.averageConfidence > 0
        ? state.scan.serverSummary.averageConfidence
        : scanAverageConfidence(state.scan.fields);
      els.scanAuditSummary.textContent = [
        `Completion: ${completion}%`,
        `Average confidence: ${avg}%`,
        `Scan ID: ${state.scan.scanId || "Not created yet"}`,
        `Status: ${state.scan.scanComplete ? "Ready for review" : "Waiting for scan"}`
      ].join("\n");
    }

    function reportListHtml(items) {
      if (!Array.isArray(items) || !items.length) return '<div class="scan-report-text">--</div>';
      return `<ul class="scan-report-list">${items.map((item) => `<li>${escapeHtml(String(item || ""))}</li>`).join("")}</ul>`;
    }

    function renderScanReport() {
      if (!els.scanReportOutput) return;
      const report = state.scan.report;
      if (!report || typeof report !== "object") {
        els.scanReportOutput.innerHTML = '<div class="scan-report-empty">Run "Scan Page + Report" to generate a full page report with detected fields, missing items, issues, and action steps.</div>';
        return;
      }

      const generatedStamp = report.generatedAt ? new Date(report.generatedAt).toLocaleString() : "";
      els.scanReportOutput.innerHTML = `
        <div class="scan-report-head">
          <div class="scan-report-title">${escapeHtml(report.title || "Page Scan Report")}</div>
          <div class="scan-report-meta">
            <span class="scan-report-pill">${escapeHtml(report.pageType || "Application Scan")}</span>
            <span class="scan-report-pill">${escapeHtml(report.scanSource || "Current Page")}</span>
            <span class="scan-report-pill">Confidence ${Number(report.confidence || 0)}%</span>
            ${generatedStamp ? `<span class="scan-report-pill">${escapeHtml(generatedStamp)}</span>` : ""}
          </div>
          <div class="scan-report-text">${escapeHtml(report.summary || "No summary.")}</div>
        </div>
        <div class="scan-report-grid">
          <article class="scan-report-section">
            <div class="t">Main Updates</div>
            ${reportListHtml(report.mainUpdates)}
          </article>
          <article class="scan-report-section">
            <div class="t">Missing Items</div>
            ${reportListHtml(report.missing)}
          </article>
          <article class="scan-report-section">
            <div class="t">Issues</div>
            ${reportListHtml(report.issues)}
          </article>
          <article class="scan-report-section">
            <div class="t">Next Actions</div>
            ${reportListHtml(report.nextActions)}
          </article>
          <article class="scan-report-section full">
            <div class="t">Extracted Snapshot</div>
            <div class="scan-report-text">${Array.isArray(report.extracted) && report.extracted.length
              ? report.extracted.map((row) => `${row.label || "Field"}: ${row.value || "-"} (${Number(row.confidence || 0)}% | ${row.source || "Detected"})`).join("\n")
              : "No extracted fields yet."}</div>
          </article>
        </div>
      `;
    }

    function collectScanPageSnapshotText() {
      const chunks = [];
      const panel = document.querySelector('.panel[data-panel="scanai"]');
      if (panel) chunks.push(String(panel.innerText || "").slice(0, 12000));

      const vehicleContext = [
        els.adYear?.value,
        els.adMake?.value,
        els.adModel?.value,
        els.adMiles?.value ? `${els.adMiles.value} miles` : "",
        els.adPrice?.value ? `$${els.adPrice.value}` : "",
        els.adVin?.value
      ].filter(Boolean).join(" ");
      if (vehicleContext) chunks.push(`Vehicle context: ${vehicleContext}`);

      const docText = String(document.body?.innerText || "").replace(/\s+/g, " ").trim();
      if (docText) chunks.push(docText.slice(0, 22000));
      return chunks.join("\n").slice(0, 32000);
    }

    function firstScanMatch(text, patterns) {
      const input = String(text || "");
      for (const pattern of patterns) {
        const match = input.match(pattern);
        if (match && match[1]) return String(match[1]).trim();
      }
      return "";
    }

    function setLocalScanField(fields, key, value, confidence, source) {
      const clean = String(value || "").replace(/\s+/g, " ").trim();
      if (!clean || !fields[key]) return;
      fields[key] = {
        value: clean,
        confidence: Math.max(0, Math.min(100, Number(confidence || 0))),
        source: String(source || "Current Page")
      };
    }

    function buildScanReportObject({ fields, summary, pageUrl, quickAsk, customerName, scanSource }) {
      const extracted = SCAN_FIELD_KEYS
        .map((key) => ({
          key,
          label: SCAN_FIELD_LABELS[key],
          value: String(fields[key]?.value || "").trim(),
          confidence: Number(fields[key]?.confidence || 0),
          source: String(fields[key]?.source || "Detected")
        }))
        .filter((row) => row.value);
      const lowFields = Array.isArray(summary?.lowConfidenceFields) ? summary.lowConfidenceFields : [];
      const missing = Array.isArray(summary?.missingFields) ? summary.missingFields : [];
      const confidence = Number(summary?.averageConfidence || 0);
      const pageType = "Credit Application / Intake";
      const reportName = String(customerName || "").trim() || "Customer";
      const mainUpdates = [];
      mainUpdates.push(`Detected ${extracted.length} populated fields on this page scan.`);
      if (fields.vehicleInterested?.value) mainUpdates.push(`Vehicle context found: ${fields.vehicleInterested.value}.`);
      if (lowFields.length) mainUpdates.push(`${lowFields.length} field(s) are low confidence and should be verified.`);
      if (quickAsk) mainUpdates.push(`Quick ask captured: ${quickAsk}`);

      const issues = [];
      if (lowFields.length) {
        lowFields.slice(0, 4).forEach((item) => {
          issues.push(`${item.label || "Field"} confidence is ${Number(item.confidence || 0)}%.`);
        });
      }
      if (!issues.length) issues.push("No major confidence issues detected.");
      if (!missing.length) issues.push("All mapped fields currently have values.");

      const nextActions = [];
      if (missing.length) nextActions.push(`Collect missing items: ${missing.slice(0, 5).join(", ")}.`);
      nextActions.push("Review all low-confidence fields with the customer.");
      nextActions.push("After verification, click Approve and Push to Backend.");

      return {
        title: `${reportName} Application Review`,
        summary: `Page scan completed${pageUrl ? ` for ${pageUrl}` : ""}. Confidence ${confidence}%.`,
        pageType,
        scanSource: scanSource || "Current Page",
        confidence,
        mainUpdates,
        extracted,
        missing,
        issues,
        nextActions,
        generatedAt: new Date().toISOString()
      };
    }

    function buildLocalPageScanPayload({ customerName, notes, pageUrl, quickAsk, pageText }) {
      const fields = createInitialScanFields();
      const source = "Current Page Snapshot";
      const merged = [
        customerName,
        notes,
        quickAsk,
        pageUrl,
        pageText,
        els.adDealer?.value || "",
        els.adDisclosure?.value || ""
      ].join("\n");

      const phone = firstScanMatch(merged, [
        /(?:phone|cell|mobile|telephone)\s*[:\-]?\s*([()\d.\-\s]{10,})/i,
        /(\+?1?\s*\(?[2-9]\d{2}\)?[\s.\-]?\d{3}[\s.\-]?\d{4})/
      ]);
      const email = firstScanMatch(merged, [/([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i]);
      const income = firstScanMatch(merged, [/(?:monthly income|gross income|income)\s*[:\-]?\s*\$?\s*([0-9][0-9,]*(?:\.\d{1,2})?)/i]);
      const housing = firstScanMatch(merged, [/(?:housing payment|rent|mortgage)\s*[:\-]?\s*\$?\s*([0-9][0-9,]*(?:\.\d{1,2})?)/i]);
      const employer = firstScanMatch(merged, [/(?:employer|company)\s*[:\-]\s*([^\n\r]+)/i]);
      const address = firstScanMatch(merged, [/(?:address|street)\s*[:\-]\s*([^\n\r]+)/i]);
      const cityStateZip = firstScanMatch(merged, [/\b([A-Z][A-Za-z.'\- ]+,\s*[A-Z]{2}\s+\d{5}(?:-\d{4})?)\b/]);
      const dob = firstScanMatch(merged, [/(?:date of birth|dob)\s*[:\-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i]);
      const ssn4 = firstScanMatch(merged, [/(?:ssn|social security)[^0-9]{0,12}(\d{4})/i]);
      const vehicle = [
        els.adYear?.value,
        els.adMake?.value,
        els.adModel?.value
      ].filter(Boolean).join(" ") || firstScanMatch(merged, [/(?:vehicle interested|desired vehicle)\s*[:\-]\s*([^\n\r]+)/i]);

      setLocalScanField(fields, "fullName", customerName || "Needs Name Confirmation", customerName ? 90 : 58, source);
      setLocalScanField(fields, "phone", phone.replace(/[^\d()\-.\s+]/g, ""), phone ? 86 : 0, source);
      setLocalScanField(fields, "email", email, email ? 90 : 0, source);
      setLocalScanField(fields, "monthlyIncome", income.replace(/[^\d.]/g, ""), income ? 80 : 0, source);
      setLocalScanField(fields, "housingPayment", housing.replace(/[^\d.]/g, ""), housing ? 76 : 0, source);
      setLocalScanField(fields, "employer", employer, employer ? 78 : 0, source);
      setLocalScanField(fields, "address", address, address ? 74 : 0, source);
      setLocalScanField(fields, "cityStateZip", cityStateZip, cityStateZip ? 74 : 0, source);
      setLocalScanField(fields, "dob", dob, dob ? 78 : 0, source);
      setLocalScanField(fields, "ssnLast4", ssn4, ssn4 ? 78 : 0, source);
      setLocalScanField(fields, "vehicleInterested", vehicle, vehicle ? 84 : 0, source);

      const summary = {
        completion: scanCompletionScore(fields),
        averageConfidence: scanAverageConfidence(fields),
        missingFields: scanMissingLocal(fields),
        lowConfidenceFields: scanLowConfidenceLocal(fields)
      };

      return {
        scanId: `page-${Date.now()}`,
        status: "ready_for_review",
        completion: summary.completion,
        averageConfidence: summary.averageConfidence,
        missingFields: summary.missingFields,
        lowConfidenceFields: summary.lowConfidenceFields,
        fields,
        report: buildScanReportObject({
          fields,
          summary,
          pageUrl,
          quickAsk,
          customerName,
          scanSource: "Current Page Snapshot"
        })
      };
    }

    function applyScanPayload(data, fallbackMessage) {
      const payload = data && typeof data === "object" ? data : {};
      hydrateScanFields(payload.fields || {});
      state.scan.scanId = String(payload.scanId || `scan-${Date.now()}`);
      state.scan.serverSummary = {
        completion: Number(payload.completion || 0),
        averageConfidence: Number(payload.averageConfidence || 0),
        missingFields: Array.isArray(payload.missingFields) ? payload.missingFields.map((x) => String(x)) : [],
        lowConfidenceFields: Array.isArray(payload.lowConfidenceFields)
          ? payload.lowConfidenceFields.map((item) => ({
              key: item?.key,
              label: String(item?.label || (item?.key ? SCAN_FIELD_LABELS[item.key] : "")),
              confidence: Number(item?.confidence || 0),
              source: String(item?.source || "")
            }))
          : []
      };
      state.scan.report = payload.report && typeof payload.report === "object"
        ? payload.report
        : buildScanReportObject({
            fields: state.scan.fields,
            summary: state.scan.serverSummary,
            pageUrl: state.scan.pageUrl,
            quickAsk: state.scan.quickAsk,
            customerName: state.scan.customerName,
            scanSource: fallbackMessage || "Scan Result"
          });
      state.scan.scanComplete = true;
    }

    function renderScanTab() {
      renderScanQueuedFiles();
      renderScanSummary();
      renderScanFlags();
      renderScanEditors();
      renderScanAudit();
      renderScanReport();
      setScanMessage(null, "");
      if (state.scan.errorMessage) setScanMessage("error", state.scan.errorMessage);
      if (state.scan.successMessage) setScanMessage("success", state.scan.successMessage);
      setScanApiStatus(state.scan.apiStatus);
    }

    function normalizeScanField(raw) {
      if (raw && typeof raw === "object" && !Array.isArray(raw)) {
        return {
          value: String(raw.value || "").trim(),
          confidence: Math.max(0, Math.min(100, Number(raw.confidence || 0))),
          source: String(raw.source || "").trim()
        };
      }
      return {
        value: String(raw || "").trim(),
        confidence: 0,
        source: ""
      };
    }

    function hydrateScanFields(rawFields) {
      const next = createInitialScanFields();
      SCAN_FIELD_KEYS.forEach((key) => {
        if (rawFields && Object.prototype.hasOwnProperty.call(rawFields, key)) {
          next[key] = normalizeScanField(rawFields[key]);
        }
      });
      state.scan.fields = next;
    }

    function setScanFieldValue(key, value) {
      if (!SCAN_FIELD_LABELS[key]) return;
      const current = state.scan.fields[key] || { value: "", confidence: 0, source: "" };
      state.scan.fields[key] = {
        value: String(value || ""),
        confidence: current.confidence || 0,
        source: current.source || "Manual Review"
      };
      state.scan.serverSummary.completion = 0;
      state.scan.serverSummary.averageConfidence = 0;
      state.scan.serverSummary.missingFields = [];
      state.scan.serverSummary.lowConfidenceFields = [];
      state.scan.report = buildScanReportObject({
        fields: state.scan.fields,
        summary: {
          completion: scanCompletionScore(state.scan.fields),
          averageConfidence: scanAverageConfidence(state.scan.fields),
          missingFields: scanMissingLocal(state.scan.fields),
          lowConfidenceFields: scanLowConfidenceLocal(state.scan.fields)
        },
        pageUrl: state.scan.pageUrl,
        quickAsk: state.scan.quickAsk,
        customerName: state.scan.customerName,
        scanSource: "Manual review update"
      });
      renderScanSummary();
      renderScanFlags();
      renderScanAudit();
      renderScanReport();
    }

    function saveScanDraft() {
      const payload = {
        customerName: state.scan.customerName,
        notes: state.scan.notes,
        pageUrl: state.scan.pageUrl,
        quickAsk: state.scan.quickAsk,
        apiBase: getScanApiBase(),
        fields: state.scan.fields
      };
      localStorage.setItem(SCAN_DRAFT_STORAGE_KEY, JSON.stringify(payload));
      state.scan.successMessage = "Application scan draft saved.";
      state.scan.errorMessage = "";
      renderScanTab();
    }

    function loadScanDraft() {
      try {
        const saved = JSON.parse(localStorage.getItem(SCAN_DRAFT_STORAGE_KEY) || "null");
        if (!saved || typeof saved !== "object") return;
        state.scan.customerName = String(saved.customerName || "");
        state.scan.notes = String(saved.notes || "");
        state.scan.pageUrl = String(saved.pageUrl || state.scan.pageUrl || window.location.href || "");
        state.scan.quickAsk = String(saved.quickAsk || "");
        if (saved.fields && typeof saved.fields === "object") hydrateScanFields(saved.fields);
        if (els.scanApiBase && saved.apiBase) els.scanApiBase.value = String(saved.apiBase);
      } catch {
        // ignore bad saved data
      }
      if (els.scanCustomerName) els.scanCustomerName.value = state.scan.customerName;
      if (els.scanNotes) els.scanNotes.value = state.scan.notes;
      if (els.scanPageUrl) els.scanPageUrl.value = state.scan.pageUrl || window.location.href || "";
      if (els.scanQuickAsk) els.scanQuickAsk.value = state.scan.quickAsk;
    }

    async function checkScanApiHealth() {
      try {
        const response = await fetch(`${getScanApiBase()}/api/health`);
        if (!response.ok) throw new Error("Health check failed.");
        setScanApiStatus("online");
        return true;
      } catch {
        setScanApiStatus("offline");
        state.scan.errorMessage = `Backend is not reachable at ${getScanApiBase()}.`;
        state.scan.successMessage = "";
        renderScanTab();
        return false;
      }
    }

    async function runApplicationScan() {
      state.scan.errorMessage = "";
      state.scan.successMessage = "";
      state.scan.customerName = String(els.scanCustomerName?.value || state.scan.customerName || "");
      state.scan.notes = String(els.scanNotes?.value || state.scan.notes || "");
      state.scan.pageUrl = String(els.scanPageUrl?.value || state.scan.pageUrl || window.location.href || "");
      state.scan.quickAsk = String(els.scanQuickAsk?.value || state.scan.quickAsk || "");
      renderScanTab();

      state.scan.isScanning = true;
      state.scan.scanComplete = false;
      renderScanTab();

      const healthy = await checkScanApiHealth();
      const pageSnapshotText = collectScanPageSnapshotText();

      try {
        let payload = null;
        if (healthy && state.scan.uploadedDocs.length) {
          const formData = new FormData();
          state.scan.uploadedDocs.forEach((file) => formData.append("documents", file));
          formData.append("customerName", state.scan.customerName || "");
          formData.append("notes", state.scan.notes || "");
          formData.append("pageUrl", state.scan.pageUrl || "");
          formData.append("quickAsk", state.scan.quickAsk || "");
          formData.append("pageText", pageSnapshotText || "");

          const response = await fetch(`${getScanApiBase()}/api/scan/upload`, {
            method: "POST",
            body: formData
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData?.error || "Scan request failed.");
          }
          payload = await response.json();
        } else if (healthy) {
          const response = await fetch(`${getScanApiBase()}/api/scan/page`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              customerName: state.scan.customerName || "",
              notes: state.scan.notes || "",
              pageUrl: state.scan.pageUrl || "",
              quickAsk: state.scan.quickAsk || "",
              pageText: pageSnapshotText || ""
            })
          });
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData?.error || "Page scan request failed.");
          }
          payload = await response.json();
        }

        if (!payload) {
          payload = buildLocalPageScanPayload({
            customerName: state.scan.customerName,
            notes: state.scan.notes,
            pageUrl: state.scan.pageUrl,
            quickAsk: state.scan.quickAsk,
            pageText: pageSnapshotText
          });
          state.scan.errorMessage = "";
          state.scan.successMessage = "Backend offline. Local page report generated.";
        } else {
          state.scan.errorMessage = "";
          state.scan.successMessage = state.scan.uploadedDocs.length
            ? "Documents scanned and report generated."
            : "Current page scanned and report generated.";
        }

        applyScanPayload(payload, healthy ? "Backend scan" : "Local scan");
      } catch (error) {
        const payload = buildLocalPageScanPayload({
          customerName: state.scan.customerName,
          notes: state.scan.notes,
          pageUrl: state.scan.pageUrl,
          quickAsk: state.scan.quickAsk,
          pageText: pageSnapshotText
        });
        applyScanPayload(payload, "Local fallback");
        state.scan.errorMessage = "";
        state.scan.successMessage = `Backend scan failed, local report generated. ${error?.message || ""}`.trim();
      } finally {
        state.scan.isScanning = false;
        renderScanTab();
      }
    }

    async function submitReviewedApplication() {
      state.scan.errorMessage = "";
      state.scan.successMessage = "";
      state.scan.customerName = String(els.scanCustomerName?.value || state.scan.customerName || "");
      state.scan.notes = String(els.scanNotes?.value || state.scan.notes || "");
      state.scan.isSubmitting = true;
      renderScanTab();

      const healthy = await checkScanApiHealth();
      if (!healthy) {
        state.scan.isSubmitting = false;
        renderScanTab();
        return;
      }

      try {
        const response = await fetch(`${getScanApiBase()}/api/submit/reviewed`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scanId: state.scan.scanId,
            approvedBy: "Deal Desk User",
            customerName: state.scan.customerName,
            notes: state.scan.notes,
            fields: state.scan.fields
          })
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData?.error || "Submit request failed.");
        }
        const data = await response.json();
        const stamp = data?.submittedAt ? new Date(data.submittedAt).toLocaleString() : new Date().toLocaleString();
        state.scan.successMessage = `Reviewed application submitted successfully at ${stamp}.`;
      } catch (error) {
        state.scan.errorMessage = error?.message || "Could not submit reviewed application.";
      } finally {
        state.scan.isSubmitting = false;
        renderScanTab();
      }
    }

    function computeCheckDigit(vin) {
      const map = {
        A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
        J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
        S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9
      };
      const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
      if (!vin || vin.length !== 17) return "-";
      let sum = 0;
      for (let i = 0; i < 17; i++) {
        const ch = vin[i];
        const value = /[0-9]/.test(ch) ? Number(ch) : (map[ch] || 0);
        sum += value * weights[i];
      }
      const mod = sum % 11;
      return mod === 10 ? "X" : String(mod);
    }

    function decodeYear(ch) {
      const sequence = "ABCDEFGHJKLMNPRSTVWXY123456789";
      const idx = sequence.indexOf(String(ch || "").toUpperCase());
      if (idx < 0) return "--";
      let year = 1980 + idx;
      const maxYear = new Date().getFullYear() + 1;
      while (year + 30 <= maxYear) year += 30;
      return String(year);
    }

    function countryFromWmi(ch) {
      const c = String(ch || "").toUpperCase();
      if (["1", "4", "5"].includes(c)) return "United States";
      if (["2"].includes(c)) return "Canada";
      if (["3"].includes(c)) return "Mexico";
      if (["J"].includes(c)) return "Japan";
      if (["K"].includes(c)) return "Korea";
      if (["S"].includes(c)) return "United Kingdom";
      if (["W"].includes(c)) return "Germany";
      if (["Z"].includes(c)) return "Italy";
      return "Unknown";
    }

    function pick(obj, keys, fallback = "--") {
      for (const key of keys) {
        const v = obj?.[key];
        if (v && String(v).trim() && String(v).trim() !== "0" && String(v).trim().toLowerCase() !== "null") {
          return String(v).trim();
        }
      }
      return fallback;
    }

    function setPill(text, ok = true) {
      els.vinStatusPill.textContent = text;
      if (ok) {
        els.vinStatusPill.style.borderColor = "rgba(52,211,153,0.5)";
        els.vinStatusPill.style.background = "rgba(52,211,153,0.2)";
      } else {
        els.vinStatusPill.style.borderColor = "rgba(251,146,60,0.55)";
        els.vinStatusPill.style.background = "rgba(251,146,60,0.22)";
      }
    }

    function clearDecodeOutput() {
      [
        "modelYearValue", "modelYearSub", "wmiValue", "wmiSub", "countryValue", "countrySub", "manufacturerValue", "manufacturerSub",
        "modelValue", "trimValue", "plantValue", "checkValue", "tbVin", "tbWmi", "tbVds", "tbCheckDigit", "tbYear", "tbPlant", "tbSerial",
        "localBody", "localEngine", "localFuel", "localTransmission", "localDrive", "localDoors"
      ].forEach((id) => setText(id, "--"));
      els.summaryArea.textContent = "Run VIN decode to load details.";
      state.decoded = { vin: "", year: "--", make: "--", model: "--", trim: "--", manufacturer: "--" };
    }

    async function decodeVin() {
      const vin = cleanVin(els.vinInput.value);
      els.vinInput.value = vin;
      els.vinQuickStatus.textContent = vin.length === 17 ? "Valid VIN Format" : "Enter full VIN";

      if (!vin || vin.length !== 17 || /[IOQ]/.test(vin)) {
        clearDecodeOutput();
        setPill("Invalid VIN", false);
        return;
      }

      setPill("Decoding...", true);

      const expected = computeCheckDigit(vin);
      const actual = vin[8];
      const checkOk = expected === actual;
      const fallbackYear = decodeYear(vin[9]);
      const fallbackCountry = countryFromWmi(vin[0]);

      try {
        const url = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/${encodeURIComponent(vin)}?format=json`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`API ${response.status}`);
        const payload = await response.json();
        const row = Array.isArray(payload?.Results) && payload.Results.length ? payload.Results[0] : null;
        if (!row) throw new Error("No decode row returned");

        const make = pick(row, ["Make"]);
        const model = pick(row, ["Model"]);
        const trim = pick(row, ["Trim", "Trim2", "Series", "Series2"]);
        const manufacturer = pick(row, ["Manufacturer", "ManufacturerName"]);
        const modelYear = pick(row, ["ModelYear"], fallbackYear);
        const bodyClass = pick(row, ["BodyClass", "VehicleType"]);
        const driveType = pick(row, ["DriveType"]);
        const engine = pick(row, ["EngineModel", "DisplacementL", "EngineConfiguration"]);
        const fuel = pick(row, ["FuelTypePrimary"]);
        const doors = pick(row, ["Doors"]);
        const transmission = pick(row, ["TransmissionStyle", "TransmissionSpeeds"]);
        const plantCountry = pick(row, ["PlantCountry"], fallbackCountry);
        const plantCity = pick(row, ["PlantCity"], "");
        const plantDisplay = [vin[10], plantCity, plantCountry].filter(Boolean).join(" - ");

        setText("modelYearValue", modelYear);
        setText("modelYearSub", `Year code: ${vin[9]} -> ${modelYear}`);
        setText("wmiValue", vin.slice(0, 3));
        setText("wmiSub", "World manufacturer identifier");
        setText("countryValue", plantCountry);
        setText("countrySub", "Plant country");
        setText("manufacturerValue", manufacturer);
        setText("manufacturerSub", "From NHTSA / VIN");
        setText("modelValue", model);
        setText("trimValue", trim);
        setText("plantValue", plantDisplay || "--");
        setText("checkValue", `${actual} / ${expected}`);

        setText("tbVin", vin);
        setText("tbWmi", vin.slice(0, 3));
        setText("tbVds", vin.slice(3, 8));
        setText("tbCheckDigit", actual);
        setText("tbYear", `${vin[9]} (${modelYear})`);
        setText("tbPlant", vin[10]);
        setText("tbSerial", vin.slice(11));

        setText("localBody", bodyClass);
        setText("localEngine", engine);
        setText("localFuel", fuel);
        setText("localTransmission", transmission);
        setText("localDrive", driveType);
        setText("localDoors", doors);

        els.summaryArea.textContent = [
          `VIN: ${vin}`,
          `Year: ${modelYear}`,
          `Make: ${make}`,
          `Model / Trim: ${model} / ${trim}`,
          `Manufacturer: ${manufacturer}`,
          `Country: ${plantCountry}`,
          `Body / Drive: ${bodyClass} / ${driveType}`,
          `Engine: ${engine}`,
          `Check Digit: ${actual} (${checkOk ? "Valid" : "Mismatch"})`,
          "Mileage: Not stored in VIN"
        ].join("\n");

        state.decoded = { vin, year: modelYear, make, model, trim, manufacturer };
        setPill(checkOk ? "Valid Check Digit" : "Check Digit Mismatch", checkOk);
      } catch (error) {
        clearDecodeOutput();
        setText("modelYearValue", fallbackYear);
        setText("modelYearSub", `Year code: ${vin[9]} -> ${fallbackYear}`);
        setText("wmiValue", vin.slice(0, 3));
        setText("wmiSub", "VIN fallback decode");
        setText("countryValue", fallbackCountry);
        setText("countrySub", "Fallback from VIN");
        setText("checkValue", `${actual} / ${expected}`);
        setText("tbVin", vin);
        setText("tbWmi", vin.slice(0, 3));
        setText("tbVds", vin.slice(3, 8));
        setText("tbCheckDigit", actual);
        setText("tbYear", `${vin[9]} (${fallbackYear})`);
        setText("tbPlant", vin[10]);
        setText("tbSerial", vin.slice(11));
        els.summaryArea.textContent = [
          `VIN: ${vin}`,
          `Year: ${fallbackYear}`,
          `Country: ${fallbackCountry}`,
          "Live NHTSA decode failed right now.",
          `Error: ${error.message || "Unknown"}`,
          "Mileage: Not stored in VIN"
        ].join("\n");

        state.decoded = { vin, year: fallbackYear, make: "--", model: "--", trim: "--", manufacturer: "--" };
        setPill(checkOk ? "Local Decode Only" : "Check Digit Mismatch", false);
      }
    }

    function pullFromVin() {
      const vin = cleanVin(els.vinInput.value || state.decoded.vin);
      if (vin) els.adVin.value = vin;
      if (state.decoded.year && state.decoded.year !== "--") els.adYear.value = state.decoded.year;
      const maker = state.decoded.manufacturer && state.decoded.manufacturer !== "--" ? state.decoded.manufacturer : state.decoded.make;
      if (maker && maker !== "--") els.adMake.value = maker;
      const modelTrim = [state.decoded.model, state.decoded.trim].filter((x) => x && x !== "--").join(" ").trim();
      if (modelTrim) els.adModel.value = modelTrim;
    }

    function copyDecodedToAd() {
      pullFromVin();
      switchTab("builder");
    }

    function calcPayment(price, down, apr, term) {
      const loan = Math.max(0, price - down);
      if (!term) return 0;
      const r = (apr / 100) / 12;
      if (r <= 0) return loan / term;
      return loan * r / (1 - Math.pow(1 + r, -term));
    }

    function cleanRepeatedWords(text) {
      return String(text || "")
        .replace(/\s+/g, " ")
        .replace(/\b([a-z0-9'-]+)(\s+\1\b)+/gi, "$1")
        .replace(/\s+([,.;:!?])/g, "$1")
        .trim();
    }

    function dedupeMarketingText(...values) {
      const seen = new Set();
      const parts = [];
      values.forEach((value) => {
        String(value || "")
          .split(/[\n;|]+/)
          .map((chunk) => chunk.split(","))
          .flat()
          .map((chunk) => chunk.split("."))
          .flat()
          .map((chunk) => cleanRepeatedWords(chunk).replace(/^[-*]+\s*/, "").replace(/[.!\s]+$/g, ""))
          .filter(Boolean)
          .forEach((chunk) => {
            const key = chunk.toLowerCase();
            if (seen.has(key)) return;
            seen.add(key);
            parts.push(chunk);
          });
      });
      return parts.join(", ");
    }

    function finalizeAdText(text) {
      const lines = String(text || "").split("\n");
      const seen = new Set();
      const output = [];
      for (const rawLine of lines) {
        const trimmed = rawLine.trim();
        if (!trimmed) {
          if (output[output.length - 1] !== "") output.push("");
          continue;
        }
        const line = trimmed.startsWith("***") ? trimmed : cleanRepeatedWords(trimmed);
        const key = line.toLowerCase();
        if (!trimmed.startsWith("***") && seen.has(key)) continue;
        if (!trimmed.startsWith("***")) seen.add(key);
        output.push(line);
      }
      while (output.length && output[0] === "") output.shift();
      while (output.length && output[output.length - 1] === "") output.pop();
      return output.join("\n");
    }

    function generateAds() {
      const vin = cleanVin(els.adVin.value);
      const year = String(els.adYear.value || "").trim();
      const make = String(els.adMake.value || "").trim();
      const model = String(els.adModel.value || "").trim();
      const miles = String(els.adMiles.value || "").trim();
      const price = parseNumber(els.adPrice.value);
      const aprInput = parseNumber(els.adApr.value);
      const apr = aprInput > 0 ? aprInput : 6.99;
      const term = Math.max(1, parseInt(String(els.adTerm.value || "60"), 10));
      const down = parseNumber(els.adDown.value);
      const features = String(els.adFeatures.value || "").trim();
      const sellingPoints = String(els.adSellingPoints?.value || "").trim();
      const dealer = String(els.adDealer.value || "").trim();
      const disclosure = String(els.adDisclosure.value || "").trim();

      const payment = Math.round(calcPayment(price, down, apr, term));
      const lowDown = Math.max(1000, Math.min(1500, down === 0 ? 1000 : down));
      const carName = [year, make, model].filter(Boolean).join(" ").trim() || "Vehicle";
      const vinLine = vin ? `VIN: ${vin}\n` : "";
      const milesText = miles ? `${Math.round(parseNumber(miles)).toLocaleString()} miles` : "mileage available on request";
      const cleanMiles = cleanRepeatedWords(milesText).replace(/[.!\s]+$/g, "");
      const combinedFeatures = dedupeMarketingText(features, sellingPoints);
      const salesPitch = [cleanMiles, combinedFeatures].filter(Boolean).join(". ");

      const creditLine = "We work with all credit types. ITIN numbers accepted. Self-employed buyers welcome with bank statements.";
      const disclosureLower = disclosure.toLowerCase();
      const hasCreditLineInDisclosure =
        disclosureLower.includes("all credit") ||
        disclosureLower.includes("itin") ||
        disclosureLower.includes("self-employed") ||
        disclosureLower.includes("self employed") ||
        disclosureLower.includes("bank statement");
      const financeDisclosureBlock = dedupeMarketingText(hasCreditLineInDisclosure ? "" : creditLine, disclosure)
        .split(", ")
        .join(". ");

      const cashAd = finalizeAdText(`*** \u{1F697} VEHICLE ***\n${carName}\n${vinLine}*** \u2728 FEATURES ***\n${salesPitch}\n\n*** \u{1F4B5} CASH PRICE ***\n${currency(price)}\n\n*** \u{1F4E9} MESSAGE TO BUYER ***\nMessage for availability, trade value, or to set a time to see it.\n\n*** \u{1F4CD} DEALER ***\n${dealer}`);
      const financeHeader = `*** \u{1F697} ${carName}${vin ? ` VIN: ${vin}` : ""}`;
      const financeFeatures = `*** \u2728 ${salesPitch}`;
      const financePayment = `*** \u{1F4B3} Estimated payment: about ${currency(payment)}/month\nTerm: ${term} months | Down: ${currency(down)} | APR: ${apr}%`;
      const financeMessage = "*** \u{1F4E9} Ask about approval options, trade-ins, and monthly payment plans.";
      const financeDisclosureLine = cleanRepeatedWords(
        dedupeMarketingText(
          "We work with all credit types. ITIN numbers accepted. Self-employed buyers welcome with bank statements.",
          financeDisclosureBlock
        )
          .split(", ")
          .join(". ")
      )
        .replace(/\s*\.\s*/g, ". ")
        .replace(/\.\s*\./g, ".")
        .replace(/\s+/g, " ")
        .trim();
      const financeAd = finalizeAdText(`${financeHeader}\n${financeFeatures}\n\n${financePayment}\n\n${financeMessage}\n\n*** ${financeDisclosureLine}`);
      const downFeatureTokens = dedupeMarketingText(features, sellingPoints)
        .split(", ")
        .map((token) => cleanRepeatedWords(token).replace(/[.!\s]+$/g, ""))
        .filter(Boolean);
      const carfaxLine = downFeatureTokens.find((token) => /carfax/i.test(token)) || "";
      const downPitchTokens = downFeatureTokens.filter((token) => token !== carfaxLine);
      const downSalesPitch = [cleanMiles, downPitchTokens.join(", ")].filter(Boolean).join(". ");
      const downDisclosureLine = cleanRepeatedWords(
        dedupeMarketingText(
          "We work with all credit types. ITIN numbers accepted. Self-employed buyers welcome with bank statements.",
          financeDisclosureBlock
        )
          .split(", ")
          .join(". ")
      )
        .replace(/\s*\.\s*/g, ". ")
        .replace(/\.\s*\./g, ".")
        .replace(/\s+/g, " ")
        .trim();
      const downHeader = `*** \u{1F697} ${carName}\n${vin ? `VIN: ${vin}\n` : ""}${carfaxLine ? `${carfaxLine}\n` : ""}`;
      const downAd = finalizeAdText(`${downHeader}*** \u2728${downSalesPitch}\n\n*** \u{1F511} Estimated start down payment: ${currency(lowDown)}\nFinance example: ${currency(payment)}/month for ${term} months at ${apr}% APR (qualified buyers)\n\n*** \u{1F4E9} Message with your budget and whether you have a trade. We can go over next steps and estimated options.\n\n*** ${downDisclosureLine}`);

      els.cashAdOutput.value = cashAd;
      els.financeAdOutput.value = financeAd;
      els.downAdOutput.value = downAd;
      els.cashTabOutput.value = cashAd;
      els.financeTabOutput.value = financeAd;
      els.downTabOutput.value = downAd;
    }

    function parseCsv(text) {
      const rows = [];
      let current = "";
      let row = [];
      let inQuotes = false;

      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        const next = text[i + 1];

        if (ch === "\"") {
          if (inQuotes && next === "\"") {
            current += "\"";
            i += 1;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (ch === "," && !inQuotes) {
          row.push(current);
          current = "";
        } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
          if (ch === "\r" && next === "\n") i += 1;
          row.push(current);
          if (!row.every((cell) => !String(cell || "").trim())) rows.push(row.slice());
          row = [];
          current = "";
        } else {
          current += ch;
        }
      }

      if (current.length || row.length) {
        row.push(current);
        if (!row.every((cell) => !String(cell || "").trim())) rows.push(row.slice());
      }

      return rows;
    }

    function normalizeHeader(value) {
      return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
    }

    function findRowValue(row, keys) {
      const entries = Object.entries(row || {});
      for (const key of keys) {
        const direct = row[key];
        if (direct !== undefined && direct !== null && String(direct).trim() !== "") {
          return String(direct).trim();
        }
        const keyNorm = normalizeHeader(key);
        const pair = entries.find(([k]) => normalizeHeader(k) === keyNorm);
        if (pair && pair[1] !== undefined && pair[1] !== null && String(pair[1]).trim() !== "") {
          return String(pair[1]).trim();
        }
      }
      return "";
    }

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function inventoryVehicleLabel(row) {
      return [
        findRowValue(row, ["year", "modelyear"]),
        findRowValue(row, ["make"]),
        findRowValue(row, ["model"]),
        findRowValue(row, ["trim"])
      ].filter(Boolean).join(" ").trim() || "Vehicle";
    }

    function inventoryVehicleVin(row) {
      return cleanVin(findRowValue(row, ["vin", "vehiclevin", "fullvin"]));
    }

    function inventoryVehicleMiles(row) {
      return parseNumber(findRowValue(row, ["mileage", "mileages", "miles", "odometer", "odometerreading", "mileagemi", "currentmileage"]));
    }

    function inventoryVehiclePrice(row) {
      return parseNumber(findRowValue(row, ["price", "cashprice", "askingprice", "saleprice", "internetprice"]));
    }

    function inventoryYear(row) {
      return parseInt(findRowValue(row, ["year", "modelyear"]).replace(/[^0-9]/g, ""), 10) || 0;
    }

    function inventoryValuations(row) {
      const explicitKbb = parseNumber(findRowValue(row, ["kbb", "kbbvalue", "kbbfair", "bookvalue", "bluebook"]));
      const explicitMarket = parseNumber(findRowValue(row, ["marketvalue", "market", "marketprice", "mmr", "avgmarket"]));
      const explicitKbbLow = parseNumber(findRowValue(row, ["kbblow", "kbb_low", "kbbtradein"]));
      const explicitKbbHigh = parseNumber(findRowValue(row, ["kbbhigh", "kbb_high", "kbbretail"]));

      const price = inventoryVehiclePrice(row);
      const miles = inventoryVehicleMiles(row);
      const year = inventoryYear(row);
      const base = price > 0 ? price : 12000;
      const currentYear = new Date().getFullYear();
      const age = year > 0 ? Math.max(0, currentYear - year) : 8;
      const ageFactor = clamp(1 - age * 0.035, 0.58, 1.1);
      const milesFactor = miles > 0 ? clamp(1 - Math.max(miles - 60000, 0) / 260000, 0.68, 1.08) : 1;

      const estimatedMarket = Math.round(base * ageFactor * milesFactor);
      const market = explicitMarket > 0 ? explicitMarket : estimatedMarket;
      const kbb = explicitKbb > 0 ? explicitKbb : Math.round(market * 1.04);
      const kbbLow = explicitKbbLow > 0 ? explicitKbbLow : Math.round(kbb * 0.94);
      const kbbHigh = explicitKbbHigh > 0 ? explicitKbbHigh : Math.round(kbb * 1.06);

      let source = "Estimated from price/year/mileage";
      if (explicitKbb > 0 && explicitMarket > 0) source = "From CSV (KBB + Market)";
      else if (explicitKbb > 0) source = "KBB from CSV, market estimated";
      else if (explicitMarket > 0) source = "Market from CSV, KBB estimated";

      return { price, miles, year, kbb, kbbLow, kbbHigh, market, source };
    }

    function inventoryDealLevel(values) {
      const price = Number(values?.price || 0);
      const market = Number(values?.market || 0);
      if (price <= 0 || market <= 0) {
        return { label: "--", cls: "", note: "Need price + market value" };
      }
      const spreadPct = ((price - market) / market) * 100;
      if (spreadPct <= -2) return { label: "A", cls: "level-a", note: "Strong value vs market" };
      if (spreadPct <= 5) return { label: "B", cls: "level-b", note: "Fair value vs market" };
      if (spreadPct <= 12) return { label: "C", cls: "level-c", note: "Priced above market" };
      return { label: "D", cls: "level-d", note: "High premium vs market" };
    }

    function setInventoryStatus(text) {
      if (els.inventoryStatus) els.inventoryStatus.textContent = text;
    }

    function getInventoryFilteredEntries() {
      const rows = getInventoryRows();
      const query = String(state.inventorySearch || "").trim().toLowerCase();
      const entries = rows.map((row, index) => ({ row, index }));
      if (!query) return entries;
      return entries.filter(({ row }) => {
        const haystack = [
          inventoryVehicleVin(row),
          inventoryVehicleLabel(row),
          findRowValue(row, ["year", "modelyear"]),
          findRowValue(row, ["make"]),
          findRowValue(row, ["model"]),
          findRowValue(row, ["trim", "series", "series2"]),
          findRowValue(row, ["stock", "stocknumber", "stockno"]),
          findRowValue(row, ["manufacturer"])
        ].join(" ").toLowerCase();
        return haystack.includes(query);
      });
    }

    function saveInventorySnapshot() {
      const payload = {
        version: 1,
        savedAt: new Date().toISOString(),
        inventoryLimit: state.inventoryLimit,
        rows: state.csvRows || []
      };
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(payload));
      return payload;
    }

    function loadInventorySnapshot(withStatus = true) {
      const raw = localStorage.getItem(INVENTORY_STORAGE_KEY);
      if (!raw) {
        if (withStatus) setInventoryStatus("No saved inventory found");
        return false;
      }
      try {
        const parsed = JSON.parse(raw);
        const rows = Array.isArray(parsed?.rows) ? parsed.rows : [];
        if (!rows.length) {
          if (withStatus) setInventoryStatus("Saved inventory is empty");
          return false;
        }
        state.csvRows = rows.map((row) => (row && typeof row === "object" ? row : {}));
        state.inventoryLimit = clamp(Number(parsed?.inventoryLimit) || state.inventoryLimit || 1000, 1, 1000);
        if (els.inventoryLimitInput) els.inventoryLimitInput.value = String(state.inventoryLimit);
        syncInventoryLimit();
        const scoped = getInventoryRows();
        populateCsvRowSelect(scoped);
        state.inventoryPage = 1;
        state.inventorySelectedIndex = scoped.length ? 0 : -1;
        if (els.csvStatus) els.csvStatus.value = `Loaded ${scoped.length} rows (from ${state.csvRows.length} total)`;
        renderInventory();
        if (withStatus) {
          const stamp = parsed?.savedAt ? new Date(parsed.savedAt).toLocaleString() : "";
          setInventoryStatus(`Loaded saved inventory (${scoped.length} vehicles${stamp ? ` â€¢ ${stamp}` : ""})`);
        }
        return true;
      } catch {
        if (withStatus) setInventoryStatus("Failed to load saved inventory");
        return false;
      }
    }

    function clearSavedInventorySnapshot() {
      localStorage.removeItem(INVENTORY_STORAGE_KEY);
      setInventoryStatus("Saved inventory cleared");
    }

    async function copyTextToClipboard(text) {
      const value = String(text || "").trim();
      if (!value) return false;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(value);
          return true;
        }
      } catch {}
      try {
        const ta = document.createElement("textarea");
        ta.value = value;
        ta.setAttribute("readonly", "true");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        return !!ok;
      } catch {
        return false;
      }
    }

    function setAdCopyStatus(text) {
      if (els.adCopyStatus) els.adCopyStatus.textContent = text;
    }

    async function copyAdTextWithStatus(text, label) {
      const copied = await copyTextToClipboard(text);
      setAdCopyStatus(copied ? `${label} copied to clipboard.` : `${label} copy failed (browser blocked clipboard).`);
    }

    function selectedFacebookAdText() {
      const type = String(els.fbAdTypeSelect?.value || "cash");
      if (type === "finance") return String(els.financeAdOutput?.value || "");
      if (type === "down") return String(els.downAdOutput?.value || "");
      return String(els.cashAdOutput?.value || "");
    }

    async function pushVehicleToFacebookFromInventory(index) {
      const rows = getInventoryRows();
      if (!Number.isFinite(index) || index < 0 || index >= rows.length) {
        setInventoryStatus("Select a vehicle first");
        return;
      }

      state.inventorySelectedIndex = index;
      if (els.csvRowSelect) els.csvRowSelect.value = String(index);
      fillAdFromCsvRow(index);
      generateAds();

      const adText = selectedFacebookAdText();
      const copied = await copyTextToClipboard(adText);
      const url = String(els.fbMarketplaceUrl?.value || "").trim() || "https://www.facebook.com/marketplace/create/vehicle";
      window.open(url, "_blank", "noopener");
      setInventoryStatus(`Opened Facebook builder for vehicle ${index + 1}. ${copied ? "Ad text copied." : "Clipboard blocked; copy manually from Ad Builder."}`);
    }

    function getInventoryRows() {
      const limit = clamp(Number(state.inventoryLimit) || 1000, 1, 1000);
      return (state.csvRows || []).slice(0, limit);
    }

    function syncInventoryLimit() {
      const raw = Number(els.inventoryLimitInput?.value);
      state.inventoryLimit = clamp(Number.isFinite(raw) ? raw : 1000, 1, 1000);
      if (els.inventoryLimitInput) els.inventoryLimitInput.value = String(state.inventoryLimit);
    }

    function populateCsvRowSelect(rows) {
      if (!els.csvRowSelect) return;
      els.csvRowSelect.innerHTML = "<option>Choose vehicle row</option>";
      rows.forEach((row, idx) => {
        const label = [
          findRowValue(row, ["year", "modelyear"]),
          findRowValue(row, ["make"]),
          findRowValue(row, ["model"]),
          findRowValue(row, ["trim"])
        ].filter(Boolean).join(" ") || findRowValue(row, ["vin"]) || `Row ${idx + 1}`;
        const option = document.createElement("option");
        option.value = String(idx);
        option.textContent = label;
        els.csvRowSelect.appendChild(option);
      });
    }

    function inventoryNeedsDecode(row) {
      const model = findRowValue(row, ["model"]);
      const trim = findRowValue(row, ["trim", "series", "series2"]);
      return !model || !trim;
    }

    function applyInventoryDecodeToRow(row, decoded) {
      if (!row || !decoded) return;
      if (decoded.modelYear && !findRowValue(row, ["year", "modelyear"])) {
        row.year = decoded.modelYear;
        row.modelyear = decoded.modelYear;
      }
      if (decoded.make && !findRowValue(row, ["make"])) row.make = decoded.make;
      if (decoded.model && !findRowValue(row, ["model"])) row.model = decoded.model;
      if (decoded.trim && !findRowValue(row, ["trim", "series", "series2"])) row.trim = decoded.trim;
      if (decoded.manufacturer && !findRowValue(row, ["manufacturer"])) row.manufacturer = decoded.manufacturer;
    }

    async function autoDecodeInventoryVehicle(index) {
      const rows = getInventoryRows();
      if (!Number.isFinite(index) || index < 0 || index >= rows.length) return;
      const row = rows[index];
      if (!inventoryNeedsDecode(row)) return;
      const vin = inventoryVehicleVin(row);
      if (!vin || vin.length !== 17) return;

      const cached = state.inventoryDecodeCache[vin];
      if (cached) {
        applyInventoryDecodeToRow(row, cached);
        populateCsvRowSelect(getInventoryRows());
        renderInventory();
        return;
      }
      if (state.inventoryDecodePending[vin]) return;

      state.inventoryDecodePending[vin] = true;
      setInventoryStatus(`Decoding ${vin} from NHTSA...`);
      try {
        const url = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/${encodeURIComponent(vin)}?format=json`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`API ${response.status}`);
        const payload = await response.json();
        const decodedRow = Array.isArray(payload?.Results) && payload.Results.length ? payload.Results[0] : null;
        if (!decodedRow) throw new Error("No decode row returned");

        const decoded = {
          modelYear: pick(decodedRow, ["ModelYear"], ""),
          make: pick(decodedRow, ["Make"], ""),
          manufacturer: pick(decodedRow, ["Manufacturer", "ManufacturerName"], ""),
          model: pick(decodedRow, ["Model"], ""),
          trim: pick(decodedRow, ["Trim", "Trim2", "Series", "Series2"], "")
        };

        state.inventoryDecodeCache[vin] = decoded;
        applyInventoryDecodeToRow(row, decoded);
        populateCsvRowSelect(getInventoryRows());
        renderInventory();
        setInventoryStatus(`Decoded ${vin}: ${inventoryVehicleLabel(row)}`);
      } catch (error) {
        state.inventoryDecodeCache[vin] = { failed: true };
        setInventoryStatus(`Decode failed for ${vin}: ${error?.message || "Unknown error"}`);
      } finally {
        delete state.inventoryDecodePending[vin];
      }
    }

    function renderInventory() {
      if (!els.inventoryList) return;
      const rows = getInventoryRows();
      const filteredEntries = getInventoryFilteredEntries();
      const totalRows = (state.csvRows || []).length;
      const hasSearch = String(state.inventorySearch || "").trim().length > 0;
      if (els.inventoryCountBadge) {
        els.inventoryCountBadge.textContent = hasSearch
          ? `${filteredEntries.length} / ${rows.length} Match`
          : `${rows.length} / ${totalRows} Vehicles`;
      }

      if (!rows.length) {
        els.inventoryList.innerHTML = `<div class="placeholder">Load a CSV file to pull inventory.</div>`;
        if (els.invSelVehicle) els.invSelVehicle.textContent = "--";
        if (els.invSelVin) els.invSelVin.textContent = "VIN: --";
        if (els.invSelPrice) els.invSelPrice.textContent = "$0";
        if (els.invSelMiles) els.invSelMiles.textContent = "Miles: --";
        if (els.invSelKbb) els.invSelKbb.textContent = "$0";
        if (els.invSelKbbRange) els.invSelKbbRange.textContent = "Range: --";
        if (els.invSelMarket) els.invSelMarket.textContent = "$0";
        if (els.invSelValuationSource) els.invSelValuationSource.textContent = "Source: --";
        if (els.invSelLevel) { els.invSelLevel.textContent = "Level --"; els.invSelLevel.className = "status-pill level-pill"; }
        if (els.inventoryValuationSummary) els.inventoryValuationSummary.textContent = "Select a vehicle row to see KBB and market value.";
        if (els.inventoryPageInfo) els.inventoryPageInfo.textContent = "Page 1 / 1";
        if (els.inventoryPrevPageBtn) els.inventoryPrevPageBtn.disabled = true;
        if (els.inventoryNextPageBtn) els.inventoryNextPageBtn.disabled = true;
        state.inventorySelectedIndex = -1;
        return;
      }

      if (!filteredEntries.length) {
        const query = String(state.inventorySearch || "").trim();
        els.inventoryList.innerHTML = `<div class="placeholder">No vehicles match "${query}".</div>`;
        if (els.inventoryPageInfo) els.inventoryPageInfo.textContent = "Page 1 / 1";
        if (els.inventoryPrevPageBtn) els.inventoryPrevPageBtn.disabled = true;
        if (els.inventoryNextPageBtn) els.inventoryNextPageBtn.disabled = true;
        if (els.invSelVehicle) els.invSelVehicle.textContent = "--";
        if (els.invSelVin) els.invSelVin.textContent = "VIN: --";
        if (els.invSelPrice) els.invSelPrice.textContent = "$0";
        if (els.invSelMiles) els.invSelMiles.textContent = "Miles: --";
        if (els.invSelKbb) els.invSelKbb.textContent = "$0";
        if (els.invSelKbbRange) els.invSelKbbRange.textContent = "Range: --";
        if (els.invSelMarket) els.invSelMarket.textContent = "$0";
        if (els.invSelValuationSource) els.invSelValuationSource.textContent = "Source: --";
        if (els.invSelLevel) { els.invSelLevel.textContent = "Level --"; els.invSelLevel.className = "status-pill level-pill"; }
        if (els.inventoryValuationSummary) els.inventoryValuationSummary.textContent = "No vehicles matched the current search.";
        state.inventorySelectedIndex = -1;
        return;
      }

      const selectedInFiltered = filteredEntries.some((entry) => entry.index === state.inventorySelectedIndex);
      if (!selectedInFiltered) {
        state.inventorySelectedIndex = filteredEntries[0].index;
      }

      const totalPages = Math.max(1, Math.ceil(filteredEntries.length / state.inventoryPageSize));
      state.inventoryPage = clamp(state.inventoryPage, 1, totalPages);
      const start = (state.inventoryPage - 1) * state.inventoryPageSize;
      const end = start + state.inventoryPageSize;
      const pageEntries = filteredEntries.slice(start, end);

      els.inventoryList.innerHTML = pageEntries.map(({ row, index: globalIndex }) => {
        const label = inventoryVehicleLabel(row);
        const vin = inventoryVehicleVin(row) || "--";
        const values = inventoryValuations(row);
        const deal = inventoryDealLevel(values);
        const milesText = values.miles > 0 ? `${Math.round(values.miles).toLocaleString()} mi` : "--";
        const active = globalIndex === state.inventorySelectedIndex ? " active" : "";
        return `<button class="inv-row${active}" data-inv-i="${globalIndex}"><div class="inv-title">${label}</div><div class="inv-meta">VIN: ${vin} | Miles: ${milesText} | Price: ${currency(values.price)}</div><div class="inv-values">KBB: ${currency(values.kbb)} | Market: ${currency(values.market)} | Level ${deal.label}</div></button>`;
      }).join("");

      els.inventoryList.querySelectorAll("button[data-inv-i]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          state.inventorySelectedIndex = parseInt(btn.getAttribute("data-inv-i"), 10);
          renderInventory();
          await autoDecodeInventoryVehicle(state.inventorySelectedIndex);
        });
        btn.addEventListener("dblclick", async () => {
          const idx = parseInt(btn.getAttribute("data-inv-i"), 10);
          state.inventorySelectedIndex = idx;
          renderInventory();
          await autoDecodeInventoryVehicle(idx);
          await pushVehicleToFacebookFromInventory(idx);
        });
      });

      if (els.inventoryPageInfo) els.inventoryPageInfo.textContent = `Page ${state.inventoryPage} / ${totalPages}`;
      if (els.inventoryPrevPageBtn) els.inventoryPrevPageBtn.disabled = state.inventoryPage <= 1;
      if (els.inventoryNextPageBtn) els.inventoryNextPageBtn.disabled = state.inventoryPage >= totalPages;

      const selected = rows[state.inventorySelectedIndex];
      if (!selected) return;
      const label = inventoryVehicleLabel(selected);
      const vin = inventoryVehicleVin(selected) || "--";
      const values = inventoryValuations(selected);
      const deal = inventoryDealLevel(values);

      if (els.invSelVehicle) els.invSelVehicle.textContent = label;
      if (els.invSelVin) els.invSelVin.textContent = `VIN: ${vin}`;
      if (els.invSelPrice) els.invSelPrice.textContent = currency(values.price);
      if (els.invSelMiles) els.invSelMiles.textContent = `Miles: ${values.miles > 0 ? Math.round(values.miles).toLocaleString() : "--"}`;
      if (els.invSelKbb) els.invSelKbb.textContent = currency(values.kbb);
      if (els.invSelKbbRange) els.invSelKbbRange.textContent = `Range: ${currency(values.kbbLow)} - ${currency(values.kbbHigh)}`;
      if (els.invSelMarket) els.invSelMarket.textContent = currency(values.market);
      if (els.invSelValuationSource) els.invSelValuationSource.textContent = `Source: ${values.source}`;
      if (els.invSelLevel) {
        els.invSelLevel.textContent = `Level ${deal.label}`;
        els.invSelLevel.className = `status-pill level-pill ${deal.cls}`.trim();
      }
      if (els.inventoryValuationSummary) {
        els.inventoryValuationSummary.textContent = [
          `${label}`,
          `Deal level: ${deal.label} (${deal.note})`,
          `List price: ${currency(values.price)} | Market value: ${currency(values.market)} | KBB: ${currency(values.kbb)}`,
          `KBB range: ${currency(values.kbbLow)} to ${currency(values.kbbHigh)}`,
          `Valuation source: ${values.source}`
        ].join("\n");
      }
    }

    function loadCsvText(text) {
      const parsed = parseCsv(text);
      if (parsed.length < 2) {
        state.csvRows = [];
        els.csvRowSelect.innerHTML = "<option>Choose vehicle row</option>";
        els.csvStatus.value = "CSV needs headers + rows";
        setInventoryStatus("CSV needs headers + rows");
        renderInventory();
        return;
      }

      const headers = parsed[0].map(normalizeHeader);
      state.csvRows = parsed.slice(1).map((values) => {
        const row = {};
        headers.forEach((h, idx) => { row[h] = String(values[idx] || "").trim(); });
        return row;
      });
      state.inventorySearch = "";
      if (els.inventorySearchInput) els.inventorySearchInput.value = "";

      syncInventoryLimit();
      const inventoryRows = getInventoryRows();
      populateCsvRowSelect(inventoryRows);
      els.csvStatus.value = `Loaded ${inventoryRows.length} rows (from ${state.csvRows.length} total)`;
      state.inventorySelectedIndex = 0;
      state.inventoryPage = 1;
      setInventoryStatus(`Loaded ${inventoryRows.length} vehicles (max ${state.inventoryLimit})`);
      renderInventory();
    }

    function fillAdFromCsvRow(forcedIndex = null) {
      const idx = forcedIndex == null
        ? parseInt(String(els.csvRowSelect.value || "-1"), 10)
        : Number(forcedIndex);
      if (!Number.isFinite(idx) || idx < 0 || idx >= state.csvRows.length) {
        els.csvStatus.value = "Choose a CSV row first";
        return;
      }

      const row = state.csvRows[idx];
      const vin = cleanVin(findRowValue(row, ["vin", "vehiclevin", "fullvin"]));
      const year = findRowValue(row, ["year", "modelyear"]);
      const make = findRowValue(row, ["make"]);
      const model = findRowValue(row, ["model"]);
      const trim = findRowValue(row, ["trim", "series", "series2"]);
      const miles = findRowValue(row, ["mileage", "mileages", "miles", "odometer", "odometerreading", "mileagemi", "currentmileage"]);
      const price = findRowValue(row, ["price", "cashprice", "askingprice", "saleprice", "internetprice"]);
      const apr = findRowValue(row, ["apr", "rate"]);
      const term = findRowValue(row, ["term", "termmonths", "months"]);
      const down = findRowValue(row, ["downpayment", "down", "cashdown"]);
      const features = findRowValue(row, ["features", "feature", "options", "equipment"]);
      const sellingPoints = findRowValue(row, ["sellingpoints", "sellingpoint", "description", "comments", "highlights"]);
      const dealer = findRowValue(row, ["dealer", "dealerline", "store", "dealership"]);
      const disclosure = findRowValue(row, ["disclosure", "terms", "notes"]);

      if (vin) { els.adVin.value = vin; els.vinInput.value = vin; }
      if (year) els.adYear.value = year;
      if (make) els.adMake.value = make;
      const modelTrim = [model, trim].filter(Boolean).join(" ").trim();
      if (modelTrim) els.adModel.value = modelTrim;
      if (miles) els.adMiles.value = miles;
      if (price) els.adPrice.value = price.replace(/[^0-9.]/g, "");
      if (apr) els.adApr.value = apr.replace(/[^0-9.]/g, "");
      if (term) {
        const termDigits = term.replace(/[^0-9]/g, "");
        if (["48", "60", "72", "84"].includes(termDigits)) els.adTerm.value = termDigits;
      }
      if (down) els.adDown.value = down.replace(/[^0-9.]/g, "");
      if (features) els.adFeatures.value = features;
      if (sellingPoints) els.adSellingPoints.value = sellingPoints;
      if (dealer) els.adDealer.value = dealer;
      if (disclosure) els.adDisclosure.value = disclosure;

      els.csvStatus.value = `Filled Ad Builder from row ${idx + 1}`;
    }

    function switchTab(tab) {
      state.activeTab = tab;
      els.navBtns.forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === tab));
      els.panels.forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === tab));
      const meta = panelMeta[tab] || panelMeta.vin;
      els.panelTitle.textContent = meta.title;
      els.panelSub.textContent = meta.sub;
    }

    function loadTheme() {
      const saved = localStorage.getItem("dixie-motors-theme");
      const isLight = saved === "light";
      document.body.classList.toggle("light", isLight);
      els.themeBtn.textContent = isLight ? "Dark Mode" : "Light Mode";
    }

    function toggleTheme() {
      const isLight = !document.body.classList.contains("light");
      document.body.classList.toggle("light", isLight);
      localStorage.setItem("dixie-motors-theme", isLight ? "light" : "dark");
      els.themeBtn.textContent = isLight ? "Dark Mode" : "Light Mode";
    }

    function bind() {
      els.navBtns.forEach((btn) => btn.addEventListener("click", () => switchTab(btn.dataset.tab)));
      els.themeBtn.addEventListener("click", toggleTheme);

      els.demoVinBtn.addEventListener("click", () => {
        els.vinInput.value = "3C6LRVCG0SE517454";
        decodeVin();
      });
      els.clearVinBtn.addEventListener("click", () => {
        els.vinInput.value = "";
        els.vinQuickStatus.textContent = "Enter full VIN";
        setPill("Awaiting Decode", true);
        clearDecodeOutput();
      });
      els.decodeVinBtn.addEventListener("click", decodeVin);
      els.vinInput.addEventListener("keydown", (event) => { if (event.key === "Enter") decodeVin(); });
      els.copyToAdBtn.addEventListener("click", copyDecodedToAd);

      els.generateAdsBtn.addEventListener("click", generateAds);
      els.pullFromVinBtn.addEventListener("click", pullFromVin);
      els.fillFromCsvBtn.addEventListener("click", fillAdFromCsvRow);

      if (els.copyCashAdBtn) els.copyCashAdBtn.addEventListener("click", async () => { await copyAdTextWithStatus(els.cashAdOutput?.value || "", "Cash ad"); });
      if (els.copyFinanceAdBtn) els.copyFinanceAdBtn.addEventListener("click", async () => { await copyAdTextWithStatus(els.financeAdOutput?.value || "", "Finance ad"); });
      if (els.copyDownAdBtn) els.copyDownAdBtn.addEventListener("click", async () => { await copyAdTextWithStatus(els.downAdOutput?.value || "", "Down payment ad"); });
      if (els.copyCashTabBtn) els.copyCashTabBtn.addEventListener("click", async () => { await copyAdTextWithStatus(els.cashTabOutput?.value || "", "Cash ad"); });
      if (els.copyFinanceTabBtn) els.copyFinanceTabBtn.addEventListener("click", async () => { await copyAdTextWithStatus(els.financeTabOutput?.value || "", "Finance ad"); });
      if (els.copyDownTabBtn) els.copyDownTabBtn.addEventListener("click", async () => { await copyAdTextWithStatus(els.downTabOutput?.value || "", "Down payment ad"); });

      els.csvFileInput.addEventListener("change", async () => {
        const file = els.csvFileInput.files?.[0];
        if (!file) return;
        try {
          const text = await file.text();
          loadCsvText(text);
        } catch {
          els.csvStatus.value = "Failed to read CSV";
        }
      });

      if (els.inventoryCsvFileInput) {
        els.inventoryCsvFileInput.addEventListener("change", async () => {
          const file = els.inventoryCsvFileInput.files?.[0];
          if (!file) return;
          try {
            const text = await file.text();
            loadCsvText(text);
            setInventoryStatus(`Loaded inventory from ${file.name}`);
          } catch {
            setInventoryStatus("Failed to read inventory CSV");
          }
        });
      }

      if (els.inventoryLimitInput) {
        els.inventoryLimitInput.addEventListener("change", () => {
          syncInventoryLimit();
          const scoped = getInventoryRows();
          populateCsvRowSelect(scoped);
          state.inventoryPage = 1;
          if (state.inventorySelectedIndex >= scoped.length) state.inventorySelectedIndex = scoped.length - 1;
          setInventoryStatus(`Inventory limit set to ${state.inventoryLimit} vehicles`);
          renderInventory();
        });
      }

      if (els.inventoryPullBtn) {
        els.inventoryPullBtn.addEventListener("click", async () => {
          const file = els.inventoryCsvFileInput?.files?.[0];
          if (!file) {
            setInventoryStatus("Choose inventory CSV file first");
            return;
          }
          try {
            const text = await file.text();
            loadCsvText(text);
            const scoped = getInventoryRows();
            setInventoryStatus(`Pulled ${scoped.length} vehicles (max ${state.inventoryLimit})`);
          } catch {
            setInventoryStatus("Failed to pull inventory from CSV");
          }
        });
      }

      if (els.inventoryUseCurrentBtn) {
        els.inventoryUseCurrentBtn.addEventListener("click", () => {
          if (!state.csvRows.length) {
            setInventoryStatus("No current CSV loaded yet");
            return;
          }
          const scoped = getInventoryRows();
          populateCsvRowSelect(scoped);
          state.inventoryPage = 1;
          if (state.inventorySelectedIndex >= scoped.length) state.inventorySelectedIndex = scoped.length - 1;
          setInventoryStatus(`Using current CSV (${scoped.length} / ${state.csvRows.length})`);
          renderInventory();
        });
      }

      if (els.inventorySearchInput) {
        els.inventorySearchInput.addEventListener("input", () => {
          state.inventorySearch = String(els.inventorySearchInput.value || "").trim();
          state.inventoryPage = 1;
          renderInventory();
        });
      }

      if (els.inventorySaveBtn) {
        els.inventorySaveBtn.addEventListener("click", () => {
          if (!state.csvRows.length) {
            setInventoryStatus("Load inventory first, then save it");
            return;
          }
          const saved = saveInventorySnapshot();
          const stamp = saved?.savedAt ? new Date(saved.savedAt).toLocaleString() : "";
          setInventoryStatus(`Inventory saved (${state.csvRows.length} vehicles${stamp ? ` â€¢ ${stamp}` : ""})`);
        });
      }

      if (els.inventoryLoadSavedBtn) {
        els.inventoryLoadSavedBtn.addEventListener("click", () => {
          loadInventorySnapshot(true);
        });
      }

      if (els.inventoryClearSavedBtn) {
        els.inventoryClearSavedBtn.addEventListener("click", () => {
          clearSavedInventorySnapshot();
        });
      }

      if (els.inventoryPrevPageBtn) {
        els.inventoryPrevPageBtn.addEventListener("click", () => {
          state.inventoryPage = Math.max(1, state.inventoryPage - 1);
          renderInventory();
        });
      }

      if (els.inventoryNextPageBtn) {
        els.inventoryNextPageBtn.addEventListener("click", () => {
          const maxPage = Math.max(1, Math.ceil(getInventoryRows().length / state.inventoryPageSize));
          state.inventoryPage = Math.min(maxPage, state.inventoryPage + 1);
          renderInventory();
        });
      }

      if (els.inventoryUseForAdBtn) {
        els.inventoryUseForAdBtn.addEventListener("click", () => {
          if (!state.csvRows.length || state.inventorySelectedIndex < 0) {
            setInventoryStatus("Select a vehicle first");
            return;
          }
          if (els.csvRowSelect) els.csvRowSelect.value = String(state.inventorySelectedIndex);
          fillAdFromCsvRow(state.inventorySelectedIndex);
          switchTab("builder");
        });
      }

      if (els.scanCustomerName) {
        els.scanCustomerName.addEventListener("input", () => {
          state.scan.customerName = String(els.scanCustomerName.value || "");
        });
      }

      if (els.scanNotes) {
        els.scanNotes.addEventListener("input", () => {
          state.scan.notes = String(els.scanNotes.value || "");
        });
      }

      if (els.scanPageUrl) {
        els.scanPageUrl.addEventListener("input", () => {
          state.scan.pageUrl = String(els.scanPageUrl.value || "");
        });
      }

      if (els.scanQuickAsk) {
        els.scanQuickAsk.addEventListener("input", () => {
          state.scan.quickAsk = String(els.scanQuickAsk.value || "");
        });
      }

      if (els.scanApiBase) {
        els.scanApiBase.addEventListener("change", () => {
          const value = getScanApiBase() || DEFAULT_SCAN_API_BASE;
          els.scanApiBase.value = value;
          localStorage.setItem("dixie-motors-scan-api-base", value);
        });
      }

      if (els.scanUploadInput) {
        els.scanUploadInput.addEventListener("change", () => {
          state.scan.uploadedDocs = Array.from(els.scanUploadInput.files || []);
          state.scan.errorMessage = "";
          state.scan.successMessage = "";
          if (!state.scan.customerName && state.scan.uploadedDocs[0]) {
            state.scan.customerName = state.scan.uploadedDocs[0].name.replace(/\.[^.]+$/, "");
            if (els.scanCustomerName) els.scanCustomerName.value = state.scan.customerName;
          }
          renderScanTab();
        });
      }

      if (els.scanCheckBtn) {
        els.scanCheckBtn.addEventListener("click", async () => {
          state.scan.errorMessage = "";
          state.scan.successMessage = "";
          const healthy = await checkScanApiHealth();
          if (healthy) {
            state.scan.successMessage = "Backend health check passed.";
            renderScanTab();
          }
        });
      }

      if (els.scanRunBtn) {
        els.scanRunBtn.addEventListener("click", runApplicationScan);
      }

      if (els.scanSubmitBtn) {
        els.scanSubmitBtn.addEventListener("click", submitReviewedApplication);
      }

      if (els.scanSaveDraftBtn) {
        els.scanSaveDraftBtn.addEventListener("click", saveScanDraft);
      }

      if (els.scanFieldEditorGrid) {
        els.scanFieldEditorGrid.addEventListener("input", (event) => {
          const target = event.target;
          if (!(target instanceof HTMLInputElement)) return;
          const key = target.dataset.scanField;
          if (!key) return;
          setScanFieldValue(key, target.value);
        });
      }
    }

    function init() {
      bind();
      loadTheme();
      if (els.inventoryLimitInput) els.inventoryLimitInput.value = String(state.inventoryLimit);
      if (els.inventorySearchInput) els.inventorySearchInput.value = state.inventorySearch;
      const hasSavedInventory = loadInventorySnapshot(false);
      const savedScanApiBase = localStorage.getItem("dixie-motors-scan-api-base");
      if (els.scanApiBase) {
        const rawSaved = String(savedScanApiBase || "").trim();
        const looksLegacy4000 = /^(https?:\/\/)?(localhost|127\.0\.0\.1):4000$/i.test(rawSaved);
        els.scanApiBase.value = !rawSaved || looksLegacy4000 ? DEFAULT_SCAN_API_BASE : rawSaved;
      }
      if (!state.scan.pageUrl) state.scan.pageUrl = window.location.href || "";
      loadScanDraft();
      if (els.scanPageUrl && !els.scanPageUrl.value) els.scanPageUrl.value = state.scan.pageUrl || window.location.href || "";
      if (els.scanQuickAsk && !els.scanQuickAsk.value) els.scanQuickAsk.value = state.scan.quickAsk || "";
      renderScanTab();
      switchTab("vin");
      clearDecodeOutput();
      generateAds();
      if (!hasSavedInventory) renderInventory();
    }

    init();
  
