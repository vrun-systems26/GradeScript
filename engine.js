/*
 * PulseQL engine: lexer, parser, interpreter, and multi-target code generators.
 * Zero dependencies. Works in the browser (window.PulseQL) and in Node (module.exports).
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
    // sensor.foo -> foo ; home.foo -> home.foo (cross-context lookup field)
    if (parts[0] === "sensor") return parts.slice(1).join(".");
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

  // ---- shared JS-like boolean expression (Node-RED function nodes and IFTTT
  // Filter Code both really do execute arbitrary JavaScript) ----

  function jsFieldRef(node) {
    return "msg." + node.parts.join(".");
  }

  function jsLiteral(lit) {
    if (lit.kind === "string") return JSON.stringify(lit.value);
    return String(lit.value);
  }

  function toJsExpr(node) {
    if (node.type === "Logical") {
      return `(${toJsExpr(node.left)} ${node.op === "and" ? "&&" : "||"} ${toJsExpr(node.right)})`;
    }
    if (node.type === "Unary" && node.op === "not") {
      return `!(${toJsExpr(node.expr)})`;
    }
    if (node.type === "Binary") {
      const l = jsFieldRef(node.left);
      const r = node.right.type === "Path" ? jsFieldRef(node.right) : jsLiteral(node.right);
      if (node.op === "contains") return `${l}.includes(${jsLiteral(node.right)})`;
      const opMap = { "==": "===", "!=": "!==", ">=": ">=", "<=": "<=", ">": ">", "<": "<" };
      return `${l} ${opMap[node.op]} ${r}`;
    }
    throw new Error(`unsupported node in JS codegen: ${node.type}`);
  }

  function collectSensorFields(node, out) {
    if (node.type === "Logical") { collectSensorFields(node.left, out); collectSensorFields(node.right, out); return; }
    if (node.type === "Unary") { collectSensorFields(node.expr, out); return; }
    if (node.type === "Binary") {
      if (node.left.type === "Path" && node.left.parts[0] === "sensor") out.push(fieldRef(node.left.parts));
      if (node.right.type === "Path" && node.right.parts[0] === "sensor") out.push(fieldRef(node.right.parts));
    }
  }

  function primaryEntityGuess(node) {
    const fields = [];
    collectSensorFields(node, fields);
    // "type" is just the domain discriminator (e.g. sensor.type == "motion"), not a
    // meaningful thing to watch — prefer the first more specific field instead.
    return fields.find((f) => f !== "type") || fields[0] || "unknown_sensor";
  }

  // ---- Home Assistant automation YAML ----

  function haFieldRef(node, notes) {
    const dotted = fieldRef(node.parts);
    notes.push(`'${dotted}' stands in for a real Home Assistant entity/attribute — wire it to an actual entity_id (e.g. states('binary_sensor.motion')) before use`);
    return dotted;
  }

  function haLiteral(lit) {
    if (lit.kind === "string") return `'${lit.value}'`;
    return String(lit.value);
  }

  function toHaExpr(node, notes) {
    if (node.type === "Logical") {
      return `${toHaExpr(node.left, notes)} ${node.op} ${toHaExpr(node.right, notes)}`;
    }
    if (node.type === "Unary" && node.op === "not") {
      return `not ${toHaExpr(node.expr, notes)}`;
    }
    if (node.type === "Binary") {
      const left = haFieldRef(node.left, notes);
      const right = node.right.type === "Path" ? haFieldRef(node.right, notes) : haLiteral(node.right);
      if (node.op === "contains") return `'${node.right.value}' in ${left}`;
      return `${left} ${node.op} ${right}`;
    }
    throw new Error(`unsupported node in Home Assistant codegen: ${node.type}`);
  }

  function toHomeAssistant(rule) {
    const notes = [];
    const expr = toHaExpr(rule.when, notes);
    let yaml = `automation:\n`;
    yaml += `  - alias: "${rule.name}"\n`;
    yaml += `    description: "${rule.description || ""}"\n`;
    yaml += `    trigger:\n      - platform: template\n        value_template: "{{ ${expr} }}"\n`;
    if (rule.within) yaml += `        for: "${rule.within.raw}"\n`;
    yaml += `    action:\n      - service: notify.notify\n        data:\n          message: "${rule.name} triggered (priority: ${rule.severity})"\n`;
    yaml += `    mode: single\n`;
    let out = yaml;
    const uniqueNotes = [...new Set(notes)];
    if (uniqueNotes.length) out += `\n# NOTE: ${uniqueNotes[0]}`;
    return out;
  }

  // ---- Node-RED flow JSON ----

  function toNodeRED(rule) {
    const jsExpr = toJsExpr(rule.when);
    const entity = primaryEntityGuess(rule.when);
    const flow = [
      {
        id: "trigger_in",
        type: "server-state-changed",
        name: `${rule.name}: trigger`,
        entityid: entity,
        wires: [["check_fn"]],
      },
      {
        id: "check_fn",
        type: "function",
        name: "Check condition",
        func: `// Evaluates the full rule logic\nif (${jsExpr}) {\n  return msg;\n}\nreturn null; // condition not met, stop here`,
        wires: [["notify_action"]],
      },
      {
        id: "notify_action",
        type: "api-call-service",
        name: `${rule.name}: notify`,
        service: "notify.notify",
        data: { message: `${rule.name} triggered (priority: ${rule.severity})` },
        wires: [[]],
      },
    ];
    let out = JSON.stringify(flow, null, 2);
    if (rule.within) {
      out += `\n\n// NOTE: "within ${rule.within.raw}" would need a debounce/trigger-filter node\n// chained before "Check condition" — Node-RED has no single built-in node\n// for an arbitrary time window, so this is left as an integration step.`;
    }
    return out;
  }

  // ---- IFTTT Applet (Filter Code) ----

  function slugify(s) {
    return s.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
  }

  function toIFTTT(rule) {
    const jsExpr = toJsExpr(rule.when);
    let out = `Applet: "${rule.name}"\n\n`;
    out += `IF   Webhooks — "Receive a web request"  (event: ${slugify(rule.name)})\n\n`;
    out += `FILTER CODE (JavaScript, IFTTT Pro):\n`;
    out += `  if (${jsExpr}) {\n    // conditions met — let the Applet continue\n  } else {\n    Ifttt.trigger.stop(); // conditions not met — stop here (illustrative; see IFTTT Filter Code docs for the exact call)\n  }\n\n`;
    out += `THEN  Notifications — "Send a notification"\n`;
    out += `  Message: "${rule.name} triggered (priority: ${rule.severity})"\n`;
    if (rule.within) {
      out += `\n// NOTE: "within ${rule.within.raw}" isn't expressible in Filter Code alone —\n// IFTTT keeps no memory of past runs, so tracking a time window needs an\n// external service (e.g. a small webhook backend) behind the Applet.`;
    }
    return out;
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

  const PulseQL = {
    tokenize,
    parse,
    compile,
    compileOne,
    runRule,
    toHomeAssistant,
    toNodeRED,
    toIFTTT,
    LexError,
    ParseError,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = PulseQL;
  } else {
    root.PulseQL = PulseQL;
  }
})(typeof window !== "undefined" ? window : globalThis);
