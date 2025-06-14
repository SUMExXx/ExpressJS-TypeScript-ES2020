import { Schema, Document, model } from 'mongoose';

interface CategoryUrlSchema extends Document {
    url: string;
}

const categorySchema = new Schema<CategoryUrlSchema>({
    url: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        immutable: true
    }
});

const Category = model<CategoryUrlSchema>('Category', categorySchema);

export default Category;