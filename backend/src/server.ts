import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Import routes
import { router as healthRouter } from './routes/health';
import { router as productRouter } from './routes/products';
import { router as authRouter } from './routes/auth';
import { router as cartRouter } from './routes/cart';
import { router as whatsappRouter } from './routes/whatsapp';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { authenticate } from './middleware/auth';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Basic health check route
app.get('/', (req, res) => {
  res.json({
    message: 'AFORSEV E-commerce API',
    version: '1.0.0',
    status: 'running'
  });
});

// API Routes
app.use('/api/health', healthRouter);
app.use('/api/products', productRouter);
app.use('/api/auth', authRouter);
app.use('/api/cart', cartRouter);
app.use('/webhook', whatsappRouter); // WhatsApp webhook endpoint

// Error handling middleware (must be after all routes)
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;