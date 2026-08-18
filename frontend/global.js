const API = "http://localhost:5000/notes"; // Adjust this if your backend IP differs.

// Default users with case-insensitive handling
let USERS = JSON.parse(localStorage.getItem('nmwa_users2') || 'null') || {
  'admin':   { pass:'1234',   displayName:'Admin',   email:'' },
  'maadh':   { pass:'12345',  displayName:'Maadhava',email:'' },
  'student': { pass:'lpu123', displayName:'Student', email:'' },
};

function saveUsers() { 
  localStorage.setItem('nmwa_users2', JSON.stringify(USERS)); 
}

function getLoggedUser() {
  return JSON.parse(localStorage.getItem('nmwa_loggedUser') || 'null');
}

function setLoggedUser(user) {
  if (user) {
    localStorage.setItem('nmwa_loggedUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('nmwa_loggedUser');
  }
}

function toggleDark() {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem('nmwa_darkMode', isDark ? 'true' : 'false');
  updateDarkModeLabels();
}

function updateDarkModeLabels() {
  const isDark = document.body.classList.contains('dark');
  const lbl = isDark ? 'Light Mode' : 'Dark Mode';
  const gBtn = document.getElementById('globalDarkBtn');
  if (gBtn) gBtn.textContent = lbl;
  const dBtn = document.getElementById('darkBtn');
  if (dBtn) dBtn.textContent = lbl;
}

// Load dark mode preference on page load
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('nmwa_darkMode') === 'true') {
    document.body.classList.add('dark');
  }
  updateDarkModeLabels();
});

// HTML escaping utility
function escHtml(t){
  return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
