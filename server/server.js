import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from 'cookie-parser';
dotenv.config();
const app = express();
import connectDB  from "./config/db.js";
import User from './Admins/models/user.js';

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({ origin: true }));
app.use(cookieParser());
import authRoutes from './Admins/Routes/auth.js';

// Mount auth routes
app.use('/api/auth', authRoutes);

app.get("/", (req, res) => {
  res.send("server is running");
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API working' });
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
      } else {
        console.log('SuperAdmin already exists.');
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
