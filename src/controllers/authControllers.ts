import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import type { Request, Response } from 'express';
import { SignJWT } from 'jose';
import User from '../models/user.js';
import ForgotPassMapping from '../models/forgotPassMapping.js';
import { transporterCommon } from '../utils/email.js';
import UnverifiedUser from '../models/unverifieduser.js';
import Affiliate from '../models/affiliate.js';

dotenv.config();

export const forgotPass = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = await req.body;

    if (!email) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000)

    const userForgot = await ForgotPassMapping.findOne({ email });

    if (userForgot) {
      userForgot.code = code
      userForgot.save()
    } else {
      const forgotUser = new ForgotPassMapping({ email: user.email, code: code })
      forgotUser.save()
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Verify Your Account',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 40px 0; background-color: #f4f4f4;">
          <div style="max-width: 480px; margin: auto; background: white; padding: 40px 30px; border-radius: 20px;">

              <!-- Branding -->
              <div style="text-align: center; margin-bottom: 30px;">
                <img src="https://www.firstoxstudio.com/images/firstox-logo.png" alt="Logo" width="120" height="36" style="vertical-align: middle; display: inline-block;" />
              </div>

              <!-- Title -->
              <h2 style="font-size: 24px; font-weight: bold; color: #000; margin-bottom: 10px;">Reset Your Password</h2>

              <!-- Message -->
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                  We received a request to reset your password. Use the verification code below to proceed.
              </p>

              <!-- Code Box -->
              <div
                  style="font-size: 28px; font-weight: bold; color: #000; background-color: #f0f0f0; padding: 12px 24px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
                  ${code}
              </div>

              <!-- Expiry Note -->
              <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
                  If you did not request a password reset, you can safely ignore this
                  email.
              </p>

              <!-- Signature -->
              <p style="font-size: 14px; color: #666;">
                  Thanks <span style="font-size: 16px;">🤗</span>,<br>
                  FirstOx Studio team
              </p>
          </div>
        </div>
      `
    };

    await transporterCommon.sendMail(mailOptions);

    res.status(200).json({ message: 'Verification Code sent' });
    return;
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal Server Error' });
    return;
  }
};



export const forgotPassReset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = await req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and code are required' });
      return;
    }

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword

    user.save()

    res.status(200).json({ message: 'Password successfully updated' });
    return;

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal Server Error' });
    return;
  }
};



export const forgotPassVerify = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code } = await req.body;

    if (!email || !code) {
      res.status(400).json({ error: 'Email and code are required' });
      return;
    }

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const userForgot = await ForgotPassMapping.findOne({ email });

    if (!userForgot) {
      res.status(500).json({ error: 'user not found' });
      return;
    }

    if (userForgot.code == parseInt(code)) {
      userForgot.deleteOne()
      res.status(200).json({ message: 'Verification Code sent' });
      return;
    }

    res.status(400).json({ error: 'Verification Code not matched' });
    return;
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal Server Error' });
    return;
  }
};



export const signin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = await req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const JWT_SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);

    // Generate JWT token using `jose`
    const token = await new SignJWT({ userId: (user._id as { toString: () => string }).toString(), email: user.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(`${process.env.JWT_EXPIRATION}s`)
      .sign(JWT_SECRET_KEY);

    //const jwtExpiration = Number(process.env.JWT_EXPIRATION) || 3600; // fallback to 1 hour if undefined or invalid

    // res.cookie('token', token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production", // only over HTTPS in production
    //   sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    //   maxAge: jwtExpiration * 1000, // milliseconds
    // })
    res.status(200).json({ message: 'Login successful', token: token });

    return;

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal Server Error' });
    return;
  }
};



export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, affiliate } = await req.body;

    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({ error: 'Email, password, first name, and last name are required' });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ error: 'Email is already registered' });
      return;
    }

    await UnverifiedUser.findOneAndDelete({ email });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user in MongoDB
    const user = new UnverifiedUser({ email: email, hashedPassword: hashedPassword, firstName: firstName, lastName: lastName, affiliate: affiliate || null });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Account',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 40px 0; background-color: #f4f4f4;">
          <div style="max-width: 480px; margin: auto; background: white; padding: 40px 30px; border-radius: 20px;">

              <!-- Branding -->
              <div style="text-align: center; margin-bottom: 30px;">
                  <img src="https://www.firstoxstudio.com/images/firstox-logo.png" alt="Logo" width="120" height="36"
                    style="vertical-align: middle;" />
              </div>

              <!-- Title -->
              <h2 style="font-size: 24px; font-weight: bold; color: #000; margin-bottom: 10px; text-align: left;">Verify Your
                  Account</h2>

              <!-- Greeting -->
              <p style="font-size: 16px; color: #333; margin-bottom: 16px;">Hello,</p>

              <!-- Message -->
              <p style="font-size: 16px; color: #333; margin-bottom: 30px;">
                  Thank you for signing up! Please verify your account by clicking the button below.
              </p>

              <!-- Button -->
              <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.APP_URL}/api/auth/verify?email=${email}&token=${user._id}"
                      style="padding: 14px 28px; font-size: 16px; color: white; background-color: #000; text-decoration: none; border-radius: 8px; display: inline-block;">
                      Verify My Account
                  </a>
              </div>

              <!-- Note -->
              <p style="font-size: 14px; color: #666; margin-bottom: 30px;">
                  If you did not request this, you can ignore this email.
              </p>

              <!-- Footer -->
              <p style="font-size: 14px; color: #666;">
                  Thanks <span style="font-size: 16px;">🤗</span>,<br>
                  LinkPlease team
              </p>

              <!-- Copyright -->
              <p style="font-size: 12px; text-align: center; color: #999; margin-top: 40px;">
                  &copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.
              </p>
          </div>
        </div>
      `
    };

    await transporterCommon.sendMail(mailOptions);

    await user.save();

    res.status(201).json({ message: 'User registered. Check your email to verify.' });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
    return;
  }
};



export const verify = async (req: Request, res: Response): Promise<void> => {
  try {

    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    if (!email || !token) {
      res.status(400).json({ error: 'Invalid or missing parameters' });
      return;
    }

    // Find the user in unverified users collection
    const unverifiedUser = await UnverifiedUser.findOne({ _id: token, email });

    if (!unverifiedUser) {
      res.status(400).json({ error: 'Invalid or expired token' });
      return;
    }

    // Create a new user in the Users collection
    await User.create({ email: email, password: unverifiedUser.hashedPassword, firstName: unverifiedUser.firstName, lastName: unverifiedUser.lastName });

    // Remove the user from UnverifiedUsers collection
    await UnverifiedUser.deleteOne({ _id: token });

    if (unverifiedUser.affiliate) {
      // Increment the signup_refers count for the affiliate
      const affiliateUser = await Affiliate.findOne({ username: unverifiedUser.affiliate });
      if (affiliateUser) {
        affiliateUser.signup_refers += 1;
        await affiliateUser.save();
      }
    }

    return res.redirect('/success');
  } catch (error) {
    console.error('Verification Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
    return;
  }
};