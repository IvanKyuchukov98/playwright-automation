# Playwright Automation

UI and API test automation framework in **TypeScript** with **Playwright Test**, written against the
[Practice Software Testing "Toolshop"](https://practicesoftwaretesting.com) demo application.

## Tech stack

| Area         | Tool                                             |
| ------------ | ------------------------------------------------ |
| Language     | TypeScript (strict mode)                         |
| Test runner  | Playwright Test                                  |
| Browsers     | Chromium, Firefox, WebKit                        |
| API testing  | Playwright `APIRequestContext`                   |
| Code quality | ESLint (typescript-eslint, playwright), Prettier |
| Config       | Environment variables / `.env` (dotenv)          |

## Project structure

```
src/
  config/env.ts       settings with defaults, overridable via environment variables
  pages/              page objects (locators + user actions)
  components/         parts shared across pages, e.g. the header
  api/                API clients and response models
  fixtures/index.ts   custom `test` that injects page objects and API clients
tests/
  ui/                 browser tests, run once per browser project
  api/                API tests, no browser
playwright.config.ts  projects, reporters, traces, timeouts
```

Tests import `test` and `expect` from `src/fixtures` and ask for page objects by name:

```ts
test('customer logs in', async ({ loginPage, accountPage }) => {
  await loginPage.loginAs(env.customer.email, env.customer.password);
  await expect(accountPage.pageTitle).toHaveText('My account');
});
```

## Getting started

Requires Node.js 20+.

```bash
npm install
npx playwright install
npm test
```

## Running tests

| Command               | What it runs                               |
| --------------------- | ------------------------------------------ |
| `npm test`            | everything: API + UI on all three browsers |
| `npm run test:ui`     | UI tests on Chromium, Firefox and WebKit   |
| `npm run test:api`    | API tests only                             |
| `npm run test:smoke`  | tests tagged `@smoke`                      |
| `npm run test:headed` | UI tests in a visible Chromium window      |
| `npm run report`      | opens the last HTML report                 |

Single browser: `npx playwright test --project=firefox`. Filter by tag: `npx playwright test --grep @api`.

## Configuration

Defaults live in `src/config/env.ts`. Override them with environment variables or a `.env` file
(copy `.env.example`), e.g. `UI_BASE_URL=http://localhost:4200 npm test`.

## Reports and debugging

- HTML report in `playwright-report/`
- On failure: trace, screenshot and video in `test-results/`. Open a trace with
  `npx playwright show-trace <path-to-trace.zip>`.

## Code quality

```bash
npm run typecheck
npm run lint
npm run format:check
```
