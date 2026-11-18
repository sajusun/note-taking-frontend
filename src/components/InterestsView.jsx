import React, { useState, useEffect } from 'react';
import { aggregationsApi } from '../services/api';
import { Hash, Users, RefreshCw, Code, CheckCircle, Shield } from 'lucide-react';

export const InterestsView = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPipeline, setShowPipeline] = useState(false);

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
          <div className="scenario-badge">
            <CheckCircle size={14} />
            <span>Scenario 1 Aggregation Pipeline</span>
          </div>
          <h1 className="view-title">Users Grouped by Interests</h1>
          <p className="view-subtitle">
            Demonstrates <strong>exactly one <code>collection.aggregate()</code> call</strong> with 
            <code>$unwind</code> and <code>$group</code> supported by multikey index <code>userSchema.index(&#123; interests: 1 &#125;)</code>.
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
          <button className="btn-primary" onClick={fetchAggregation} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {showPipeline && (
        <div className="code-box">
          <div className="code-box-header">
            <span>Single MongoDB Aggregation Pipeline</span>
            <span className="code-tag">User.aggregate()</span>
          </div>
          <pre>
{`User.aggregate([
  // 1. Match users with non-empty interests
  { $match: { interests: { $exists: true, $not: { $size: 0 } } } },
  // 2. Unwind array into individual document stream
  { $unwind: "$interests" },
  // 3. Group by each interest and accumulate users
  {
    $group: {
      _id: "$interests",
      totalUsers: { $sum: 1 },
      users: { $push: { _id: "$_id", name: "$name", email: "$email", role: "$role" } }
    }
  },
  // 4. Clean projection
  { $project: { _id: 0, interest: "$_id", totalUsers: 1, users: 1 } },
  // 5. Alphabetical sort
  { $sort: { interest: 1 } }
])`}
          </pre>
        </div>
      )}

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div className="loading-state">Running MongoDB Aggregation Pipeline...</div>
      ) : data.length === 0 ? (
        <div className="empty-state">
          <p className="empty-title">No user interests recorded</p>
          <p className="empty-subtitle">
            Users must have interests defined in their profile to populate this aggregation.
          </p>
        </div>
      ) : (
        <div className="interests-grid">
          {data.map((item) => (
            <div key={item.interest} className="interest-card">
              <div className="interest-header">
                <div className="interest-tag">
                  <Hash size={18} />
                  <span>{item.interest}</span>
                </div>
                <div className="interest-count-pill">
                  <Users size={13} />
                  <span>{item.totalUsers} {item.totalUsers === 1 ? 'User' : 'Users'}</span>
                </div>
              </div>

              <div className="interest-users-list">
                {item.users.map((u) => (
                  <div key={u._id} className="interest-user-item">
                    <div className="user-avatar-small">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info-small">
                      <div className="user-name-line">
                        <span className="user-name-text">{u.name}</span>
                        {u.role === 'admin' && (
                          <span className="role-mini-badge">Admin</span>
                        )}
                      </div>
                      <span className="user-email-text">{u.email}</span>
                    </div>
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
