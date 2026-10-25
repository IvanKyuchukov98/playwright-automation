// Turns a Playwright JSON report into a Markdown table for the GitHub run summary:
// one row per project (api, chromium, ...) plus a total.
// Usage: node summary.mjs results.json
import { readFileSync } from 'node:fs';

const report = JSON.parse(readFileSync(process.argv[2], 'utf8'));

function* testsIn(suite) {
  for (const spec of suite.specs ?? []) yield* spec.tests;
  for (const child of suite.suites ?? []) yield* testsIn(child);
}

const empty = () => ({ passed: 0, failed: 0, flaky: 0, skipped: 0 });
const byProject = new Map();
for (const suite of report.suites) {
  for (const test of testsIn(suite)) {
    const row = byProject.get(test.projectName) ?? empty();
    // Playwright statuses: expected = passed, unexpected = failed, flaky = passed on retry.
    const key = { expected: 'passed', unexpected: 'failed' }[test.status] ?? test.status;
    row[key]++;
    byProject.set(test.projectName, row);
  }
}

const total = empty();
for (const row of byProject.values()) {
  for (const key of Object.keys(total)) total[key] += row[key];
}

const line = (name, r) => `| ${name} | ${r.passed} | ${r.failed} | ${r.flaky} | ${r.skipped} |`;
const seconds = (report.stats.duration / 1000).toFixed(1);
const suite = process.env.SUITE ? `${process.env.SUITE} ` : '';

console.log(`### ${suite}results ${total.failed ? '❌' : '✅'}`);
console.log('| Project | Passed | Failed | Flaky | Skipped |');
console.log('|---|---|---|---|---|');
for (const [name, row] of [...byProject].sort(([a], [b]) => a.localeCompare(b))) {
  console.log(line(name, row));
}
console.log(line('**Total**', total));
console.log(`\nDuration: ${seconds}s. Full HTML report: the \`playwright-report\` artifact.`);
