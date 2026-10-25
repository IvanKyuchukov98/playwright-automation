// Condenses a Playwright JSON report into run.json: run details plus passed / failed / flaky /
// skipped per project. The run summary and the report history page are built from it.
// Usage: node run-info.mjs <results.json> <run.json>
// Reads RUN_NUMBER, RUN_ID, SHA and SUITE from the environment (all optional).
import { readFileSync, writeFileSync } from 'node:fs';

const [resultsPath, outPath] = process.argv.slice(2);
const report = JSON.parse(readFileSync(resultsPath, 'utf8'));

function* testsIn(suite) {
  for (const spec of suite.specs ?? []) yield* spec.tests;
  for (const child of suite.suites ?? []) yield* testsIn(child);
}

const empty = () => ({ passed: 0, failed: 0, flaky: 0, skipped: 0 });
const projects = {};
for (const suite of report.suites) {
  for (const test of testsIn(suite)) {
    // The login setup runs once per shard and isn't a test of the app, so it isn't counted.
    if (test.projectName === 'setup') continue;
    const row = (projects[test.projectName] ??= empty());
    // Playwright statuses: expected = passed, unexpected = failed, flaky = passed on retry.
    row[{ expected: 'passed', unexpected: 'failed' }[test.status] ?? test.status]++;
  }
}

const total = empty();
for (const row of Object.values(projects)) {
  for (const key of Object.keys(total)) total[key] += row[key];
}

const { RUN_NUMBER, RUN_ID, SHA, SUITE } = process.env;
const info = {
  runNumber: RUN_NUMBER ? Number(RUN_NUMBER) : null,
  runId: RUN_ID ?? null,
  sha: SHA ?? null,
  suite: SUITE ?? null,
  date: report.stats.startTime,
  durationSeconds: Math.round(report.stats.duration / 100) / 10,
  total,
  projects: Object.fromEntries(Object.entries(projects).sort(([a], [b]) => a.localeCompare(b))),
};

writeFileSync(outPath, JSON.stringify(info, null, 2) + '\n');
