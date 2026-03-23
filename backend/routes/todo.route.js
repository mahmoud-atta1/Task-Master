const express = require('express');
const { body } = require('express-validator');
const {
  createTodo,
  getTodos,
  getTodo,
  updateTodo,
  deleteTodo,
  getStats,
  completeTodo,
} = require('../controllers/todo.controller');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

const todoValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3 })
    .withMessage('Title must be at least 3 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority'),
];

router.use(protect);

router.get('/stats/overview', getStats);

router.post('/', todoValidation, createTodo);
router.get('/', getTodos);
router.get('/:id', getTodo);
router.put('/:id', todoValidation, updateTodo);
router.delete('/:id', deleteTodo);

router.patch('/:id/complete', completeTodo);

module.exports = router;
