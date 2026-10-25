import path from 'node:path';

/**
 * Saved browser sessions, written by tests/setup/auth.setup.ts before the UI tests start.
 * Use one in a test file with `test.use({ storageState: storageState.customer })`.
 */
export const storageState = {
  customer: path.join(__dirname, '../../.auth/customer.json'),
} as const;

/** A session for the Toolshop UI: it keeps the JWT in localStorage under "auth-token". */
export function toolshopSession(uiBaseUrl: string, token: string) {
  return {
    cookies: [],
    origins: [
      {
        origin: new URL(uiBaseUrl).origin,
        localStorage: [{ name: 'auth-token', value: token }],
      },
    ],
  };
}
