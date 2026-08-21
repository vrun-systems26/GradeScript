const fs = require("fs");
const path = require("path");
const PulseQL = require("./engine.js");

const exampleFiles = fs.readdirSync(path.join(__dirname, "examples")).filter((f) => f.endsWith(".shieldql"));
const logs = JSON.parse(fs.readFileSync(path.join(__dirname, "sample-logs/logs.json"), "utf8"));

let failures = 0;

for (const file of exampleFiles) {
  const src = fs.readFileSync(path.join(__dirname, "examples", file), "utf8");
  console.log(`\n=== ${file} ===`);
  let rule;
  try {
    rule = PulseQL.compileOne(src);
    console.log(`parsed OK: rule ${rule.name}, severity=${rule.severity}, within=${rule.within ? rule.within.raw : "none"}`);
  } catch (e) {
    console.log(`PARSE FAILED: ${e.message}`);
    failures++;
    continue;
  }

  try {
    console.log("--- Home Assistant YAML ---");
    console.log(PulseQL.toHomeAssistant(rule));
  } catch (e) { console.log("HOME ASSISTANT CODEGEN FAILED:", e.message); failures++; }

  try {
    console.log("--- Node-RED flow JSON ---");
    console.log(PulseQL.toNodeRED(rule));
  } catch (e) { console.log("NODE-RED CODEGEN FAILED:", e.message); failures++; }

  try {
    console.log("--- IFTTT Applet ---");
    console.log(PulseQL.toIFTTT(rule));
  } catch (e) { console.log("IFTTT CODEGEN FAILED:", e.message); failures++; }

  console.log("--- Interpreter against sample sensor readings ---");
  for (const entry of logs) {
    const { matched, error } = PulseQL.runRule(rule, { sensor: entry.sensor, home: entry.home });
    console.log(`${matched ? "MATCH  " : "no-match"} | ${entry.label}${error ? " | ERROR: " + error : ""}`);
  }
}

console.log(`\n${failures === 0 ? "ALL OK" : failures + " FAILURES"}`);
process.exit(failures === 0 ? 0 : 1);
