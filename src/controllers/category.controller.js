import { Category } from '../models/index.js';

// CREATE category
export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Category name is required' });
        }
        const category = await Category.create({ name, description });
        return res.status(201).json({ message: 'Category created', category });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
                 
// GET all categories
export const getAllCategories = async (_req, res) => {
    try {
        const categories = await Category.findAll();
        return res.json({ message: 'All categories', categories });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// GET category by ID
export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ error: 'Category not found' });
        return res.json(category);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// UPDATE category
export const updateCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ error: 'Category not found' });
        const { name, description } = req.body;
        await category.update({ name, description });
        return res.json({ message: 'Category updated', category });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// DELETE category
export const deleteCategory = async (req, res) => {
    try {
        const deleted = await Category.destroy({ where: { id: req.params.id } });
        if (!deleted) return res.status(404).json({ error: 'Category not found' });
        return res.json({ message: 'Category deleted' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
