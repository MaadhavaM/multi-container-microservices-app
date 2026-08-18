document.addEventListener('DOMContentLoaded', () => {
  // If user is already logged in, redirect to dashboard
  if (getLoggedUser()) {
    window.location.href = 'dashboard.html';
  }

  // Setup event listeners
  document.getElementById('loginPass').addEventListener('keypress', e => { if(e.key==='Enter') doLogin(); });
  document.getElementById('signupConfirm').addEventListener('keypress', e => { if(e.key==='Enter') doSignup(); });
  document.getElementById('forgotModal').addEventListener('click', function(e) { if(e.target===this) closeModal('forgotModal'); });
});

function switchTab(t){
  document.getElementById('loginForm').style.display  = t==='login'  ? 'block' : 'none';
  document.getElementById('signupForm').style.display = t==='signup' ? 'block' : 'none';
  document.getElementById('loginTab').className  = 'auth-tab'+(t==='login'?' active':'');
  document.getElementById('signupTab').className = 'auth-tab'+(t==='signup'?' active':'');
  clearMsg();
}

function togglePwd(id, btn){
  var inp = document.getElementById(id);
  if(inp.type==='password'){ inp.type='text'; btn.textContent='Hide'; }
  else{ inp.type='password'; btn.textContent='Show'; }
}

function validateUsername(val){
  var hint = document.getElementById('userHint');
  if(!val){ hint.textContent=''; hint.className='field-hint hint-info'; return; }
  if(val.length < 3){ hint.textContent='Username must be at least 3 characters'; hint.className='field-hint hint-err'; return; }
  if(!/^[A-Za-z0-9_]+$/.test(val)){ hint.textContent='Only letters, numbers and underscore allowed'; hint.className='field-hint hint-err'; return; }
  var key = val.toLowerCase();
  if(USERS[key]){ hint.textContent='Username already taken'; hint.className='field-hint hint-err'; return; }
  hint.textContent='Username is available'; hint.className='field-hint hint-ok';
}

function checkConfirm(){
  var p1 = document.getElementById('signupPass').value;
  var p2 = document.getElementById('signupConfirm').value;
  var hint = document.getElementById('confirmHint');
  if(!p2){ hint.textContent=''; return; }
  if(p1===p2){ hint.textContent='Passwords match'; hint.className='field-hint hint-ok'; }
  else{ hint.textContent='Passwords do not match'; hint.className='field-hint hint-err'; }
}

function checkStrength(val){
  var wrap = document.getElementById('strengthWrap');
  var fill = document.getElementById('strengthFill');
  var text = document.getElementById('strengthText');
  if(!val){ wrap.className='strength-wrap'; return; }
  wrap.className='strength-wrap show';
  var s=0;
  if(val.length>=4) s++;
  if(val.length>=8) s++;
  if(/[A-Z]/.test(val)) s++;
  if(/[0-9]/.test(val)) s++;
  if(/[^A-Za-z0-9]/.test(val)) s++;
  var lv=[
    {w:'20%',bg:'#e74c3c',lbl:'Very Weak'},
    {w:'40%',bg:'#e67e22',lbl:'Weak'},
    {w:'60%',bg:'#f1c40f',lbl:'Fair'},
    {w:'80%',bg:'#2ecc71',lbl:'Strong'},
    {w:'100%',bg:'#27ae60',lbl:'Very Strong'},
  ][Math.min(s,4)];
  fill.style.width=lv.w; fill.style.background=lv.bg;
  text.textContent='Strength: '+lv.lbl; text.style.color=lv.bg;
}

function showMsg(m,t){ var e=document.getElementById('authMsg'); e.textContent=m; e.className='auth-msg show '+t; setTimeout(clearMsg,4000); }
function clearMsg(){ document.getElementById('authMsg').className='auth-msg'; }

function openModal(id){ document.getElementById(id).className='modal-overlay show'; }
function closeModal(id){ document.getElementById(id).className='modal-overlay'; clearModalMsg(); }
function clearModalMsg(){ var m=document.getElementById('fgMsg'); if(m) m.className='modal-msg'; }

function doResetPassword(){
  var u   = document.getElementById('fgUser').value.trim().toLowerCase();
  var cur = document.getElementById('fgCurrentPass').value;
  var np  = document.getElementById('fgNewPass').value;
  var cp  = document.getElementById('fgConfirmPass').value;
  var msg = document.getElementById('fgMsg');
  function setMsg(t,cls){ msg.textContent=t; msg.className='modal-msg show '+cls; }
  if(!u||!cur||!np||!cp){ setMsg('Please fill in all fields.','err'); return; }
  if(!USERS[u]){ setMsg('Username not found.','err'); return; }
  if(USERS[u].pass !== cur){ setMsg('Current password is incorrect.','err'); return; }
  if(np.length < 4){ setMsg('New password must be at least 4 characters.','err'); return; }
  if(np !== cp){ setMsg('New passwords do not match.','err'); return; }
  USERS[u].pass = np;
  saveUsers();
  setMsg('Password updated successfully! You can now login.','ok');
  setTimeout(function(){ closeModal('forgotModal'); }, 2000);
}

function doLogin(){
  var u = document.getElementById('loginUser').value.trim();
  var p = document.getElementById('loginPass').value;
  if(!u||!p){ showMsg('Please enter username and password.','err'); return; }
  var key = u.toLowerCase(); // case-insensitive
  var userObj = USERS[key];
  if(userObj && userObj.pass === p){
    setLoggedUser({ key:key, displayName: userObj.displayName });
    window.location.href = 'dashboard.html';
  } else {
    showMsg('Invalid username or password. Please try again.','err');
    document.getElementById('loginPass').value = '';
  }
}

function doSignup(){
  var name    = document.getElementById('signupName').value.trim();
  var rawUser = document.getElementById('signupUser').value.trim();
  var pass    = document.getElementById('signupPass').value;
  var confirm = document.getElementById('signupConfirm').value;
  var email   = document.getElementById('signupEmail').value.trim();
  if(!name||!rawUser||!email||!pass||!confirm){ showMsg('Please fill in all required fields.','err'); return; }
  if(rawUser.length < 3){ showMsg('Username must be at least 3 characters.','err'); return; }
  if(!/^[A-Za-z0-9_]+$/.test(rawUser)){ showMsg('Username: only letters, numbers and underscore allowed.','err'); return; }
  if(pass.length < 8){ showMsg('Password must be at least 8 characters.','err'); return; }
  if(!/(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9])/.test(pass)){ showMsg('Password must contain letters, numbers, and symbols.','err'); return; }
  if(pass !== confirm){ showMsg('Passwords do not match.','err'); return; }
  var key = rawUser.toLowerCase();
  if(USERS[key]){ showMsg('Username already exists. Please choose another.','err'); return; }
  
  USERS[key] = { pass:pass, displayName:rawUser, email: document.getElementById('signupEmail').value.trim() };
  saveUsers();
  
  showMsg('Account created! Logging you in...','ok');
  setTimeout(function(){ 
    setLoggedUser({key:key, displayName:rawUser}); 
    window.location.href = 'dashboard.html'; 
  }, 900);
}
