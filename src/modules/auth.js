// Auth Module â€” LuxCart
import { showToast } from './ui.js';

let authMode = 'login';

export function isLoggedIn() { return !!localStorage.getItem('token'); }
export function getToken() { return localStorage.getItem('token'); }

export function openAuth() {
  document.getElementById('auth-overlay').classList.add('active');
  document.body.classList.add('no-scroll');
}

function closeAuth() {
  document.getElementById('auth-overlay').classList.remove('active');
  document.body.classList.remove('no-scroll');
  document.getElementById('auth-message').textContent = '';
}

function updateAuthUI(loggedIn) {
  const loginBtn = document.getElementById('login-nav-btn');
  const userBtn = document.getElementById('user-btn');
  const dropdownName = document.getElementById('user-dropdown-name');

  if (loggedIn) {
    loginBtn.classList.add('hidden');
    userBtn.classList.remove('hidden');
    dropdownName.textContent = localStorage.getItem('name') || 'User';
  } else {
    loginBtn.classList.remove('hidden');
    userBtn.classList.add('hidden');
  }
}

async function submitAuth() {
  const name = document.getElementById('auth-name').value;
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;
  const message = document.getElementById('auth-message');

  if (!email || !password) { message.textContent = 'Please fill all fields'; return; }
  if (authMode === 'signup' && !name) { message.textContent = 'Please enter your name'; return; }

  message.textContent = 'Please wait...';
  message.className = 'auth-message';

  try {
    const res = await fetch(`/api/server?action=${authMode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();

    if (data.error) { message.textContent = data.error; message.className = 'auth-message error'; return; }

    localStorage.setItem('token', data.token);
    localStorage.setItem('name', data.name);
    message.textContent = `Welcome, ${data.name}!`;
    message.className = 'auth-message success';
    updateAuthUI(true);
    showToast('success', 'Welcome!', `Logged in as ${data.name}`);

    setTimeout(closeAuth, 800);
  } catch (err) {
    message.textContent = 'Connection error. Please try again.';
    message.className = 'auth-message error';
  }
}

function toggleMode() {
  authMode = authMode === 'login' ? 'signup' : 'login';
  document.getElementById('auth-title').textContent = authMode === 'login' ? 'Login' : 'Sign Up';
  document.getElementById('auth-toggle-text').textContent = authMode === 'login' ? 'New here?' : 'Already have an account?';
  document.getElementById('auth-toggle-btn').textContent = authMode === 'login' ? 'Create account' : 'Login';
  document.getElementById('auth-name-field').style.display = authMode === 'signup' ? 'block' : 'none';
  document.getElementById('auth-message').textContent = '';
}

export function initAuth() {
  document.getElementById('auth-close').addEventListener('click', closeAuth);
  document.getElementById('auth-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeAuth();
  });
  document.getElementById('auth-toggle-btn').addEventListener('click', toggleMode);
  document.getElementById('auth-submit-btn').addEventListener('click', submitAuth);
  document.getElementById('login-nav-btn').addEventListener('click', openAuth);
  document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    updateAuthUI(false);
    document.getElementById('user-dropdown').classList.remove('active');
    showToast('info', 'Logged Out', 'See you next time!');
  });

  // User dropdown toggle
  document.getElementById('user-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('user-dropdown').classList.toggle('active');
  });
  document.addEventListener('click', () => {
    document.getElementById('user-dropdown').classList.remove('active');
  });

  // Enter key on password
  document.getElementById('auth-password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submitAuth();
  });

  // Check if already logged in
  if (isLoggedIn()) updateAuthUI(true);
}

