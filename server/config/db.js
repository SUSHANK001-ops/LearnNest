import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () =>{
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error('MONGO_URI is not defined in environment');
        }
        // set a short serverSelectionTimeoutMS so failed attempts return quickly during development
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log('Database connected successfully');
    } catch (error) {
        console.log('Database connection failed');
        // Print concise error message to help diagnose (don't accidentally leak sensitive info)
        console.error(error && error.message ? error.message : error);
    }
}
export default connectDB;