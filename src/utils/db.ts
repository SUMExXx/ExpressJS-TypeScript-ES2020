import mongoose from 'mongoose';
import mongo from './mongo.js';

const url = mongo.url;

const connectDB = async () => {
    if (!url) {
        throw new Error("MongoDB URL is not defined");
    }
    try {
        await mongoose.connect(url);
        console.log("MongoDB connection SUCCESS");
    }
    catch (err: unknown) {
        if (err instanceof Error) {
            console.log(err.message);
        } else {
            console.log('An unknown error occurred');
        }
    }
}

export default connectDB;