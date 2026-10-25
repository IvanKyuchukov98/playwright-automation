import type { Locator, Page } from '@playwright/test';

/** Top navigation bar, shared by every page. */
export class Header {
  readonly cartQuantity: Locator;
  readonly userMenu: Locator;

  constructor(page: Page) {
    this.cartQuantity = page.getByTestId('cart-quantity');
    this.userMenu = page.getByTestId('nav-menu');
  }
}
