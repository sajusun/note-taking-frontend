const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
};

// Authentication API
export const authApi = {
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me')
};

// Notes API
export const notesApi = {
  getNotes: (page = 1, limit = 6, userId = '') => {
    let url = `/notes?page=${page}&limit=${limit}`;
    if (userId) url += `&userId=${userId}`;
    return request(url);
  },
  getNoteById: (id) => request(`/notes/${id}`),
  createNote: (noteData) => request('/notes', { method: 'POST', body: JSON.stringify(noteData) }),
  updateNote: (id, noteData) => request(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(noteData) }),
  deleteNote: (id) => request(`/notes/${id}`, { method: 'DELETE' })
};

// Users API (Admin)
export const usersApi = {
  getUsers: (page = 1, limit = 10) => request(`/users?page=${page}&limit=${limit}`),
  createUser: (userData) => request('/users', { method: 'POST', body: JSON.stringify(userData) }),
  updateUser: (id, userData) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(userData) }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' })
};

// Posts API
export const postsApi = {
  getPosts: (page = 1, limit = 10) => request(`/posts?page=${page}&limit=${limit}`),
  createPost: (postData) => request('/posts', { method: 'POST', body: JSON.stringify(postData) }),
  deletePost: (id) => request(`/posts/${id}`, { method: 'DELETE' })
};

// Aggregations API (Scenario 1 & 2)
export const aggregationsApi = {
  getUsersByInterests: () => request('/aggregations/users-by-interests'),
  getUserPostsLookup: (userId) => request(`/aggregations/user-posts/${userId}`)
};
