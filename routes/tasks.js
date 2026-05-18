const express = require('express');
const router = express.Router();

const taskController = require('../controllers/taskController');
const { requireAuth } = require('../middleware/auth');

console.log('Task Controller Loaded:', typeof taskController);

// ======================
// TASK API ROUTES ONLY
// ======================
router.get('/tasks', requireAuth, taskController.getTasks);

router.post('/tasks', requireAuth, taskController.createTask);

router.put('/tasks/:id', requireAuth, taskController.updateTask);

router.delete('/tasks/:id', requireAuth, taskController.deleteTask);

router.patch('/tasks/:id/complete', requireAuth, taskController.toggleComplete);

module.exports = router;
