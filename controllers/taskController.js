const { supabaseAdmin } = require('../config/supabase');

/* =========================
   DASHBOARD
========================= */
const showDashboard = async (req, res) => {
  try {
    const userId = req.user?.id;

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

    return res.render('dashboard', {
      user: user || { name: "User", email: "" },
      tasks: safeTasks
    });

  } catch (err) {
    console.log(err);
    return res.render('dashboard', {
      user: { name: "User", email: "" },
      tasks: []
    });
  }
};

/* =========================
   TASK CRUD
========================= */

const getTasks = async (req, res) => {
  const userId = req.user.id;

  const { data, error } = await supabaseAdmin
    .from('tasks')
    .select('*')
    .eq('user_id', userId);

  if (error) return res.status(500).json(error);

  res.json(data);
};

const createTask = async (req, res) => {
  const userId = req.user.id;

  const { title, subject } = req.body;

  const { data, error } = await supabaseAdmin
    .from('tasks')
    .insert([{ title, subject, user_id: userId }])
    .select();

  if (error) return res.status(500).json(error);

  res.json(data);
};

const updateTask = async (req, res) => {
  const { id } = req.params;

  const { title, subject } = req.body;

  const { data, error } = await supabaseAdmin
    .from('tasks')
    .update({ title, subject })
    .eq('id', id)
    .select();

  if (error) return res.status(500).json(error);

  res.json(data);
};

const deleteTask = async (req, res) => {
  const { id } = req.params;

  const { error } = await supabaseAdmin
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json(error);

  res.json({ message: 'Task deleted' });
};

const toggleComplete = async (req, res) => {
  const { id } = req.params;

  const { data: task } = await supabaseAdmin
    .from('tasks')
    .select('completed')
    .eq('id', id)
    .single();

  const { data, error } = await supabaseAdmin
    .from('tasks')
    .update({ completed: !task.completed })
    .eq('id', id)
    .select();

  if (error) return res.status(500).json(error);

  res.json(data);
};

module.exports = {
  showDashboard,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleComplete
};
