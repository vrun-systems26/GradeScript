/* PulseQL playground UI logic. No dependencies, no network calls. */
(function () {
  "use strict";

  // ---- Embedded examples & sample logs (kept in sync with /examples and /sample-logs) ----

  const EXAMPLES = {
    "Motion-Activated Lighting": `// MOTION-ACTIVATED LIGHTING — turn on lights when someone walks into a dark room
rule MotionActivatedLighting {
  when sensor.type == "motion"                    // only look at motion sensors
    and sensor.motion == "detected"                // it actually detected movement
    and sensor.light_level < 20                    // ...AND the room is dark (0-100 scale) — try 50 (looser) or 10 (stricter)
    and home.hour >= 18                             // ...AND it's evening or later
  severity: low
  tags: "comfort", "lighting"
  description: "Turn on the lights automatically when someone enters a dark room in the evening"
}
`,
    "Energy Saver": `// ENERGY SAVER — lower the heat automatically when everyone's away and it's cold
rule EnergySaver {
  when sensor.type == "thermostat"                  // only look at thermostat readings
    and home.occupancy_count == 0                    // nobody is home right now
    and sensor.outside_temp_f < 40                    // ...AND it's cold outside — try 32 (stricter) or 55 (looser)
  within 15m                                          // must have been empty for at least 15 minutes
  severity: low
  tags: "energy", "cost-saving"
  description: "Reduce heating automatically once the house has been empty for a while in cold weather"
}
`,
    "Leak Prevention": `// LEAK PREVENTION — shut off the water main before a small drip becomes a flood
rule LeakPrevention {
  when sensor.type == "water"                        // only look at water sensors
    and sensor.leak_detected == true                  // water where there shouldn't be any
    and home.alert_acknowledged == false               // ...AND nobody has already responded
  within 3m                                            // give a person 3 minutes to react first
  severity: critical
  tags: "safety", "water-damage"
  description: "Shut off the main water valve if a leak is detected and nobody has acknowledged it"
}
`,
    "Garden Auto-Watering": `// GARDEN AUTO-WATERING — water the garden only when it actually needs it
rule GardenAutoWatering {
  when sensor.type == "soil"                          // only look at soil moisture sensors
    and sensor.moisture_pct < 30                        // the soil is dry — try 20 (stricter) or 40 (looser)
    and sensor.rain_last_24h_mm < 5                       // ...AND it hasn't rained much recently
  severity: low
  tags: "garden", "water-saving"
  description: "Water the garden automatically only when the soil is actually dry and it hasn't rained"
}
`,
    "✏️ Start your own (blank)": `// YOUR TURN — this is a real, working rule. Edit anything below and watch
// the other panels update live. Every field except "when" is optional.
rule MyAutomation {
  when sensor.type == "motion"                      // 1. what kind of sensor are you watching?
    and sensor.light_level < 20                      // 2. change this number, or add more lines with "and" / "or"
  severity: medium                                    // low, medium, high, or critical
  tags: "example"                                      // optional labels, comma-separated
  description: "Describe what this rule does, in plain words"
}
`,
  };

  const EXAMPLE_DESCRIPTIONS = {
    "Motion-Activated Lighting": "Turns on the lights automatically when someone walks into a dark room in the evening.",
    "Energy Saver": "Lowers the heat automatically once the house has been empty for a while in cold weather.",
    "Leak Prevention": "Shuts off the main water valve if a leak is detected and nobody has responded yet.",
    "Garden Auto-Watering": "Waters the garden only when the soil is actually dry and it hasn't rained recently.",
    "✏️ Start your own (blank)": "Not an example to study — a real empty starting point. Type your own rule here from scratch.",
  };

  const SAMPLE_LOGS = [
    { label: "Motion in a dark evening room", home: { occupancy_count: 1, alert_acknowledged: false, hour: 20 }, sensor: { type: "motion", motion: "detected", light_level: 8, outside_temp_f: 55, leak_detected: false, moisture_pct: 50, rain_last_24h_mm: 10 } },
    { label: "Motion in a bright room (benign)", home: { occupancy_count: 1, alert_acknowledged: false, hour: 15 }, sensor: { type: "motion", motion: "detected", light_level: 80, outside_temp_f: 70, leak_detected: false, moisture_pct: 50, rain_last_24h_mm: 10 } },
    { label: "Empty house, cold outside", home: { occupancy_count: 0, alert_acknowledged: false, hour: 3 }, sensor: { type: "thermostat", motion: "clear", light_level: 0, outside_temp_f: 28, leak_detected: false, moisture_pct: 50, rain_last_24h_mm: 10 } },
    { label: "Someone home, cold outside (benign)", home: { occupancy_count: 2, alert_acknowledged: false, hour: 19 }, sensor: { type: "thermostat", motion: "clear", light_level: 0, outside_temp_f: 28, leak_detected: false, moisture_pct: 50, rain_last_24h_mm: 10 } },
    { label: "Unacknowledged water leak", home: { occupancy_count: 1, alert_acknowledged: false, hour: 9 }, sensor: { type: "water", motion: "clear", light_level: 0, outside_temp_f: 65, leak_detected: true, moisture_pct: 50, rain_last_24h_mm: 10 } },
    { label: "Leak already acknowledged (benign)", home: { occupancy_count: 1, alert_acknowledged: true, hour: 9 }, sensor: { type: "water", motion: "clear", light_level: 0, outside_temp_f: 65, leak_detected: true, moisture_pct: 50, rain_last_24h_mm: 10 } },
    { label: "Dry soil, no recent rain", home: { occupancy_count: 1, alert_acknowledged: false, hour: 7 }, sensor: { type: "soil", motion: "clear", light_level: 0, outside_temp_f: 72, leak_detected: false, moisture_pct: 18, rain_last_24h_mm: 0 } },
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

  let compiledResults = { homeassistant: "", nodered: "", ifttt: "" };
  let activeTab = "homeassistant";

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
      rule = PulseQL.compileOne(src);
    } catch (e) {
      statusBar.textContent = "✗ " + e.message;
      statusBar.className = "err";
      output.textContent = "";
      testResults.innerHTML = `<div class="test-meta">Fix the rule to see compiled output and test results.</div>`;
      return;
    }

    const withinNote = rule.within ? ` — note: the live tester below checks one reading at a time, it doesn't yet simulate the ${rule.within.raw} window itself` : "";
    statusBar.textContent = `✓ Parsed rule "${rule.name}" — priority: ${rule.severity}${rule.within ? `, within: ${rule.within.raw}` : ""}${rule.tags.length ? `, tags: ${rule.tags.join(", ")}` : ""}${withinNote}`;
    statusBar.className = "ok";

    try {
      compiledResults.homeassistant = PulseQL.toHomeAssistant(rule);
      compiledResults.nodered = PulseQL.toNodeRED(rule);
      compiledResults.ifttt = PulseQL.toIFTTT(rule);
      output.textContent = compiledResults[activeTab];
    } catch (e) {
      output.textContent = "Codegen error: " + e.message;
    }

    renderTests(rule);
  }

  function renderTests(rule) {
    const rows = SAMPLE_LOGS.map((entry) => {
      const { matched, error } = PulseQL.runRule(rule, { sensor: entry.sensor, home: entry.home });
      const badgeClass = error ? "error" : matched ? "match" : "nomatch";
      const badgeText = error ? "ERROR" : matched ? "MATCH" : "no match";
      return `<div class="test-row">
        <span class="badge ${badgeClass}">${badgeText}</span>
        <span class="test-label">${escapeHtml(entry.label)}</span>
        <span class="test-meta">${error ? escapeHtml(error) : ""}</span>
      </div>`;
    });
    const matchCount = SAMPLE_LOGS.filter((entry) => PulseQL.runRule(rule, { sensor: entry.sensor, home: entry.home }).matched).length;
    testResults.innerHTML = `<div class="test-summary">${matchCount} / ${SAMPLE_LOGS.length} sample readings matched this rule</div>` + rows.join("");
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
  exampleSelect.value = "Motion-Activated Lighting";
  editor.value = EXAMPLES["Motion-Activated Lighting"];
  updateExampleDescription();
  render();
})();
