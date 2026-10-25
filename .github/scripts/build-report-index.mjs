// Builds <site>/index.html: a table of the runs in <site>/runs/<run number>/, newest first,
// from the run.json each report carries (see run-info.mjs).
// Usage: node build-report-index.mjs <site-dir>
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const site = process.argv[2];
const runsDir = path.join(site, 'runs');
const repoUrl = `${process.env.GITHUB_SERVER_URL ?? 'https://github.com'}/${process.env.GITHUB_REPOSITORY ?? ''}`;

const escape = (text) =>
  String(text).replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c],
  );

const runs = existsSync(runsDir)
  ? readdirSync(runsDir)
      .filter((name) => /^\d+$/.test(name))
      .sort((a, b) => Number(b) - Number(a))
  : [];

const rows = runs.map((run) => {
  const infoPath = path.join(runsDir, run, 'run.json');
  const info = existsSync(infoPath) ? JSON.parse(readFileSync(infoPath, 'utf8')) : null;
  const href = `runs/${run}/`;

  const runCell = info?.runId
    ? `<a href="${repoUrl}/actions/runs/${escape(info.runId)}">#${run}</a>`
    : `#${run}`;
  const commitCell = info?.sha
    ? `<a href="${repoUrl}/commit/${escape(info.sha)}"><code>${escape(info.sha.slice(0, 7))}</code></a>`
    : '';
  const date = info?.date
    ? new Date(info.date).toISOString().slice(0, 16).replace('T', ' ') + ' UTC'
    : '';

  let resultCell = `<a href="${href}">Report</a>`;
  if (info) {
    const { passed, failed, flaky } = info.total;
    const ran = passed + failed + flaky;
    const status = failed ? 'failed' : 'passed';
    const projects = Object.entries(info.projects)
      .map(([name, r]) => {
        const projectRan = r.passed + r.failed + r.flaky;
        const state = r.failed ? 'failed' : 'passed';
        return `<span class="project ${state}">${escape(name)} <span class="count">${r.passed + r.flaky}/${projectRan}</span></span>`;
      })
      .join('');
    resultCell = `<a class="result ${status}" href="${href}">${passed + flaky}/${ran} passed</a>${flaky ? ` <span class="count">${flaky} flaky</span>` : ''}<div class="projects">${projects}</div>`;
  }

  return `<tr><td>${runCell}</td><td>${date}</td><td>${escape(info?.suite ?? '')}</td><td>${commitCell}</td><td>${resultCell}</td><td>${info ? `${info.durationSeconds}s` : ''}</td></tr>`;
});

const body = rows.length ? rows.join('\n') : '<tr><td colspan="6">No reports yet.</td></tr>';

writeFileSync(
  path.join(site, 'index.html'),
  `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Test Reports</title>
  <style>
    :root { --text: #1f2328; --muted: #59636e; --line: #d1d9e0; --link: #0969da;
            --pass-bg: #dafbe1; --pass: #1a7f37; --fail-bg: #ffebe9; --fail: #cf222e; --bg: #fff; }
    @media (prefers-color-scheme: dark) {
      :root { --text: #e6edf3; --muted: #9198a1; --line: #3d444d; --link: #4493f8;
              --pass-bg: #12261e; --pass: #3fb950; --fail-bg: #25171c; --fail: #f85149; --bg: #0d1117; }
    }
    body { font-family: system-ui, sans-serif; max-width: 64rem; margin: 2.5rem auto; padding: 0 1rem;
           color: var(--text); background: var(--bg); }
    h1 { margin-bottom: .25rem; }
    p { color: var(--muted); margin-top: 0; }
    a { color: var(--link); }
    .table { overflow-x: auto; }
    table { border-collapse: collapse; width: 100%; }
    th, td { text-align: left; padding: .6rem .5rem; border-bottom: 1px solid var(--line); white-space: nowrap;
             vertical-align: top; }
    th { color: var(--muted); font-weight: 600; font-size: .9rem; }
    .result { font-weight: 600; text-decoration: none; }
    .result.passed { color: var(--pass); }
    .result.failed { color: var(--fail); }
    .projects { display: flex; gap: .4rem; flex-wrap: wrap; margin-top: .35rem; }
    .project { border-radius: 999px; padding: .1rem .55rem; border: 1px solid var(--line); font-size: .85rem; }
    .project.passed { background: var(--pass-bg); border-color: var(--pass); }
    .project.failed { background: var(--fail-bg); border-color: var(--fail); }
    .count { color: var(--muted); font-size: .85rem; }
  </style>
</head>
<body>
  <h1>Test reports</h1>
  <p>Last runs of the <a href="${repoUrl}">playwright-automation</a> suite, newest first.
     Each result opens the Playwright HTML report, with traces for failed tests.</p>
  <div class="table">
    <table>
      <thead><tr><th>Run</th><th>Date</th><th>Suite</th><th>Commit</th><th>Result (per project)</th><th>Duration</th></tr></thead>
      <tbody>
${body}
      </tbody>
    </table>
  </div>
</body>
</html>
`,
);
