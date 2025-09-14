import User from '../models/user.js';
import dotenv from 'dotenv';
import type { Request, Response } from 'express';
import { Webhook } from "standardwebhooks";
import { v4 as uuidv4 } from 'uuid';
import dodo from "../utils/dodo.js";
import TempOrder from '../models/tempOrder.js';
import { jwtVerify } from 'jose';
import getEmail from '../utils/getEmail.js';
import Affiliate from '../models/affiliate.js';

dotenv.config();

// export const captureOrder = async (req: Request, res: Response): Promise<void> => {
//   const webhook = new Webhook(process.env.DODO_WEBHOOK_KEY!);

//   let rawBody = '';
//   req.setEncoding('utf8');

//   req.on('data', (chunk) => {
//     rawBody += chunk;
//   });

//   req.on('end', async () => {
//     try {
//       // Extract headers
//       const getHeaderValue = (header: string | string[] | undefined): string => {
//         if (Array.isArray(header)) return header[0];
//         return header || "";
//       };

//       const webhookHeaders = {
//         "webhook-id": getHeaderValue(req.headers["webhook-id"]),
//         "webhook-signature": getHeaderValue(req.headers["webhook-signature"]),
//         "webhook-timestamp": getHeaderValue(req.headers["webhook-timestamp"]),
//       };

//       // ✅ Verify signature AFTER full body is received
//       await webhook.verify(rawBody, webhookHeaders);

//       const payload = JSON.parse(rawBody);

//       switch (payload.type) {
//         case 'payment.succeeded':
//           await handlePaymentSucceeded(payload);
//           res.status(200).json({ message: 'Success' });
//           return;
//       }

//       res.status(501).json({ error: 'Unhandled event type' });
//     } catch (error) {
//       console.error("❌ Error verifying or handling webhook:", error);
//       res.status(400).json({ error: 'Webhook verification or processing failed' });
//     }
//   });

//   req.on('error', (err) => {
//     console.error('❌ Error reading request body:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   });
// };

export const captureOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const webhook = new Webhook(process.env.DODO_WEBHOOK_KEY!);

    const rawBody = req.body.toString("utf8"); // Only works if express.raw() is used
    const headers = req.headers;

    const webhookHeaders = {
      "webhook-id": Array.isArray(headers["webhook-id"]) ? headers["webhook-id"][0] : headers["webhook-id"] || "",
      "webhook-signature": Array.isArray(headers["webhook-signature"]) ? headers["webhook-signature"][0] : headers["webhook-signature"] || "",
      "webhook-timestamp": Array.isArray(headers["webhook-timestamp"]) ? headers["webhook-timestamp"][0] : headers["webhook-timestamp"] || "",
    };

    // ✅ Verify signature
    await webhook.verify(rawBody, webhookHeaders);

    const payload = JSON.parse(rawBody);

    console.log("Received webhook payload:", payload);

    switch (payload.type) {
      case 'payment.succeeded':
        await handlePaymentSucceeded(payload);
        res.status(200).json({ message: 'Success' });
        return;
      case 'payment.failed':
        // Handle payment failed event if needed
        res.status(200).json({ message: 'Payment failed event received' });
        return;
    }

    res.status(501).json({ error: 'Unhandled event type' });
  } catch (error) {
    console.error("❌ Error verifying or handling webhook:", error);
    res.status(400).json({ error: 'Webhook verification or processing failed' });
  }
};

const handlePaymentSucceeded = async (payload: any) => {
  // Implement your logic to handle the payment succeeded event
  // For example, you might want to update the user's subscription status in your database

  // You can access the payment details from payload.data
  const { payment_id } = payload.data;

  const tempOrder = await TempOrder.findOne({ paymentId: payment_id });

  if (tempOrder) {
    // Update the temp order status or perform any other necessary actions
    const user = await User.findOne({ email: tempOrder.email });
    if (user) {
      // Update user's subscription status or any other relevant information
      user.plan = 'premium'; // Example field, adjust as necessary
      await user.save();
    }

    if(tempOrder.affiliate) {
      // Increment the success_refers count for the affiliate
      const affiliateUser = await Affiliate.findOne({ username: tempOrder.affiliate });
      if (affiliateUser) {
        affiliateUser.success_refers += 1;
        await affiliateUser.save();
      }
    }
    // You can also send a confirmation email or perform other actions here

    await tempOrder.deleteOne()
  }
};



