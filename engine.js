/*
 * ShieldQL engine: lexer, parser, interpreter, and multi-target code generators.
 * Zero dependencies. Works in the browser (window.ShieldQL) and in Node (module.exports).
 */
(function (root) {
  "use strict";

  // ---------------------------------------------------------------------
  // Lexer
  // ---------------------------------------------------------------------

  const KEYWORDS = new Set([
    "rule", "when", "within", "severity", "tags", "description",
    "and", "or", "not", "true", "false", "contains"
  ]);

  const DURATION_UNITS = { ms: 1, s: 1000, m: 60000, h: 3600000, d: 86400000 };

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
          if (peek() === "\\" && (peek(1) === '"' || peek(1) === "\\")) {
            value += peek(1);
            advance(2);
          } else {
            value += peek();
            advance();
          }
        }
        if (i >= n) throw new LexError("unterminated string literal", startLine, startCol);
        advance(); // closing quote
        tokens.push({ type: "STRING", value, line: startLine, col: startCol });
        continue;
      }

      if (/[0-9]/.test(ch)) {
        let numStr = "";
        while (i < n && /[0-9.]/.test(peek())) { numStr += peek(); advance(); }
        // duration suffix?
        let unit = "";
        if (/[a-zA-Z]/.test(peek() || "")) {
          let j = i, u = "";
          while (j < n && /[a-zA-Z]/.test(source[j])) { u += source[j]; j++; }
          if (DURATION_UNITS.hasOwnProperty(u)) {
            unit = u;
            advance(u.length);
          }
        }
        if (unit) {
          const ms = parseFloat(numStr) * DURATION_UNITS[unit];
          tokens.push({ type: "DURATION", value: ms, raw: numStr + unit, line: startLine, col: startCol });
        } else {
          tokens.push({ type: "NUMBER", value: parseFloat(numStr), line: startLine, col: startCol });
        }
        continue;
      }

      if (/[A-Za-z_]/.test(ch)) {
        let ident = "";
        while (i < n && /[A-Za-z0-9_]/.test(peek() || "")) { ident += peek(); advance(); }
        if (KEYWORDS.has(ident)) {
          tokens.push({ type: ident.toUpperCase(), value: ident, line: startLine, col: startCol });
        } else {
          tokens.push({ type: "IDENT", value: ident, line: startLine, col: startCol });
        }
        continue;
      }

      const two = ch + (peek(1) || "");
      if (["==", "!=", ">=", "<="].includes(two)) {
        tokens.push({ type: two, value: two, line: startLine, col: startCol });
        advance(2);
        continue;
      }

      if ("{}(),.:><".includes(ch)) {
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
      const rules = [];
      while (!at("EOF")) rules.push(parseRule());
      return { type: "Program", rules };
    }

    function parseRule() {
      expect("RULE");
      const nameTok = expect("IDENT", "expected rule name");
      expect("{");

      let when = null, within = null, severity = "medium", tags = [], description = "";

      while (!at("}")) {
        if (at("WHEN")) {
          advance();
          when = parseOr();
        } else if (at("WITHIN")) {
          advance();
          const d = expect("DURATION", "expected a duration like 10m after 'within'");
          within = d;
        } else if (at("SEVERITY")) {
          advance();
          expect(":");
          const sevTok = at("IDENT") ? advance() : advance();
          severity = String(sevTok.value).toLowerCase();
        } else if (at("TAGS")) {
          advance();
          expect(":");
          tags.push(expect("STRING").value);
          while (at(",")) { advance(); tags.push(expect("STRING").value); }
        } else if (at("DESCRIPTION")) {
          advance();
          expect(":");
          description = expect("STRING").value;
        } else {
          throw new ParseError(`unexpected token inside rule body`, peek());
        }
      }
      expect("}");

      if (!when) throw new ParseError(`rule '${nameTok.value}' is missing a 'when' clause`, nameTok);

      return {
        type: "Rule",
        name: nameTok.value,
        when, within, severity, tags, description,
        line: nameTok.line
      };
    }

    function parseOr() {
      let left = parseAnd();
      while (at("OR")) {
        advance();
        const right = parseAnd();
        left = { type: "Logical", op: "or", left, right };
      }
      return left;
    }

    function parseAnd() {
      let left = parseUnary();
      while (at("AND")) {
        advance();
        const right = parseUnary();
        left = { type: "Logical", op: "and", left, right };
      }
      return left;
    }

    function parseUnary() {
      if (at("NOT")) {
        advance();
        return { type: "Unary", op: "not", expr: parseUnary() };
      }
      return parseComparison();
    }

    function parseComparison() {
      const left = parsePrimary();
      const opTypes = ["==", "!=", ">=", "<=", ">", "<", "CONTAINS"];
      if (opTypes.includes(peek().type)) {
        const opTok = advance();
        const op = opTok.type === "CONTAINS" ? "contains" : opTok.type;
        const right = parsePrimary();
        return { type: "Binary", op, left, right };
      }
      return left;
    }

    function parsePrimary() {
      if (at("(")) {
        advance();
        const expr = parseOr();
        expect(")");
        return expr;
      }
      if (at("STRING")) { const t = advance(); return { type: "Literal", kind: "string", value: t.value }; }
      if (at("NUMBER")) { const t = advance(); return { type: "Literal", kind: "number", value: t.value }; }
      if (at("DURATION")) { const t = advance(); return { type: "Literal", kind: "duration", value: t.value, raw: t.raw }; }
      if (at("TRUE")) { advance(); return { type: "Literal", kind: "bool", value: true }; }
      if (at("FALSE")) { advance(); return { type: "Literal", kind: "bool", value: false }; }
      if (at("IDENT")) {
        const parts = [advance().value];
        while (at(".")) { advance(); parts.push(expect("IDENT").value); }
        return { type: "Path", parts };
      }
      throw new ParseError("expected an expression", peek());
    }

    const program = parseProgram();
    expect("EOF");
    return program;
  }

  // ---------------------------------------------------------------------
  // Interpreter
  // ---------------------------------------------------------------------

  function resolvePath(parts, context) {
    let cur = context;
    for (const p of parts) {
      if (cur == null || typeof cur !== "object") return undefined;
      cur = cur[p];
    }
    return cur;
  }

  function evalExpr(node, context) {
    switch (node.type) {
      case "Literal":
        return node.value;
      case "Path":
        return resolvePath(node.parts, context);
      case "Unary":
        if (node.op === "not") return !truthy(evalExpr(node.expr, context));
        throw new Error(`unknown unary op ${node.op}`);
      case "Logical": {
        const l = evalExpr(node.left, context);
        if (node.op === "and") return truthy(l) ? truthy(evalExpr(node.right, context)) : false;
        if (node.op === "or") return truthy(l) ? true : truthy(evalExpr(node.right, context));
        throw new Error(`unknown logical op ${node.op}`);
      }
      case "Binary": {
        const l = evalExpr(node.left, context);
        const r = evalExpr(node.right, context);
        switch (node.op) {
          case "==": return l === r;
          case "!=": return l !== r;
          case ">=": return l >= r;
          case "<=": return l <= r;
          case ">": return l > r;
          case "<": return l < r;
          case "contains": return typeof l === "string" && typeof r === "string" && l.includes(r);
          default: throw new Error(`unknown binary op ${node.op}`);
        }
      }
      default:
        throw new Error(`cannot evaluate node type ${node.type}`);
    }
  }

  function truthy(v) { return v === true || (v !== false && v !== undefined && v !== null && v !== 0 && v !== ""); }

  // Evaluate a rule against a single event/user context. Returns {matched, error}
  function runRule(rule, context) {
    try {
      const matched = truthy(evalExpr(rule.when, context));
      return { matched, error: null };
    } catch (e) {
      return { matched: false, error: e.message };
    }
  }

  // ---------------------------------------------------------------------
  // Code generation helpers
  // ---------------------------------------------------------------------

  function fieldRef(parts) {
    // event.foo -> foo ; user.foo -> user.foo (cross-context lookup field)
    if (parts[0] === "event") return parts.slice(1).join(".");
    return parts.join(".");
  }

  function isFieldVsField(node) {
    return node.type === "Binary" && node.left.type === "Path" && node.right.type === "Path";
  }

  function literalToString(lit) {
    if (lit.kind === "string") return lit.value;
    if (lit.kind === "duration") return lit.raw;
    return String(lit.value);
  }

  // ---- Splunk SPL ----

  function toSplunkClause(node, notes) {
    if (node.type === "Logical") {
      const l = toSplunkClause(node.left, notes);
      const r = toSplunkClause(node.right, notes);
      return node.op === "and" ? `(${l} AND ${r})` : `(${l} OR ${r})`;
    }
    if (node.type === "Unary" && node.op === "not") {
      return `NOT ${toSplunkClause(node.expr, notes)}`;
    }
    if (node.type === "Binary") {
      if (isFieldVsField(node)) {
        notes.push(`field-to-field comparison (${fieldRef(node.left.parts)} ${node.op} ${fieldRef(node.right.parts)}) needs an SPL 'eval' clause; see comment below`);
        return `eval(${fieldRef(node.left.parts)}${node.op === "==" ? "=" : node.op}${fieldRef(node.right.parts)})`;
      }
      const field = fieldRef(node.left.parts);
      const val = node.right.kind === "string" ? `"${node.right.value}"` : literalToString(node.right);
      const opMap = { "==": "=", "!=": "!=", ">=": ">=", "<=": "<=", ">": ">", "<": "<" };
      if (node.op === "contains") return `${field}="*${node.right.value}*"`;
      return `${field}${opMap[node.op]}${val}`;
    }
    throw new Error(`unsupported node in Splunk codegen: ${node.type}`);
  }

  function toSplunk(rule) {
    const notes = [];
    const clause = toSplunkClause(rule.when, notes);
    let spl = `search ${clause}`;
    if (rule.within) spl += ` earliest=-${rule.within.raw}`;
    spl += `\n| eval severity="${rule.severity}"`;
    if (rule.tags.length) spl += `\n| eval rule_tags="${rule.tags.join(",")}"`;
    let out = `\`\`\` ${rule.name} — ${rule.description || "no description"} \`\`\`\n${spl}`;
    if (notes.length) out += `\n\n# NOTE: ${notes.join("; ")}`;
    return out;
  }

  // ---- Sigma YAML ----

  function collectFlatAnd(node, out) {
    // returns true if fully flattened (only AND of simple Binary clauses)
    if (node.type === "Logical" && node.op === "and") {
      return collectFlatAnd(node.left, out) && collectFlatAnd(node.right, out);
    }
    if (node.type === "Binary" && !isFieldVsField(node)) {
      out.push(node);
      return true;
    }
    return false;
  }

  function sigmaModifierFor(op) {
    return { "==": "", "!=": "|neq", ">=": "|gte", "<=": "|lte", ">": "|gt", "<": "|lt", contains: "|contains" }[op] ?? "";
  }

  function toSigma(rule) {
    const flat = [];
    const notes = [];
    const isFlat = collectFlatAnd(rule.when, flat);

    let body;
    if (isFlat && flat.length) {
      const lines = flat.map((n) => {
        const field = fieldRef(n.left.parts) + sigmaModifierFor(n.op);
        const val = n.right.kind === "string" ? n.right.value : literalToString(n.right);
        return `    ${field}: ${JSON.stringify(val)}`;
      });
      body = `detection:\n  selection:\n${lines.join("\n")}\n  condition: selection`;
    } else {
      body = `detection:\n  # NOTE: this rule uses OR/NOT logic or field-to-field comparisons that\n  # do not map cleanly onto Sigma's flat selection format. Expressed here\n  # as a correlation rule needing manual review.\n  selection:\n    keywords: "see ShieldQL source rule '${rule.name}' for full logic"\n  condition: selection`;
      notes.push("complex boolean logic (OR / NOT / field-to-field) simplified — verify manually");
    }

    let yaml = `title: ${rule.name}\n`;
    yaml += `status: experimental\n`;
    yaml += `description: ${JSON.stringify(rule.description || "")}\n`;
    yaml += `logsource:\n  category: authentication\n`;
    yaml += body;
    if (rule.within) yaml += `\n  timeframe: ${rule.within.raw}`;
    yaml += `\nlevel: ${rule.severity}\n`;
    if (rule.tags.length) yaml += `tags:\n${rule.tags.map((t) => `  - ${t}`).join("\n")}\n`;
    if (notes.length) yaml += `\n# NOTE: ${notes.join("; ")}`;
    return yaml;
  }

  // ---- Elastic EQL ----

  function toElasticClause(node) {
    if (node.type === "Logical") {
      return `${toElasticClause(node.left)} ${node.op} ${toElasticClause(node.right)}`;
    }
    if (node.type === "Unary" && node.op === "not") {
      return `not ${toElasticClause(node.expr)}`;
    }
    if (node.type === "Binary") {
      const elasticField = (parts) => (parts[0] === "event" ? "event." + fieldRef(parts) : fieldRef(parts));
      const l = elasticField(node.left.parts);
      if (isFieldVsField(node)) {
        const r = elasticField(node.right.parts);
        return `${l} ${node.op} ${r}`;
      }
      if (node.op === "contains") {
        return `stringContains(${l}, "${node.right.value}")`;
      }
      const val = node.right.kind === "string" ? `"${node.right.value}"` : literalToString(node.right);
      return `${l} ${node.op} ${val}`;
    }
    throw new Error(`unsupported node in Elastic codegen: ${node.type}`);
  }

  function toElasticEQL(rule) {
    const clause = toElasticClause(rule.when);
    let eql = `// ${rule.name} — ${rule.description || "no description"}\n`;
    eql += `any where ${clause}`;
    if (rule.within) eql += `\n// apply over the last ${rule.within.raw} using the Kibana time range picker`;
    eql += `\n// severity: ${rule.severity}${rule.tags.length ? `, tags: ${rule.tags.join(", ")}` : ""}`;
    return eql;
  }

  // ---------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------

  function compile(source) {
    const tokens = tokenize(source);
    const program = parse(tokens);
    return program;
  }

  function compileOne(source) {
    const program = compile(source);
    if (program.rules.length !== 1) throw new Error(`expected exactly one rule, found ${program.rules.length}`);
    return program.rules[0];
  }

  const ShieldQL = {
    tokenize,
    parse,
    compile,
    compileOne,
    runRule,
    toSplunk,
    toSigma,
    toElasticEQL,
    LexError,
    ParseError,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = ShieldQL;
  } else {
    root.ShieldQL = ShieldQL;
  }
})(typeof window !== "undefined" ? window : globalThis);
