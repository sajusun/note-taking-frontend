import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { aggregationsApi, postsApi } from '../services/api';
import { FileText, Plus, User, Calendar, Code, CheckCircle, Send, ArrowRight } from 'lucide-react';

export const UserPostsView = () => {
  const { user } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [lookupResult, setLookupResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPipeline, setShowPipeline] = useState(false);

  // New Post State
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [creatingPost, setCreatingPost] = useState(false);
  const [isPostFormOpen, setIsPostFormOpen] = useState(false);

  // Fetch list of users to populate selector
  const fetchUsers = async () => {
    try {
      const res = await aggregationsApi.getUsersByInterests();
      if (res.success && res.data) {
        // Collect distinct users from interests
        const userMap = new Map();
        res.data.forEach((item) => {
          item.users.forEach((u) => {
            if (!userMap.has(u._id)) userMap.set(u._id, u);
          });
        });
        const usersList = Array.from(userMap.values());
        setAvailableUsers(usersList);

        // Default to logged-in user or first user
        if (usersList.length > 0) {
          const currentId = user?._id || user?.id;
          const match = usersList.find((u) => u._id === currentId);
          const initialId = match ? match._id : usersList[0]._id;
          setSelectedUserId(initialId);
          fetchLookupPosts(initialId);
        }
      }
    } catch (err) {
      console.error('Failed to load user list for selector:', err);
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
      setIsPostFormOpen(false);
      // Refresh current lookup
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
          <div className="scenario-badge">
            <CheckCircle size={14} />
            <span>Scenario 2 Aggregation Pipeline</span>
          </div>
          <h1 className="view-title">User Posts ($lookup Stage)</h1>
          <p className="view-subtitle">
            Retrieves all posts belonging to a particular user using a <strong>single aggregation pipeline with a <code>$lookup</code> stage</strong>, 
            supported by <code>postSchema.index(&#123; userId: 1, createdAt: -1 &#125;)</code>.
          </p>
        </div>

        <div className="header-actions">
          <button
            className="btn-secondary"
            onClick={() => setShowPipeline((prev) => !prev)}
          >
            <Code size={16} />
            <span>{showPipeline ? 'Hide Pipeline Code' : 'View Pipeline Code'}</span>
          </button>
          <button
            className="btn-primary"
            onClick={() => setIsPostFormOpen((prev) => !prev)}
          >
            <Plus size={16} />
            <span>{isPostFormOpen ? 'Close Post Form' : 'Publish New Post'}</span>
          </button>
        </div>
      </div>

      {showPipeline && (
        <div className="code-box">
          <div className="code-box-header">
            <span>Single MongoDB Aggregation Pipeline with $lookup</span>
            <span className="code-tag">User.aggregate()</span>
          </div>
          <pre>
{`User.aggregate([
  // 1. Target the specific user
  { $match: { _id: new mongoose.Types.ObjectId(userId) } },
  // 2. Perform $lookup join to fetch posts written by this user
  {
    $lookup: {
      from: "posts",
      localField: "_id",
      foreignField: "userId",
      pipeline: [{ $sort: { createdAt: -1 } }],
      as: "posts"
    }
  },
  // 3. Project output schema
  { $project: { password: 0, __v: 0 } }
])`}
          </pre>
        </div>
      )}

      {/* Publish Post Card (Collapsible) */}
      {isPostFormOpen && (
        <div className="form-card-inline">
          <h3 className="form-card-title">Write a Public Post</h3>
          <p className="form-card-subtitle">
            Posts are stored in the separate <code>Posts</code> collection and retrieved via <code>$lookup</code>.
          </p>
          <form onSubmit={handleCreatePost}>
            <div className="form-group">
              <label>Post Title</label>
              <input
                type="text"
                placeholder="Give your post an engaging title..."
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Post Content</label>
              <textarea
                rows={3}
                placeholder="Write your post content..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                required
              />
            </div>
            <div className="form-actions-right">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsPostFormOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={creatingPost}>
                <Send size={15} />
                <span>{creatingPost ? 'Publishing...' : 'Publish Post'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* User Selector Dropdown Bar */}
      <div className="user-selector-bar">
        <label className="selector-label">
          <User size={16} />
          <span>Select User to Run $lookup Pipeline:</span>
        </label>
        <select
          value={selectedUserId}
          onChange={handleSelectUser}
          className="user-select-dropdown"
        >
          {availableUsers.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name} ({u.email}) - {u.role.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {/* Results View */}
      {loading ? (
        <div className="loading-state">Executing $lookup aggregation pipeline...</div>
      ) : lookupResult ? (
        <div className="lookup-results-section">
          {/* User Overview Card */}
          <div className="user-profile-header-card">
            <div className="user-profile-avatar-large">
              {lookupResult.user.name.charAt(0).toUpperCase()}
            </div>
            <div className="user-profile-info-block">
              <div className="user-name-role-row">
                <h2>{lookupResult.user.name}</h2>
                <span className={`role-badge ${lookupResult.user.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                  {lookupResult.user.role.toUpperCase()}
                </span>
              </div>
              <p className="user-email-dim">{lookupResult.user.email}</p>
              {lookupResult.user.interests?.length > 0 && (
                <div className="interests-tag-row">
                  {lookupResult.user.interests.map((int) => (
                    <span key={int} className="interest-mini-chip">#{int}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="total-posts-counter">
              <span className="counter-number">{lookupResult.totalPosts}</span>
              <span className="counter-label">Posts via $lookup</span>
            </div>
          </div>

          {/* Posts List */}
          <h3 className="posts-section-heading">
            Posts Joined via <code>$lookup</code> from <code>Posts</code> Collection
          </h3>

          {lookupResult.posts.length === 0 ? (
            <div className="empty-state">
              <p className="empty-title">No posts found for this user</p>
              <p className="empty-subtitle">
                This user has not authored any public posts yet. Click "Publish New Post" above to add one.
              </p>
            </div>
          ) : (
            <div className="posts-grid">
              {lookupResult.posts.map((post) => (
                <div key={post._id} className="post-card">
                  <div className="post-header">
                    <FileText size={18} className="text-primary" />
                    <h4 className="post-title">{post.title}</h4>
                  </div>
                  <div className="post-body">{post.content}</div>
                  <div className="post-footer">
                    <Calendar size={13} />
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
