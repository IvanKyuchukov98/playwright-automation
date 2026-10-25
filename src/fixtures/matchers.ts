import { expect as baseExpect, type APIResponse } from '@playwright/test';
import { z, type ZodType } from 'zod';

/** Custom assertions, available on the `expect` exported from src/fixtures. */
export const expect = baseExpect.extend({
  /** Checks an API response's JSON body against a zod schema: `await expect(response).toMatchSchema(...)`. */
  async toMatchSchema(response: APIResponse, schema: ZodType) {
    const result = schema.safeParse(await response.json());
    return {
      name: 'toMatchSchema',
      pass: result.success,
      message: () =>
        result.success
          ? `Expected ${response.url()} not to match the schema, but it did.`
          : `Expected ${response.url()} to match the schema:\n${z.prettifyError(result.error)}`,
    };
  },
});
