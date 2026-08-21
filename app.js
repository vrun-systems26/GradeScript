/* GradeScript playground UI logic. No dependencies, no network calls. */
(function () {
  "use strict";

  // ---- Embedded examples & sample grade entries (kept in sync with /examples and /sample-logs) ----

  const EXAMPLES = {
    "Biology": `// BIOLOGY — a typical weighted-category grading policy
class Biology {
  category Homework = 15%
  category Tests = 40%
  category Labs = 25%
  category Final = 20%

  late Homework: max 70%
  retake Tests: max 80%
}
`,
    "AP English": `// AP ENGLISH — essay-heavy policy with a big final project
class APEnglish {
  category Essays = 30%
  category Participation = 10%
  category Exams = 35%
  category FinalProject = 25%

  late Essays: max 80%
}
`,
    "Algebra II": `// ALGEBRA II — quiz-heavy policy where quizzes can be retaken
class AlgebraII {
  category Homework = 20%
  category Quizzes = 25%
  category Tests = 35%
  category FinalExam = 20%

  retake Quizzes: max 90%
}
`,
    "Intro CS": `// INTRO TO COMPUTER SCIENCE — project-heavy policy
class IntroCS {
  category Projects = 35%
  category Labs = 20%
  category Midterm = 20%
  category Final = 25%

  late Projects: max 75%
}
`,
    "US History": `// US HISTORY — discussion- and essay-based policy
class USHistory {
  category Essays = 25%
  category Quizzes = 20%
  category Discussion = 15%
  category Exams = 40%

  late Essays: max 75%
}
`,
    "Spanish I": `// SPANISH I — participation-heavy language class
class SpanishI {
  category Participation = 20%
  category Homework = 20%
  category Quizzes = 25%
  category Exams = 35%

  retake Quizzes: max 85%
}
`,
    "✏️ Start your own (blank)": `class MyClass {
  category Homework = 20%
  category Tests = 50%
  category Final = 30%
}
`,
  };

  const EXAMPLE_DESCRIPTIONS = {
    "Biology": "A standard weighted policy: homework, tests, labs, and a final — with late and retake caps.",
    "AP English": "Essay-heavy policy where a big final project counts for a quarter of the grade.",
    "Algebra II": "Quiz-heavy policy where students can retake a quiz instead of being stuck with one bad score.",
    "Intro CS": "Project-heavy policy typical of a coding class, with a lighter final exam.",
    "US History": "Discussion- and essay-based policy with exams carrying the most weight.",
    "Spanish I": "Participation-heavy language class policy where quizzes can be retaken.",
    "✏️ Start your own (blank)": "Not an example to study — a real empty starting point. Use the table below to build your own policy.",
  };

  const SAMPLE_ENTRIES_BY_CLASS = {
    "Biology": [
      { category: "Homework", score: 95 }, { category: "Homework", score: 58, late: true }, { category: "Homework", score: 88 },
      { category: "Tests", score: 74 }, { category: "Tests", score: 85, isRetake: true },
      { category: "Labs", score: 91 }, { category: "Labs", score: 84 },
    ],
    "AP English": [
      { category: "Essays", score: 89 }, { category: "Essays", score: 72, late: true },
      { category: "Participation", score: 95 }, { category: "Participation", score: 90 },
      { category: "Exams", score: 81 },
    ],
    "Algebra II": [
      { category: "Homework", score: 92 }, { category: "Homework", score: 88 }, { category: "Homework", score: 96 },
      { category: "Quizzes", score: 65 }, { category: "Quizzes", score: 90, isRetake: true },
      { category: "Tests", score: 77 },
    ],
    "Intro CS": [
      { category: "Projects", score: 91 }, { category: "Projects", score: 68, late: true },
      { category: "Labs", score: 100 }, { category: "Labs", score: 95 },
      { category: "Midterm", score: 83 },
    ],
    "US History": [
      { category: "Essays", score: 86 }, { category: "Essays", score: 79 },
      { category: "Quizzes", score: 90 }, { category: "Quizzes", score: 84 },
      { category: "Discussion", score: 97 },
    ],
    "Spanish I": [
      { category: "Participation", score: 98 }, { category: "Participation", score: 92 },
      { category: "Homework", score: 85 }, { category: "Homework", score: 90 },
      { category: "Quizzes", score: 70 }, { category: "Quizzes", score: 88, isRetake: true },
    ],
    "✏️ Start your own (blank)": [],
  };

  const DASHBOARD_CLASSES = ["Biology", "AP English", "Algebra II", "Intro CS", "US History", "Spanish I"];

  // ---- DOM refs ----

  const editor = document.getElementById("editor");
  const highlight = document.getElementById("highlight");
  const statusBar = document.getElementById("status-bar");
  const output = document.getElementById("output");
  const gradeResults = document.getElementById("grade-results");
  const exampleSelect = document.getElementById("example-select");
  const exampleDescription = document.getElementById("example-description");
  const tabButtons = document.querySelectorAll(".tab-btn");
  const classNameInput = document.getElementById("class-name-input");
  const policyRows = document.getElementById("policy-rows");
  const weightTotalEl = document.getElementById("weight-total");
  const addCategoryBtn = document.getElementById("add-category-btn");

  let compiledResults = { syllabus: "", spreadsheet: "", lms: "" };
  let activeTab = "syllabus";
  let currentClassDef = null;
  let solverCategory = null;
  let solverTarget = 90;
  let currentEntries = [];

  // table editor state
  let tableState = { className: "MyClass", categories: [] };
  let rowIdCounter = 0;

  // ---- helpers ----

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // Category names in the table can be friendly text ("Extra Credit"); the
  // language's identifiers can't contain spaces, so we sanitize when
  // generating real source, while the table keeps showing what you typed.
  function toIdent(name) {
    const cleaned = String(name || "").trim().replace(/[^A-Za-z0-9_ ]/g, "").replace(/\s+/g, "_");
    return cleaned && /^[A-Za-z_]/.test(cleaned) ? cleaned : "Category" + (cleaned ? "_" + cleaned : "");
  }

  // ---- Syntax highlighting (display-only; independent of the real lexer) ----

  const KEYWORD_RE = /\b(class|category|late|retake|max)\b/g;

  function highlightSource(src) {
    return src.split("\n").map(highlightLine).join("\n");
  }

  function highlightLine(line) {
    const commentIdx = line.indexOf("//");
    let code = commentIdx === -1 ? line : line.slice(0, commentIdx);
    const comment = commentIdx === -1 ? "" : line.slice(commentIdx);

    let escaped = escapeHtml(code);
    escaped = escaped.replace(/"([^"]*)"/g, '<span class="tok-str">"$1"</span>');
    escaped = escaped.replace(/\b(\d+(?:\.\d+)?%?)\b/g, '<span class="tok-num">$1</span>');
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

  // ---- Table editor: state <-> source text ----

  function generateSource(state) {
    let src = `class ${toIdent(state.className) || "MyClass"} {\n`;
    for (const cat of state.categories) {
      src += `  category ${toIdent(cat.name)} = ${cat.weight === "" || cat.weight == null ? 0 : cat.weight}%\n`;
    }
    const lates = state.categories.filter((c) => c.lateMax !== "" && c.lateMax != null);
    const retakes = state.categories.filter((c) => c.retakeMax !== "" && c.retakeMax != null);
    if (lates.length) {
      src += `\n`;
      for (const c of lates) src += `  late ${toIdent(c.name)}: max ${c.lateMax}%\n`;
    }
    if (retakes.length) {
      src += `\n`;
      for (const c of retakes) src += `  retake ${toIdent(c.name)}: max ${c.retakeMax}%\n`;
    }
    src += `}\n`;
    return src;
  }

  function classDefToTableState(cls) {
    return {
      className: cls.name,
      categories: cls.categories.map((c) => {
        const late = cls.latePolicies.find((p) => p.category === c.name);
        const retake = cls.retakePolicies.find((p) => p.category === c.name);
        return {
          id: "r" + rowIdCounter++,
          name: c.name,
          weight: c.weight,
          lateMax: late ? late.max : "",
          retakeMax: retake ? retake.max : "",
        };
      }),
    };
  }

  function renderTable() {
    classNameInput.value = tableState.className;

    policyRows.innerHTML = tableState.categories.map((cat) => `
      <div class="policy-row" data-id="${cat.id}">
        <input type="text" class="row-name" value="${escapeHtml(cat.name)}" placeholder="e.g. Homework" />
        <input type="number" class="row-weight" value="${cat.weight}" min="0" max="100" placeholder="20" />
        <input type="number" class="row-late" value="${cat.lateMax}" min="0" max="100" placeholder="—" />
        <input type="number" class="row-retake" value="${cat.retakeMax}" min="0" max="100" placeholder="—" />
        <button type="button" class="row-delete" aria-label="Remove category" title="Remove category">✕</button>
      </div>
    `).join("");

    const total = tableState.categories.reduce((acc, c) => acc + (parseFloat(c.weight) || 0), 0);
    weightTotalEl.textContent = `Total weight: ${total}%${total === 100 ? " ✓" : ""}`;
    weightTotalEl.className = "weight-total" + (total === 100 ? " ok" : total > 100 ? " over" : " under");

    policyRows.querySelectorAll(".policy-row").forEach((rowEl) => {
      const id = rowEl.dataset.id;
      const cat = tableState.categories.find((c) => c.id === id);
      rowEl.querySelector(".row-name").addEventListener("input", (e) => { cat.name = e.target.value; onTableChange(false); });
      rowEl.querySelector(".row-weight").addEventListener("input", (e) => { cat.weight = e.target.value; onTableChange(true); });
      rowEl.querySelector(".row-late").addEventListener("input", (e) => { cat.lateMax = e.target.value; onTableChange(false); });
      rowEl.querySelector(".row-retake").addEventListener("input", (e) => { cat.retakeMax = e.target.value; onTableChange(false); });
      rowEl.querySelector(".row-delete").addEventListener("click", () => {
        tableState.categories = tableState.categories.filter((c) => c.id !== id);
        renderTable();
        compileAndRender();
      });
    });
  }

  function onTableChange(skipRowRebuild) {
    if (!skipRowRebuild) renderTable(); else {
      const total = tableState.categories.reduce((acc, c) => acc + (parseFloat(c.weight) || 0), 0);
      weightTotalEl.textContent = `Total weight: ${total}%${total === 100 ? " ✓" : ""}`;
      weightTotalEl.className = "weight-total" + (total === 100 ? " ok" : total > 100 ? " over" : " under");
    }
    compileAndRender();
  }

  classNameInput.addEventListener("input", (e) => {
    tableState.className = e.target.value;
    compileAndRender();
  });

  addCategoryBtn.addEventListener("click", () => {
    tableState.categories.push({ id: "r" + rowIdCounter++, name: "", weight: "", lateMax: "", retakeMax: "" });
    renderTable();
    compileAndRender();
    const rows = policyRows.querySelectorAll(".row-name");
    if (rows.length) rows[rows.length - 1].focus();
  });

  // ---- Animated number count-up ----

  function animateNumber(el, from, to, suffix, duration) {
    const start = performance.now();
    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = (from + (to - from) * eased).toFixed(1) + suffix;
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = to.toFixed(1) + suffix;
    }
    requestAnimationFrame(frame);
  }

  // ---- Compile + render ----

  function compileAndRender() {
    const src = generateSource(tableState);
    editor.value = src;
    syncHighlight();

    let cls;
    try {
      cls = GradeScript.compileOne(src);
    } catch (e) {
      statusBar.textContent = "✗ " + e.message;
      statusBar.className = "err";
      output.textContent = "";
      gradeResults.innerHTML = `<div class="test-meta">Fix the policy to see compiled output and live results.</div>`;
      return;
    }

    currentClassDef = cls;
    const totalWeight = cls.categories.reduce((a, c) => a + c.weight, 0);
    const weightNote = totalWeight !== 100 ? ` — note: category weights sum to ${totalWeight}%, not 100%` : "";
    statusBar.textContent = `✓ Parsed class "${cls.name}" — ${cls.categories.length} categories${cls.latePolicies.length ? `, ${cls.latePolicies.length} late polic${cls.latePolicies.length === 1 ? "y" : "ies"}` : ""}${cls.retakePolicies.length ? `, ${cls.retakePolicies.length} retake polic${cls.retakePolicies.length === 1 ? "y" : "ies"}` : ""}${weightNote}`;
    statusBar.className = totalWeight !== 100 ? "err" : "ok";

    try {
      compiledResults.syllabus = GradeScript.toSyllabus(cls);
      compiledResults.spreadsheet = GradeScript.toSpreadsheet(cls);
      compiledResults.lms = GradeScript.toLMS(cls);
      output.textContent = compiledResults[activeTab];
    } catch (e) {
      output.textContent = "Codegen error: " + e.message;
    }

    renderGradeResults(cls);
  }

  function renderGradeResults(cls) {
    const result = GradeScript.computeGrade(cls, currentEntries);

    const categoryNames = cls.categories.map((c) => c.name);
    if (!solverCategory || !categoryNames.includes(solverCategory)) {
      solverCategory = categoryNames[categoryNames.length - 1];
    }

    const breakdownRows = result.breakdown.map((b) => `
      <div class="grade-row">
        <span class="grade-row-cat">${escapeHtml(b.category)}</span>
        <span class="grade-row-weight">${b.weight}%</span>
        <span class="grade-row-avg ${b.hasData ? "" : "no-data"}">${b.hasData ? b.average.toFixed(1) + "%" : "no data yet"}</span>
      </div>
    `).join("");

    const options = categoryNames.map((n) => `<option value="${escapeHtml(n)}" ${n === solverCategory ? "selected" : ""}>${escapeHtml(n)}</option>`).join("");

    let solverHtml = "";
    let solverClass = "";
    if (categoryNames.length === 0) {
      solverHtml = `Add a category above to try this out.`;
    } else {
      try {
        const solve = GradeScript.solveForTarget(cls, currentEntries, solverCategory, solverTarget);
        if (solve.alreadySecured) {
          solverClass = "positive";
          solverHtml = `Good news — that's already locked in. Even a 0% on <strong>${escapeHtml(solverCategory)}</strong> keeps you at or above ${solverTarget}%.`;
        } else if (!solve.achievable) {
          solverHtml = `Not reachable through <strong>${escapeHtml(solverCategory)}</strong> alone, even with a perfect 100% — that's not a verdict on the class, just this one path to it.`;
        } else if (solve.requiredScore <= 60) {
          solverClass = "positive";
          solverHtml = `Comfortably in reach — you need at least <strong>${solve.requiredScore.toFixed(1)}%</strong> on <strong>${escapeHtml(solverCategory)}</strong> to reach ${solverTarget}% overall.`;
        } else {
          solverHtml = `You need at least <strong>${solve.requiredScore.toFixed(1)}%</strong> on <strong>${escapeHtml(solverCategory)}</strong> to reach ${solverTarget}% overall.`;
        }
      } catch (e) {
        solverHtml = `<span class="test-meta">${escapeHtml(e.message)}</span>`;
      }
    }

    const prevCurrent = gradeResults.querySelector("#grade-current-num");
    const prevValue = prevCurrent ? parseFloat(prevCurrent.textContent) : null;

    gradeResults.innerHTML = `
      <div class="grade-hero">
        <div class="grade-hero-number" id="grade-current-num">${result.currentGrade === null ? "—" : "0.0%"}</div>
        <div class="grade-hero-letter grade-letter-${(result.currentLetter || "").charAt(0).toLowerCase() || "n"}">${result.currentLetter || "n/a"}</div>
      </div>
      <div class="grade-caption">Where things stand right now — not a final verdict. Anything with no data yet is still wide open.</div>
      <div class="grade-range">
        <span>Worst case: <strong>${result.worstPossible.toFixed(1)}%</strong> (${result.worstLetter})</span>
        <span>Best case: <strong>${result.bestPossible.toFixed(1)}%</strong> (${result.bestLetter})</span>
      </div>
      <div class="grade-breakdown">
        <div class="grade-row grade-row-head">
          <span class="grade-row-cat">Category</span>
          <span class="grade-row-weight">Weight</span>
          <span class="grade-row-avg">Average</span>
        </div>
        ${breakdownRows || `<div class="test-meta">No categories yet — add one on the left.</div>`}
      </div>
      <div class="grade-solver">
        <div class="grade-solver-title">🎯 What do I need?</div>
        <div class="solver-controls">
          <span>To get</span>
          <input type="number" id="solver-target" min="0" max="100" value="${solverTarget}" ${categoryNames.length === 0 ? "disabled" : ""} />
          <span>% on</span>
          <select id="solver-category" ${categoryNames.length === 0 ? "disabled" : ""}>${options}</select>
        </div>
        <div class="solver-result ${solverClass}">${solverHtml}</div>
      </div>
    `;

    const numEl = document.getElementById("grade-current-num");
    if (result.currentGrade !== null && numEl) {
      animateNumber(numEl, prevValue && !isNaN(prevValue) ? prevValue : 0, result.currentGrade, "%", 500);
    }

    const targetInput = document.getElementById("solver-target");
    const categorySelect = document.getElementById("solver-category");
    if (targetInput) targetInput.addEventListener("input", (e) => {
      const v = parseFloat(e.target.value);
      solverTarget = isNaN(v) ? 0 : v;
      renderGradeResults(currentClassDef);
    });
    if (categorySelect) categorySelect.addEventListener("change", (e) => {
      solverCategory = e.target.value;
      renderGradeResults(currentClassDef);
    });
  }

  // ---- GPA Dashboard ----

  function renderDashboard() {
    const wrap = document.getElementById("dashboard-wrap");
    const rows = [];
    let gpaSum = 0;
    let gpaCount = 0;

    for (const name of DASHBOARD_CLASSES) {
      let rowHtml;
      try {
        const cls = GradeScript.compileOne(EXAMPLES[name]);
        const entries = SAMPLE_ENTRIES_BY_CLASS[name] || [];
        const result = GradeScript.computeGrade(cls, entries);
        const points = result.currentGrade === null ? null : GradeScript.gpaPoints(result.currentLetter);
        if (points !== null) { gpaSum += points; gpaCount++; }
        rowHtml = `
          <div class="dash-row">
            <span class="dash-class">${escapeHtml(cls.name)}</span>
            <span class="dash-grade">${result.currentGrade === null ? "—" : result.currentGrade.toFixed(1) + "%"}</span>
            <span class="dash-letter grade-letter-${(result.currentLetter || "").charAt(0).toLowerCase() || "n"}">${result.currentLetter || "n/a"}</span>
            <span class="dash-points">${points === null ? "—" : points.toFixed(1)}</span>
          </div>`;
      } catch (e) {
        rowHtml = `<div class="dash-row"><span class="dash-class">${escapeHtml(name)}</span><span class="test-meta">error: ${escapeHtml(e.message)}</span></div>`;
      }
      rows.push(rowHtml);
    }

    const overallGpa = gpaCount > 0 ? gpaSum / gpaCount : null;

    wrap.innerHTML = `
      <div class="dash-hero">
        <div class="dash-hero-number">${overallGpa === null ? "—" : overallGpa.toFixed(2)}</div>
        <div class="dash-hero-label">Overall GPA<br/><span class="test-meta">unweighted average across ${gpaCount} class${gpaCount === 1 ? "" : "es"} with data</span></div>
      </div>
      <div class="dash-caption">Most grade calculators only ever show you one class. This adds them all up — using the same sample data as the Build tab's dropdown, one class at a time. Edit a class on the Build tab and its number here won't move; this dashboard is a snapshot of the 6 defaults, not live-linked (yet).</div>
      <div class="dash-table">
        <div class="dash-row dash-row-head">
          <span class="dash-class">Class</span>
          <span class="dash-grade">Grade</span>
          <span class="dash-letter">Letter</span>
          <span class="dash-points">GPA pts</span>
        </div>
        ${rows.join("")}
      </div>
    `;
  }

  // ---- Wiring ----

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeTab = btn.dataset.target;
      output.textContent = compiledResults[activeTab] || "";
    });
  });

  // ---- Top-level view tabs ----

  const viewTabButtons = document.querySelectorAll(".view-tab-btn");
  const views = {
    "build": document.getElementById("view-build"),
    "translate": document.getElementById("view-translate"),
    "dashboard": document.getElementById("view-dashboard"),
  };

  viewTabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      viewTabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      Object.values(views).forEach((v) => v.classList.remove("active"));
      views[btn.dataset.view].classList.add("active");
      if (btn.dataset.view === "dashboard") renderDashboard();
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

  function loadExample(name) {
    const cls = GradeScript.compileOne(EXAMPLES[name]);
    tableState = classDefToTableState(cls);
    currentEntries = SAMPLE_ENTRIES_BY_CLASS[name] || [];
    solverCategory = null;
    renderTable();
    updateExampleDescription();
    compileAndRender();
  }

  exampleSelect.addEventListener("change", () => loadExample(exampleSelect.value));

  // ---- Landing screen: slides + fade into the app ----
  // (the title's letter-by-letter reveal is pure CSS — see #landing-title .letter in styles.css)

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
    void appContent.offsetHeight;
    appContent.classList.add("app-visible");
    setTimeout(() => {
      landingScreen.classList.add("hidden");
    }, 400);
  }

  landingNext.addEventListener("click", () => {
    if (currentSlide < totalSlides) goToSlide(currentSlide + 1);
    else enterApp();
  });

  landingDots.forEach((dot) => {
    dot.addEventListener("click", () => goToSlide(Number(dot.dataset.goto)));
  });

  // ---- Help panel ----

  const helpBtn = document.getElementById("help-btn");
  const helpOverlay = document.getElementById("help-overlay");
  const helpClose = document.getElementById("help-close");

  function openHelp() { helpOverlay.classList.add("open"); }
  function closeHelp() { helpOverlay.classList.remove("open"); }

  helpBtn.addEventListener("click", openHelp);
  helpClose.addEventListener("click", closeHelp);
  helpOverlay.addEventListener("click", (e) => { if (e.target === helpOverlay) closeHelp(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeHelp(); });

  // Initial load
  exampleSelect.value = "Biology";
  loadExample("Biology");
})();
