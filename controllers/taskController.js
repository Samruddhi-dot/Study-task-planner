// controllers/taskController.js
// =============================================
// Task Controller (FIXED VERSION)
// =============================================

const { supabaseAdmin } = require('../config/supabase');

const VALID_PRIORITIES = ['High', 'Medium', 'Low'];

/* ---------------------------
   GET TASKS
---------------------------- */
const getTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subject, completed, sortBy = 'deadline', order = 'asc' } = req.query;

    let query = supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('user_id', userId);

    if (subject) {
      query = query.ilike('subject', `%${subject}%`);
    }

    if (completed !== undefined) {
      query = query.eq('completed', completed === 'true');
    }

    const validSortFields = ['deadline', 'priority', 'created_at', 'title'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'deadline';

    query = query.order(sortField, { ascending: order !== 'desc' });

    const { data: tasks, error } = await query;

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch tasks' });
    }

    return res.json({
      success: true,
      count: tasks.length,
      tasks
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/* ---------------------------
   CREATE TASK
---------------------------- */
const createTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, subject, deadline, priority = 'Medium', notes } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title required' });
    }

    if (!VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({ success: false, message: 'Invalid priority' });
    }

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .insert([{
        user_id: userId,
        title,
        subject,
        deadline,
        priority,
        notes,
        completed: false
      }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: 'Create failed' });
    }

    return res.status(201).json({ success: true, task: data });

  } catch (err) {
    return res.status(500).json({ success: false });
  }
};

/* ---------------------------
   UPDATE TASK
---------------------------- */
const updateTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .update(req.body)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    return res.json({ success: true, task: data });

  } catch (err) {
    return res.status(500).json({ success: false });
  }
};

/* ---------------------------
   DELETE TASK
---------------------------- */
const deleteTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select();

    if (error || !data.length) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    return res.json({ success: true, message: 'Deleted' });

  } catch (err) {
    return res.status(500).json({ success: false });
  }
};

/* ---------------------------
   TOGGLE COMPLETE
---------------------------- */
const toggleComplete = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { data: task } = await supabaseAdmin
      .from('tasks')
      .select('completed')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!task) {
      return res.status(404).json({ success: false });
    }

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .update({ completed: !task.completed })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    return res.json({ success: true, task: data });

  } catch (err) {
    return res.status(500).json({ success: false });
  }
};

/* ---------------------------
   DASHBOARD
---------------------------- */
const showDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: tasks } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('user_id', userId);

    return res.render('dashboard', {
      user: {
        name: req.user?.name || "User",
        email: req.user?.email || ""
      },
      tasks: tasks || [],
      subjects: [],
      stats: {
        total: tasks?.length || 0,
        pending: tasks?.filter(t => !t.completed).length || 0,
        completed: tasks?.filter(t => t.completed).length || 0,
        overdue: 0
      }
    });

  } catch (err) {
    return res.render('dashboard', {
      user: { name: "User", email: "" },
      tasks: [],
      subjects: [],
      stats: {
        total: 0,
        pending: 0,
        completed: 0,
        overdue: 0
      }
    });
  }
};
/* ---------------------------
   EXPORTS (IMPORTANT FIX)
---------------------------- */
module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleComplete,
  showDashboard
};
