import asyncHandler from 'express-async-handler';
import Category from '../models/categoryModel.js';

// @desc    Create a category
// @route   POST /api/users/categories
// @access  Private (teacher)
const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('Category name is required');
  }

  const exists = await Category.findOne({ name });
  if (exists) {
    res.status(400);
    throw new Error('Category already exists');
  }

  const category = await Category.create({
    name,
    description,
    createdBy: req.user ? req.user._id : null,
  });

  if (category) {
    res.status(201).json(category);
  } else {
    res.status(400);
    throw new Error('Invalid category data');
  }
});

// @desc    Get all categories
// @route   GET /api/users/categories
// @access  Private (teacher) or public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.status(200).json(categories);
});

// @desc    Delete category
// @route   DELETE /api/users/categories/:id
// @access  Private (teacher)
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  await category.deleteOne();
  res.status(200).json({ message: 'Category removed' });
});

export { createCategory, getCategories, deleteCategory };
