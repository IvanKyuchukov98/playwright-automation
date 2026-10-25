import type { Product, ProductPage } from '../api/models';

let nextId = 1;

/** A valid in-stock product; pass only the fields the test cares about. */
export function aProduct(overrides: Partial<Product> = {}): Product {
  const id = `MOCK${String(nextId++).padStart(22, '0')}`;
  return {
    id,
    name: 'Mocked Product',
    description: 'A product returned by a mocked API response.',
    price: 10,
    is_location_offer: false,
    is_rental: false,
    co2_rating: 'B',
    in_stock: true,
    is_eco_friendly: false,
    product_image: { id: `${id}-IMG`, file_name: 'pliers01.avif', title: 'Mocked product' },
    category: { id: 'MOCK-CATEGORY', name: 'Pliers', slug: 'pliers' },
    brand: { id: 'MOCK-BRAND', name: 'Mock Brand' },
    ...overrides,
  };
}

/** A single page holding exactly the given products. */
export function aProductPage(products: Product[]): ProductPage {
  return {
    current_page: 1,
    data: products,
    from: products.length ? 1 : null,
    last_page: 1,
    per_page: 9,
    to: products.length || null,
    total: products.length,
  };
}
