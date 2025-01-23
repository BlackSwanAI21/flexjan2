import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import webhookRoutes from './src/api/webhooks/routes';
import compression from 'compression';
import helmet from 'helmet';
import { validateEnv } from './src/utils/validateEnv';
import rateLimit from 'express-rate-limit';

// Load environment variables based on environment
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
  dotenv.config({ path: '.env.server' });
}

const app = express();
const port = process.env.PORT || 3000;

// Enhanced CORS configuration for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') 
    : true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.use(compression());
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", process.env.SUPABASE_URL],
        // Add other CSP directives as needed
      }
    }
  }));

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });
  
  // Apply to all routes
  app.use(limiter);
}

// Before app initialization
validateEnv();

// API Routes
app.use('/api', webhookRoutes);

// Add health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Serve index.html for all other routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Enhanced error handling
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

app.listen(port, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`);
}); 