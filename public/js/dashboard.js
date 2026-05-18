// public/js/dashboard.js
// =============================================
// Dashboard Frontend JavaScript
// =============================================
// Handles all task CRUD operations, filtering, 
// and UI updates without page reloads.

// ===== STATE =====
let editingTaskId = null; // Track which task is being edited

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  // Show today's date in the header
  updateDateDisplay();
  
  // Render the initial tasks from server data
  renderTasks(allTasks);
});

/** Update the date display in the header */
function updateDateDisplay() {
  const dateEl = document.getElementById('currentDate');
  if (dateEl) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = new Date().toLocaleDateString('en-US', options);
  }
}

// ===== RENDERING =====

/**
 * Render an array of tasks to the tasks list
 * @param {Array} tasks - Array of task objects
 */
function renderTasks(tasks) {
  const tasksList = document.getElementById('tasksList');
  const emptyState = document.getElementById('emptyState');
  const loadingSpinner = document.getElementById('loadingSpinner');

  // Hide loading spinner
  if (loadingSpinner) loadingSpinner.style.display = 'none';

  if (!tasks || tasks.length === 0) {
    tasksList.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';
  tasksList.innerHTML = tasks.map(task => createTaskCard(task)).join('');
}

/**
 * Create HTML for a single task card
 * @param {Object} task - Task object from the database
 */
function createTaskCard(task) {
  const isOverdue = task.deadline && !task.completed && new Date(task.deadline) < new Date();
  const deadlineText = task.deadline ? formatDate(task.deadline) : 'No deadline';
  
  return `
    <div class="task-card ${task.completed ? 'completed-card' : ''} ${isOverdue ? 'overdue-card' : ''}" 
         id="task-${task.id}">
      
      <!-- Completion checkbox -->
      <button 
        class="task-checkbox ${task.completed ? 'checked' : ''}" 
        onclick="toggleComplete('${task.id}')"
        title="${task.completed ? 'Mark as pending' : 'Mark as complete'}"
      >
        ${task.completed ? '✓' : ''}
      </button>

      <!-- Task content -->
      <div class="task-content">
        <div class="task-title">${escapeHtml(task.title)}</div>
        <div class="task-meta">
          ${task.subject ? `<span class="task-subject">📖 ${escapeHtml(task.subject)}</span>` : ''}
          <span class="task-deadline ${isOverdue ? 'overdue-text' : ''}">
            ${isOverdue ? '⚠️ Overdue: ' : '📅 '}${deadlineText}
          </span>
        </div>
        ${task.notes ? `<div class="task-notes">📝 ${escapeHtml(task.notes)}</div>` : ''}
      </div>

      <!-- Priority badge -->
      <span class="priority-badge priority-${task.priority}">${task.priority}</span>

      <!-- Action buttons -->
      <div class="task-actions">
        <button class="task-btn" onclick="editTask('${task.id}')" title="Edit task">✏️</button>
        <button class="task-btn delete-btn" onclick="deleteTask('${task.id}')" title="Delete task">🗑️</button>
      </div>
    </div>
  `;
}

// ===== MODAL MANAGEMENT =====

/** Show the modal for adding a new task */
function showAddTaskModal() {
  editingTaskId = null;
  document.getElementById('modalTitle').textContent = 'Add New Task';
  document.getElementById('taskId').value = '';
  document.getElementById('taskTitle').value = '';
  document.getElementById('taskSubject').value = '';
  document.getElementById('taskDeadline').value = '';
  document.getElementById('taskPriority').value = 'Medium';
  document.getElementById('taskNotes').value = '';
  document.getElementById('saveTaskBtn').querySelector('.btn-text').textContent = 'Save Task';
  document.getElementById('modalError').style.display = 'none';
  document.getElementById('taskModal').style.display = 'flex';
  document.getElementById('taskTitle').focus();
}

/** 
 * Show the modal pre-filled for editing an existing task
 * @param {string} taskId - ID of the task to edit
 */
function editTask(taskId) {
  const task = allTasks.find(t => t.id === taskId);
  if (!task) return;

  editingTaskId = taskId;
  document.getElementById('modalTitle').textContent = 'Edit Task';
  document.getElementById('taskId').value = taskId;
  document.getElementById('taskTitle').value = task.title;
  document.getElementById('taskSubject').value = task.subject || '';
  document.getElementById('taskDeadline').value = task.deadline ? task.deadline.split('T')[0] : '';
  document.getElementById('taskPriority').value = task.priority;
  document.getElementById('taskNotes').value = task.notes || '';
  document.getElementById('saveTaskBtn').querySelector('.btn-text').textContent = 'Update Task';
  document.getElementById('modalError').style.display = 'none';
  document.getElementById('taskModal').style.display = 'flex';
  document.getElementById('taskTitle').focus();
}

/** Close the modal */
function closeModal() {
  document.getElementById('taskModal').style.display = 'none';
  editingTaskId = null;
}

// Close modal when clicking outside
document.getElementById('taskModal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('taskModal')) closeModal();
});

// ===== FORM SUBMISSION =====

