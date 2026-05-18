import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import multer from 'multer';
import connectDB from './config/db.js';
import authRouter from './routes/authRoutes.js';
import employeeRouter from './routes/employeeRoutes.js';
import profileRouter from './routes/profileRoute.js';
import leaveRouter from './routes/leaveRoutes.js';
import payslipRouter from './routes/payslipRoutes.js';
import dashboardRouter from './routes/dashboardRoutes.js';
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"

const app = express()

//Middlewares
app.use(cors())
app.use(express.json())
app.use(multer().none())

// Database connection flag
let dbConnected = false;

// Middleware to connect to DB on first request (cold start - for Vercel)
app.use(async (req, res, next) => {
  if (!dbConnected) {
    try {
      await connectDB();
      console.log('MongoDB connected (via middleware)');
      dbConnected = true;
    } catch (error) {
      console.error('Error connecting to MongoDB:', error.message);
      return res.status(500).json({ 
        error: 'Database connection failed',
        message: error.message 
      });
    }
  }
  next();
});

//Routes
app.get('/', (req, res) => res.json({ message: 'Server is running' }))
app.use('/api/auth', authRouter)
app.use('/api/employees', employeeRouter)
app.use('/api/profile', profileRouter)
app.use('/api/attendance', profileRouter)
app.use('/api/leave', leaveRouter)
app.use('/api/payslip', payslipRouter)
app.use('/api/dashboard', dashboardRouter)
app.use("/api/inngest", serve({ client: inngest, functions }));

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Export app for Vercel serverless
export default app;

// START SERVER LOCALLY (for development with nodemon)
// This block runs only when NODE_ENV is NOT 'production' (i.e., locally)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4000;
  
  (async () => {
    try {
      // Connect to database
      await connectDB();
      console.log('MongoDB connected successfully');
      
      // Start listening on PORT
      app.listen(PORT, () => {
        console.log(` Server is running on http://localhost:${PORT}`);
        console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      });
    } catch (error) {
      console.error(' Failed to start server:', error.message);
      process.exit(1);
    }
  })();
}