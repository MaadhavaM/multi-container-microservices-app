let allNotes = [];

document.addEventListener('DOMContentLoaded', () => {
  const loggedUser = getLoggedUser();
  if (!loggedUser) {
    window.location.href = 'login.html';
    return;
  }
  
  document.getElementById('loggedUserName').textContent = loggedUser.displayName;
  document.getElementById('userAvatar').textContent = loggedUser.displayName[0].toUpperCase();
  
  loadNotes();
});

function doLogout(){
  setLoggedUser(null);
  window.location.href = 'login.html';
}

async function loadNotes(){
  try{
    const r = await fetch(API); 
    allNotes = await r.json();
    renderNotes();
  }catch(e){
    setTimeout(loadNotes, 3000);
  }
}

function renderNotes(){
  const searchEl = document.getElementById('searchInp');
  if(!searchEl) return;
  const q = (searchEl.value || '').toLowerCase();
  
  const filtered = allNotes.filter(n => 
    (n.title||'').toLowerCase().includes(q) || (n.content||'').toLowerCase().includes(q)
  );
  
  const countEl = document.getElementById('notesCount');
  if(countEl) countEl.textContent = filtered.length + ' note' + (filtered.length !== 1 ? 's' : '') + ' saved';
  
  const list = document.getElementById('notesList');
  if(!list) return;
  
  if(filtered.length === 0){ 
    list.innerHTML = '<div class="no-notes">' + (q ? 'No notes match your search.' : 'No notes yet. Add one above!') + '</div>'; 
    return; 
  }
  
  list.innerHTML = '';
  filtered.forEach(n => {
    const init = (n.title||'N').trim()[0].toUpperCase();
    let preview = (n.content||'').replace(/\n/g,' ').trim();
    if(!preview) preview = 'Click Open to view and write content...';
    if(preview.length > 55) preview = preview.substring(0, 55) + '...';
    
    const card = document.createElement('div'); 
    card.className = 'note-card';
    card.innerHTML =
      '<div class="note-card-top" onclick="openNote('+n.id+',false)">'+
        '<div class="note-icon">'+init+'</div>'+
        '<div class="note-info">'+
          '<div class="note-title">'+escHtml(n.title||'Untitled')+'</div>'+
          '<div class="note-preview">'+escHtml(preview)+'</div>'+
        '</div>'+
        '<div class="note-date">'+fmtDate(n.updated_at)+'</div>'+
      '</div>'+
      '<div class="note-actions">'+
        '<button class="nab open-btn-s" onclick="openNote('+n.id+',false)">Open</button>'+
        '<button class="nab edit-btn-s" onclick="openNote('+n.id+',true)">Edit</button>'+
        '<button class="nab del-btn-s" onclick="deleteNote('+n.id+',event)">Delete</button>'+
      '</div>';
    list.appendChild(card);
  });
}

async function addNote(){
  const inp = document.getElementById('addInp'); 
  const title = inp.value.trim(); 
  if(!title){ inp.focus(); return; }
  
  try {
    const r = await fetch(API, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({title, content:''})
    });
    const note = await r.json(); 
    openNote(note.id, true);
  } catch(e) {
    alert('Error creating note.');
  }
}

function openNote(id, editMode) {
  window.location.href = `editor.html?id=${id}&edit=${editMode ? '1' : '0'}`;
}

async function deleteNote(id, ev){
  ev.stopPropagation();
  const note = allNotes.find(n => n.id === id);
  if(!confirm('Delete "' + (note ? note.title : 'this note') + '"?')) return;
  try {
    await fetch(API + '/' + id, {method: 'DELETE'});
    allNotes = allNotes.filter(n => n.id !== id);
    renderNotes();
  } catch(e) {
    alert('Error deleting note.');
  }
}

function fmtDate(s){
  if(!s) return '';
  const d = new Date(s);
  return d.toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'}) + ' ' + 
         d.toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'});
}
