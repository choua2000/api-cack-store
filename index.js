import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
// Import central models (sets up all associations)
import { sequelize } from './src/models/index.js';

// Routes
import userRoutes from './src/routes/user.route.js';
import authRoutes from './src/routes/auth.route.js';
import categoryRoutes from './src/routes/category.route.js';
import productRoutes from './src/routes/product.route.js';
import orderRoutes from './src/routes/order.route.js';
import uploadRoutes from './src/routes/upload.route.js';

dotenv.config();

const app = express();
app.use(cors());
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

        app.listen(PORT, () => {
            console.log(`Server running on port http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('DB connection failed:', err);
    }
}

start();