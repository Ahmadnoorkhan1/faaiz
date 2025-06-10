import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import consultantRoutes from "./routes/consultantRoutes.js";
import scheduledCallRoutes from "./routes/scheduledCallRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import microsoftAuthRoutes from './routes/microsoftAuthRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import configRoutes from './routes/configRoutes.js';
import permissionRoutes from './routes/permissionRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import scopingFormRoutes from './routes/ScopingFormRoutes.js';
import proposalRoutes from './routes/proposalRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Middleware
app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/consultants', consultantRoutes);
app.use('/api/scheduled-calls', scheduledCallRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/microsoft', microsoftAuthRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/roles', roleRoutes);  
app.use('/api/config', configRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/scoping-forms', scopingFormRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/users', userRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('GRC Application API is running');
});

// Port
const PORT = process.env.PORT || 5000;

// Start server after connecting to database
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});

