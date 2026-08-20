const fs = require("fs");
const path = require("path");
const ShieldQL = require("./engine.js");

const exampleFiles = fs.readdirSync(path.join(__dirname, "examples")).filter((f) => f.endsWith(".shieldql"));
const logs = JSON.parse(fs.readFileSync(path.join(__dirname, "sample-logs/logs.json"), "utf8"));

let failures = 0;

for (const file of exampleFiles) {
  const src = fs.readFileSync(path.join(__dirname, "examples", file), "utf8");
  console.log(`\n=== ${file} ===`);
  let rule;
  try {
    rule = ShieldQL.compileOne(src);
    console.log(`parsed OK: rule ${rule.name}, severity=${rule.severity}, within=${rule.within ? rule.within.raw : "none"}`);
  } catch (e) {
    console.log(`PARSE FAILED: ${e.message}`);
    failures++;
    continue;
  }

  try {
    console.log("--- Splunk SPL ---");
    console.log(ShieldQL.toSplunk(rule));
  } catch (e) { console.log("SPLUNK CODEGEN FAILED:", e.message); failures++; }

  try {
    console.log("--- Sigma YAML ---");
    console.log(ShieldQL.toSigma(rule));
  } catch (e) { console.log("SIGMA CODEGEN FAILED:", e.message); failures++; }

  try {
    console.log("--- Elastic EQL ---");
    console.log(ShieldQL.toElasticEQL(rule));
  } catch (e) { console.log("ELASTIC CODEGEN FAILED:", e.message); failures++; }

  console.log("--- Interpreter against sample logs ---");
  for (const entry of logs) {
    const { matched, error } = ShieldQL.runRule(rule, { event: entry.event, user: entry.user });
    console.log(`${matched ? "MATCH  " : "no-match"} | ${entry.label}${error ? " | ERROR: " + error : ""}`);
  }
}

console.log(`\n${failures === 0 ? "ALL OK" : failures + " FAILURES"}`);
process.exit(failures === 0 ? 0 : 1);
