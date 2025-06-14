import { countries } from '../data/countries.js';
import { Schema, Document, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

interface ContactEmailSchema extends Document {
    uuid: string;
    fullName: string;
    companyName: string;
    phone: string;
    email: string;
    detail: string;
    country: string;
}

const contactEmailSchema = new Schema<ContactEmailSchema>(
    {
        uuid: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            immutable: true,
            default: uuidv4
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            immutable: true,
        },
        companyName: {
            type: String,
            required: true,
            trim: true,
            immutable: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
            immutable: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            required: true
        },
        detail: {
            type: String,
            trim: true,
            immutable: true
        },
        country: {
            type: String,
            trim: true,
            required: true,
            enum: countries
        }
    } 
);

const ContactEmail = model<ContactEmailSchema>('ContactEmail', contactEmailSchema);

export default ContactEmail;