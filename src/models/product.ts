import { Schema, Document, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ProductSchema extends Document {
    pid: string;
    name: string;
    price: number;
    desc: string;
    imageUrl: string;
    imagePublicId: string;
}

const productSchema = new Schema<ProductSchema>({
    pid: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        immutable: true,
        default: uuidv4
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    desc: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        trim: true
    },
    imageUrl: {
        type: String,
        required: true,
        trim: true
    },
    imagePublicId: {
        type: String,
        required: true,
        trim: true
    },
});

const Product = model<ProductSchema>('Product', productSchema);

export default Product;