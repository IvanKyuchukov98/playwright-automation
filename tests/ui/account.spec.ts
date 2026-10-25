import { storageState } from '../../src/auth/storageState';
import { env } from '../../src/config/env';
import { expect, test } from '../../src/fixtures';

test.describe('Customer account', { tag: '@ui' }, () => {
  // Starts logged in with the session saved by the auth setup, without using the login form.
  test.use({ storageState: storageState.customer });

  test(
    'logged-in customer opens their account',
    { tag: '@smoke' },
    async ({ page, accountPage, header }) => {
      await page.goto('/account');

      await expect(accountPage.pageTitle).toHaveText('My account');
      await expect(header.userMenu).toContainText(env.customer.name);
    },
  );
});
