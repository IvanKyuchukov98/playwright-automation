import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { storageState, toolshopSession } from '../../src/auth/storageState';
import { env } from '../../src/config/env';
import { expect, test as setup } from '../../src/fixtures';

// Logs in through the API and saves the session for the UI tests, so they start already logged in
// instead of filling in the login form. Runs before the browser projects (see playwright.config.ts).
// The token is valid for a few minutes only, so a fresh one is fetched on every run.
setup('log in the customer', async ({ authApi }) => {
  const token = await authApi.tokenFor(env.customer.email, env.customer.password);
  expect(token, 'access token').toBeTruthy();

  await mkdir(path.dirname(storageState.customer), { recursive: true });
  await writeFile(storageState.customer, JSON.stringify(toolshopSession(env.uiBaseUrl, token)));
});
