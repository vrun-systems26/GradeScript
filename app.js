/* ShieldQL playground UI logic. No dependencies, no network calls. */
(function () {
  "use strict";

  // ---- Embedded examples & sample logs (kept in sync with /examples and /sample-logs) ----

  const EXAMPLES = {
    "Credential Stuffing": `// Flags a login that succeeds after several failed attempts from a country
// that doesn't match the account's home country within a short window.
rule CredentialStuffing {
  when event.type == "login"
    and event.failed_attempts >= 5
    and event.country != user.home_country
  within 10m
  severity: high
  tags: "credential-stuffing", "brute-force", "authentication"
  description: "Multiple failed logins followed by access from an unexpected country within 10 minutes"
}
`,
    "Impossible Travel": `// Flags a session where the reported travel speed between two logins for
// the same user is physically impossible.
rule ImpossibleTravel {
  when event.type == "login"
    and event.travel_speed_kmh >= 900
    and event.country != event.previous_country
  within 1h
  severity: critical
  tags: "impossible-travel", "account-takeover"
  description: "Two logins for the same account imply travel faster than commercial air speed"
}
`,
    "Data Exfiltration": `// Flags unusually large outbound transfers to a destination outside the
// corporate network, especially outside business hours.
rule DataExfiltration {
  when event.type == "network_transfer"
    and event.bytes_out >= 500000000
    and event.destination_internal == false
    and event.is_business_hours == false
  within 30m
  severity: high
  tags: "exfiltration", "insider-threat", "network"
  description: "Large outbound transfer to an external destination outside business hours"
}
`,
    "Privilege Escalation": `// Flags a process spawned by a non-admin user that requests admin-level
// privileges shortly after a suspicious download.
rule PrivilegeEscalation {
  when event.type == "process_start"
    and event.requested_privilege == "admin"
    and user.is_admin == false
    and event.process contains "powershell"
  within 5m
  severity: critical
  tags: "privilege-escalation", "endpoint"
  description: "Non-admin user's PowerShell process requested admin privileges"
}
`,
  };

  const SAMPLE_LOGS = [
    { label: "Credential stuffing pattern", user: { id: "u-101", home_country: "US", is_admin: false }, event: { type: "login", failed_attempts: 7, country: "RO", travel_speed_kmh: 0, previous_country: "US", requested_privilege: null, process: "", bytes_out: 0, destination_internal: false, is_business_hours: true } },
    { label: "Normal login", user: { id: "u-102", home_country: "US", is_admin: false }, event: { type: "login", failed_attempts: 0, country: "US", travel_speed_kmh: 0, previous_country: "US", requested_privilege: null, process: "", bytes_out: 0, destination_internal: false, is_business_hours: true } },
    { label: "Impossible travel", user: { id: "u-103", home_country: "DE", is_admin: false }, event: { type: "login", failed_attempts: 0, country: "JP", travel_speed_kmh: 4200, previous_country: "DE", requested_privilege: null, process: "", bytes_out: 0, destination_internal: false, is_business_hours: true } },
    { label: "Large internal transfer (benign)", user: { id: "u-104", home_country: "US", is_admin: false }, event: { type: "network_transfer", bytes_out: 900000000, destination_internal: true, is_business_hours: false, failed_attempts: 0, country: "US", previous_country: "US", travel_speed_kmh: 0, requested_privilege: null, process: "" } },
    { label: "Data exfiltration", user: { id: "u-105", home_country: "US", is_admin: false }, event: { type: "network_transfer", bytes_out: 750000000, destination_internal: false, is_business_hours: false, failed_attempts: 0, country: "US", previous_country: "US", travel_speed_kmh: 0, requested_privilege: null, process: "" } },
    { label: "PowerShell privilege escalation", user: { id: "u-106", home_country: "US", is_admin: false }, event: { type: "process_start", requested_privilege: "admin", process: "C:\\\\Windows\\\\System32\\\\powershell.exe -enc ...", bytes_out: 0, failed_attempts: 0, country: "US", previous_country: "US", travel_speed_kmh: 0, destination_internal: false, is_business_hours: true } },
    { label: "Admin using PowerShell (benign)", user: { id: "u-107", home_country: "US", is_admin: true }, event: { type: "process_start", requested_privilege: "admin", process: "powershell.exe -Command Get-Process", bytes_out: 0, failed_attempts: 0, country: "US", previous_country: "US", travel_speed_kmh: 0, destination_internal: false, is_business_hours: true } },
  ];

  // ---- DOM refs ----

  const editor = document.getElementById("editor");
  const highlight = document.getElementById("highlight");
  const statusBar = document.getElementById("status-bar");
  const output = document.getElementById("output");
  const testResults = document.getElementById("test-results");
  const exampleSelect = document.getElementById("example-select");
  const tabButtons = document.querySelectorAll(".tab-btn");

  let compiledResults = { splunk: "", sigma: "", eql: "" };
  let activeTab = "splunk";

  // ---- Syntax highlighting (display-only; independent of the real lexer) ----

  const KEYWORD_RE = /\b(rule|when|within|severity|tags|description|and|or|not|true|false|contains)\b/g;

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function highlightSource(src) {
    const lines = src.split("\n");
    return lines.map(highlightLine).join("\n");
  }

  function highlightLine(line) {
    // Pull out comment first
    const commentIdx = line.indexOf("//");
    let code = commentIdx === -1 ? line : line.slice(0, commentIdx);
    const comment = commentIdx === -1 ? "" : line.slice(commentIdx);

    let escaped = escapeHtml(code);
    escaped = escaped.replace(/"([^"]*)"/g, '<span class="tok-str">"$1"</span>');
    escaped = escaped.replace(/\b(\d+(?:\.\d+)?(?:ms|s|m|h|d)?)\b/g, '<span class="tok-num">$1</span>');
    escaped = escaped.replace(KEYWORD_RE, '<span class="tok-kw">$1</span>');

    let out = escaped;
    if (comment) out += `<span class="tok-com">${escapeHtml(comment)}</span>`;
    return out;
  }

  function syncHighlight() {
    highlight.innerHTML = highlightSource(editor.value) + "\n";
    highlight.scrollTop = editor.scrollTop;
    highlight.scrollLeft = editor.scrollLeft;
  }

  editor.addEventListener("scroll", () => {
    highlight.scrollTop = editor.scrollTop;
    highlight.scrollLeft = editor.scrollLeft;
  });

  // ---- Compile + render ----

  function render() {
    syncHighlight();
    const src = editor.value;

    let rule;
    try {
      rule = ShieldQL.compileOne(src);
    } catch (e) {
      statusBar.textContent = "✗ " + e.message;
      statusBar.className = "err";
      output.textContent = "";
      testResults.innerHTML = `<div class="test-meta">Fix the rule to see compiled output and test results.</div>`;
      return;
    }

    statusBar.textContent = `✓ Parsed rule "${rule.name}" — severity: ${rule.severity}${rule.within ? `, within: ${rule.within.raw}` : ""}${rule.tags.length ? `, tags: ${rule.tags.join(", ")}` : ""}`;
    statusBar.className = "ok";

    try {
      compiledResults.splunk = ShieldQL.toSplunk(rule);
      compiledResults.sigma = ShieldQL.toSigma(rule);
      compiledResults.eql = ShieldQL.toElasticEQL(rule);
      output.textContent = compiledResults[activeTab];
    } catch (e) {
      output.textContent = "Codegen error: " + e.message;
    }

    renderTests(rule);
  }

  function renderTests(rule) {
    const rows = SAMPLE_LOGS.map((entry) => {
      const { matched, error } = ShieldQL.runRule(rule, { event: entry.event, user: entry.user });
      const badgeClass = error ? "error" : matched ? "match" : "nomatch";
      const badgeText = error ? "ERROR" : matched ? "MATCH" : "no match";
      return `<div class="test-row">
        <span class="badge ${badgeClass}">${badgeText}</span>
        <span class="test-label">${escapeHtml(entry.label)}</span>
        <span class="test-meta">${error ? escapeHtml(error) : ""}</span>
      </div>`;
    });
    const matchCount = SAMPLE_LOGS.filter((entry) => ShieldQL.runRule(rule, { event: entry.event, user: entry.user }).matched).length;
    testResults.innerHTML = `<div class="test-summary">${matchCount} / ${SAMPLE_LOGS.length} sample events matched this rule</div>` + rows.join("");
  }

  // ---- Wiring ----

  editor.addEventListener("input", render);

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeTab = btn.dataset.target;
      output.textContent = compiledResults[activeTab] || "";
    });
  });

  Object.keys(EXAMPLES).forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    exampleSelect.appendChild(opt);
  });

  exampleSelect.addEventListener("change", () => {
    editor.value = EXAMPLES[exampleSelect.value];
    render();
  });

  // ---- Landing screen ----

  const landingScreen = document.getElementById("landing-screen");
  const landingEnter = document.getElementById("landing-enter");
  const appContent = document.getElementById("app-content");

  landingEnter.addEventListener("click", () => {
    landingScreen.classList.add("hidden");
    appContent.classList.remove("app-hidden");
    editor.focus();
  });

  // ---- Help panel + tip banner ----

  const helpBtn = document.getElementById("help-btn");
  const helpOverlay = document.getElementById("help-overlay");
  const helpClose = document.getElementById("help-close");
  const tipBanner = document.getElementById("tip-banner");
  const tipClose = document.getElementById("tip-close");

  function openHelp() { helpOverlay.classList.add("open"); }
  function closeHelp() { helpOverlay.classList.remove("open"); }

  helpBtn.addEventListener("click", openHelp);
  helpClose.addEventListener("click", closeHelp);
  helpOverlay.addEventListener("click", (e) => {
    if (e.target === helpOverlay) closeHelp();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeHelp();
  });

  tipClose.addEventListener("click", () => {
    tipBanner.classList.add("hidden");
    try { localStorage.setItem("shieldql-tip-dismissed", "1"); } catch (e) {}
  });
  try {
    if (localStorage.getItem("shieldql-tip-dismissed") === "1") tipBanner.classList.add("hidden");
  } catch (e) {}

  // Initial load
  exampleSelect.value = "Credential Stuffing";
  editor.value = EXAMPLES["Credential Stuffing"];
  render();
})();
