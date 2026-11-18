import React from 'react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          Care Guide Notes
        </div>

        <nav className="nav-tabs">
          <button
            className={`nav-tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            Notes
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'interests' ? 'active' : ''}`}
            onClick={() => setActiveTab('interests')}
          >
            Interests (Agg 1)
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            User Posts (Agg 2)
          </button>

          {isAdmin && (
            <button
              className={`nav-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              Users (Admin)
            </button>
          )}
        </nav>

        <div className="navbar-user">
          <span>{user?.name}</span>
          <span className={`role-badge ${isAdmin ? 'admin' : ''}`}>
            {user?.role}
          </span>
          <button onClick={logout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};