export const dodoCreate = async (req: Request, res: Response): Promise<void> => {

  try {
    const { name, email, city, country, state, street, zipcode, affiliate } = await req.body;

    const code = uuidv4();

    const subscription = await dodo.subscriptions.create({
      billing: {
        city: city,
        country: country,
        state: state,
        street: street,
        zipcode: zipcode
      },
      customer: {
        email: email,
        name: name
      },
      payment_link: true,
      return_url: `${process.env.APP_URL}/payment-success`,
      product_id: process.env.DODO_SUBSCRIPTION_PRODUCT_ID!,
      quantity: 1,
    });

    await TempOrder.findOneAndDelete({ email: email });

    const tempOrder = new TempOrder({
      email: email,
      code: code,
      paymentId: subscription.payment_id,
      affiliate: affiliate || null
    });

    await tempOrder.save()

    res.json({ paymentLink: subscription.payment_link });
    return;
  } catch (err) {
    console.error("Payment link creation failed", err);
    res.status(500).json(
      {
        error: err instanceof Error ? err.message : "An unknown error occurred",
      }
    );
  }
}



export const getEmailUser = async (req: Request, res: Response): Promise<void> => {

  const JWT_SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);

  try {
    const { token } = await req.body;

    const { payload } = await jwtVerify(token, JWT_SECRET_KEY, {
      algorithms: ['HS256'],
    });

    if (typeof payload.email === 'string') {
      res.status(200).json({ email: payload.email });
    } else {
      res.status(400).json({ error: 'Email not found in token' });
    }
  } catch (err) {
    console.error('Invalid or expired token:', err);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}



export const getUser = async (req: Request, res: Response): Promise<void> => {

  try {
    const body = await req.body;
    const token = body.token;

    if (!token) {
      res.status(400).json({ value: false, error: 'Token missing' });
      return;
    }

    const email = await getEmail(token);
    if (!email) {
      res.status(401).json({ value: false, error: 'Invalid token' });
      return;
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ value: false, error: 'User not found' });
      return;
    }

    res.status(200).json({ email: user.email, plan: user.plan, firstName: user.firstName, lastName: user.lastName });
  } catch (error) {
    console.error('❌ Plan verification failed:', error);
    res.status(500).json({ value: false, error: 'Server error' });
  }
}



export const logout = async (req: Request, res: Response): Promise<void> => {

  void req;

  res.cookie('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // only over HTTPS in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      expires: new Date(0), // Expire the cookie immediately
    })
    .status(200)
    .json({ message: 'Logged out' });

  return;
}



export const verifyJWT = async (req: Request, res: Response): Promise<void> => {

  try {
    const body = await req.body;
    const token = body.token;

    if (!token) {
      res.status(400).json({ value: false, error: 'Token missing' });
      return;
    }

    const email = await getEmail(token);
    if (!email) {
      res.status(401).json({ value: false, error: 'Invalid token' });
      return;
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ value: false, error: 'User not found' });
      return;
    }

    res.status(200).json({ value: true });
    return;
  } catch (error) {
    console.error('❌ Plan verification failed:', error);
    res.status(500).json({ value: false, error: 'Server error' });
    return;
  }
}



export const verifyPlan = async (req: Request, res: Response): Promise<void> => {

  try {
    const body = await req.body;
    const token = body.token;

    if (!token) {
      res.status(400).json({ success: false, error: 'Token missing' });
      return;
    }

    const email = await getEmail(token);
    if (!email) {
      res.status(401).json({ success: false, error: 'Invalid token' });
      return;
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const hasValidPlan = user.plan === 'premium' || user.plan === 'enterprise';

    res.status(200).json({ success: true, plan: user.plan, valid: hasValidPlan });
    return;
  } catch (error) {
    console.error('❌ Plan verification failed:', error);
    res.status(500).json({ success: false, error: 'Server error' });
    return;
  }
}