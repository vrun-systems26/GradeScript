#!/usr/bin/env node
const fs = require("fs");
const PulseQL = require("./engine.js");

function usage() {
  console.log(`PulseQL CLI

Usage:
  node cli.js compile <file.shieldql>               Show all three compiled targets
  node cli.js compile <file.shieldql> --target=X     X = homeassistant | nodered | ifttt
  node cli.js test <file.shieldql> <logs.json>       Run the rule's interpreter against sample events
`);
}

function readSource(file) {
  return fs.readFileSync(file, "utf8");
}

function cmdCompile(args) {
  const file = args[0];
  if (!file) return usage();
  const targetArg = args.find((a) => a.startsWith("--target="));
  const target = targetArg ? targetArg.split("=")[1] : null;

  const rule = PulseQL.compileOne(readSource(file));

  const targets = {
    homeassistant: () => PulseQL.toHomeAssistant(rule),
    nodered: () => PulseQL.toNodeRED(rule),
    ifttt: () => PulseQL.toIFTTT(rule),
  };

  if (target) {
    if (!targets[target]) throw new Error(`unknown target '${target}', expected one of: ${Object.keys(targets).join(", ")}`);
    console.log(targets[target]());
    return;
  }

  for (const [name, fn] of Object.entries(targets)) {
    console.log(`\n=== ${name} ===`);
    console.log(fn());
  }
}

function cmdTest(args) {
  const [ruleFile, logsFile] = args;
  if (!ruleFile || !logsFile) return usage();
  const rule = PulseQL.compileOne(readSource(ruleFile));
  const logs = JSON.parse(fs.readFileSync(logsFile, "utf8"));

  let matches = 0;
  for (const entry of logs) {
    const { matched, error } = PulseQL.runRule(rule, { sensor: entry.sensor, home: entry.home || {} });
    if (matched) matches++;
    console.log(`${matched ? "MATCH   " : "no-match"} | ${entry.label || JSON.stringify(entry.sensor)}${error ? " | ERROR: " + error : ""}`);
  }
  console.log(`\n${matches} / ${logs.length} events matched rule '${rule.name}'`);
}

function main() {
  const [, , cmd, ...rest] = process.argv;
  try {
    if (cmd === "compile") return cmdCompile(rest);
    if (cmd === "test") return cmdTest(rest);
    usage();
  } catch (e) {
    console.error(`Error: ${e.message}`);
    process.exit(1);
  }
}

main();
