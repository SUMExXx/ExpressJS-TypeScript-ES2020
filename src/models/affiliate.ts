import mongoose, { Document } from 'mongoose';

const { Schema, model, models } = mongoose;

interface Affiliate extends Document {
    username: string;
    password: string;
    createdAt: Date;
    total_refers: number;
    signup_refers: number;
    success_refers: number;
    refs: string[];
}

const AffiliateSchema = new Schema<Affiliate>({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    total_refers: {
        type: Number,
        default: 0
    },
    signup_refers: {
        type: Number,
        default: 0
    },
    success_refers: {
        type: Number,
        default: 0
    },
    refs: {
        type: [String],
        default: []
    }
}, { timestamps: true });

const Affiliate = models.Affiliate || model<Affiliate>('Affiliate', AffiliateSchema);

export default Affiliate;