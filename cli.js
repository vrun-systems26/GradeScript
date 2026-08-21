#!/usr/bin/env node
const fs = require("fs");
const GradeScript = require("./engine.js");

function usage() {
  console.log(`GradeScript CLI

Usage:
  node cli.js compile <file.gradescript>               Show all three compiled targets
  node cli.js compile <file.gradescript> --target=X     X = syllabus | spreadsheet | lms
  node cli.js test <file.gradescript> <grades.json>     Run the calculator against sample grades
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

  const cls = GradeScript.compileOne(readSource(file));

  const targets = {
    syllabus: () => GradeScript.toSyllabus(cls),
    spreadsheet: () => GradeScript.toSpreadsheet(cls),
    lms: () => GradeScript.toLMS(cls),
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
  const [classFile, gradesFile] = args;
  if (!classFile || !gradesFile) return usage();
  const cls = GradeScript.compileOne(readSource(classFile));
  const entries = JSON.parse(fs.readFileSync(gradesFile, "utf8"));

  const result = GradeScript.computeGrade(cls, entries);
  console.log(`Grades entered: ${entries.length}`);
  for (const b of result.breakdown) {
    console.log(`  ${b.category} (${b.weight}%): ${b.hasData ? b.average.toFixed(1) + "%" : "no data yet"}`);
  }
  console.log(`\nCurrent grade:  ${result.currentGrade === null ? "n/a" : result.currentGrade.toFixed(1) + "% (" + result.currentLetter + ")"}`);
  console.log(`Best possible:  ${result.bestPossible.toFixed(1)}% (${result.bestLetter})`);
  console.log(`Worst possible: ${result.worstPossible.toFixed(1)}% (${result.worstLetter})`);
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
