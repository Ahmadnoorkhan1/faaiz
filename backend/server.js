import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { errorHandler } from "./src/middleware/error.js";

// Import routes
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import clientRoutes from "./src/routes/clientRoutes.js";
import consultantRoutes from "./src/routes/consultantRoutes.js";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/consultants', consultantRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('GRC Application API is running');
});

// Error handling middleware
app.use(errorHandler);

// Port
const PORT = process.env.PORT || 5000;

// Start server after connecting to database
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});

