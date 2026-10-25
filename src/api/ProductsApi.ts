import type { APIRequestContext, APIResponse } from '@playwright/test';
import { env } from '../config/env';

export class ProductsApi {
  constructor(private readonly request: APIRequestContext) {}

  list(page = 1): Promise<APIResponse> {
    return this.request.get(`${env.apiBaseUrl}/products`, { params: { page } });
  }

  search(query: string): Promise<APIResponse> {
    return this.request.get(`${env.apiBaseUrl}/products/search`, { params: { q: query } });
  }

  details(id: string): Promise<APIResponse> {
    return this.request.get(`${env.apiBaseUrl}/products/${id}`);
  }
}
