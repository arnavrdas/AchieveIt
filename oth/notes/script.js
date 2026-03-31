const notebox = document.getElementById('notebox');
const notes = JSON.parse(localStorage.getItem('notes')) || [""];

load();

function save() {
    x = notebox.value;
    localStorage.setItem('notes', JSON.stringify(x));
}

function load() {
    notebox.value = savedText;
}

function indent() {
    
}