// controllers/taskController.js
// =============================================
// Task Controller
// =============================================
// Handles all CRUD operations for study tasks.
// All routes here require authentication (see routes/tasks.js)

const { supabaseAdmin } = require('../config/supabase');

// Valid values for task fields
const VALID_PRIORITIES = ['High', 'Medium', 'Low'];

/**
 * GET /tasks
 * Get all tasks for the logged-in user
 * Supports filtering by: subject, completed status
 * Supports sorting by: deadline, priority, created_at
 */
exports.getTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subject, completed, sortBy = 'deadline', order = 'asc' } = req.query;

    // Start building the query
    let query = supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('user_id', userId); // IMPORTANT: Only get tasks belonging to this user

    // Apply optional filters
    if (subject) {
      query = query.ilike('subject', `%${subject}%`); // Case-insensitive search
    }

    if (completed !== undefined) {
      query = query.eq('completed', completed === 'true');
    }

    // Apply sorting
    const validSortFields = ['deadline', 'priority', 'created_at', 'title'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'deadline';
    query = query.order(sortField, { ascending: order !== 'desc', nullsFirst: false });

    const { data: tasks, error } = await query;

    if (error) {
      console.error('Error fetching tasks:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch tasks'
      });
    }

    // Calculate some stats for the dashboard
    const stats = {
      total: tasks.length,
      completed: tasks.filter(t => t.completed).length,
      pending: tasks.filter(t => !t.completed).length,
      highPriority: tasks.filter(t => t.priority === 'High' && !t.completed).length,
      overdue: tasks.filter(t => {
        if (!t.deadline || t.completed) return false;
        return new Date(t.deadline) < new Date();
      }).length
    };

    return res.status(200).json({
      success: true,
      count: tasks.length,
      stats,
      tasks
    });

  } catch (error) {
    console.error('Get tasks error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching tasks'
    });
  }
};

/**
 * POST /tasks
 * Create a new study task
 */
exports.createTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, subject, deadline, priority = 'Medium', notes } = req.body;

    // --- Validation ---
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required'
      });
    }

    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: `Priority must be one of: ${VALID_PRIORITIES.join(', ')}`
      });
    }

    if (deadline && isNaN(new Date(deadline).getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid deadline date format'
      });
    }

    // --- Insert into database ---
    const { data: task, error } = await supabaseAdmin
      .from('tasks')
      .insert([{
        user_id: userId,
        title: title.trim(),
        subject: subject?.trim() || null,
        deadline: deadline || null,
        priority,
        notes: notes?.trim() || null,
        completed: false
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create task'
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Task created successfully!',
      task
    });

  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating task'
    });
  }
};

/**
 * PUT /tasks/:id
 * Update all fields of a task
 */
exports.updateTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, subject, deadline, priority, notes, completed } = req.body;

    // --- Validation ---
    if (title !== undefined && title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Task title cannot be empty'
      });
    }

    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: `Priority must be one of: ${VALID_PRIORITIES.join(', ')}`
      });
    }

    // Build update object (only include provided fields)
    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (subject !== undefined) updateData.subject = subject?.trim() || null;
    if (deadline !== undefined) updateData.deadline = deadline || null;
    if (priority !== undefined) updateData.priority = priority;
    if (notes !== undefined) updateData.notes = notes?.trim() || null;
    if (completed !== undefined) updateData.completed = Boolean(completed);

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields provided to update'
      });
    }

    // --- Update in database ---
    // The .eq('user_id', userId) ensures users can only edit THEIR OWN tasks
    const { data: task, error } = await supabaseAdmin
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId) // Security: only update if it belongs to this user
      .select()
      .single();

    if (error || !task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to edit it'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully!',
      task
    });

  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating task'
    });
  }
};

/**
 * DELETE /tasks/:id
 * Delete a task permanently
 */
exports.deleteTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Delete only if the task belongs to this user
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', userId) // Security check
      .select();

    if (error) {
      console.error('Error deleting task:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete task'
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to delete it'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully!'
    });

  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting task'
    });
  }
};

/**
 * PATCH /tasks/:id/complete
 * Toggle task completion status
 */
exports.toggleComplete = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // First, get the current state of the task
    const { data: existingTask, error: fetchError } = await supabaseAdmin
      .from('tasks')
      .select('completed')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Toggle the completed status
    const { data: task, error } = await supabaseAdmin
      .from('tasks')
      .update({ completed: !existingTask.completed })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update task status'
      });
    }

    return res.status(200).json({
      success: true,
      message: task.completed ? 'Task marked as completed! 🎉' : 'Task marked as pending',
      task
    });

  } catch (error) {
    console.error('Toggle complete error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating task'
    });
  }
};

/**
 * GET /dashboard (page route - handled separately)
 * Render the dashboard page with initial task data
 */
exports.showDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user's tasks for initial page render
    const { data: tasks } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('deadline', { ascending: true, nullsFirst: false });

    const allTasks = tasks || [];

    // Get unique subjects for the filter dropdown
    const subjects = [...new Set(allTasks.map(t => t.subject).filter(Boolean))];

    // Stats for dashboard cards
    const stats = {
      total: allTasks.length,
      completed: allTasks.filter(t => t.completed).length,
      pending: allTasks.filter(t => !t.completed).length,
      highPriority: allTasks.filter(t => t.priority === 'High' && !t.completed).length,
      overdue: allTasks.filter(t => {
        if (!t.deadline || t.completed) return false;
        return new Date(t.deadline) < new Date();
      }).length
    };

    res.render('dashboard', {
      title: 'My Study Planner',
      user: req.user,
      tasks: allTasks,
      subjects,
      stats
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.render('dashboard', {
      title: 'My Study Planner',
      user: req.user,
      tasks: [],
      subjects: [],
      stats: { total: 0, completed: 0, pending: 0, highPriority: 0, overdue: 0 }
    });
  }
};
