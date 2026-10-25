import { aProduct } from '../../src/mocks/builders';
import { expect, test } from '../../src/fixtures';

// The UI talks to a real API, but these tests replace or change some of its responses
// (see src/mocks/ToolshopApiMock.ts) to check states a shared backend can't easily produce.
test.describe('Product list with mocked API responses', { tag: ['@ui', '@mock'] }, () => {
  test('shows a message when the search finds nothing', async ({ mockApi, productListPage }) => {
    await mockApi.searchResults([]);
    await productListPage.open();
    // Searching before the first list has loaded lets that late response overwrite the results.
    await expect(productListPage.productCards.first()).toBeVisible();

    await productListPage.searchFor('hammer');

    await expect(productListPage.noResults).toHaveText('There are no products found.');
    await expect(productListPage.productCards).toHaveCount(0);
  });

  test('shows products exactly as the API returns them', async ({ mockApi, productListPage }) => {
    await mockApi.productList([
      aProduct({ name: 'Mocked Claw Hammer', price: 1234.5 }),
      aProduct({ name: 'Mocked Mini Saw', price: 0.99 }),
    ]);

    await productListPage.open();

    await expect(productListPage.productNames).toHaveText([
      'Mocked Claw Hammer',
      'Mocked Mini Saw',
    ]);
    await expect(productListPage.productPrices).toHaveText(['$1234.50', '$0.99']);
  });

  test('an out-of-stock product cannot be added to the cart', async ({
    mockApi,
    productListPage,
    productDetailsPage,
  }) => {
    // Real responses, with only the stock flag changed.
    await mockApi.modifyProductList((page) => {
      page.data[0].in_stock = false;
    });
    await mockApi.modifyProductDetails((product) => {
      product.in_stock = false;
    });
    await productListPage.open();

    const firstCard = productListPage.productCards.first();
    await expect(firstCard.getByTestId('out-of-stock')).toHaveText('Out of stock');
    await firstCard.click();

    await expect(productDetailsPage.outOfStock).toBeVisible();
    await expect(productDetailsPage.addToCartButton).toBeDisabled();
  });

  test('sorting sends the chosen order to the API', async ({ mockApi, productListPage }) => {
    await productListPage.open();
    await expect(productListPage.productCards.first()).toBeVisible();

    const request = mockApi.nextProductListRequest();
    await productListPage.sortBy('price,asc');

    expect((await request).postDataJSON()).toMatchObject({ sort: 'price,asc' });
  });

  test.fail(
    'a server error replaces the loading placeholders with a message',
    {
      annotation: {
        type: 'known issue',
        description:
          'On a 500 from the product list the grid keeps its loading placeholders forever, with no ' +
          'error message or retry. Marked as expected to fail; Playwright reports it once fixed.',
      },
    },
    async ({ mockApi, productListPage }) => {
      await mockApi.failProductList(500);
      const request = mockApi.nextProductListRequest();

      await productListPage.open();
      // Check only once the failed call has come back, not before the grid has even rendered.
      await (await request).response();

      await expect(productListPage.loadingPlaceholders).toHaveCount(0, { timeout: 5_000 });
    },
  );
});
