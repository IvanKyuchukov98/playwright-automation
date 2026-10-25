import { z } from 'zod';

/**
 * Response contracts of the Toolshop API. Tests check responses against them with
 * `expect(body).toMatchSchema(...)`, and the TypeScript types below are derived from them,
 * so the types and the checks can't drift apart.
 * Unknown extra fields are allowed: a new field in the API doesn't break the contract.
 */

export const LoginResponseSchema = z.object({
  access_token: z.string().min(1),
  token_type: z.string().regex(/^bearer$/i),
  expires_in: z.number().int().positive(),
});

export const ErrorResponseSchema = z.object({
  error: z.string(),
});

export const MessageResponseSchema = z.object({
  message: z.string(),
});

const Id = z.string().min(1);

export const ProductSchema = z.object({
  id: Id,
  name: z.string().min(1),
  description: z.string(),
  price: z.number().nonnegative(),
  is_location_offer: z.boolean(),
  is_rental: z.boolean(),
  co2_rating: z.enum(['A', 'B', 'C', 'D', 'E']).nullable(),
  in_stock: z.boolean(),
  is_eco_friendly: z.boolean(),
  product_image: z.object({
    id: Id,
    by_name: z.string(),
    by_url: z.string(),
    source_name: z.string(),
    source_url: z.string(),
    file_name: z.string().min(1),
    title: z.string(),
  }),
  category: z.object({ id: Id, name: z.string(), slug: z.string().optional() }),
  brand: z.object({ id: Id, name: z.string() }),
});

/** A product page with its specifications, as returned by GET /products/{id}. */
export const ProductDetailsSchema = ProductSchema.extend({
  category: ProductSchema.shape.category.extend({ parent_id: Id.nullable().optional() }),
  specs: z.array(
    z.object({
      id: Id,
      product_id: Id,
      spec_name: z.string(),
      spec_value: z.string(),
      spec_unit: z.string().nullable(),
    }),
  ),
});

/** One page of a product list, as returned by the list and search endpoints. */
export const ProductPageSchema = z.object({
  current_page: z.number().int().min(1),
  data: z.array(ProductSchema),
  from: z.number().int().nullable(),
  last_page: z.number().int().min(1),
  per_page: z.number().int().min(1),
  to: z.number().int().nullable(),
  total: z.number().int().nonnegative(),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type ProductDetails = z.infer<typeof ProductDetailsSchema>;
export type ProductPage = z.infer<typeof ProductPageSchema>;
