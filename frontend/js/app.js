const API_BASE_URL = (() => {
  const isFileProtocol = window.location.protocol === 'file:';
  const isLocalStaticServer =
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1') &&
    window.location.port !== '3000';

  if (isFileProtocol || isLocalStaticServer) {
    const localHost = window.location.hostname === '127.0.0.1' ? '127.0.0.1' : 'localhost';
    return `http://${localHost}:3000/api/v1`;
  }

  return `${window.location.origin}/api/v1`;
})();

const DEFAULT_PROFILE_AVATAR = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#E8EEF9"/>
        <stop offset="100%" stop-color="#CFD9EE"/>
      </linearGradient>
    </defs>
    <rect width="160" height="160" rx="80" fill="url(#bg)"/>
    <circle cx="80" cy="62" r="28" fill="#A7B4D0"/>
    <path d="M36 132c6-24 24-38 44-38s38 14 44 38" fill="#95A6C8"/>
  </svg>`
)}`;

async function readJsonSafe(response) {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return null;

  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractApiError(data, fallbackMessage) {
  if (data && typeof data.message === 'string' && data.message.trim()) {
    return data.message;
  }

  if (data && Array.isArray(data.errors) && data.errors.length > 0) {
    const firstError = data.errors[0];
    if (firstError && typeof firstError.msg === 'string' && firstError.msg.trim()) {
      return firstError.msg;
    }
  }

  return fallbackMessage;
}
let token = localStorage.getItem('token');
let currentUser = null;
let allTodos = [];
let statsChart = null;
const activeFilters = {
  status: '',
  priority: '',
};

document.addEventListener('DOMContentLoaded', () => {
  const profileImage = document.getElementById('profile-image');
  if (profileImage) {
    profileImage.src = DEFAULT_PROFILE_AVATAR;
    profileImage.onerror = () => {
      profileImage.src = DEFAULT_PROFILE_AVATAR;
    };
  }

  switchAuthMode('login');
  showSection('auth');

  if (token) {
    getCurrentUser();
  }
});

function switchAuthMode(mode) {
  const loginPanel = document.getElementById('auth-login-panel');
  const registerPanel = document.getElementById('auth-register-panel');
  const loginTab = document.getElementById('auth-tab-login');
  const registerTab = document.getElementById('auth-tab-register');
  const sideTitle = document.getElementById('auth-side-title');
  const sideText = document.getElementById('auth-side-text');
  const sideBtn = document.getElementById('auth-side-btn');
  const authCard = document.querySelector('.auth-card');
  const animatePanel = (panel) => {
    if (!panel) return;
    panel.classList.remove('mode-enter');
    void panel.offsetWidth;
    panel.classList.add('mode-enter');
  };

  if (!loginPanel || !registerPanel || !loginTab || !registerTab) return;

  if (mode === 'register') {
    if (authCard) authCard.classList.add('register-mode');
    loginPanel.classList.add('hidden');
    registerPanel.classList.remove('hidden');
    animatePanel(registerPanel);
    loginTab.classList.remove('active');
    registerTab.classList.add('active');
    if (sideTitle) sideTitle.textContent = 'Already using TaskMaster?';
    if (sideText) {
      sideText.textContent =
        'Sign in to your TaskMaster workspace and continue managing your tasks.';
    }
    if (sideBtn) {
      sideBtn.textContent = 'SIGN IN';
      sideBtn.setAttribute('onclick', "switchAuthMode('login')");
    }
    return;
  }

  if (authCard) authCard.classList.remove('register-mode');
  registerPanel.classList.add('hidden');
  loginPanel.classList.remove('hidden');
  animatePanel(loginPanel);
  registerTab.classList.remove('active');
  loginTab.classList.add('active');
  if (sideTitle) sideTitle.textContent = 'Welcome to TaskMaster';
  if (sideText) {
    sideText.textContent =
      'Create your TaskMaster account to organize tasks, track progress, and stay focused every day.';
  }
  if (sideBtn) {
    sideBtn.textContent = 'SIGN UP';
    sideBtn.setAttribute('onclick', "switchAuthMode('register')");
  }
}

function getSafeProfileImage(imageUrl) {
  if (!imageUrl) return DEFAULT_PROFILE_AVATAR;
  if (imageUrl.includes('i.pravatar.cc')) return DEFAULT_PROFILE_AVATAR;
  return imageUrl;
}

async function handleRegister(e) {
  e.preventDefault();
  const form = e.target;

  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirmPassword = document.getElementById('reg-confirm').value;

  if (password !== confirmPassword) {
    showToast('Passwords do not match', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });

    const data = await readJsonSafe(response);

    if (!response.ok) {
      if (response.status === 404 || response.status === 405) {
        showToast('API is not available. Run backend on port 3000.', 'error');
        return;
      }
      showToast(extractApiError(data, 'Registration failed'), 'error');
      return;
    }

    token = data.token;
    localStorage.setItem('token', token);
    currentUser = data.data.user;

    showToast('Registration successful! ✅', 'success');
    updateUI();
    await loadTodos();
    await loadStats();
    showSection('dashboard');
    form.reset();
  } catch (error) {
    showToast('Connection error', 'error');
    console.error(error);
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const form = e.target;

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await readJsonSafe(response);

    if (!response.ok) {
      if (response.status === 404 || response.status === 405) {
        showToast('API is not available. Run backend on port 3000.', 'error');
        return;
      }
      showToast(extractApiError(data, 'Login failed'), 'error');
      return;
    }

    token = data.token;
    localStorage.setItem('token', token);
    currentUser = data.data.user;

    showToast('Welcome back! 👋', 'success');
    updateUI();
    await loadTodos();
    await loadStats();
    showSection('dashboard');
    form.reset();
  } catch (error) {
    showToast('Connection error', 'error');
    console.error(error);
  }
}

