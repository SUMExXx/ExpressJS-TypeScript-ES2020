import dotenv from 'dotenv';
import type { Request, Response } from 'express';
import Affiliate from '../models/affiliate.js';
import { jwtVerify, SignJWT } from 'jose';

dotenv.config();

export const addRef = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = await req.body;

    const referrer = body.referrer;

    if (!referrer) {
      res.status(400).json({ error: 'Username is required' });
      return;
    }

    const updatedAffiliate = await Affiliate.findOneAndUpdate(
      { username: referrer },
      { $inc: { total_refers: 1 } },
      { new: true }
    );

    if (!updatedAffiliate) {
      res.status(404).json({ error: 'Affiliate not found' });
      return;
    }

    res.json({ message: 'Total refers increased', data: updatedAffiliate });
  } catch (error) {
    console.error('Error updating total_refers:', error);
    res.status(500).json({ error: 'Internal Server Error' });
    return;
  }
};



export const checkValidity = async (req: Request, res: Response): Promise<void> => {

  const { username, affiliateToken } = req.body;

  try {

    const token = affiliateToken;

    if (!token) {
      res.status(400).json({ error: 'Invalid or missing token' });
      return;
    }

    // Find the user in unverified users collection
    const affiliate = await Affiliate.findOne({ username });

    if (!affiliate) {
      res.status(400).json({ error: 'Affiliate not found' });
      return;
    }

    if (process.env.JWT_SECRET) {
      const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);
      
      const { payload } = await jwtVerify(token, SECRET_KEY);
      
      const verified = payload.username === username;
      console.log(username)
      if (verified) {
        res.status(200).json({ success: 'Verified' });
        return;
      }
    }

    res.status(400).json({ error: 'Problem' });
    return;
  } catch (error) {
    console.error('Verification Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
    return;
  }
};



export const getData = async (req: Request, res: Response): Promise<void> => {

  const { username } = await req.body;

  try {

    const affiliate = await Affiliate.findOne({ username: username }).select("total_refers success_refers signup_refers");

    if (!affiliate) {
      res.status(400).json({ error: 'Invalid' });
      return;
    }

    res.json(affiliate);
    return;
  } catch (error) {
    console.error('Verification Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
    return;
  }
};



export const signin = async (req: Request, res: Response): Promise<void> => {

  const JWT_SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);

  try {
    const { username, password } = await req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    // Check if admin exists
    const affiliate = await Affiliate.findOne({ username });
    if (!affiliate) {
      res.status(401).json({ error: 'Invalid affiliate credentials' });
      return;
    }

    // Compare passwords
    // const isMatch = await bcrypt.compare(password, admin.password);
    const isMatch = password == affiliate.password
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid affiliate credentials' });
      return;
    }

    // Generate JWT token using `jose`
    const token = await new SignJWT({ adminId: (affiliate._id as { toString: () => string }).toString(), username: affiliate.username })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(`${process.env.JWT_EXPIRATION}s`)
      .sign(JWT_SECRET_KEY);

    //const jwtExpiration = Number(process.env.JWT_EXPIRATION) || 3600; // default to 1 hour if undefined

    // res.cookie('affiliate_token', token, {
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV === "production", // only over HTTPS in production
    //     sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    //     maxAge: jwtExpiration * 1000, // in milliseconds
    //   })
    res.status(200).json({ message: 'Admin login successful', affiliateToken: token });

    return;

  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).json({ error: 'Internal Server Error' });
    return;
  }
};