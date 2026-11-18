import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Users, Hash, FileText, LogOut, Shield, User } from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="brand-logo">
            <BookOpen size={22} className="logo-icon" />
          </div>
          <div>
            <span className="brand-title">Care Guide Notes</span>
            <span className="brand-subtitle">Secure RBAC & Aggregations</span>
          </div>
        </div>

        <nav className="nav-tabs">
          <button
            className={`nav-tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            <BookOpen size={16} />
            <span>Notes</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'interests' ? 'active' : ''}`}
            onClick={() => setActiveTab('interests')}
          >
            <Hash size={16} />
            <span>Interests Aggregation</span>
            <span className="badge-pill">Scenario 1</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            <FileText size={16} />
            <span>User Posts ($lookup)</span>
            <span className="badge-pill">Scenario 2</span>
          </button>

          {isAdmin && (
            <button
              className={`nav-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <Users size={16} />
              <span>User Management</span>
              <span className="badge-pill admin-badge">Admin</span>
            </button>
          )}
        </nav>

        <div className="navbar-user">
          <div className="user-profile-badge">
            {isAdmin ? <Shield size={16} className="text-warning" /> : <User size={16} />}
            <div className="user-details-mini">
              <span className="user-name">{user?.name}</span>
              <span className={`role-badge ${isAdmin ? 'badge-admin' : 'badge-user'}`}>
                {user?.role?.toUpperCase()}
              </span>
            </div>
          </div>

          <button onClick={logout} className="btn-logout" title="Logout">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
