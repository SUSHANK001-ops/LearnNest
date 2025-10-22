import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () =>{
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error('MONGO_URI is not defined in environment');
        }
        await mongoose.connect(uri);
        console.log('Database connected successfully');
    } catch (error) {
        console.log('Database connection failed');
        console.error(error);
    }
}
export default connectDB;