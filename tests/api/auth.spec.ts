import type { ErrorResponse, LoginResponse } from '../../src/api/models';
import { env } from '../../src/config/env';
import { expect, test } from '../../src/fixtures';

test.describe('Authentication API', { tag: '@api' }, () => {
  test(
    'customer receives an access token with valid credentials',
    { tag: '@smoke' },
    async ({ authApi }) => {
      const response = await authApi.login(env.customer.email, env.customer.password);

      expect(response.status()).toBe(200);
      const body = (await response.json()) as LoginResponse;
      expect(body.access_token).toBeTruthy();
      expect(body.token_type.toLowerCase()).toBe('bearer');
      expect(body.expires_in).toBeGreaterThan(0);
    },
  );

  // Uses an unknown email on purpose: repeated wrong passwords lock real accounts.
  test('login is rejected for unknown credentials', async ({ authApi }) => {
    const response = await authApi.login('unknown.user@example.com', 'wrong-password');

    expect(response.status()).toBe(401);
    const body = (await response.json()) as ErrorResponse;
    expect(body.error).toBe('Unauthorized');
  });
});
