import 'dotenv/config';

/**
 * Settings come from environment variables, optionally loaded from a local .env file
 * (see .env.example). Every value has a default, so the tests run with no setup.
 */
function read(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export const env = {
  uiBaseUrl: read('UI_BASE_URL', 'https://practicesoftwaretesting.com'),
  apiBaseUrl: read('API_BASE_URL', 'https://api.practicesoftwaretesting.com'),
  headless: read('HEADLESS', 'true') !== 'false',
  expectTimeout: Number(read('EXPECT_TIMEOUT_MS', '10000')),

  // Public demo account published by the site for testing.
  customer: {
    email: read('CUSTOMER_EMAIL', 'customer@practicesoftwaretesting.com'),
    password: read('CUSTOMER_PASSWORD', 'welcome01'),
    name: read('CUSTOMER_NAME', 'Jane Doe'),
  },
} as const;
