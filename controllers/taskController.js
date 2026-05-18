const { supabaseAdmin } = require('../config/supabase');

/* =========================
   GET TASKS
========================= */
const getTasks = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   CREATE TASK
========================= */
const createTask = async (req, res) => {
  try {
    const userId = req.user.id;

    const { title, subject } = req.body;

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .insert([{ title, subject, user_id: userId }])
      .select();

    if (error) throw error;

    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   UPDATE TASK
========================= */
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const { title, subject } = req.body;

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .update({ title, subject })
      .eq('id', id)
      .select();

    if (error) throw error;

    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   DELETE TASK
========================= */
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   TOGGLE COMPLETE
========================= */
const toggleComplete = async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .update({ completed })
      .eq('id', id)
      .select();

    if (error) throw error;

    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   DASHBOARD (your original)
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

    const subjects = [...new Set(safeTasks.map(t => t.subject).filter(Boolean))];

    return res.render('dashboard', {
      user: user || { name: "User", email: "" },
      tasks: safeTasks,
      stats,
      subjects
    });

  } catch (err) {
    return res.render('dashboard', {
      user: { name: "User", email: "" },
      tasks: [],
      stats: { total: 0, pending: 0, completed: 0, overdue: 0 },
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
