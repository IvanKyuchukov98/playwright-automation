import {
  MessageResponseSchema,
  ProductDetailsSchema,
  ProductPageSchema,
  type ProductPage,
} from '../../src/api/schemas';
import { expect, test } from '../../src/fixtures';

test.describe('Products API', { tag: '@api' }, () => {
  test(
    'product list returns the first page of products',
    { tag: '@smoke' },
    async ({ productsApi }) => {
      const response = await productsApi.list(1);

      expect(response.status()).toBe(200);
      await expect(response).toMatchSchema(ProductPageSchema);

      const page = (await response.json()) as ProductPage;
      expect(page.current_page).toBe(1);
      expect(page.data.length).toBeGreaterThan(0);
      expect(page.data.length).toBeLessThanOrEqual(page.per_page);
    },
  );

  test('search returns only products matching the query', async ({ productsApi }) => {
    const response = await productsApi.search('pliers');

    expect(response.status()).toBe(200);
    await expect(response).toMatchSchema(ProductPageSchema);

    const names = ((await response.json()) as ProductPage).data.map((product) =>
      product.name.toLowerCase(),
    );
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) expect(name).toContain('pliers');
  });

  test('product details include the specifications', async ({ productsApi }) => {
    const list = (await (await productsApi.list(1)).json()) as ProductPage;
    const product = list.data[0];

    const response = await productsApi.details(product.id);

    expect(response.status()).toBe(200);
    await expect(response).toMatchSchema(ProductDetailsSchema);
    expect(await response.json()).toMatchObject({
      id: product.id,
      name: product.name,
      price: product.price,
    });
  });

  test('an unknown product returns 404', async ({ productsApi }) => {
    const response = await productsApi.details('01ZZZZZZZZZZZZZZZZZZZZZZZZ');

    expect(response.status()).toBe(404);
    await expect(response).toMatchSchema(MessageResponseSchema);
  });
});
