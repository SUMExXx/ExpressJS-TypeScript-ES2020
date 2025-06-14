import { Schema, Document, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

interface CategorySchema extends Document {
    cid: string;
    name: string;
    desc: string;
    imageUrl: string;
    imagePublicId: string;
    subcategories: CategorySchema[] | null;
    products: string[] | null;
    contentsType: boolean; // false for categories, true for products
    url: string;
}

const categorySchema = new Schema<CategorySchema>({
    cid: {
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
    subcategories: {
        type: [],
        default: null
    },
    products: {
        type: [String],
        default: null
    },
    contentsType: {
        type: Boolean,
        required: true,
        default: false // false for categories, true for products
    },
    url: {
        type: String,
        required: true,
        trim: true,
        unique: true
    }
});

categorySchema.add({
    subcategories: {
        type: [categorySchema],
        default: null
    }
});

const Category = model<CategorySchema>('Category', categorySchema);

export default Category;