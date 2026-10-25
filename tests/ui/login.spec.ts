import { env } from '../../src/config/env';
import { expect, test } from '../../src/fixtures';

test.describe('Customer login', { tag: '@ui' }, () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test(
    'customer logs in with valid credentials',
    { tag: '@smoke' },
    async ({ loginPage, accountPage, header }) => {
      await loginPage.loginAs(env.customer.email, env.customer.password);

      await expect(accountPage.pageTitle).toHaveText('My account');
      await expect(header.userMenu).toContainText(env.customer.name);
    },
  );

  // Uses an unknown email on purpose: repeated wrong passwords lock real accounts.
  test('login is rejected for unknown credentials', async ({ loginPage }) => {
    await loginPage.loginAs('unknown.user@example.com', 'wrong-password');

    await expect(loginPage.errorMessage).toContainText('Invalid email or password');
  });
});
