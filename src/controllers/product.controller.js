import { Product, Category, sequelize } from '../models/index.js';
import { Op } from 'sequelize';
import cloudinary from '../configs/cloudinary.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../middlewares/error.js';

// Helper: upload file buffer to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'products' },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        stream.end(fileBuffer);
    });
};

// CREATE product
export const createProduct = catchAsync(async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const { name, description, price, cost_price, stock_qty, category_id } = req.body;
        if (!name || !price || !category_id) {
            await transaction.rollback();
            return next(new AppError('name, price, and category_id are required', 400));
        }
        // Verify category exists
        const category = await Category.findByPk(category_id);
        if (!category) {
            await transaction.rollback();
            return next(new AppError('Category not found', 404));
        }

        // Upload image to Cloudinary if file is attached
        let image_url = null;
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            image_url = result.secure_url;
        }

        const product = await Product.create({
            name, description, price, cost_price, stock_qty,
            category_id, image_url
        }, { transaction: transaction });

        await transaction.commit();
        return res.status(201).json({ success: true, message: 'Product created', product });
    } catch (err) {
        await transaction.rollback();
        next(err);
    }
});

// GET all products (with category)
export const getAllProducts = catchAsync(async (_req, res, next) => {
    const limit = Math.max(1, Number(_req.query.limit) || 20);
    const offset = Math.max(0, Number(_req.query.offset) || 0);
    const products = await Product.findAll({
        include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
        limit,
        offset
    });
    return res.json({ success: true, message: 'All products', count: products.length, limit, offset, data: products });
});

// GET product by ID
export const getProductById = catchAsync(async (req, res, next) => {
    const product = await Product.findByPk(req.params.id, {
        include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }]
    });
    if (!product) return next(new AppError('Product not found', 404));
    return res.json({ success: true, data: product });
});

// UPDATE product
export const updateProduct = catchAsync(async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            await transaction.rollback();
            return next(new AppError('Product not found', 404));
        }

        const { name, description, price, cost_price, stock_qty, category_id, status } = req.body;

        // Upload new image to Cloudinary if file is attached
        let image_url = product.image_url;
        if (req.file) {
            // Delete old image from Cloudinary if it exists
            if (product.image_url) {
                const parts = product.image_url.split('/');
                const lastParts = parts.slice(-3);
                const filePath = lastParts.join('/');
                const publicId = filePath.split('.')[0];
                await cloudinary.uploader.destroy(publicId).catch(() => { });
            }
            const result = await uploadToCloudinary(req.file.buffer);
            image_url = result.secure_url;
        }
        await product.update({
            name, description, price, cost_price, stock_qty,
            category_id, image_url, status
        }, { transaction: transaction });
        await transaction.commit();
        return res.json({ success: true, message: 'Product updated', product });
    } catch (err) {
        await transaction.rollback();
        next(err);
    }
});

// DELETE product
export const deleteProduct = catchAsync(async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            await transaction.rollback();
            return next(new AppError('Product not found', 404));
        }

        const imageUrl = product.image_url;
        await product.destroy({ transaction });

        if (imageUrl) {
            const publicId = imageUrl.split('/').slice(-3).join('/').split('.')[0];
            await cloudinary.uploader.destroy(publicId).catch(() => { });
        }
        await transaction.commit();
        return res.json({ success: true, message: 'Product deleted Successfully' });
    } catch (err) {
        await transaction.rollback();
        next(err);
    }
});

// SEARCH products by name
export const searchProductsByName = catchAsync(async (req, res, next) => {
    const { name } = req.query;
    console.log("name", name);

    if (!name) {
        return next(new AppError('Search name is required', 400));
    }

    const products = await Product.findAll({
        where: {
            name: {
                [Op.like]: `%${name}%`
            }
        },
        include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }]
    });
    return res.json({
        success: true,
        count: products.length,
        data: products
    });
});
