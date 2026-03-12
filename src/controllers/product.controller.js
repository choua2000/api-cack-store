import { Product, Category } from '../models/index.js';
import cloudinary from '../configs/cloudinary.js';

// Helper: upload file buffer to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'api-basic/products' },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        stream.end(fileBuffer);
    });
};

// CREATE product
export const createProduct = async (req, res) => {
    try {
        const { name, description, price, cost_price, stock_qty, category_id } = req.body;
        if (!name || !price || !category_id) {
            return res.status(400).json({ message: 'name, price, and category_id are required' });
        }
        // Verify category exists
        const category = await Category.findByPk(category_id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
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
        });
        return res.status(201).json({ message: 'Product created', product });
    } catch (err) {
        console.log("Error: ", err);
        return res.status(500).json({ error: err.message });
    }
};

// GET all products (with category)
export const getAllProducts = async (_req, res) => {
    try {
        const products = await Product.findAll({
            include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }]
        });
        return res.json({ message: 'All products', products });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// GET product by ID
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }]
        });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        return res.json(product);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// UPDATE product
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        const { name, description, price, cost_price, stock_qty, category_id, status } = req.body;

        // Upload new image to Cloudinary if file is attached
        let image_url = product.image_url;
        if (req.file) {
            // Delete old image from Cloudinary if it exists
            if (product.image_url) {
                const publicId = product.image_url.split('/').slice(-3).join('/').split('.')[0];
                await cloudinary.uploader.destroy(publicId).catch(() => { });
            }
            const result = await uploadToCloudinary(req.file.buffer);
            image_url = result.secure_url;
        }

        await product.update({
            name, description, price, cost_price, stock_qty,
            category_id, image_url, status
        });
        return res.json({ message: 'Product updated', product });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// DELETE product
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        const imageUrl = product.image_url;
        await product.destroy();

        if (imageUrl) {
            // Extracts the last 3 parts: 'api-basic', 'products', 'filename.ext'
            // resulting in 'api-basic/products/filename'
            const publicId = imageUrl.split('/').slice(-3).join('/').split('.')[0];
            await cloudinary.uploader.destroy(publicId).catch(() => { });
        }

        return res.json({ message: 'Product deleted Successfully' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
