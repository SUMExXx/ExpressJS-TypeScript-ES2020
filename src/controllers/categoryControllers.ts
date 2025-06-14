import bcrypt from 'bcrypt';

import UnverifiedEmail from '../models/unverifiedEmail.js';
// import { v2 as cloudinary } from 'cloudinary';
import jwt from 'jsonwebtoken';
// import nodemailer from 'nodemailer';
// import transporter from '../utils/email.js';
import User from '../models/user.js';
import dotenv from 'dotenv';
import type { Request, Response } from 'express';
import cloudinary from '../utils/cloudinary.js';
import Category from '../models/category.js';

dotenv.config();

export const getCategories = async (_:Request, res: Response): Promise<void> => {
    try {
        const categories = await Category.find().select('cid name desc imageUrl url');;
        res.status(200).json(categories);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: String(error) });
        }
    }
}

export const createCategory = async (req: Request, res: Response): Promise<void> => {

  const {name, desc, url} = req.body;

  if (!name || !desc || !url) {
    res.status(400).send({ message: 'Name, description, and URL are required' });
    return;
  }

  var imgPublicId: string;

  try {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'sencoline/categories',
        resource_type: 'image',
      },
      async (error, result) => {
        if (error) {
          return res.status(500).send('Error uploading image to Cloudinary');
        }

        if (!result || !result.public_id) {
          return res.status(500).send('Error uploading image to Cloudinary');
        }

        imgPublicId = result.public_id

        const optimizedUrl = cloudinary.url(imgPublicId, {
            fetch_format: 'auto',
            quality: 'auto'
        });
        
        const category = new Category({
          name: name,
          desc: desc,
          url: url,
          imageUrl: optimizedUrl,
          imagePublicId: imgPublicId
        })

        try{
          await category.save().then((c) => {

            res.send({message: `Category with name: ${c.name} has been created`});

          });
        }
        catch(err){
            if (err instanceof Error) {
              res.status(400).send(err.message);
            } else {
              res.status(400).send(String(err));
            }
        }

      }
    );

    if (!req.file || !req.file.buffer) {
      res.status(400).send({ message: 'No file uploaded' });
      return ;
    }

    uploadStream.end(req.file.buffer);
    
  } catch (error) {
    res.status(500).send({message: error});
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