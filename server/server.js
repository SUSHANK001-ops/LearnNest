import express from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
const app = express();
import connectDB  from "./config/db.js";
connectDB();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({ origin: true }));

app.get("/", (req, res) => {
  res.send("server is running");
});


app.get('/api/test', (req, res) => {
  res.json({ message: 'API working' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
