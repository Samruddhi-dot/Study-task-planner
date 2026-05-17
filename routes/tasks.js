// routes/tasks.js
// =============================================
// Task Routes
// =============================================
// All routes here are protected - require login

const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { requireAuth, requireAuthPage } = require('../middleware/auth');

// --- Dashboard Page Route ---
// GET /dashboard - show the planner dashboard (HTML page)
router.get('/dashboard', requireAuthPage, taskController.showDashboard);

// --- Task API Routes ---
// All routes below require a valid JWT token

// GET /tasks - get all tasks (supports ?subject=Math&completed=false&sortBy=deadline)
router.get('/tasks', requireAuth, taskController.getTasks);

// POST /tasks - create a new task
// Body: { title, subject, deadline, priority, notes }
router.post('/tasks', requireAuth, taskController.createTask);

// PUT /tasks/:id - update all task fields
// Body: { title, subject, deadline, priority, notes, completed }
router.put('/tasks/:id', requireAuth, taskController.updateTask);

// DELETE /tasks/:id - delete a task
router.delete('/tasks/:id', requireAuth, taskController.deleteTask);

// PATCH /tasks/:id/complete - toggle task completion status
router.patch('/tasks/:id/complete', requireAuth, taskController.toggleComplete);

module.exports = router;
