import bcrypt from 'bcrypt';

import UnverifiedEmail from '../models/unverifiedEmail.js';
// import { v2 as cloudinary } from 'cloudinary';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { transporterContactUs } from '../utils/email.js';
import User from '../models/user.js';
import dotenv from 'dotenv';
import type { Request, Response } from 'express';

dotenv.config();

export const userRegister = async (req: Request, res: Response): Promise<void> => {

  const email = req.body.email;
  const password = req.body.password;

  await UnverifiedEmail.findOneAndDelete({email: email})

  const hashedPassword = await bcrypt.hash(password, 10);

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const unverifiedEmail = new UnverifiedEmail(
    {
      email: email,
      password: hashedPassword,
      otp: otp
    }
  )

  try{
    await unverifiedEmail.save().then(() => {

      res.send({message: `Verify Email`});

      const mailOptions = {
        from: `Work Up <${process.env.EMAIL_USER}>`, // Sender address
        to: `${email}`, // List of receivers
        subject: 'Work Up email verification', // Subject line
        text: `Your OTP for verification is ${otp}`, // Plain text body
        html: `<div style="max-width: 400px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); text-align: center; background-color: #f9f9f9;"><h2 style="margin-bottom: 20px; font-size: 24px; color: #333;">OTP Verification</h2><p style="font-size: 18px; margin-bottom: 20px;">Your OTP for verification is <strong style="font-size: 36px; font-weight: bold; color: #28a745;">${otp}</strong></p></div>`// HTML body
      };

      transporterContactUs.sendMail(mailOptions, (error: Error | null, info) => {
        if (error) {
          return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      });
    });
  }
  catch(err){
      if (err instanceof Error) {
        res.status(400).send(err.message);
      } else {
        res.status(400).send(String(err));
      }
  }
};

export const userVerify  = async (req: Request, res: Response): Promise<void> => {

  const email = req.body.email;
  const otp = req.body.otp;
  
  try{
    const uvemail = await UnverifiedEmail.findOne({email: email})
      
    if(!uvemail){
      res.status(400).json({message: "Email not found", code: "EmailNotFound"});
      return;
    }

    if(uvemail.otp == otp){
        
      const customer = new User(
        {
          email: uvemail.email,
          password: uvemail.password,
        }
      )
      
      try{
        await customer.save().then(async () => {
          
          try{
            await UnverifiedEmail.deleteOne({ _id: uvemail._id }).then(() => {
              res.status(200).send({message: "Verification successful"});
            });
            
          } catch (err) {
            if (err instanceof Error) {
              if (err instanceof Error) {
                res.status(400).json({message: err.message});
              } else {
                res.status(400).json({message: String(err)});
              }
            } else {
              res.status(400).json({message: String(err)});
            }
          }
        });
      } catch (err){
        if (err instanceof Error) {
          res.status(400).json({message: err.message});
        } else {
          res.status(400).json({message: String(err)});
        }
      }
    } else {
      res.status(400).send({message: "Verification unsuccessful"});
    }
  } catch(err){
      if (err instanceof Error) {
        res.json({message: err.message});
      } else {
        res.json({message: String(err)});
      }
  }  
  
};

export const userLogin = async (req: Request, res: Response): Promise<void> => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required', code: 'MissingFields' });
    return;
  }

  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    res.status(500).json({ message: 'JWT secret is not defined', code: 'ServerError' });
    return;
  }

  try {
    const customer = await User.findOne({ email: email }) as (typeof User.prototype) | null;
    if (!customer) {
      res.status(400).json({ message: 'Invalid Email', code: 'InvalidEmail' });
      return;
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid Password', code: 'InvalidCode' });
      return;
    }
    
    const token = jwt.sign({ userId: customer._id }, JWT_SECRET, { expiresIn: '30d' });

    res.json({ token, code: "Success" });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error, code: "Error" });
  }
};

export const userVerifyToken = async (req: Request, res: Response): Promise<void> => {
  const email = req.body.email;
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    res.status(500).json({ message: 'JWT secret is not defined', code: 'ServerError' });
    return;
  }

  if (!token) {
    res.status(401).json({ message: 'Token is required', code: 'MissingToken' });
    return;
  }

  try {
    const customer = await User.findOne({ email: email }) as (typeof User.prototype) | null;
    if (!customer) {
      res.status(400).json({ message: 'Invalid Email', code: 'InvalidEmail' });
      return;
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: "Unverified", code: "unverified" });

      // Check if user is JwtPayload and has userId
      if (!user || typeof user !== 'object' || !('userId' in user)) {
        return res.status(403).json({ message: 'Invalid token', code: 'InvalidToken' });
      }

      if (customer._id.toString() === (user as jwt.JwtPayload).userId) {
        res.status(200).send({message: "Verified", code: "verified"});
      } else {
        return res.status(403).json({ message: 'Invalid token', code: 'InvalidToken' });
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error, code: "Error" });
  }
};