import { Schema, Document, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

interface AdminSchema extends Document {
    uuid: string;
    firstName: string | null;
    middleName: string | null;
    lastName: string | null;
    imgUrl: string | null;
    imgPublicId: string | null;
    email: string;
    password: string;
    phoneNumber: string | null;
    joiningDate: Date;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    state: string | null;
    zipCode: number | null;
}

const adminSchema = new Schema<AdminSchema>(
    {
        uuid: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            immutable: true,
            default: uuidv4
        },
        firstName: {
            type: String,
            maxlength: 20,
            required: true,
            trim: true,
            default: null
        },
        middleName: {
            type: String,
            maxlength: 20,
            trim: true,
            default: null
        },
        lastName: {
            type: String,
            maxlength: 20,
            required: true,
            trim: true,
            default: null
        },
        imgUrl: {
            type: String,
            trim: true,
            default: null
        },
        imgPublicId: {
            type: String,
            trim: true,
            default: null
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            required: true
        },
        password: {
            type: String,
            trim: true,
            required: true,
        },
        phoneNumber: {
            type: String,
            trim: true,
            default: null
        },
        joiningDate: {
            type: Date,
            trim: true,
            default: Date.now()
        },
        addressLine1: {
            type: String,
            trim: true,
            default: null
        },
        addressLine2: {
            type: String,
            trim: true,
            default: null
        },
        city: {
            type: String,
            trim: true,
            default: null
        },
        state: {
            type: String,
            trim: true,
            default: null
        },
        zipCode: {
            type: Number,
            trim: true,
            default: null
        }
    } 
);

// customerSchema.pre('save', async function(next) {
//   const user = this;
//   if (!user.isModified('password')) return next();
  
//   try {
//     const hashedPassword = await bcrypt.hash(user.password, 10); // 10 is the saltRounds
//     user.password = hashedPassword;
//     next();
//   } catch (error) {
//     return next(error);
//   }
// });

const Admin = model<AdminSchema>('Admin', adminSchema);

export default Admin;