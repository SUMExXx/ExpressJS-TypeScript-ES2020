import { createTransport } from 'nodemailer';

import dotenv from 'dotenv';

dotenv.config();

export const transporterCommon = createTransport({
  host: process.env.EMAIL_HOST,
  port: 465, // or 587 for TLS
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});