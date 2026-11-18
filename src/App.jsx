import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { AuthView } from './components/AuthView';
import { Navbar } from './components/Navbar';
import { NotesView } from './components/NotesView';
import { InterestsView } from './components/InterestsView';
import { UserPostsView } from './components/UserPostsView';
import { AdminUsersView } from './components/AdminUsersView';

export function App() {
  const { user, loading, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('notes');

  if (loading) {
    return (
      <div className="auth-wrapper">
        <div className="empty-state">Loading application...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthView />;
  }

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {activeTab === 'notes' && <NotesView />}
        {activeTab === 'interests' && <InterestsView />}
        {activeTab === 'posts' && <UserPostsView />}
        {activeTab === 'users' && isAdmin && <AdminUsersView />}
      </main>
    </div>
  );
}

export default App;
