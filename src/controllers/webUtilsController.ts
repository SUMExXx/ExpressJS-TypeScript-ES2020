// import { v2 as cloudinary } from 'cloudinary';
import ContactEmail from '../models/contactEmail.js';
import dotenv from 'dotenv';
import type { Request, Response } from 'express';
import { transporterContactUs, transporterRequestQuote } from '../utils/email.js';
import RequestQuote from '../models/requestQuote.js';

dotenv.config();

export const contactEmail = async (req: Request, res: Response): Promise<void> => {

    const { fullName, companyName, phone, email, detail, country} = req.body;

    const contactEmail = new ContactEmail(
        {
            fullName: fullName,
            companyName: companyName,
            phone: phone,
            email: email,
            detail: detail,
            country: country
        }
    )

    try{
        const savedContactEmail = await contactEmail.save()

        if(!savedContactEmail){
            res.status(500).json({"message": "Save failed"})
            return;
        }

        // Early Exit
        res.status(201).json({message: "Message sent"})
        return;

        const mailOptions = {
            from: `Sencoline <${process.env.EMAIL_CONTACT_US}>`, // Sender address
            to: `${process.env.RECEIVER_EMAIL}`, // List of receivers
            subject: `${fullName} from ${companyName}`, // Subject line
            text: `${detail}\n ${fullName}\n${companyName}\n${phone}\n${email}\n${country}`, // Plain text body
            html: `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Email Template</title><style>body{font-family:Arial,sans-serif;line-height:1.6;background-color:#f9f9f9;padding:20px}.email-container{background-color:#ffffff;padding:20px;border-radius:8px;max-width:600px;margin:0 auto;box-shadow:0 2px 5px rgba(0,0,0,0.1)}.email-header{font-size:20px;font-weight:bold;color:#333333;margin-bottom:20px}.email-detail{margin-bottom:10px}.label{font-weight:bold;color:#555555}</style></head><body><div class="email-container"><div class="email-header">New Inquiry Details</div><div class="email-detail"><span class="label">Detail:</span> ${detail}</div><div class="email-detail"><span class="label">Full Name:</span> ${fullName}</div><div class="email-detail"><span class="label">Company:</span> ${companyName}</div><div class="email-detail"><span class="label">Phone:</span> ${phone}</div><div class="email-detail"><span class="label">Email:</span> ${email}</div><div class="email-detail"><span class="label">Country:</span> ${country}</div></div></body></html>`// HTML body
        };

        transporterContactUs.sendMail(mailOptions, (error: Error | null) => {
            if (error) {
                return console.log(error);
            }
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

export const requestQuote = async (req: Request, res: Response): Promise<void> => {

    const { fullName, companyName, phone, email, detail, note} = req.body;

    const requestQuote = new RequestQuote(
        {
            fullName: fullName,
            companyName: companyName,
            phone: phone,
            email: email,
            detail: detail,
            note: note
        }
    )

    try{
        const savedRequestQuote = await requestQuote.save()

        if(!savedRequestQuote){
            res.status(500).json({"message": "Save failed"})
            return;
        }

        // Early Exit
        res.status(201).json({message: "Message sent"})
        return;

        const mailOptions = {
            from: `Sencoline <${process.env.EMAIL_CONTACT_US}>`, // Sender address
            to: `${process.env.RECEIVER_EMAIL}`, // List of receivers
            subject: `${fullName} from ${companyName}`, // Subject line
            text: `${detail}\n${note}\n${fullName}\n${companyName}\n${phone}\n${email}\n`, // Plain text body
            html: `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Email Template</title><style>body{font-family:Arial,sans-serif;line-height:1.6;background-color:#f9f9f9;padding:20px}.email-container{background-color:#ffffff;padding:20px;border-radius:8px;max-width:600px;margin:0 auto;box-shadow:0 2px 5px rgba(0,0,0,0.1)}.email-header{font-size:20px;font-weight:bold;color:#333333;margin-bottom:20px}.email-detail{margin-bottom:10px}.label{font-weight:bold;color:#555555}</style></head><body><div class="email-container"><div class="email-header">New Inquiry Details</div><div class="email-detail"><span class="label">Detail:</span> ${detail}</div><div class="email-detail"><span class="label">Full Name:</span> ${fullName}</div><div class="email-detail"><span class="label">Company:</span> ${companyName}</div><div class="email-detail"><span class="label">Phone:</span> ${phone}</div><div class="email-detail"><span class="label">Email:</span> ${email}</div></div></body></html>`// HTML body
        };

        transporterRequestQuote.sendMail(mailOptions, (error: Error | null) => {
            if (error) {
                return console.log(error);
            }
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