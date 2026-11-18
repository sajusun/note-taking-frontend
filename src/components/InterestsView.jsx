import React, { useState, useEffect } from 'react';
import { aggregationsApi } from '../services/api';

export const InterestsView = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAggregation = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await aggregationsApi.getUsersByInterests();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch interests aggregation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAggregation();
  }, []);

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h1 className="view-title">Users by Interests (Aggregation 1)</h1>
          <p className="view-subtitle">
            MongoDB single aggregation pipeline ($unwind and $group) grouping users by their interests.
          </p>
        </div>

        <button className="btn-secondary" onClick={fetchAggregation} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div className="empty-state">Running aggregation query...</div>
      ) : data.length === 0 ? (
        <div className="empty-state">No interests found in database.</div>
      ) : (
        <div className="interests-grid">
          {data.map((item) => (
            <div key={item.interest} className="interest-card">
              <div className="interest-header">
                <span className="interest-title">#{item.interest}</span>
                <span className="interest-count">{item.totalUsers} {item.totalUsers === 1 ? 'user' : 'users'}</span>
              </div>

              <div className="user-list">
                {item.users.map((u) => (
                  <div key={u._id} className="user-item">
                    <span>{u.name}</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{u.email}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
