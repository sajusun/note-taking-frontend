import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { notesApi } from '../services/api';
import { Plus, Edit2, Trash2, Calendar, User, ChevronLeft, ChevronRight, Search, ShieldCheck } from 'lucide-react';

export const NotesView = () => {
  const { user, isAdmin } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Admin filter toggle: view all vs view own
  const [viewAll, setViewAll] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    setError('');
    try {
      // If admin and viewing own only, pass userId=user.id. Otherwise regular user automatically only gets their own
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
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await notesApi.deleteNote(id);
      fetchNotes();
    } catch (err) {
      alert(err.message || 'Failed to delete note');
    }
  };

  return (
    <div className="view-container">
      {/* Top Action Bar */}
      <div className="view-header">
        <div>
          <h1 className="view-title">
            {isAdmin && viewAll ? "All System Notes (Admin View)" : "My Personal Notes"}
          </h1>
          <p className="view-subtitle">
            {isAdmin && viewAll
              ? "Displaying notes created by all users across the platform."
              : "Secure private notes protected with Role-Based Access Control and compound indexes."}
          </p>
        </div>

        <div className="header-actions">
          {isAdmin && (
            <div className="admin-toggle-group">
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
                All Users' Notes
              </button>
            </div>
          )}

          <button className="btn-primary" onClick={handleOpenCreateModal}>
            <Plus size={18} />
            <span>Create New Note</span>
          </button>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {/* Notes Grid */}
      {loading ? (
        <div className="loading-state">Loading notes from MongoDB...</div>
      ) : notes.length === 0 ? (
        <div className="empty-state">
          <p className="empty-title">No notes found</p>
          <p className="empty-subtitle">
            {isAdmin && viewAll ? "There are no notes in the system." : "You haven't created any notes yet."}
          </p>
          <button className="btn-primary" onClick={handleOpenCreateModal}>
            Create your first note
          </button>
        </div>
      ) : (
        <div className="notes-grid">
          {notes.map((note) => {
            const isOwner = note.userId?._id === (user._id || user.id) || note.userId === (user._id || user.id);
            const authorName = note.userId?.name || 'Unknown Author';
            const authorRole = note.userId?.role || 'user';

            return (
              <div key={note._id} className="note-card">
                <div className="note-card-header">
                  <h3 className="note-title">{note.title}</h3>
                  <div className="note-actions">
                    {(isOwner || isAdmin) && (
                      <>
                        <button
                          className="icon-btn edit"
                          onClick={() => handleOpenEditModal(note)}
                          title="Edit Note"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="icon-btn delete"
                          onClick={() => handleDeleteNote(note._id)}
                          title="Delete Note"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="note-content">{note.content}</div>

                <div className="note-footer">
                  <div className="note-meta">
                    <Calendar size={13} />
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>

                  {isAdmin && viewAll && (
                    <div className="author-pill">
                      <User size={12} />
                      <span>{authorName}</span>
                      <span className={`pill-role ${authorRole}`}>{authorRole}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {pagination.totalPages > 1 && (
        <div className="pagination-bar">
          <div className="pagination-info">
            Showing Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total} total notes)
          </div>
          <div className="pagination-controls">
            <button
              className="btn-page"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={!pagination.hasPrevPage}
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>
            <span className="current-page-badge">{pagination.page}</span>
            <button
              className="btn-page"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={!pagination.hasNextPage}
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit Note Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>{editingNote ? 'Edit Note' : 'Create New Note'}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSaveNote} className="modal-form">
              <div className="form-group">
                <label>Note Title</label>
                <input
                  type="text"
                  placeholder="Enter a descriptive title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={100}
                />
              </div>

              <div className="form-group">
                <label>Note Content</label>
                <textarea
                  rows={5}
                  placeholder="Write your note content here..."
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
                  {saving ? 'Saving...' : editingNote ? 'Update Note' : 'Create Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
