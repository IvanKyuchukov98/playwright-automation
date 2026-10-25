import { ProductPageSchema, ProductSchema, type Product, type ProductPage } from '../api/schemas';

let nextId = 1;

/**
 * A valid in-stock product; pass only the fields the test cares about.
 * The result is checked against the API schema, so mocked data stays realistic.
 */
export function aProduct(overrides: Partial<Product> = {}): Product {
  const id = `MOCK${String(nextId++).padStart(22, '0')}`;
  return ProductSchema.parse({
    id,
    name: 'Mocked Product',
    description: 'A product returned by a mocked API response.',
    price: 10,
    is_location_offer: false,
    is_rental: false,
    co2_rating: 'B',
    in_stock: true,
    is_eco_friendly: false,
    product_image: {
      id: `${id}-IMG`,
      by_name: 'Mock',
      by_url: '',
      source_name: 'Mock',
      source_url: '',
      file_name: 'pliers01.avif',
      title: 'Mocked product',
    },
    category: { id: 'MOCK-CATEGORY', name: 'Pliers', slug: 'pliers' },
    brand: { id: 'MOCK-BRAND', name: 'Mock Brand' },
    ...overrides,
  });
}

/** A single page holding exactly the given products. */
export function aProductPage(products: Product[]): ProductPage {
  return ProductPageSchema.parse({
    current_page: 1,
    data: products,
    from: products.length ? 1 : null,
    last_page: 1,
    per_page: 9,
    to: products.length || null,
    total: products.length,
  });
}
