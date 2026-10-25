import { ErrorResponseSchema, LoginResponseSchema } from '../../src/api/schemas';
import { env } from '../../src/config/env';
import { expect, test } from '../../src/fixtures';

test.describe('Authentication API', { tag: '@api' }, () => {
  test(
    'customer receives an access token with valid credentials',
    { tag: '@smoke' },
    async ({ authApi }) => {
      const response = await authApi.login(env.customer.email, env.customer.password);

      expect(response.status()).toBe(200);
      // The schema checks a non-empty token, a "bearer" type and a positive expiry.
      await expect(response).toMatchSchema(LoginResponseSchema);
    },
  );

  // Uses an unknown email on purpose: repeated wrong passwords lock real accounts.
  test('login is rejected for unknown credentials', async ({ authApi }) => {
    const response = await authApi.login('unknown.user@example.com', 'wrong-password');

    expect(response.status()).toBe(401);
    await expect(response).toMatchSchema(ErrorResponseSchema);
    expect((await response.json()).error).toBe('Unauthorized');
  });
});
