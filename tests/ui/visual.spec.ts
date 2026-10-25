import { aProduct } from '../../src/mocks/builders';
import { expect, test } from '../../src/fixtures';

// Screenshots differ between operating systems (fonts, anti-aliasing), so the baselines are made
// on Linux in CI by the "Update visual baselines" workflow and the tests run only there.
// Baselines live in tests/ui/__screenshots__/, one per browser.
test.describe('Visual comparison', { tag: ['@ui', '@visual'] }, () => {
  test.skip(
    process.platform !== 'linux',
    'Visual baselines are made on Linux; run these in CI (see update-snapshots.yml)',
  );

  test('login form', async ({ page, loginPage }) => {
    await loginPage.open();

    await expect(page.getByTestId('login-form')).toHaveScreenshot('login-form.png');
  });

  test('header for a guest', async ({ page, productListPage }) => {
    await productListPage.open();

    await expect(page.locator('app-header nav')).toHaveScreenshot('header-guest.png');
  });

  test('product grid', async ({ mockApi, productListPage }) => {
    // Mocked products keep the image stable when the real catalogue changes.
    await mockApi.productList([
      aProduct({ name: 'Combination Pliers', price: 14.15, co2_rating: 'D' }),
      aProduct({ name: 'Bolt Cutters', price: 48.41, in_stock: false }),
      aProduct({ name: 'Long Nose Pliers', price: 14.24, co2_rating: 'A' }),
    ]);
    await productListPage.open();
    await expect(productListPage.productCards).toHaveCount(3);

    await expect(productListPage.productGrid).toHaveScreenshot('product-grid.png');
  });
});