/** Handle the task form submission (create or update) */
document.getElementById('taskForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const saveBtn = document.getElementById('saveTaskBtn');
  const btnText = saveBtn.querySelector('.btn-text');
  const btnLoading = saveBtn.querySelector('.btn-loading');
  const errorDiv = document.getElementById('modalError');

  const taskData = {
    title: document.getElementById('taskTitle').value.trim(),
    subject: document.getElementById('taskSubject').value.trim(),
    deadline: document.getElementById('taskDeadline').value || null,
    priority: document.getElementById('taskPriority').value,
    notes: document.getElementById('taskNotes').value.trim()
  };

  if (!taskData.title) {
    errorDiv.textContent = '⚠️ Task title is required';
    errorDiv.style.display = 'block';
    return;
  }

  // Show loading
  btnText.style.display = 'none';
  btnLoading.style.display = 'inline';
  saveBtn.disabled = true;
  errorDiv.style.display = 'none';

  try {
    let response, data;

    if (editingTaskId) {
      // UPDATE existing task
      response = await fetch(`/tasks/${editingTaskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
    } else {
      // CREATE new task
      response = await fetch('/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
    }

    data = await response.json();

    if (data.success) {
      closeModal();
      showToast(data.message, 'success');
      await refreshTasks(); // Reload tasks from server
    } else {
      errorDiv.textContent = '⚠️ ' + data.message;
      errorDiv.style.display = 'block';
    }
  } catch (err) {
    errorDiv.textContent = '⚠️ Network error. Please try again.';
    errorDiv.style.display = 'block';
  } finally {
    btnText.style.display = 'inline';
    btnLoading.style.display = 'none';
    saveBtn.disabled = false;
  }
});

// ===== TASK ACTIONS =====

/**
 * Toggle a task's completion status
 * @param {string} taskId - Task ID to toggle
 */
async function toggleComplete(taskId) {
  try {
    const response = await fetch(`/tasks/${taskId}/complete`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();

    if (data.success) {
      showToast(data.message, 'success');
      await refreshTasks();
    } else {
      showToast(data.message, 'error');
    }
  } catch (err) {
    showToast('Failed to update task', 'error');
  }
}

/**
 * Delete a task after confirmation
 * @param {string} taskId - Task ID to delete
 */
async function deleteTask(taskId) {
  const task = allTasks.find(t => t.id === taskId);
  if (!task) return;

  if (!confirm(`Delete task "${task.title}"? This cannot be undone.`)) return;

  try {
    const response = await fetch(`/tasks/${taskId}`, {
      method: 'DELETE'
    });
    const data = await response.json();

    if (data.success) {
      showToast('Task deleted', 'success');
      await refreshTasks();
    } else {
      showToast(data.message, 'error');
    }
  } catch (err) {
    showToast('Failed to delete task', 'error');
  }
}

// ===== FILTERS =====

/** Apply all current filter/sort selections */
async function applyFilters() {
  const subject = document.getElementById('filterSubject').value;
  const completed = document.getElementById('filterStatus').value;
  const priority = document.getElementById('filterPriority').value;
  const sortBy = document.getElementById('sortBy').value;

  // Build query params
  const params = new URLSearchParams();
  if (subject) params.append('subject', subject);
  if (completed !== '') params.append('completed', completed);
  if (sortBy) params.append('sortBy', sortBy);

  try {
    const response = await fetch(`/tasks?${params.toString()}`);
    const data = await response.json();

    if (data.success) {
      let tasks = data.tasks;
      
      // Client-side priority filter (not in API)
      if (priority) {
        tasks = tasks.filter(t => t.priority === priority);
      }

      renderTasks(tasks);
      updateStats(data.stats);
    }
  } catch (err) {
    showToast('Failed to apply filters', 'error');
  }
}

/** Reset all filters */
function clearFilters() {
  document.getElementById('filterSubject').value = '';
  document.getElementById('filterStatus').value = '';
  document.getElementById('filterPriority').value = '';
  document.getElementById('sortBy').value = 'deadline';
  refreshTasks();
}

// ===== DATA REFRESH =====

/** Fetch fresh task data from the server and re-render */
async function refreshTasks() {
  try {
    const response = await fetch('/tasks');
    const data = await response.json();

    if (data.success) {
      allTasks = data.tasks; // Update global state
      renderTasks(allTasks);
      updateStats(data.stats);
      updateSubjectFilter(allTasks);
    }
  } catch (err) {
    console.error('Failed to refresh tasks:', err);
  }
}

/** Update the subject dropdown with current subjects */
function updateSubjectFilter(tasks) {
  const subjects = [...new Set(tasks.map(t => t.subject).filter(Boolean))];
  const select = document.getElementById('filterSubject');
  const currentValue = select.value;
  
  select.innerHTML = '<option value="">All Subjects</option>' +
    subjects.map(s => `<option value="${s}" ${s === currentValue ? 'selected' : ''}>${s}</option>`).join('');
}

/** Update dashboard stat cards */
function updateStats(stats) {
  if (!stats) return;
  const el = (id) => document.getElementById(id);
  if (el('statTotal')) el('statTotal').textContent = stats.total;
  if (el('statPending')) el('statPending').textContent = stats.pending;
  if (el('statCompleted')) el('statCompleted').textContent = stats.completed;
  if (el('statOverdue')) el('statOverdue').textContent = stats.overdue;
}

// ===== AUTH =====

/** Log out the current user */
async function logout() {
  if (!confirm('Are you sure you want to log out?')) return;

  try {
    await fetch('/auth/logout', { method: 'POST' });
    window.location.href = '/auth/signin';
  } catch (err) {
    window.location.href = '/auth/signin';
  }
}

// ===== UTILITIES =====

/** Show a toast notification */
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.style.display = 'block';

  setTimeout(() => {
    toast.style.display = 'none';
  }, 3500);
}

/** Format a date string for display */
function formatDate(dateString) {
  if (!dateString) return 'No deadline';
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Escape HTML to prevent XSS attacks */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}
