const express = require('express');
const { getTasks, createTask, getTaskById, updateTask, deleteTask, deleteCompletedTasks } = require('../controllers/taskController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.route('/').get(protect, getTasks).post(protect, createTask);
router.route('/completed').delete(protect, deleteCompletedTasks);
router.route('/:id').get(protect, getTaskById).put(protect, updateTask).delete(protect, deleteTask);

module.exports = router;
