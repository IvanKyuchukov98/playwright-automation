// Prints a Markdown results table for the GitHub run summary from run.json (see run-info.mjs).
// Usage: node summary.mjs <run.json>
import { readFileSync } from 'node:fs';

const infoPath = process.argv[2];
const info = JSON.parse(readFileSync(infoPath, 'utf8'));

const line = (name, r) => `| ${name} | ${r.passed} | ${r.failed} | ${r.flaky} | ${r.skipped} |`;
const suite = info.suite ? `${info.suite} ` : '';

console.log(`### ${suite}results ${info.total.failed ? '❌' : '✅'}`);
console.log('| Project | Passed | Failed | Flaky | Skipped |');
console.log('|---|---|---|---|---|');
for (const [name, row] of Object.entries(info.projects)) console.log(line(name, row));
console.log(line('**Total**', info.total));
console.log(`\nDuration: ${info.durationSeconds}s.`);
console.log('Full HTML report: the `playwright-report` artifact.');
