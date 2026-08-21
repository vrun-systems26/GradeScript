/*
 * GradeScript engine: lexer, parser, interpreter (grade calculator), and
 * multi-target code generators. Zero dependencies. Works in the browser
 * (window.GradeScript) and in Node (module.exports).
 */
(function (root) {
  "use strict";

  // ---------------------------------------------------------------------
  // Lexer
  // ---------------------------------------------------------------------

  const KEYWORDS = new Set(["class", "category", "late", "retake", "max"]);

  class LexError extends Error {
    constructor(message, line, col) {
      super(`Lex error (line ${line}, col ${col}): ${message}`);
      this.line = line;
      this.col = col;
    }
  }

  function tokenize(source) {
    const tokens = [];
    let i = 0, line = 1, col = 1;
    const n = source.length;

    function advance(k = 1) {
      for (let j = 0; j < k; j++) {
        if (source[i] === "\n") { line++; col = 1; } else { col++; }
        i++;
      }
    }
    function peek(offset = 0) { return source[i + offset]; }

    while (i < n) {
      const ch = peek();

      if (ch === " " || ch === "\t" || ch === "\r" || ch === "\n") { advance(); continue; }

      if (ch === "/" && peek(1) === "/") {
        while (i < n && peek() !== "\n") advance();
        continue;
      }

      const startLine = line, startCol = col;

      if (ch === '"') {
        advance();
        let value = "";
        while (i < n && peek() !== '"') {
          if (peek() === "\\" && (peek(1) === '"' || peek(1) === "\\")) { value += peek(1); advance(2); }
          else { value += peek(); advance(); }
        }
        if (i >= n) throw new LexError("unterminated string literal", startLine, startCol);
        advance();
        tokens.push({ type: "STRING", value, line: startLine, col: startCol });
        continue;
      }

      if (/[0-9]/.test(ch)) {
        let numStr = "";
        while (i < n && /[0-9.]/.test(peek())) { numStr += peek(); advance(); }
        if (peek() === "%") {
          advance();
          tokens.push({ type: "PERCENT", value: parseFloat(numStr), line: startLine, col: startCol });
        } else {
          tokens.push({ type: "NUMBER", value: parseFloat(numStr), line: startLine, col: startCol });
        }
        continue;
      }

      if (/[A-Za-z_]/.test(ch)) {
        let ident = "";
        while (i < n && /[A-Za-z0-9_]/.test(peek() || "")) { ident += peek(); advance(); }
        if (KEYWORDS.has(ident)) tokens.push({ type: ident.toUpperCase(), value: ident, line: startLine, col: startCol });
        else tokens.push({ type: "IDENT", value: ident, line: startLine, col: startCol });
        continue;
      }

      if ("{}:=".includes(ch)) {
        tokens.push({ type: ch, value: ch, line: startLine, col: startCol });
        advance();
        continue;
      }

      throw new LexError(`unexpected character '${ch}'`, startLine, startCol);
    }

    tokens.push({ type: "EOF", value: null, line, col });
    return tokens;
  }

  // ---------------------------------------------------------------------
  // Parser -> AST
  // ---------------------------------------------------------------------

  class ParseError extends Error {
    constructor(message, token) {
      const loc = token ? ` (line ${token.line}, col ${token.col}, got ${token.type})` : "";
      super(`Parse error: ${message}${loc}`);
      this.token = token;
    }
  }

  function parse(tokens) {
    let pos = 0;
    const peek = (o = 0) => tokens[pos + o];
    const at = (type) => peek().type === type;
    function advance() { return tokens[pos++]; }
    function expect(type, msg) {
      if (!at(type)) throw new ParseError(msg || `expected ${type}`, peek());
      return advance();
    }

    function parseProgram() {
      const classes = [];
      while (!at("EOF")) classes.push(parseClass());
      return { type: "Program", classes };
    }

    function parseClass() {
      expect("CLASS");
      const nameTok = expect("IDENT", "expected a class name");
      expect("{");

      const categories = [];
      const latePolicies = [];
      const retakePolicies = [];

      while (!at("}")) {
        if (at("CATEGORY")) {
          advance();
          const catName = expect("IDENT", "expected a category name").value;
          expect("=");
          const weight = expect("PERCENT", "expected a percentage like 15%").value;
          categories.push({ name: catName, weight });
        } else if (at("LATE")) {
          advance();
          const catName = expect("IDENT", "expected a category name after 'late'").value;
          expect(":");
          expect("MAX");
          const max = expect("PERCENT", "expected a percentage like 70%").value;
          latePolicies.push({ category: catName, max });
        } else if (at("RETAKE")) {
          advance();
          const catName = expect("IDENT", "expected a category name after 'retake'").value;
          expect(":");
          expect("MAX");
          const max = expect("PERCENT", "expected a percentage like 80%").value;
          retakePolicies.push({ category: catName, max });
        } else {
          throw new ParseError("expected 'category', 'late', or 'retake'", peek());
        }
      }
      expect("}");

      if (categories.length === 0) throw new ParseError(`class '${nameTok.value}' has no categories`, nameTok);

      return { type: "Class", name: nameTok.value, categories, latePolicies, retakePolicies, line: nameTok.line };
    }

    const program = parseProgram();
    expect("EOF");
    return program;
  }

  // ---------------------------------------------------------------------
  // Interpreter: the grade calculator
  // ---------------------------------------------------------------------

  // entries: [{ category, name, score, late?, isRetake? }, ...]

  function findPolicy(list, category) {
    return list.find((p) => p.category === category);
  }

  function effectiveScore(entry, classDef) {
    let score = entry.score;
    if (entry.late) {
      const policy = findPolicy(classDef.latePolicies, entry.category);
      if (policy) score = Math.min(score, policy.max);
    }
    if (entry.isRetake) {
      const policy = findPolicy(classDef.retakePolicies, entry.category);
      if (policy) score = Math.min(score, policy.max);
    }
    return score;
  }

  function categoryAverage(classDef, entries, categoryName) {
    const inCat = entries.filter((e) => e.category === categoryName);
    if (inCat.length === 0) return null;
    const sum = inCat.reduce((acc, e) => acc + effectiveScore(e, classDef), 0);
    return sum / inCat.length;
  }

  function letterGrade(pct) {
    if (pct >= 93) return "A";
    if (pct >= 90) return "A-";
    if (pct >= 87) return "B+";
    if (pct >= 83) return "B";
    if (pct >= 80) return "B-";
    if (pct >= 77) return "C+";
    if (pct >= 73) return "C";
    if (pct >= 70) return "C-";
    if (pct >= 60) return "D";
    return "F";
  }

  const GPA_POINTS = { "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3, "C": 2.0, "C-": 1.7, "D": 1.0, "F": 0.0 };

  function gpaPoints(letter) {
    return GPA_POINTS.hasOwnProperty(letter) ? GPA_POINTS[letter] : null;
  }

  function computeGrade(classDef, entries) {
    const breakdown = classDef.categories.map((cat) => {
      const avg = categoryAverage(classDef, entries, cat.name);
      return { category: cat.name, weight: cat.weight, average: avg, hasData: avg !== null };
    });

    const graded = breakdown.filter((b) => b.hasData);
    const gradedWeight = graded.reduce((acc, b) => acc + b.weight, 0);
    const currentGrade = gradedWeight > 0
      ? graded.reduce((acc, b) => acc + b.average * b.weight, 0) / gradedWeight
      : null;

    const bestPossible = breakdown.reduce((acc, b) => acc + (b.hasData ? b.average : 100) * b.weight, 0) / 100;
    const worstPossible = breakdown.reduce((acc, b) => acc + (b.hasData ? b.average : 0) * b.weight, 0) / 100;

    return {
      breakdown,
      currentGrade,
      currentLetter: currentGrade === null ? null : letterGrade(currentGrade),
      bestPossible,
      bestLetter: letterGrade(bestPossible),
      worstPossible,
      worstLetter: letterGrade(worstPossible),
    };
  }

  // "What score do I need on [category] to reach a target grade?" — solves
  // the weighted-average equation backward for one unknown category,
  // conservatively assuming any OTHER still-ungraded category scores 0.
  function solveForTarget(classDef, entries, targetCategoryName, targetPct) {
    const target = classDef.categories.find((c) => c.name === targetCategoryName);
    if (!target) throw new Error(`unknown category '${targetCategoryName}'`);

    const totalWeight = classDef.categories.reduce((acc, c) => acc + c.weight, 0);
    const othersWeightedSum = classDef.categories
      .filter((c) => c.name !== targetCategoryName)
      .reduce((acc, c) => {
        const avg = categoryAverage(classDef, entries, c.name);
        return acc + (avg === null ? 0 : avg) * c.weight;
      }, 0);

    const requiredScore = (targetPct * totalWeight - othersWeightedSum) / target.weight;

    return {
      category: targetCategoryName,
      requiredScore,
      achievable: requiredScore <= 100,
      alreadySecured: requiredScore <= 0,
    };
  }

  // ---------------------------------------------------------------------
  // Code generation
  // ---------------------------------------------------------------------

  function pct(n) {
    return Number.isInteger(n) ? `${n}%` : `${n.toFixed(1)}%`;
  }

  // ---- Plain-English syllabus paragraph ----

  function toSyllabus(classDef) {
    const catList = classDef.categories.map((c) => `${c.name} (${pct(c.weight)})`);
    const totalWeight = classDef.categories.reduce((a, c) => a + c.weight, 0);
    let out = `Your grade in ${classDef.name} is calculated from ${classDef.categories.length} categor${classDef.categories.length === 1 ? "y" : "ies"}: `;
    out += catList.length > 1
      ? catList.slice(0, -1).join(", ") + ", and " + catList[catList.length - 1] + "."
      : catList[0] + ".";

    for (const lp of classDef.latePolicies) {
      out += `\n\nLate ${lp.category} is capped at a maximum score of ${pct(lp.max)}.`;
    }
    for (const rp of classDef.retakePolicies) {
      out += `\n\n${rp.category} may be retaken; retake scores are capped at a maximum of ${pct(rp.max)}.`;
    }
    if (totalWeight !== 100) {
      out += `\n\n# NOTE: category weights currently sum to ${pct(totalWeight)}, not 100% — double-check the policy.`;
    }
    return out;
  }

  // ---- Spreadsheet formula (Google Sheets / Excel) ----

  function toSpreadsheet(classDef) {
    const n = classDef.categories.length;
    const lastRow = 1 + n;
    let out = `// ${classDef.name} — paste into any cell, with category averages in column B\n`;
    out += `// and category weights in column C, one row per category (rows 2-${lastRow}):\n\n`;
    out += `=SUMPRODUCT(B2:B${lastRow}, C2:C${lastRow}) / 100\n\n`;
    out += `// Suggested layout:\n`;
    out += `// A1: Category      B1: Average (%)   C1: Weight (%)\n`;
    classDef.categories.forEach((c, idx) => {
      out += `// A${idx + 2}: ${c.name}${" ".repeat(Math.max(1, 14 - c.name.length))}B${idx + 2}: <your average>   C${idx + 2}: ${c.weight}\n`;
    });
    if (classDef.latePolicies.length || classDef.retakePolicies.length) {
      out += `\n// NOTE: late/retake caps aren't expressed in this formula — apply the cap\n`;
      out += `// to the raw score (in column B's source data) before averaging, e.g.\n`;
      out += `// =MIN(raw_score, ${classDef.latePolicies[0] ? classDef.latePolicies[0].max : classDef.retakePolicies[0].max}) for a capped assignment.`;
    }
    return out;
  }

  // ---- Canvas-style LMS assignment-group JSON ----

  function toLMS(classDef) {
    const groups = classDef.categories.map((c) => {
      const group = { name: c.name, group_weight: c.weight };
      const late = findPolicy(classDef.latePolicies, c.name);
      const retake = findPolicy(classDef.retakePolicies, c.name);
      if (late) group.late_policy = { max_percent: late.max };
      if (retake) group.retake_policy = { allowed: true, max_percent: retake.max };
      return group;
    });
    const config = {
      course: classDef.name,
      apply_assignment_group_weights: true,
      assignment_groups: groups,
    };
    let out = JSON.stringify(config, null, 2);
    out += `\n\n// NOTE: field names here are illustrative — they approximate real LMS\n`;
    out += `// concepts (Canvas's weighted assignment groups, for example) but the\n`;
    out += `// exact schema would need to match your specific LMS's admin API.`;
    return out;
  }

  // ---------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------

  function compile(source) {
    const tokens = tokenize(source);
    return parse(tokens);
  }

  function compileOne(source) {
    const program = compile(source);
    if (program.classes.length !== 1) throw new Error(`expected exactly one class, found ${program.classes.length}`);
    return program.classes[0];
  }

  const GradeScript = {
    tokenize,
    parse,
    compile,
    compileOne,
    computeGrade,
    solveForTarget,
    letterGrade,
    gpaPoints,
    toSyllabus,
    toSpreadsheet,
    toLMS,
    LexError,
    ParseError,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = GradeScript;
  } else {
    root.GradeScript = GradeScript;
  }
})(typeof window !== "undefined" ? window : globalThis);
