import type { Page, Request, Route } from '@playwright/test';
import type { Product, ProductPage } from '../api/schemas';
import { env } from '../config/env';
import { aProductPage } from './builders';

const apiOrigin = new URL(env.apiBaseUrl).origin;

/** Matches requests to one Toolshop API path, e.g. "/products", whatever the method or query. */
const endpoint = (path: string | RegExp) => (url: URL) =>
  url.origin === apiOrigin &&
  (typeof path === 'string' ? url.pathname === path : path.test(url.pathname));

const PRODUCT_LIST = endpoint('/products');
const PRODUCT_SEARCH = endpoint('/products/search');
const PRODUCT_DETAILS = endpoint(/^\/products\/[0-9A-Z]{26}$/);

/**
 * Intercepts the calls the browser makes to the Toolshop API, so a test can put the UI in states
 * that are hard to create on a real backend: empty results, errors, unusual data.
 * Set mocks up before the page makes the call, usually before navigating.
 *
 * Note: the UI loads product lists with the HTTP QUERY method and sends the filters in the body.
 */
export class ToolshopApiMock {
  constructor(private readonly page: Page) {}

  /** The product list (home page) returns exactly these products. */
  async productList(products: Product[]): Promise<void> {
    await this.page.route(PRODUCT_LIST, (route) => route.fulfill({ json: aProductPage(products) }));
  }

  /** Product search returns exactly these products. */
  async searchResults(products: Product[]): Promise<void> {
    await this.page.route(PRODUCT_SEARCH, (route) =>
      route.fulfill({ json: aProductPage(products) }),
    );
  }

  /** The product list fails with the given HTTP status. */
  async failProductList(status = 500): Promise<void> {
    await this.page.route(PRODUCT_LIST, (route) =>
      route.fulfill({ status, json: { message: 'Mocked server error' } }),
    );
  }

  /** Lets the real product list call through, then changes its response before the UI sees it. */
  async modifyProductList(change: (page: ProductPage) => void): Promise<void> {
    await this.page.route(PRODUCT_LIST, (route) => modifyJson(route, change));
  }

  /** Lets the real product details call through, then changes its response before the UI sees it. */
  async modifyProductDetails(change: (product: Product) => void): Promise<void> {
    await this.page.route(PRODUCT_DETAILS, (route) => modifyJson(route, change));
  }

  /** Resolves with the next product list request, e.g. to check the filters the UI sends. */
  nextProductListRequest(): Promise<Request> {
    return this.page.waitForRequest((request) => PRODUCT_LIST(new URL(request.url())));
  }
}

async function modifyJson<T>(route: Route, change: (body: T) => void): Promise<void> {
  const response = await route.fetch();
  const body = (await response.json()) as T;
  change(body);
  await route.fulfill({ response, json: body });
}