async function getCurrentUser() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const data = await readJsonSafe(response);
      if (!data || !data.data || !data.data.user) {
        logout(false);
        return;
      }
      currentUser = data.data.user;
      updateUI();
      loadTodos();
      loadStats();
      showSection('dashboard');
    } else {
      logout(false);
    }
  } catch (error) {
    console.error(error);
    logout(false);
  }
}

function logout(showMessage = true) {
  token = null;
  currentUser = null;
  localStorage.removeItem('token');
  if (showMessage) {
    showToast('Logged out successfully', 'success');
  }
  showSection('auth');
  updateUI();
}

async function handleAddTodo(e) {
  e.preventDefault();

  const title = document.getElementById('todo-title').value;
  const description = document.getElementById('todo-description').value;
  const priority = document.getElementById('todo-priority').value;
  const dueDate = document.getElementById('todo-date').value;

  try {
    const response = await fetch(`${API_BASE_URL}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      }),
    });

    const data = await readJsonSafe(response);

    if (!response.ok) {
      showToast(extractApiError(data, 'Failed to create task'), 'error');
      return;
    }

    showToast('Task created successfully! ✅', 'success');
    closeModal('add-todo-modal');
    document.getElementById('todo-title').value = '';
    document.getElementById('todo-description').value = '';
    loadTodos();
    loadStats();
  } catch (error) {
    showToast('Connection error', 'error');
    console.error(error);
  }
}

async function loadTodos() {
  try {
    const response = await fetch(`${API_BASE_URL}/todos`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      if (response.status === 401) logout();
      return;
    }

    const data = await readJsonSafe(response);
    if (!data || !data.data || !Array.isArray(data.data.todos)) return;
    allTodos = data.data.todos;
    renderTodos(allTodos);
  } catch (error) {
    console.error(error);
  }
}

function renderTodos(todos) {
  const list = document.getElementById('todos-list');

  if (todos.length === 0) {
    list.innerHTML = '<div class="glass p-8 text-center text-gray-500"><i class="fas fa-inbox text-4xl mb-4 block"></i> No tasks</div>';
    return;
  }

  list.innerHTML = todos
    .map(
      (todo) => `
    <div class="task-card glass p-4 ${todo.status === 'completed' ? 'completed' : ''}">
        <div class="flex justify-between items-start mb-3">
            <h3 class="text-lg font-bold text-gray-800 flex-1">${todo.title}</h3>
            <span class="status-badge status-${todo.status}">
                ${getStatusLabel(todo.status)}
            </span>
        </div>
        
        ${todo.description ? `<p class="text-gray-600 text-sm mb-3 task-copy">${todo.description}</p>` : ''}
        
        <div class="flex gap-2 mb-3 flex-wrap">
            <span class="priority-${todo.priority} px-3 py-1 rounded text-xs font-bold">
                ${getPriorityLabel(todo.priority)}
            </span>
            ${todo.dueDate ? `<span class="text-xs bg-gray-200 px-3 py-1 rounded task-date"><i class="fas fa-calendar mr-1"></i>${new Date(todo.dueDate).toLocaleDateString('en-US')}</span>` : ''}
        </div>

        <div class="status-switch">
            <button
              onclick="changeTodoStatus('${todo._id}', 'pending')"
              class="status-switch-btn ${todo.status === 'pending' ? 'active' : ''}"
              ${todo.status === 'pending' ? 'disabled' : ''}
            >
              To Do
            </button>
            <button
              onclick="changeTodoStatus('${todo._id}', 'in-progress')"
              class="status-switch-btn ${todo.status === 'in-progress' ? 'active' : ''}"
              ${todo.status === 'in-progress' ? 'disabled' : ''}
            >
              In Progress
            </button>
            <button
              onclick="changeTodoStatus('${todo._id}', 'completed')"
              class="status-switch-btn ${todo.status === 'completed' ? 'active' : ''}"
              ${todo.status === 'completed' ? 'disabled' : ''}
            >
              Done
            </button>
        </div>
        
        <div class="flex gap-2 task-actions">
            <button onclick="deleteTodo('${todo._id}')" class="task-btn task-btn-danger text-white px-3 py-1 rounded text-sm"><i class="fas fa-trash mr-1"></i> Delete</button>
        </div>
    </div>
  `
    )
    .join('');
}

function filterTodos() {
  let filtered = allTodos;

  if (activeFilters.status) {
    filtered = filtered.filter((t) => t.status === activeFilters.status);
  }
  if (activeFilters.priority) {
    filtered = filtered.filter((t) => t.priority === activeFilters.priority);
  }

  renderTodos(filtered);
}

function setFilter(type, value, buttonEl) {
  activeFilters[type] = value;

  const parent = buttonEl && buttonEl.parentElement;
  if (parent) {
    parent.querySelectorAll('.filter-chip').forEach((chip) => {
      chip.classList.remove('active');
    });
    buttonEl.classList.add('active');
  }

  filterTodos();
}

async function completeTodo(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/todos/${id}/complete`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      showToast('Task completed! 🎉', 'success');
      loadTodos();
      loadStats();
    }
  } catch (error) {
    console.error(error);
  }
}

