import { Schema, Document, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

interface RequestQuoteSchema extends Document {
    uuid: string;
    fullName: string;
    companyName: string;
    phone: string;
    email: string;
    detail: string;
    note: string;
}

const requestQuoteSchema = new Schema<RequestQuoteSchema>(
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
        note: {
            type: String,
            trim: true,
        }
    } 
);

const RequestQuote = model<RequestQuoteSchema>('RequestQuote', requestQuoteSchema);

export default RequestQuote;