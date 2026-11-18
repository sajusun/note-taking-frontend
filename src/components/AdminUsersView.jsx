import React, { useState, useEffect } from 'react';
import { usersApi } from '../services/api';

export const AdminUsersView = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [interests, setInterests] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await usersApi.getUsers(page, limit);
      if (res.success) {
        setUsers(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await usersApi.createUser({
        name,
        email,
        password,
        role,
        interests: interests.split(',').map((i) => i.trim()).filter(Boolean)
      });
      setIsModalOpen(false);
      setName('');
      setEmail('');
      setPassword('');
      setInterests('');
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (id, userName) => {
    if (!window.confirm(`Delete user "${userName}"? This will delete all their notes and posts.`)) {
      return;
    }
    try {
      await usersApi.deleteUser(id);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to delete user');
    }
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h1 className="view-title">User Management (Admin)</h1>
          <p className="view-subtitle">
            Admin panel for viewing and managing registered users with pagination.
          </p>
        </div>

        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          + Add User
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div className="empty-state">Loading users...</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Interests</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 500 }}>{u.name}</td>
                  <td style={{ color: '#64748b' }}>{u.email}</td>
                  <td>
                    <span className={`role-badge ${u.role === 'admin' ? 'admin' : ''}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    {u.interests?.length > 0 ? (
                      <span style={{ fontSize: '0.8rem', color: '#475569' }}>
                        {u.interests.join(', ')}
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>None</span>
                    )}
                  </td>
                  <td style={{ color: '#64748b', fontSize: '0.82rem' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      className="btn-icon delete"
                      onClick={() => handleDeleteUser(u._id, u.name)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              <h2>Add New User</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label>Interests (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. chess, reading"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
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
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
