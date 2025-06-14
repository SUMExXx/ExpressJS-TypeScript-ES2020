import { Schema, Document, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

interface UnverifiedEmailSchema extends Document {
    uuid: string;
    email: string;
    password: string;
    otp: number;
}

const unverifiedEmailSchema = new Schema<UnverifiedEmailSchema>(
    {
        uuid: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            immutable: true,
            default: uuidv4
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            trim: true,
        },
        otp: {
            type: Number,
            trim: true,
        }
    } 
);

const UnverifiedEmail = model<UnverifiedEmailSchema>('UnverifiedEmail', unverifiedEmailSchema);

export default UnverifiedEmail;