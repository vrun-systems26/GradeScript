/* ShieldQL playground UI logic. No dependencies, no network calls. */
(function () {
  "use strict";

  // ---- Embedded examples & sample logs (kept in sync with /examples and /sample-logs) ----

  const EXAMPLES = {
    "Credential Stuffing": `// CREDENTIAL STUFFING — someone trying a list of stolen passwords against your login page
rule CredentialStuffing {
  when event.type == "login"                       // only look at login attempts
    and event.failed_attempts >= 5                  // 5+ wrong passwords in a row — try 2 (stricter) or 10 (looser)
    and event.country != user.home_country          // ...AND it's from a different country than usual
  within 10m                                        // all of this happening inside a 10-minute window
  severity: high
  tags: "credential-stuffing", "brute-force", "authentication"
  description: "Multiple failed logins followed by access from an unexpected country within 10 minutes"
}
`,
    "Impossible Travel": `// IMPOSSIBLE TRAVEL — same account logging in faster than a human could really travel
rule ImpossibleTravel {
  when event.type == "login"                        // only look at login attempts
    and event.travel_speed_kmh >= 900                // 900 km/h ~ commercial airplane speed — try 2000 (stricter) or 500 (looser)
    and event.country != event.previous_country       // ...AND the country changed since their last login
  within 1h
  severity: critical
  tags: "impossible-travel", "account-takeover"
  description: "Two logins for the same account imply travel faster than commercial air speed"
}
`,
    "Data Exfiltration": `// DATA EXFILTRATION — someone quietly copying a huge pile of company data outward
rule DataExfiltration {
  when event.type == "network_transfer"              // only look at file/network transfers
    and event.bytes_out >= 500000000                 // 500,000,000 bytes ~ 500 MB — try 2000000000 (2GB, stricter) or 100000000 (100MB, looser)
    and event.destination_internal == false          // ...AND it's leaving the company network
    and event.is_business_hours == false              // ...AND it's happening outside normal work hours
  within 30m
  severity: high
  tags: "exfiltration", "insider-threat", "network"
  description: "Large outbound transfer to an external destination outside business hours"
}
`,
    "Privilege Escalation": `// PRIVILEGE ESCALATION — a normal user's program asking for admin (full-control) powers
rule PrivilegeEscalation {
  when event.type == "process_start"                 // only look at programs starting up
    and event.requested_privilege == "admin"         // it's asking for admin-level access
    and user.is_admin == false                       // ...AND the person running it isn't actually an admin
    and event.process contains "powershell"           // ...AND it's a PowerShell process — try "cmd.exe" instead
  within 5m
  severity: critical
  tags: "privilege-escalation", "endpoint"
  description: "Non-admin user's PowerShell process requested admin privileges"
}
`,
    "✏️ Start your own (blank)": `// YOUR TURN — this is a real, working rule. Edit anything below and watch
// panels 2 and 3 update live. Every field except "when" is optional.
rule MyDetection {
  when event.type == "login"                        // 1. what kind of event are you watching for?
    and event.failed_attempts >= 5                   // 2. change this number, or add more lines with "and" / "or"
  severity: medium                                    // low, medium, high, or critical
  tags: "example"                                      // optional labels, comma-separated
  description: "Describe what this rule catches, in plain words"
}
`,
  };

  const EXAMPLE_DESCRIPTIONS = {
    "Credential Stuffing": "Detects logins after repeated failed passwords from an unexpected country — a classic stolen-password attack.",
    "Impossible Travel": "Detects two logins for the same account that imply travel faster than a commercial flight.",
    "Data Exfiltration": "Detects unusually large file transfers leaving the network outside business hours.",
    "Privilege Escalation": "Detects a non-admin user's PowerShell process requesting admin-level access.",
    "✏️ Start your own (blank)": "Not an example to study — a real empty starting point. Type your own rule here from scratch.",
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
  const exampleDescription = document.getElementById("example-description");
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

    const withinNote = rule.within ? ` — note: the live tester below checks one event at a time, it doesn't yet simulate the ${rule.within.raw} window itself` : "";
    statusBar.textContent = `✓ Parsed rule "${rule.name}" — severity: ${rule.severity}${rule.within ? `, within: ${rule.within.raw}` : ""}${rule.tags.length ? `, tags: ${rule.tags.join(", ")}` : ""}${withinNote}`;
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

  // ---- Top-level view tabs (Write & Test vs. See it Translated) ----

  const viewTabButtons = document.querySelectorAll(".view-tab-btn");
  const views = { "write-test": document.getElementById("view-write-test"), "translate": document.getElementById("view-translate") };

  viewTabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      viewTabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      Object.values(views).forEach((v) => v.classList.remove("active"));
      views[btn.dataset.view].classList.add("active");
    });
  });

  Object.keys(EXAMPLES).forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    exampleSelect.appendChild(opt);
  });

  function updateExampleDescription() {
    const desc = EXAMPLE_DESCRIPTIONS[exampleSelect.value] || "";
    exampleDescription.innerHTML = `<strong>${escapeHtml(exampleSelect.value)}</strong> — ${escapeHtml(desc)}`;
  }

  exampleSelect.addEventListener("change", () => {
    editor.value = EXAMPLES[exampleSelect.value];
    updateExampleDescription();
    render();
  });

  // ---- Landing screen: slides + fade into the app ----

  const landingScreen = document.getElementById("landing-screen");
  const appContent = document.getElementById("app-content");
  const landingSlides = Array.from(document.querySelectorAll(".landing-slide"));
  const landingDots = Array.from(document.querySelectorAll(".landing-dot"));
  const landingNext = document.getElementById("landing-next");
  const totalSlides = landingSlides.length;
  let currentSlide = 1;

  function goToSlide(n) {
    currentSlide = n;
    landingSlides.forEach((s) => {
      const isTarget = Number(s.dataset.slide) === n;
      s.classList.toggle("active", isTarget);
      if (isTarget) { s.style.animation = "none"; void s.offsetWidth; s.style.animation = ""; }
    });
    landingDots.forEach((d) => d.classList.toggle("active", Number(d.dataset.goto) === n));
    landingNext.textContent = n === totalSlides ? "Open the playground →" : "Next →";
  }

  function enterApp() {
    landingScreen.classList.add("fading-out");
    appContent.classList.remove("app-hidden");
    void appContent.offsetHeight; // force a reflow so the opacity transition below actually triggers
    appContent.classList.add("app-visible");
    setTimeout(() => {
      landingScreen.classList.add("hidden");
      editor.focus();
    }, 400);
  }

  landingNext.addEventListener("click", () => {
    if (currentSlide < totalSlides) goToSlide(currentSlide + 1);
    else enterApp();
  });

  landingDots.forEach((dot) => {
    dot.addEventListener("click", () => goToSlide(Number(dot.dataset.goto)));
  });

  // ---- Title decode/glitch animation: letters cycle through 0/1 before resolving ----

  function scrambleLetter(el, finalChar, startDelay) {
    const pool = "01";
    const scrambleDuration = 500 + Math.random() * 300;
    const intervalMs = 45;
    el.classList.add("scrambling");
    setTimeout(() => {
      const startedAt = Date.now();
      const iv = setInterval(() => {
        if (Date.now() - startedAt >= scrambleDuration) {
          clearInterval(iv);
          el.textContent = finalChar;
          el.classList.remove("scrambling");
        } else {
          el.textContent = pool[Math.floor(Math.random() * pool.length)];
        }
      }, intervalMs);
    }, startDelay);
  }

  function runTitleScramble() {
    const letters = Array.from(document.querySelectorAll("#landing-title .letter"));
    letters.forEach((el, i) => {
      const finalChar = el.dataset.char;
      scrambleLetter(el, finalChar, i * 70);
    });
  }

  runTitleScramble();

  // ---- Help panel ----

  const helpBtn = document.getElementById("help-btn");
  const helpOverlay = document.getElementById("help-overlay");
  const helpClose = document.getElementById("help-close");

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

  // Initial load
  exampleSelect.value = "Credential Stuffing";
  editor.value = EXAMPLES["Credential Stuffing"];
  updateExampleDescription();
  render();
})();
