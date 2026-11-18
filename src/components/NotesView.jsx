import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { notesApi } from '../services/api';

export const NotesView = () => {
  const { user, isAdmin } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });

  const [viewAll, setViewAll] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    setError('');
    try {
      const filterUserId = (isAdmin && !viewAll) ? user._id || user.id : '';
      const res = await notesApi.getNotes(page, limit, filterUserId);
      if (res.success) {
        setNotes(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [page, viewAll]);

  const handleOpenCreateModal = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setIsModalOpen(true);
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingNote) {
        await notesApi.updateNote(editingNote._id, { title, content });
      } else {
        await notesApi.createNote({ title, content });
      }
      setIsModalOpen(false);
      fetchNotes();
    } catch (err) {
      alert(err.message || 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await notesApi.deleteNote(id);
      fetchNotes();
    } catch (err) {
      alert(err.message || 'Failed to delete note');
    }
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h1 className="view-title">
            {isAdmin && viewAll ? "All Notes" : "My Notes"}
          </h1>
          <p className="view-subtitle">
            {isAdmin && viewAll
              ? "Viewing all notes in the database (Admin privilege)"
              : "Private personal notes with pagination"}
          </p>
        </div>

        <div className="header-actions">
          {isAdmin && (
            <div className="toggle-group">
              <button
                className={`toggle-btn ${!viewAll ? 'active' : ''}`}
                onClick={() => { setViewAll(false); setPage(1); }}
              >
                My Notes
              </button>
              <button
                className={`toggle-btn ${viewAll ? 'active' : ''}`}
                onClick={() => { setViewAll(true); setPage(1); }}
              >
                All Notes
              </button>
            </div>
          )}

          <button className="btn-primary" onClick={handleOpenCreateModal}>
            + New Note
          </button>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div className="empty-state">Loading notes...</div>
      ) : notes.length === 0 ? (
        <div className="empty-state">
          <p>No notes found.</p>
          <button className="btn-primary" style={{ marginTop: '0.75rem' }} onClick={handleOpenCreateModal}>
            Create Note
          </button>
        </div>
      ) : (
        <div className="notes-grid">
          {notes.map((note) => {
            const isOwner = note.userId?._id === (user._id || user.id) || note.userId === (user._id || user.id);
            const author = note.userId?.name || 'Unknown';

            return (
              <div key={note._id} className="note-card">
                <div>
                  <div className="note-card-header">
                    <h3 className="note-title">{note.title}</h3>
                    {(isOwner || isAdmin) && (
                      <div className="note-actions">
                        <button
                          className="btn-icon"
                          onClick={() => handleOpenEditModal(note)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-icon delete"
                          onClick={() => handleDeleteNote(note._id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="note-content" style={{ marginTop: '0.5rem' }}>{note.content}</p>
                </div>

                <div className="note-footer">
                  <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  {isAdmin && viewAll && <span>by {author}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="pagination-bar">
          <span>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </span>
          <div className="pagination-controls">
            <button
              className="btn-page"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={!pagination.hasPrevPage}
            >
              Previous
            </button>
            <button
              className="btn-page"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={!pagination.hasNextPage}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>{editingNote ? 'Edit Note' : 'New Note'}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSaveNote}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  placeholder="Note title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Content</label>
                <textarea
                  rows={4}
                  placeholder="Note content..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingNote ? 'Save Changes' : 'Create Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
