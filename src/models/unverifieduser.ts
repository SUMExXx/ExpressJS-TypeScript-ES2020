import mongoose, { Document } from 'mongoose';

const { Schema, model, models } = mongoose;

interface IUnverifiedUser extends Document {
  email: string;
  firstName: string;
  lastName: string;
  hashedPassword: string;
  createdAt: Date;
  affiliate?: string | null;
}

const UnverifiedUserSchema = new Schema<IUnverifiedUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  hashedPassword: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '24h', // Automatically delete after 24 hours
  },
  affiliate: {
    type: String,
    default: null
  }
});

const UnverifiedUser = models.UnverifiedUser || model<IUnverifiedUser>('UnverifiedUser', UnverifiedUserSchema);

export default UnverifiedUser;