let currentNote = null;
let isEditMode = false;
let origTitle = '', origContent = '';

document.addEventListener('DOMContentLoaded', () => {
  if (!getLoggedUser()) {
    window.location.href = 'login.html';
    return;
  }
  
  const params = new URLSearchParams(window.location.search);
  const noteId = params.get('id');
  const edit = params.get('edit') === '1';
  
  if(noteId) {
    loadNote(noteId, edit);
  } else {
    goBack();
  }
  
  document.addEventListener('keydown', function(e){
    if((e.ctrlKey||e.metaKey)&&e.key==='s'){e.preventDefault(); if(currentNote&&isEditMode) saveNote();}
    if(e.key==='Escape'&&currentNote) goBack();
  });
});

async function loadNote(id, editMode){
  try {
    const r = await fetch(API + '/' + id);
    if (!r.ok) throw new Error("Note not found");
    currentNote = await r.json();
    
    origTitle = currentNote.title || ''; 
    origContent = currentNote.content || '';
    
    document.getElementById('npTitleView').textContent = currentNote.title || 'Untitled';
    document.getElementById('npTitleInp').value = currentNote.title || '';
    document.getElementById('npContentInp').value = currentNote.content || '';
    
    setContentView(currentNote.content || '');
    updateWordCount();
    
    document.getElementById('npTimestamp').textContent = currentNote.updated_at ? 'Last saved: ' + fmtDate(currentNote.updated_at) : 'Not saved yet';
    setEditMode(editMode || false);
  } catch(e) {
    alert("Could not load note.");
    goBack();
  }
}

function setEditMode(on){
  isEditMode = on;
  document.getElementById('npTitleView').style.display  = on?'none':'block';
  document.getElementById('npTitleInp').style.display   = on?'block':'none';
  document.getElementById('npContentView').style.display= on?'none':'block';
  document.getElementById('npContentInp').style.display = on?'block':'none';
  document.getElementById('editBtn').style.display  = on?'none':'inline-block';
  document.getElementById('saveBtn').style.display  = on?'inline-block':'none';
  document.getElementById('cancelBtn').style.display= on?'inline-block':'none';
  
  const b = document.getElementById('modeBadge');
  b.textContent = on ? 'Edit Mode' : 'Read Mode';
  b.className = 'mode-badge ' + (on ? 'mode-edit' : 'mode-read');
  
  if(on) setTimeout(() => document.getElementById('npContentInp').focus(), 50);
}

function enterEditMode() {
  origTitle = currentNote.title || '';
  origContent = currentNote.content || '';
  document.getElementById('npTitleInp').value = origTitle;
  document.getElementById('npContentInp').value = origContent;
  setEditMode(true);
}

function cancelEdit() {
  document.getElementById('npTitleView').textContent = origTitle || 'Untitled';
  setContentView(origContent);
  setEditMode(false);
}

function setContentView(c){
  const v = document.getElementById('npContentView');
  if(!c || !c.trim()) {
    v.innerHTML = '<span class="np-content-empty">No content yet. Click Edit to start writing.</span>';
  } else {
    v.textContent = c;
  }
}

async function saveNote(){
  if(!currentNote) return;
  const title = document.getElementById('npTitleInp').value.trim() || 'Untitled';
  const content = document.getElementById('npContentInp').value;
  
  try {
    const r = await fetch(API + '/' + currentNote.id, {
      method: 'PUT',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({title, content})
    });
    const up = await r.json(); 
    
    currentNote.title = title; 
    currentNote.content = content;
    if(up.updated_at) currentNote.updated_at = up.updated_at;
    
    origTitle = title; 
    origContent = content;
    
    document.getElementById('npTitleView').textContent = title;
    setContentView(content); 
    updateWordCount();
    document.getElementById('npTimestamp').textContent = 'Last saved: ' + (up.updated_at ? fmtDate(up.updated_at) : 'just now');
    
    setEditMode(false);
    
    const msg = document.getElementById('savedMsg'); 
    msg.className = 'saved-msg show'; 
    setTimeout(() => { msg.className = 'saved-msg'; }, 2000);
  } catch(e) {
    alert('Error saving.');
  }
}

function goBack(){
  window.location.href = 'dashboard.html';
}

async function deleteCurrentNote(){
  if(!currentNote) return;
  if(!confirm('Delete "' + (currentNote.title||'this note') + '"?')) return;
  try {
    await fetch(API + '/' + currentNote.id, {method:'DELETE'});
    goBack();
  } catch(e) {
    alert('Error deleting.');
  }
}

function updateWordCount(){
  const c = document.getElementById('npContentInp').value || '';
  const w = c.trim() ? c.trim().split(/\s+/).length : 0;
  document.getElementById('npWordCount').textContent = w + ' word' + (w!==1?'s':'') + ' | ' + c.length + ' chars';
}

function fmtDate(s){
  if(!s) return '';
  const d = new Date(s);
  return d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) + ' ' + 
         d.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
}
