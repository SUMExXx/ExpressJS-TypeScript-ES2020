import mongoose, { Document } from 'mongoose';

const { Schema, model, models } = mongoose;

interface TempOrder extends Document {
  email: string;
  code: string;
  paymentId: string;
  createdAt: Date;
  affiliate?: string | null;
}

const TempOrderSchema = new Schema<TempOrder>({
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    code: { 
        type: String, 
        required: true,
        unique: true,
    },
    paymentId: {
        type: String, 
        required: true,
        unique: true,
    },
    affiliate: {
        type: String,
        default: null
    }
}, { timestamps: true });

const TempOrder = models.TempOrder || model<TempOrder>('TempOrder', TempOrderSchema);

export default TempOrder;