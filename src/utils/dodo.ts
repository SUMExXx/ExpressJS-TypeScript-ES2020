import DodoPayments from 'dodopayments';

const dodo = new DodoPayments({
  bearerToken: process.env.NODE_ENV == "production"? process.env.DODO_PAYMENTS_API_KEY: process.env.DODO_TEST_API_KEY,
  // bearerToken: process.env.DODO_TEST_API_KEY,
  // environment: process.env.NODE_ENV == "production"? "live_mode": "test_mode"
  // environment: "test_mode" // Use test mode for development
});

export default dodo;