import mongoose, { Document } from 'mongoose';

const { Schema, model, models } = mongoose;

interface User extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    plan: string;
    createdAt: Date;
}

const UserSchema = new Schema<User>({
    firstName: { 
        type: String, 
        required: true, 
        unique: true 
    },
    lastName: {
        type: String, 
        required: true, 
        unique: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    plan: { 
        type: String, 
        required: true, 
        enum: ['free', 'premium', 'enterprise'],
        default: 'free' 
    },
}, { timestamps: true });

const User = models.User || model<User>('User', UserSchema);

export default User
