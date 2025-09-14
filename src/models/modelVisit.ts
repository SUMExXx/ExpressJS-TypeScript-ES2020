import mongoose, { Document } from 'mongoose';

const { Schema, model, models } = mongoose;

interface ModelVisitSchema extends Document {
  visitTime: Date;
  objectModel: string;
  userId?: string;
  ipAddress?: string;
}

const modelVisitSchema = new Schema<ModelVisitSchema>(
  {
    visitTime: { type: Date, required: true, default: Date.now },
    objectModel: { type: String, required: true },
    userId: { type: String },
    ipAddress: { type: String }
  }
);

const ModelVisit = models.ModelVisit || model<ModelVisitSchema>('ModelVisit', modelVisitSchema);

export default ModelVisit;