export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface ErrorResponse {
  error: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  is_location_offer: boolean;
  is_rental: boolean;
  co2_rating: string;
  in_stock: boolean;
  is_eco_friendly: boolean;
  product_image: { id: string; file_name: string; title: string };
  category: { id: string; name: string; slug?: string };
  brand: { id: string; name: string };
}

/** One page of a product list, as returned by the list and search endpoints. */
export interface ProductPage {
  current_page: number;
  data: Product[];
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}
