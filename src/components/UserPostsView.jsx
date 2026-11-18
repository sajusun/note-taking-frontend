import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { aggregationsApi, postsApi } from '../services/api';

export const UserPostsView = () => {
  const { user } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [lookupResult, setLookupResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [creatingPost, setCreatingPost] = useState(false);
  const [showNewPostForm, setShowNewPostForm] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await aggregationsApi.getUsersByInterests();
      if (res.success && res.data) {
        const userMap = new Map();
        res.data.forEach((item) => {
          item.users.forEach((u) => {
            if (!userMap.has(u._id)) userMap.set(u._id, u);
          });
        });
        const usersList = Array.from(userMap.values());
        setAvailableUsers(usersList);

        if (usersList.length > 0) {
          const currentId = user?._id || user?.id;
          const match = usersList.find((u) => u._id === currentId);
          const initialId = match ? match._id : usersList[0]._id;
          setSelectedUserId(initialId);
          fetchLookupPosts(initialId);
        }
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const fetchLookupPosts = async (userId) => {
    if (!userId) return;
    setLoading(true);
    setError('');
    try {
      const res = await aggregationsApi.getUserPostsLookup(userId);
      if (res.success) {
        setLookupResult(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch user posts lookup');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSelectUser = (e) => {
    const newId = e.target.value;
    setSelectedUserId(newId);
    fetchLookupPosts(newId);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setCreatingPost(true);
    try {
      await postsApi.createPost({ title: postTitle, content: postContent });
      setPostTitle('');
      setPostContent('');
      setShowNewPostForm(false);
      fetchLookupPosts(selectedUserId);
    } catch (err) {
      alert(err.message || 'Failed to create post');
    } finally {
      setCreatingPost(false);
    }
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h1 className="view-title">User Posts ($lookup Aggregation)</h1>
          <p className="view-subtitle">
            Retrieves all posts belonging to a user using a single aggregation pipeline with a $lookup stage.
          </p>
        </div>

        <button
          className="btn-secondary"
          onClick={() => setShowNewPostForm((prev) => !prev)}
        >
          {showNewPostForm ? 'Close Form' : '+ New Public Post'}
        </button>
      </div>

      {showNewPostForm && (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1rem', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Create a Public Post</h3>
          <form onSubmit={handleCreatePost}>
            <div className="form-group">
              <label>Post Title</label>
              <input
                type="text"
                placeholder="Title"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Post Content</label>
              <textarea
                rows={3}
                placeholder="Content"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowNewPostForm(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={creatingPost}>
                {creatingPost ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="selector-box">
        <label style={{ fontSize: '0.88rem', fontWeight: 500 }}>Select User:</label>
        <select value={selectedUserId} onChange={handleSelectUser}>
          {availableUsers.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name} ({u.email})
            </option>
          ))}
        </select>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div className="empty-state">Running $lookup aggregation...</div>
      ) : lookupResult ? (
        <div>
          <div className="user-info-box">
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{lookupResult.user.name}</h2>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{lookupResult.user.email} • Role: {lookupResult.user.role}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2563eb' }}>{lookupResult.totalPosts}</span>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>posts via $lookup</p>
            </div>
          </div>

          <h3 style={{ fontSize: '1rem', margin: '1.25rem 0 0.75rem 0' }}>Posts Joined from Posts Collection:</h3>

          {lookupResult.posts.length === 0 ? (
            <div className="empty-state">This user has not published any posts yet.</div>
          ) : (
            <div className="notes-grid">
              {lookupResult.posts.map((post) => (
                <div key={post._id} className="post-card">
                  <h4 className="post-title">{post.title}</h4>
                  <p className="post-content">{post.content}</p>
                  <span className="post-date">{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
