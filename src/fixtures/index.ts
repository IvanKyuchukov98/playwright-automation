import { test as base } from '@playwright/test';
import { AuthApi } from '../api/AuthApi';
import { Header } from '../components/Header';
import { AccountPage } from '../pages/AccountPage';
import { LoginPage } from '../pages/LoginPage';

/**
 * Page objects and API clients as fixtures: a test asks for what it needs by name
 * and Playwright builds it per test, so tests never call `new` themselves.
 */
type Fixtures = {
  loginPage: LoginPage;
  accountPage: AccountPage;
  header: Header;
  authApi: AuthApi;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  accountPage: async ({ page }, use) => use(new AccountPage(page)),
  header: async ({ page }, use) => use(new Header(page)),
  authApi: async ({ request }, use) => use(new AuthApi(request)),
});

export { expect } from '@playwright/test';
