/* CampusNotes - Student Note Management Application */

/**
 * CampusNotes application.
 * Stores notes in browser localStorage so data persists across reloads.
 */
(function () {
  // DOM elements
  const noteForm = document.getElementById("note-form");
  const noteTitleInput = document.getElementById("note-title");
  const noteSubjectInput = document.getElementById("note-subject");
  const noteContentInput = document.getElementById("note-content");
  const saveBtn = document.getElementById("save-btn");
  const clearBtn = document.getElementById("clear-btn");
  const notesList = document.getElementById("notes-list");
  const emptyState = document.getElementById("empty-state");
  const notesCount = document.getElementById("notes-count");
  const filterSubject = document.getElementById("filter-subject");
  const searchNotes = document.getElementById("search-notes");

  // Error spans
  const titleError = document.getElementById("title-error");
  const subjectError = document.getElementById("subject-error");
  const contentError = document.getElementById("content-error");

  // State
  let notes = JSON.parse(localStorage.getItem("campusnotes.notes")) || [];
  let editingId = null; // id of note being edited, null when adding

  // Initialization
  function init() {
    renderNotes();
    bindEvents();
  }

  // Event bindings
  function bindEvents() {
    noteForm.addEventListener("submit", handleFormSubmit);
    clearBtn.addEventListener("click", handleClear);
    filterSubject.addEventListener("change", renderNotes);
    searchNotes.addEventListener("input", renderNotes);

    // Clear field errors on input
    noteTitleInput.addEventListener("input", () => clearError(titleError));
    noteSubjectInput.addEventListener("change", () => clearError(subjectError));
    noteContentInput.addEventListener("input", () => clearError(contentError));
  }

  // --- Core operations ---

  function handleFormSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const noteData = {
      title: noteTitleInput.value.trim(),
      subject: noteSubjectInput.value,
      content: noteContentInput.value.trim(),
    };

    if (editingId) {
      updateNote(editingId, noteData);
      editingId = null;
      saveBtn.textContent = "Save Note";
    } else {
      createNote(noteData);
    }

    noteForm.reset();
    renderNotes();
  }

  function handleClear() {
    noteForm.reset();
    clearError(titleError);
    clearError(subjectError);
    clearError(contentError);
    editingId = null;
    saveBtn.textContent = "Save Note";
  }

  function createNote(data) {
    const note = {
      id: Date.now().toString(),
      title: data.title,
      subject: data.subject,
      content: data.content,
      createdAt: new Date().toISOString(),
    };
    notes.unshift(note);
    persist();
  }

  function updateNote(id, data) {
    const index = notes.findIndex((n) => n.id === id);
    if (index === -1) return;
    notes[index] = {
      ...notes[index],
      title: data.title,
      subject: data.subject,
      content: data.content,
    };
    persist();
  }

  function deleteNote(id) {
    if (!confirm("Delete this note? This cannot be undone.")) {
      return;
    }
    notes = notes.filter((n) => n.id !== id);
    persist();
    renderNotes();
  }

  function editNote(id) {
    const note = notes.find((n) => n.id === id);
    if (!note) return;

    noteTitleInput.value = note.title;
    noteSubjectInput.value = note.subject;
    noteContentInput.value = note.content;
    editingId = id;
    saveBtn.textContent = "Update Note";
    noteTitleInput.focus();
  }

  // --- Validation & rendering ---

  function validateForm() {
    let valid = true;

    if (!noteTitleInput.value.trim()) {
      showError(titleError, "Title is required.");
      valid = false;
    }
    if (!noteSubjectInput.value) {
      showError(subjectError, "Please select a subject.");
      valid = false;
    }
    if (!noteContentInput.value.trim()) {
      showError(contentError, "Content is required.");
      valid = false;
    }

    return valid;
  }

  function showError(element, message) {
    element.textContent = message;
  }

  function clearError(element) {
    element.textContent = "";
  }

  function persist() {
    localStorage.setItem("campusnotes.notes", JSON.stringify(notes));
  }

  function renderNotes() {
    const subjectFilter = filterSubject.value;
    const searchTerm = searchNotes.value.toLowerCase().trim();

    const filtered = notes.filter((note) => {
      const matchesSubject =
        !subjectFilter || note.subject === subjectFilter;
      const matchesSearch =
        !searchTerm ||
        note.title.toLowerCase().includes(searchTerm) ||
        note.content.toLowerCase().includes(searchTerm);
      return matchesSubject && matchesSearch;
    });

    notesList.innerHTML = "";
    notesCount.textContent = filtered.length;

    if (filtered.length === 0) {
      emptyState.classList.remove("hidden");
      notesList.classList.add("hidden");
      return;
    }

    emptyState.classList.add("hidden");
    notesList.classList.remove("hidden");

    filtered.forEach((note) => {
      const item = document.createElement("li");
      item.className = "note-item";
      item.innerHTML = `
        <span class="note-subject">${escapeHtml(note.subject)}</span>
        <div>
          <div class="note-title">${escapeHtml(note.title)}</div>
          <div class="note-date">
            Created ${formatDate(note.createdAt)}
          </div>
        </div>
        <div class="note-content">${escapeHtml(note.content)}</div>
        <div class="note-actions">
          <button class="btn btn-outline" aria-label="Edit note" onclick="app.editNote('${note.id}')">Edit</button>
          <button class="btn btn-danger" aria-label="Delete note" onclick="app.deleteNote('${note.id}')">Delete</button>
        </div>
      `;
      notesList.appendChild(item);
    });
  }

  // --- Helpers ---

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  // Expose for inline event handlers
  window.app = {
    editNote,
    deleteNote,
  };

  init();
})();
