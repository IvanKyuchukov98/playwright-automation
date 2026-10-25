import { test as base } from '@playwright/test';
import { AuthApi } from '../api/AuthApi';
import { ProductsApi } from '../api/ProductsApi';
import { Header } from '../components/Header';
import { ToolshopApiMock } from '../mocks/ToolshopApiMock';
import { AccountPage } from '../pages/AccountPage';
import { LoginPage } from '../pages/LoginPage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';
import { ProductListPage } from '../pages/ProductListPage';

/**
 * Page objects and API clients as fixtures: a test asks for what it needs by name
 * and Playwright builds it per test, so tests never call `new` themselves.
 */
type Fixtures = {
  loginPage: LoginPage;
  accountPage: AccountPage;
  productListPage: ProductListPage;
  productDetailsPage: ProductDetailsPage;
  header: Header;
  authApi: AuthApi;
  productsApi: ProductsApi;
  mockApi: ToolshopApiMock;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  accountPage: async ({ page }, use) => use(new AccountPage(page)),
  productListPage: async ({ page }, use) => use(new ProductListPage(page)),
  productDetailsPage: async ({ page }, use) => use(new ProductDetailsPage(page)),
  header: async ({ page }, use) => use(new Header(page)),
  authApi: async ({ request }, use) => use(new AuthApi(request)),
  productsApi: async ({ request }, use) => use(new ProductsApi(request)),
  mockApi: async ({ page }, use) => use(new ToolshopApiMock(page)),
});

export { expect } from './matchers';