async function changeTodoStatus(id, status) {
  const target = allTodos.find((todo) => todo._id === id);
  if (!target || target.status === status) return;

  try {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: target.title,
        description: target.description || '',
        priority: target.priority || 'medium',
        dueDate: target.dueDate || undefined,
        status,
      }),
    });

    const data = await readJsonSafe(response);

    if (!response.ok) {
      showToast(extractApiError(data, 'Failed to update status'), 'error');
      return;
    }

    showToast(`Status changed to ${getStatusLabel(status)}`, 'success');
    loadTodos();
    loadStats();
  } catch (error) {
    showToast('Connection error', 'error');
    console.error(error);
  }
}

async function deleteTodo(id) {
  if (!confirm('Are you sure you want to delete this task?')) return;

  try {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      showToast('Task deleted successfully', 'success');
      loadTodos();
      loadStats();
    }
  } catch (error) {
    console.error(error);
  }
}

async function loadStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/todos/stats/overview`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      if (response.status === 401) logout();
      const errorData = await readJsonSafe(response);
      console.error('Failed to load stats', errorData || response.statusText);
      return;
    }

    const data = await readJsonSafe(response);
    if (!data || !data.data) return;
    updateStats(data.data);
  } catch (error) {
    console.error(error);
  }
}

function updateStats(stats) {
  document.getElementById('stat-total').textContent = stats.total;
  document.getElementById('stat-pending').textContent = stats.pending;
  document.getElementById('stat-progress').textContent = stats.inProgress;
  document.getElementById('stat-completed').textContent = stats.completed;

  const total = Math.max(stats.total || 0, 1);
  const toPercent = (value) => Math.max(0, Math.min(100, Math.round((value / total) * 100)));
  const setMeter = (id, value) => {
    const meter = document.getElementById(id);
    if (!meter) return;
    meter.style.width = `${value}%`;
  };

  setMeter('meter-total', stats.total > 0 ? 100 : 0);
  setMeter('meter-pending', toPercent(stats.pending || 0));
  setMeter('meter-progress', toPercent(stats.inProgress || 0));
  setMeter('meter-completed', toPercent(stats.completed || 0));

  const ctx = document.getElementById('statsChart');
  if (ctx) {
    const chartData = [stats.completed || 0, stats.inProgress || 0, stats.pending || 0];

    if (statsChart) {
      statsChart.data.datasets[0].data = chartData;
      statsChart.update();
      return;
    }

    statsChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'In Progress', 'Pending'],
        datasets: [
          {
            data: chartData,
            backgroundColor: ['#0ea5a4', '#3f67dd', '#57b3ff'],
            borderColor: ['#0b8f8e', '#3559bf', '#439bdf'],
            borderWidth: 1.5,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        animation: {
          duration: 450,
          easing: 'easeOutQuart',
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { size: 13 },
              padding: 18,
              usePointStyle: true,
              pointStyle: 'circle',
            },
          },
        },
      },
    });
  }
}

function showSection(section) {
  document.getElementById('auth-section').classList.add('hidden');
  document.getElementById('dashboard-section').classList.add('hidden');
  document.getElementById('todos-section').classList.add('hidden');

  if (section === 'auth') {
    document.getElementById('auth-section').classList.remove('hidden');
  } else if (section === 'dashboard') {
    document.getElementById('dashboard-section').classList.remove('hidden');
  } else if (section === 'todos') {
    document.getElementById('todos-section').classList.remove('hidden');
  }

  document.body.classList.toggle('auth-view', section === 'auth');
  updateNavigation(section);
}

function updateNavigation(section) {
  if (!currentUser) {
    document.getElementById('nav-auth').classList.remove('hidden');
    document.getElementById('nav-dashboard').classList.add('hidden');
    document.getElementById('nav-todos').classList.add('hidden');
    document.getElementById('nav-logout').classList.add('hidden');
    document.getElementById('user-profile').classList.add('hidden');
  } else {
    document.getElementById('nav-auth').classList.add('hidden');
    document.getElementById('nav-dashboard').classList.remove('hidden');
    document.getElementById('nav-todos').classList.remove('hidden');
    document.getElementById('nav-logout').classList.remove('hidden');
    document.getElementById('user-profile').classList.remove('hidden');
  }
}

function updateUI() {
  if (currentUser) {
    document.getElementById('user-name').textContent = currentUser.name;
    document.getElementById('user-email').textContent = currentUser.email;
    document.getElementById('profile-image').src =
      getSafeProfileImage(currentUser.profileImage);
  }
}

function showAddTodoModal() {
  if (!token) {
    showToast('Please login first', 'error');
    return;
  }
  document.getElementById('add-todo-modal').classList.add('show');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('show');
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = 'toast';

  const icon = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
  }[type];

  toast.innerHTML = `${icon} ${message}`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function getStatusLabel(status) {
  const labels = {
    pending: 'Pending',
    'in-progress': 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return labels[status] || status;
}

function getPriorityLabel(priority) {
  const labels = {
    high: '🔴 High',
    medium: '🟡 Medium',
    low: '🟢 Low',
  };
  return labels[priority] || priority;
}

window.onclick = (e) => {
  const modal = document.getElementById('add-todo-modal');
  if (e.target === modal) {
    closeModal('add-todo-modal');
  }
};
