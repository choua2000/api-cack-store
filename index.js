
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables early
dotenv.config();

// Validation: Ensure all required environment variables are present
const REQUIRED_ENV = [
    'DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET',
    'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET',
    'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'
];

const missingEnv = REQUIRED_ENV.filter(key => !process.env[key]);
if (missingEnv.length > 0) {
    console.error(`CRITICAL: Missing required environment variables: ${missingEnv.join(', ')}`);
    process.exit(1);
}

// Import central models (sets up all associations)
import { sequelize } from './src/models/index.js';

// Routes
import userRoutes from './src/routes/user.route.js';
import authRoutes from './src/routes/auth.route.js';
import categoryRoutes from './src/routes/category.route.js';
import productRoutes from './src/routes/product.route.js';
import orderRoutes from './src/routes/order.route.js';
import uploadRoutes from './src/routes/upload.route.js';
import paymentRoutes from './src/routes/payment.route.js';
import cartRoutes from './src/routes/cart.route.js';
import bookingRoutes from './src/routes/booking.route.js';
import { errorHandler, AppError } from './src/middlewares/error.js';


const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

// Optimization & Logging
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Webhook route needs raw body, so we mount it BEFORE express.json()
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
    // We can pass it to the actual router
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT;

async function start() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected Successfully.');

        // Mount routes
        app.use('/api/users', userRoutes);
        app.use('/api/auth', authRoutes);
        app.use('/api/categories', categoryRoutes);
        app.use('/api/products', productRoutes);
        app.use('/api/orders', orderRoutes);
        app.use('/api/upload', uploadRoutes);
        app.use('/api/payment', paymentRoutes);
        app.use('/api/cart', cartRoutes);
        app.use('/api/bookings', bookingRoutes);

        // 404 Catch-all for undefined routes
        app.use((req, res, next) => {
            next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
        });

        // Global Error Handler
        app.use(errorHandler);

        app.listen(PORT, () => {
            console.log(`Server running on port http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('DB connection failed:', err);
    }
}

start();