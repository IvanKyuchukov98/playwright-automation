import type { APIRequestContext, APIResponse } from '@playwright/test';
import { env } from '../config/env';
import type { LoginResponse } from './schemas';

export class AuthApi {
  constructor(private readonly request: APIRequestContext) {}

  login(email: string, password: string): Promise<APIResponse> {
    return this.request.post(`${env.apiBaseUrl}/users/login`, { data: { email, password } });
  }

  /** Logs in and returns the access token, failing fast if the login is rejected. */
  async tokenFor(email: string, password: string): Promise<string> {
    const response = await this.login(email, password);
    if (!response.ok()) {
      throw new Error(`Login failed for ${email}: ${response.status()} ${await response.text()}`);
    }
    const body = (await response.json()) as LoginResponse;
    return body.access_token;
  }
}
