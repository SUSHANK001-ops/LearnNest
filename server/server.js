import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';

dotenv.config();
const app = express();
import connectDB  from "./config/db.js";
import User from './Admins/models/user.js';

const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Security Middleware
// Set security HTTP headers
app.use(helmet());

// Rate limiting - prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use('/api/', limiter);

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login/signup requests per 15 minutes
  message: 'Too many authentication attempts, please try again after 15 minutes.',
  skipSuccessfulRequests: true, // Don't count successful requests
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Cookie parser
app.use(cookieParser());

// CORS configuration
const corsOptions = {
  origin: isProduction 
    ? process.env.CLIENT_URL || 'https://yourdomain.com' 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

import authRoutes from './Admins/Routes/auth.js';
import institutionRoutes from './routes/institutionRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';

// Mount auth routes
app.use('/api/auth', authRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);

app.get("/", (req, res) => {
  res.json({ 
    message: "LearnNest LMS API", 
    version: "1.0.0",
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API working' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = isProduction && statusCode === 500 
    ? 'Internal server error' 
    : err.message || 'Something went wrong';
  
  res.status(statusCode).json({
    success: false,
    message,
    ...((!isProduction) && { stack: err.stack })
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server after DB connection and ensure a SuperAdmin exists
(async () => {
  try {
    await connectDB();

    // Ensure initial superadmin exists (use env vars)
    const superEmail = process.env.SUPERADMIN_EMAIL;
    const superPassword = process.env.SUPERADMIN_PASSWORD;
    if (superEmail && superPassword) {
      const existing = await User.findOne({ role: 'superadmin' });
      if (!existing) {
        const defaultSuper = new User({
          fullname: { firstname: 'Super', lastname: 'Admin' },
          username: 'superadmin',
          email: superEmail,
          password: superPassword,
          role: 'superadmin',
        });
        await defaultSuper.save();
        console.log('Default SuperAdmin created:', superEmail);
      } 
    } else {
      console.log('SUPERADMIN_EMAIL or SUPERADMIN_PASSWORD not set; skipping default SuperAdmin creation.');
    }

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
