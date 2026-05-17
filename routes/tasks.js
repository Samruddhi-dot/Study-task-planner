// routes/tasks.js
// =============================================

const express = require('express');
const router = express.Router();

const taskController = require('../controllers/taskController');
const { requireAuth, requireAuthPage } = require('../middleware/auth');

// OPTIONAL debug (only after import)
console.log('Task Controller Loaded:', typeof taskController);

// Dashboard page
router.get('/dashboard', requireAuthPage, taskController.showDashboard);

// Task APIs
router.get('/tasks', requireAuth, taskController.getTasks);

router.post('/tasks', requireAuth, taskController.createTask);

router.put('/tasks/:id', requireAuth, taskController.updateTask);

router.delete('/tasks/:id', requireAuth, taskController.deleteTask);

router.patch('/tasks/:id/complete', requireAuth, taskController.toggleComplete);

module.exports = router;
