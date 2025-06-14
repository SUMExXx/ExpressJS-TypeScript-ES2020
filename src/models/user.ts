import { Schema, Document, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// const cartItemSchema = new mongoose.Schema({
//     id: {
//         type: String,
//     },
//     qty: {
//         type: Number,
//         min: 0,
//         max: 100
//     }
// });

// const geoCoordinateSchema = new mongoose.Schema({
//     y: {
//         type: Number
//     },
//     x: {
//         type: Number
//     }
// });

// const languagesSchema = new mongoose.Schema({
//   role: {
//     type: String,
//     enum: languages.languages,
//   }
// });

interface UserSchema extends Document {
    uuid: string;
    firstName: string | null;
    middleName: string | null;
    lastName: string | null;
    dateOfBirth: Date | null;
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

const userSchema = new Schema<UserSchema>(
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
            trim: true,
            default: null
        },
        dateOfBirth: {
            type: Date,
            default: null,
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

const User = model<UserSchema>('User', userSchema);

export default User;