const fs = require("fs");
const path = require("path");
const GradeScript = require("./engine.js");

const exampleFiles = fs.readdirSync(path.join(__dirname, "examples")).filter((f) => f.endsWith(".gradescript"));
const entries = JSON.parse(fs.readFileSync(path.join(__dirname, "sample-logs/logs.json"), "utf8"));

let failures = 0;

for (const file of exampleFiles) {
  const src = fs.readFileSync(path.join(__dirname, "examples", file), "utf8");
  console.log(`\n=== ${file} ===`);
  let cls;
  try {
    cls = GradeScript.compileOne(src);
    const totalWeight = cls.categories.reduce((a, c) => a + c.weight, 0);
    console.log(`parsed OK: class ${cls.name}, ${cls.categories.length} categories, weights sum to ${totalWeight}%`);
    if (totalWeight !== 100) console.log(`  WARNING: weights don't sum to 100%`);
  } catch (e) {
    console.log(`PARSE FAILED: ${e.message}`);
    failures++;
    continue;
  }

  try {
    console.log("--- Syllabus ---");
    console.log(GradeScript.toSyllabus(cls));
  } catch (e) { console.log("SYLLABUS CODEGEN FAILED:", e.message); failures++; }

  try {
    console.log("--- Spreadsheet ---");
    console.log(GradeScript.toSpreadsheet(cls));
  } catch (e) { console.log("SPREADSHEET CODEGEN FAILED:", e.message); failures++; }

  try {
    console.log("--- LMS JSON ---");
    console.log(GradeScript.toLMS(cls));
  } catch (e) { console.log("LMS CODEGEN FAILED:", e.message); failures++; }

  try {
    const result = GradeScript.computeGrade(cls, entries);
    console.log("--- Calculator (against sample grade entries) ---");
    for (const b of result.breakdown) {
      console.log(`  ${b.category} (${b.weight}%): ${b.hasData ? b.average.toFixed(1) + "%" : "no data"}`);
    }
    console.log(`  current: ${result.currentGrade === null ? "n/a" : result.currentGrade.toFixed(1) + "% (" + result.currentLetter + ")"}, best: ${result.bestPossible.toFixed(1)}%, worst: ${result.worstPossible.toFixed(1)}%`);
  } catch (e) {
    console.log("CALCULATOR FAILED:", e.message);
    failures++;
  }
}

console.log(`\n${failures === 0 ? "ALL OK" : failures + " FAILURES"}`);
process.exit(failures === 0 ? 0 : 1);
