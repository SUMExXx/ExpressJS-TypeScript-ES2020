import dotenv from 'dotenv';
import type { Request, Response } from 'express';
import { transporterCommon } from '../utils/email.js';

dotenv.config();

export const contactFounder = async (req: Request, res: Response): Promise<void> => {

    try {
        const { email, name, message } = await req.body;

        if (!email || !name || !message) {
            res.status(400).json({ error: 'Email, name, and message are required' });
            return;
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_RECEIVER,
            subject: `New Message from ${name}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #333;">New Message Received</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; white-space: pre-wrap;">
            ${message}
          </div>
        </div>
      `
        };

        await transporterCommon.sendMail(mailOptions);

        res.status(201).json({ message: 'User registered. Check your email to verify.' });
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
    }
};