import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log('Database connected successfully via Prisma');
    } catch (error) {
        console.log('Database connection failed');
        console.error(error && error.message ? error.message : error);
    }
};

export { prisma };
export default connectDB;