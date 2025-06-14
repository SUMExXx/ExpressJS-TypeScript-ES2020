import bcrypt from 'bcrypt';

// import { v2 as cloudinary } from 'cloudinary';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import type { Request, Response } from 'express';
import Admin from '../models/admin.js';
import cloudinary from '../utils/cloudinary.js';

dotenv.config();

export const adminRegister = async (req: Request, res: Response): Promise<void> => {
    
    const {
        firstName,
        middleName,
        lastName,
        email,
        password,
        phoneNumber,
        addressLine1,
        addressLine2,
        city,
        state,
        zipCode
    } = req.body;

    let imgPublicId = ""

    // Basic validation
    if (!firstName || !lastName || !email || !password) {
        res.status(400).json({ message: 'Missing required fields.' });
        return;
    }

    // Check if email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
        res.status(409).json({ message: 'Email already exists.' });
        return;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'sencoline/admins',
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
                
                const newAdmin = new Admin({
                    firstName,
                    middleName,
                    lastName,
                    email,
                    password: hashedPassword,
                    imgUrl: optimizedUrl,
                    imgPublicId: imgPublicId,
                    phoneNumber,
                    addressLine1,
                    addressLine2,
                    city,
                    state,
                    zipCode
                });
        
                try{
                    await newAdmin.save();
    
                    res.status(201).json({ message: 'Admin registered successfully.' });
                    return;
                } catch (error) {
                    console.error('Registration error:', error);
                    res.status(500).json({ message: 'Server error. Please try again later.' });
                    return;
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
}

export const adminLogin = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRATION) {
        res.status(500).json({ value: false, message: 'Server configuration error' });
        return;
    }

    // Basic validation
    if (!email || !password) {
        res.status(400).json({ value: false, message: 'Email and password are required' });
        return;
    }

    try {
        // Check if user exists in MongoDB
        const adminUser = await Admin.findOne({ email: email.trim() });

        if (!adminUser) {
            res.status(401).json({ value: false, message: 'Invalid credentials.' });
            return;
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, adminUser.password);
        if (!isMatch) {
            res.status(401).json({ value: false, message: 'Invalid credentials.' });
            return;
        }

        // Generate JWT token
        const token = jwt.sign(
            { email: adminUser.email, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '604800s' } // 7 days
        );

        res.cookie('admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.setHeader('Authorization', `Bearer ${token}`);

        res.status(200).json({ value: true, token });
        return;
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ value: false, message: 'Server error during login' });
        return;
    }
};

export const adminTokenVerify = async (req: Request, res: Response): Promise<void> => {
    const adminToken = req.body.adminToken;

    if (!process.env.JWT_SECRET) {
        res.status(500).json({ value: false, message: 'Server configuration error' });
        return;
    }

    try {
        // Decode and verify token
        const decoded = jwt.verify(adminToken, process.env.JWT_SECRET) as { email: string };

        // Check if admin exists
        const adminUser = await Admin.findOne({ email: decoded.email });

        if (!adminUser) {
            res.status(401).json({ value: false, message: 'Admin not found' });
            return;
        }

        // Everything is valid
        res.status(200).json({ value: true });
    } catch (err) {
        if (err instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ value: false, message: 'Invalid token' });
        } else if (err instanceof Error) {
            res.status(500).json({ value: false, message: err.message });
        } else {
            res.status(500).json({ value: false, message: String(err) });
        }
    }
};