import mongoose, { Document } from 'mongoose';

const { Schema, model, models } = mongoose;

interface Admin extends Document {
  email: string;
  password: string;
  createdAt: Date;
}

const AdminSchema = new Schema<Admin>({
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
}, { timestamps: true });

const Admin = models.Admin || model<Admin>('Admin', AdminSchema);

export default Admin;
