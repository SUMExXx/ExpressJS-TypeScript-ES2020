import { createTransport } from 'nodemailer';

import dotenv from 'dotenv';

dotenv.config();

export const transporterContactUs = createTransport({
  service: process.env.EMAIL_SERVICE
  auth: {
    user: process.env.EMAIL_CONTACT_US,
    pass: process.env.EMAIL_CONTACT_US_APP_PASS
  }
});

export const transporterRequestQuote = createTransport({
  service: process.env.EMAIL_SERVICE
  auth: {
    user: process.env.EMAIL_REQUEST_QUOTE,
    pass: process.env.EMAIL_REQUEST_QUOTE_APP_PASS
  }
});