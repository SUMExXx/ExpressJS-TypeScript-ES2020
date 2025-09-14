import mongoose, { Document } from 'mongoose';

const { Schema, model, models } = mongoose;

interface ForgotPassMappingSchema extends Document {
  email: string;
  code: number;
}

const forgotPassMappingSchema = new Schema<ForgotPassMappingSchema>({
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    code: { 
        type: Number, 
        required: true 
    },
});

const ForgotPassMapping = models.ForgetPassMapping || model<ForgotPassMappingSchema>('ForgotPassMapping', forgotPassMappingSchema);

export default ForgotPassMapping;
