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

  const DEFAULT_DROPDOWN_NAMES = ["Biology", "AP English", "Algebra II", "Intro CS", "US History", "Spanish I"];

  // Dropdown labels ("AP English") don't always match the internal class
  // identifier inside the source ("APEnglish", no space — identifiers can't
  // contain spaces). Build a reverse lookup once at startup so live state
  // and sample entries can be found by whichever name we have on hand.
  const CLASSNAME_TO_DROPDOWN = {};
  DEFAULT_DROPDOWN_NAMES.forEach((dropdownName) => {
    try {
      CLASSNAME_TO_DROPDOWN[GradeScript.compileOne(EXAMPLES[dropdownName]).name] = dropdownName;
    } catch (e) { /* ignore — a bad default would already fail the test suite */ }
  });
  const DASHBOARD_CLASSNAMES = Object.keys(CLASSNAME_TO_DROPDOWN);

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
  let currentExampleName = null;

  // Every class the user has visited or edited this session, keyed by its
  // internal class name — this is what makes switching classes (and the
  // dashboard) reflect live edits instead of reverting to defaults.
  let liveClassStates = {};

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

  function classDefToTableState(cls, defaultAverages) {
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
      // one typed-in average per category (e.g. "82.5") — this is what you enter
      categoryAverages: { ...(defaultAverages || {}) },
    };
  }

  // Derives a starting "average so far" per category from the bundled sample
  // entries, using the real engine (so late/retake caps are respected),
  // purely to give a new user something realistic to see and overwrite.
  function deriveDefaultAverages(dropdownName) {
    const entries = SAMPLE_ENTRIES_BY_CLASS[dropdownName];
    if (!entries || !entries.length) return {};
    const cls = GradeScript.compileOne(EXAMPLES[dropdownName]);
    const result = GradeScript.computeGrade(cls, entries);
    const averages = {};
    result.breakdown.forEach((b) => { if (b.hasData) averages[b.category] = Math.round(b.average * 10) / 10; });
    return averages;
  }

  // Turns the table's category-average inputs into the entry list the
  // engine actually expects — one synthetic entry per category with data.
  function tableStateToEntries(state) {
    return Object.entries(state.categoryAverages || {})
      .filter(([, v]) => v !== undefined && v !== "" && v !== null && !isNaN(parseFloat(v)))
      .map(([category, v]) => ({ category, score: parseFloat(v) }));
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

    updateWeightTotal();

    policyRows.querySelectorAll(".policy-row").forEach((rowEl) => {
      const id = rowEl.dataset.id;
      const cat = tableState.categories.find((c) => c.id === id);
      // NOTE: these handlers deliberately never call renderTable() — doing
      // so on every keystroke would destroy and recreate the input you're
      // typing in, which is exactly what kicks focus out mid-word.
      rowEl.querySelector(".row-name").addEventListener("input", (e) => { cat.name = e.target.value; compileAndRender(); });
      rowEl.querySelector(".row-weight").addEventListener("input", (e) => { cat.weight = e.target.value; updateWeightTotal(); compileAndRender(); });
      rowEl.querySelector(".row-late").addEventListener("input", (e) => { cat.lateMax = e.target.value; compileAndRender(); });
      rowEl.querySelector(".row-retake").addEventListener("input", (e) => { cat.retakeMax = e.target.value; compileAndRender(); });
      rowEl.querySelector(".row-delete").addEventListener("click", () => {
        tableState.categories = tableState.categories.filter((c) => c.id !== id);
        renderTable();
        compileAndRender();
      });
    });
  }

  function updateWeightTotal() {
    const total = tableState.categories.reduce((acc, c) => acc + (parseFloat(c.weight) || 0), 0);
    weightTotalEl.textContent = `Total weight: ${total}%${total === 100 ? " ✓" : ""}`;
    weightTotalEl.className = "weight-total" + (total === 100 ? " ok" : total > 100 ? " over" : " under");
  }

  classNameInput.addEventListener("input", (e) => {
    const oldName = tableState.className;
    tableState.className = e.target.value;
    // Only clean up the old key if it still points at THIS same table state
    // (a real rename) — never touch another class's saved entry just
    // because we happened to compile a name that collides.
    if (oldName !== tableState.className && liveClassStates[oldName] === tableState) {
      delete liveClassStates[oldName];
    }
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
    registerLiveState();
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
    renderDashboard();
  }

  // Full rebuild: rebuilds every element in the results panel, including
  // the average inputs themselves. Only call this after a STRUCTURAL
  // change (categories added/removed/renamed, or switching class) — never
  // on a per-keystroke input, or you'll destroy the input the user is
  // typing in and kick their cursor out mid-word (that's the exact bug
  // this shape is designed to avoid).
  function renderGradeResults(cls) {
    const categoryNames = cls.categories.map((c) => c.name);
    if (!solverCategory || !categoryNames.includes(solverCategory)) {
      solverCategory = categoryNames[categoryNames.length - 1];
    }

    const breakdownRows = cls.categories.map((cat) => {
      const val = tableState.categoryAverages[cat.name];
      return `
      <div class="grade-row" data-cat="${escapeHtml(cat.name)}">
        <span class="grade-row-cat">${escapeHtml(cat.name)}</span>
        <span class="grade-row-weight">${cat.weight}%</span>
        <input type="number" class="grade-row-avg-input" min="0" max="100" step="0.1" placeholder="e.g. 85" value="${val === undefined || val === "" ? "" : val}" />
      </div>`;
    }).join("");

    const options = categoryNames.map((n) => `<option value="${escapeHtml(n)}" ${n === solverCategory ? "selected" : ""}>${escapeHtml(n)}</option>`).join("");

    gradeResults.innerHTML = `
      <div class="grade-hero">
        <div class="grade-hero-number" id="grade-current-num">—</div>
        <div class="grade-hero-letter" id="grade-current-letter">n/a</div>
      </div>
      <div class="grade-caption">Type your current average into each category below (e.g. "85" if you're at an 85% so far). Leave a category blank if you haven't started it yet — not a final verdict, just where things stand right now.</div>
      <div class="grade-range" id="grade-range"></div>
      <div class="grade-breakdown">
        <div class="grade-row grade-row-head">
          <span class="grade-row-cat">Category</span>
          <span class="grade-row-weight">Weight</span>
          <span class="grade-row-avg">Your average (%)</span>
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
        <div class="solver-result" id="solver-result-text"></div>
      </div>
    `;

    // Value-only edits from here on: update state + a lightweight refresh,
    // never rebuild this panel's own inputs.
    gradeResults.querySelectorAll(".grade-row-avg-input").forEach((inp) => {
      inp.addEventListener("input", (e) => {
        const catName = inp.closest(".grade-row").dataset.cat;
        const v = e.target.value;
        tableState.categoryAverages[catName] = v === "" ? undefined : v;
        registerLiveState();
        refreshComputedDisplay(currentClassDef);
        renderDashboard();
      });
    });

    const targetInput = document.getElementById("solver-target");
    const categorySelect = document.getElementById("solver-category");
    if (targetInput) targetInput.addEventListener("input", (e) => {
      const v = parseFloat(e.target.value);
      solverTarget = isNaN(v) ? 0 : v;
      refreshComputedDisplay(currentClassDef);
    });
    if (categorySelect) categorySelect.addEventListener("change", (e) => {
      solverCategory = e.target.value;
      refreshComputedDisplay(currentClassDef);
    });

    refreshComputedDisplay(cls);
  }

  // Lightweight update: recomputes the grade and repaints only the hero
  // number/letter, the best/worst range, and the solver's result text —
  // never touches the average inputs or solver controls, so typing in them
  // never loses focus.
  function refreshComputedDisplay(cls) {
    if (!cls) return;
    const entries = tableStateToEntries(tableState);
    const result = GradeScript.computeGrade(cls, entries);

    const numEl = document.getElementById("grade-current-num");
    const letterEl = document.getElementById("grade-current-letter");
    if (numEl) {
      const prevValue = parseFloat(numEl.dataset.raw || "0") || 0;
      if (result.currentGrade === null) {
        numEl.textContent = "—";
        numEl.dataset.raw = "0";
      } else {
        animateNumber(numEl, isNaN(prevValue) ? 0 : prevValue, result.currentGrade, "%", 400);
        numEl.dataset.raw = String(result.currentGrade);
      }
    }
    if (letterEl) {
      letterEl.textContent = result.currentLetter || "n/a";
      letterEl.className = "grade-hero-letter grade-letter-" + ((result.currentLetter || "").charAt(0).toLowerCase() || "n");
    }

    const rangeEl = document.getElementById("grade-range");
    if (rangeEl) {
      rangeEl.innerHTML = `
        <span>Worst case: <strong>${result.worstPossible.toFixed(1)}%</strong> (${result.worstLetter})</span>
        <span>Best case: <strong>${result.bestPossible.toFixed(1)}%</strong> (${result.bestLetter})</span>
      `;
    }

    const solverResultEl = document.getElementById("solver-result-text");
    if (!solverResultEl) return;
    const categoryNames = cls.categories.map((c) => c.name);
    let solverHtml = "";
    let solverClass = "";
    if (categoryNames.length === 0) {
      solverHtml = `Add a category above to try this out.`;
    } else {
      try {
        const solve = GradeScript.solveForTarget(cls, entries, solverCategory, solverTarget);
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
    solverResultEl.className = "solver-result " + solverClass;
    solverResultEl.innerHTML = solverHtml;
  }

  // ---- GPA Dashboard ----

  function renderDashboard() {
    const wrap = document.getElementById("dashboard-wrap");
    const rows = [];
    let gpaSum = 0;
    let gpaCount = 0;

    // The 6 defaults, plus any additional class name the user has actually
    // built or renamed into existence this session — a genuinely dynamic
    // list, not a fixed count.
    const namesToShow = [...DASHBOARD_CLASSNAMES];
    Object.keys(liveClassStates).forEach((n) => { if (!namesToShow.includes(n)) namesToShow.push(n); });

    for (const name of namesToShow) {
      let rowHtml;
      const isCurrentlyActive = name === tableState.className;
      const hasLiveState = liveClassStates.hasOwnProperty(name);
      try {
        let cls, entries;
        if (hasLiveState) {
          cls = GradeScript.compileOne(generateSource(liveClassStates[name]));
          entries = tableStateToEntries(liveClassStates[name]);
        } else {
          const dropdownName = CLASSNAME_TO_DROPDOWN[name];
          cls = GradeScript.compileOne(EXAMPLES[dropdownName]);
          entries = SAMPLE_ENTRIES_BY_CLASS[dropdownName] || [];
        }
        const result = GradeScript.computeGrade(cls, entries);
        const points = result.currentGrade === null ? null : GradeScript.gpaPoints(result.currentLetter);
        if (points !== null) { gpaSum += points; gpaCount++; }
        rowHtml = `
          <div class="dash-row${isCurrentlyActive ? " dash-row-live" : ""}">
            <span class="dash-class">${escapeHtml(cls.name)}${isCurrentlyActive ? ' <span class="dash-live-badge">editing live</span>' : ""}</span>
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
      <div class="dash-caption">Most grade calculators only ever show you one class. This adds every class you've built up. Whichever one you're currently on in the Build tab is marked "editing live" below and reflects your changes instantly — the rest keep whatever you last left them at, or their starting sample data if you haven't visited them yet.</div>
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
    const defaultCls = GradeScript.compileOne(EXAMPLES[name]);
    const isBlankTemplate = name === "✏️ Start your own (blank)";

    // The blank template always starts fresh; a named preset restores your
    // prior edits to it, if you've visited it before this session.
    if (!isBlankTemplate && liveClassStates[defaultCls.name]) {
      tableState = liveClassStates[defaultCls.name];
    } else {
      tableState = classDefToTableState(defaultCls, deriveDefaultAverages(name));
    }

    currentExampleName = name;
    solverCategory = null;
    registerLiveState();
    renderTable();
    updateExampleDescription();
    compileAndRender();
  }

  // Registers (or re-registers) the active table state under its current
  // class name. Deliberately never deletes another key — that's handled
  // specifically by the class-name input's own handler, which is the only
  // place a genuine rename (as opposed to switching classes) happens.
  function registerLiveState() {
    liveClassStates[tableState.className] = tableState;
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
