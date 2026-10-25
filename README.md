# Playwright Automation

UI and API test automation framework in **TypeScript** with **Playwright Test**, written against the
[Practice Software Testing "Toolshop"](https://practicesoftwaretesting.com) demo application.

## Tech stack

| Area         | Tool                                             |
| ------------ | ------------------------------------------------ |
| Language     | TypeScript (strict mode)                         |
| Test runner  | Playwright Test                                  |
| Browsers     | Chromium, Firefox, WebKit                        |
| API testing  | Playwright `APIRequestContext`, zod schemas      |
| Code quality | ESLint (typescript-eslint, playwright), Prettier |
| Config       | Environment variables / `.env` (dotenv)          |

## Project structure

```
src/
  config/env.ts       settings with defaults, overridable via environment variables
  pages/              page objects (locators + user actions)
  components/         parts shared across pages, e.g. the header
  api/                API clients and zod response schemas (types are derived from them)
  mocks/              network mocking helper and test data builders
  auth/               saved login sessions (storageState) for the UI tests
  fixtures/           custom `test` that injects page objects and API clients, custom matchers
tests/
  ui/                 browser tests, run once per browser project
  api/                API tests, no browser
  setup/              logs in through the API before the UI tests run
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
| `npm run test:mock`   | UI tests with mocked API responses         |
| `npm run test:visual` | visual comparison tests (Linux / CI only)  |
| `npm run test:headed` | UI tests in a visible Chromium window      |
| `npm run report`      | opens the last HTML report                 |

Single browser: `npx playwright test --project=firefox`. Filter by tag: `npx playwright test --grep @api`.

## Logged-in tests (API login + storageState)

UI tests that need a logged-in customer don't go through the login form. Before the browser
projects start, the `setup` project (`tests/setup/auth.setup.ts`) logs in through the API and
saves the token as a browser session in `.auth/customer.json`. The Toolshop keeps the token in
localStorage, so no browser is needed for this step. A test file opts in with:

```ts
test.use({ storageState: storageState.customer });
```

The browser projects depend on `setup`, so it runs automatically, also in every CI shard. The
token expires after a few minutes, so it's fetched fresh on each run. Tests for the login form
itself don't use the saved session.

## API contract checks (zod)

Every API response is checked against a zod schema in `src/api/schemas.ts` with a custom matcher:

```ts
await expect(response).toMatchSchema(ProductPageSchema);
```

The TypeScript types (`Product`, `ProductPage`, ...) are inferred from the same schemas, so the
types and the checks can't drift apart. The mock builders validate their output too, so mocked
data always looks like real API data. A broken contract lists every problem with its location:

```
Expected https://api.../products/search?q=pliers to match the schema:
✖ Too small: expected number to be >=0
  → at data[0].price
✖ Invalid input: expected object, received undefined
  → at data[1].brand
```

## Network mocking

`tests/ui/products.mock.spec.ts` intercepts the calls the browser makes to the Toolshop API to
check UI states a shared backend can't easily produce. The `mockApi` fixture
(`src/mocks/ToolshopApiMock.ts`) wraps `page.route()`:

| Technique               | Example                                                          |
| ----------------------- | ---------------------------------------------------------------- |
| Replace a response      | `mockApi.searchResults([])`: empty search results                |
| Fully fake data         | `mockApi.productList([aProduct({ price: 1234.5 })])`             |
| Change a real response  | `mockApi.modifyProductDetails((p) => { p.in_stock = false; })`   |
| Simulate a server error | `mockApi.failProductList(500)`                                   |
| Check what the UI sends | `mockApi.nextProductListRequest()` then inspect `postDataJSON()` |

`aProduct()` builds a valid product, so a test sets only the fields it cares about.

The server error test documents a known issue: on a 500 the product grid shows loading
placeholders forever, with no error message. It's marked `test.fail()`, so it passes while the
bug exists and Playwright flags it once the app is fixed.

## Visual comparison

`tests/ui/visual.spec.ts` compares the login form, the guest header and the product grid with
baseline screenshots, one per browser, in `tests/ui/__screenshots__/`. The product grid uses
mocked products, so catalogue changes don't affect it.

Screenshots differ between operating systems, so baselines are made on Linux in CI and the tests
are skipped on other systems. To create or update the baselines, run the **Update visual
baselines** workflow (Actions tab): it takes new screenshots against the Docker Toolshop and
commits the changed images. When a comparison fails, the HTML report shows the expected, actual
and diff images side by side.

## Configuration

Defaults live in `src/config/env.ts`. Override them with environment variables or a `.env` file
(copy `.env.example`), e.g. `UI_BASE_URL=http://localhost:4200 npm test`.

## Reports and debugging

- HTML report in `playwright-report/`
- On failure: trace, screenshot and video in `test-results/`. Open a trace with
  `npx playwright show-trace <path-to-trace.zip>`.

## CI

[`.github/workflows/tests.yml`](.github/workflows/tests.yml) runs on GitHub Actions:

- **When:** nightly full regression on all browsers, or manually from the Actions tab with a
  choice of suite (regression / smoke) and browsers.
- **Environment:** a local Toolshop in Docker, started by the
  [`toolshop-environment`](https://github.com/IvanKyuchukov98/toolshop-environment) action, because
  the public site shows a Cloudflare check to CI browsers.
- **Sharding:** the selected tests are split across parallel jobs (`--shard=1/2`, `2/2`). Each shard
  uploads a blob report, and a final job merges them with `playwright merge-reports` into a single
  HTML report, uploaded as the `playwright-report` artifact.
- **Summary:** passed / failed / flaky / skipped per project, shown on the run page.
- **Report history:** runs on `main` publish to GitHub Pages: the merged HTML report of the
  last 10 runs, with traces you can open in the browser, and an index page with results per
  project, duration and links to each run and commit.
- **Checks:** type check, ESLint and Prettier run in a separate job.

## Code quality

```bash
npm run typecheck
npm run lint
npm run format:check
```
