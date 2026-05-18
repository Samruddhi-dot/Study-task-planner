const { supabaseAdmin } = require('../config/supabase');

/* =========================
   DASHBOARD (FIXED)
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
      stats,
      subjects
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

module.exports = {
  showDashboard
};
