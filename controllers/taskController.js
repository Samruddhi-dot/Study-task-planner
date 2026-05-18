const { supabaseAdmin } = require('../config/supabase');

const VALID_PRIORITIES = ['High', 'Medium', 'Low'];

/* =========================
   GET TASKS
========================= */
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
      count: tasks?.length || 0,
      tasks: tasks || []
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/* =========================
   CREATE TASK
========================= */
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
      .insert([
        {
          user_id: userId,
          title,
          subject,
          deadline,
          priority,
          notes,
          completed: false
        }
      ])
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

/* =========================
   UPDATE TASK
========================= */
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

/* =========================
   DELETE TASK
========================= */
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

    if (error || !data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    return res.json({ success: true, message: 'Deleted' });

  } catch (err) {
    return res.status(500).json({ success: false });
  }
};

/* =========================
   TOGGLE COMPLETE
========================= */
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

    if (error) {
      return res.status(500).json({ success: false });
    }

    return res.json({ success: true, task: data });

  } catch (err) {
    return res.status(500).json({ success: false });
  }
};

/* =========================
   DASHBOARD (FIXED ROOT CAUSE)
========================= */
const showDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, name, email')
      .eq('id', userId)
      .single();

    const { data: tasks } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('user_id', userId);

    const safeTasks = tasks || [];

    const stats = {
      total: safeTasks.length,
      pending: safeTasks.filter(t => !t.completed).length,
      completed: safeTasks.filter(t => t.completed).length,
      overdue: 0
    };

    const subjects = [...new Set(
      safeTasks.map(t => t.subject).filter(Boolean)
    )];

    return res.render('dashboard', {
      user: user || { name: "User", email: "" },
      tasks: safeTasks,
      stats,        // ✅ ALWAYS SENT
      subjects      // ✅ ALWAYS SENT
    });

  } catch (err) {
    console.log("Dashboard error:", err);

    return res.render('dashboard', {
      user: { name: "User", email: "" },
      tasks: [],
      stats: {
        total: 0,
        pending: 0,
        completed: 0,
        overdue: 0
      },
      subjects: []
    });
  }
};

/* =========================
   EXPORTS
========================= */
module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleComplete,
  showDashboard
};
