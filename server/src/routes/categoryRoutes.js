// Category Routes for CampusFix
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', categoryController.getCategories);
router.post('/', authenticate, authorize('ADMIN'), categoryController.createCategory);
router.patch('/:id', authenticate, authorize('ADMIN'), categoryController.updateCategory);
router.delete('/:id', authenticate, authorize('ADMIN'), categoryController.deleteCategory);

module.exports = router;
