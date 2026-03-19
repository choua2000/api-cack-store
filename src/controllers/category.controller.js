import { Category } from '../models/index.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../middlewares/error.js';

// CREATE category
export const createCategory = catchAsync(async (req, res, next) => {
    const { name, description } = req.body;
    if (!name) {
        return next(new AppError('Category name is required', 400));
    }
    const category = await Category.create({ name, description });
    return res.status(201).json({ success: true, message: 'Category created', category });
});

// GET all categories
export const getAllCategories = catchAsync(async (_req, res, next) => {
    const categories = await Category.findAll();
    return res.json({ success: true, message: 'All categories', data: categories });
});

// GET category by ID
export const getCategoryById = catchAsync(async (req, res, next) => {
    const category = await Category.findByPk(req.params.id);
    if (!category) return next(new AppError('Category not found', 404));
    return res.json({ success: true, data: category });
});

// UPDATE category
export const updateCategory = catchAsync(async (req, res, next) => {
    const category = await Category.findByPk(req.params.id);
    if (!category) return next(new AppError('Category not found', 404));
    const { name, description } = req.body;
    await category.update({ name, description });
    return res.json({ success: true, message: 'Category updated', category });
});

// DELETE category
export const deleteCategory = catchAsync(async (req, res, next) => {
    const deleted = await Category.destroy({ where: { id: req.params.id } });
    if (!deleted) return next(new AppError('Category not found', 404));
    return res.json({ success: true, message: 'Category deleted' });
});
