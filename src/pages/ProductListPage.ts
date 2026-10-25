import type { Locator, Page } from '@playwright/test';

/** Home page: product grid with search, sorting and filters. */
export class ProductListPage {
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly sortSelect: Locator;
  readonly productGrid: Locator;
  readonly productCards: Locator;
  readonly productNames: Locator;
  readonly productPrices: Locator;
  readonly noResults: Locator;
  /** Grey placeholder cards shown while the products load. */
  readonly loadingPlaceholders: Locator;

  constructor(private readonly page: Page) {
    this.searchInput = page.getByTestId('search-query');
    this.searchButton = page.getByTestId('search-submit');
    this.sortSelect = page.getByTestId('sort');
    this.productGrid = page.locator('app-overview .col-md-9 > .container');
    this.productCards = page.locator('a.card');
    this.productNames = page.getByTestId('product-name');
    this.productPrices = page.getByTestId('product-price');
    this.noResults = page.getByTestId('no-results');
    this.loadingPlaceholders = page.locator('.card.skeleton');
  }

  async open(): Promise<void> {
    await this.page.goto('/');
  }

  async searchFor(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchButton.click();
    await this.waitForState('search_completed');
  }

  /** Sorts by an option value, e.g. "price,asc". */
  async sortBy(option: string): Promise<void> {
    await this.sortSelect.selectOption(option);
    await this.waitForState('sorting_completed');
  }

  /** The product grid exposes its loading state in a data-test attribute, e.g. "search_completed". */
  private async waitForState(state: string): Promise<void> {
    await this.page.getByTestId(state).waitFor({ state: 'attached' });
  }
}
