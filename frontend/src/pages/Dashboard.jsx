import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tasksAPI } from '../services/api';

function Dashboard({ user }) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  const features = [
    {
      id: 'disease',
      icon: '🔍',
      title: 'Disease Detection',
      description: 'Upload leaf images and identify diseases',
      path: '/disease',
      color: '#e74c3c',
    },
    {
      id: 'crops',
      icon: '🌾',
      title: 'Crop Information',
      description: 'Access detailed crop data and requirements',
      path: '/crops',
      color: '#2ecc71',
    },
    {
      id: 'weather',
      icon: '🌤️',
      title: 'Weather Dashboard',
      description: 'Check weather conditions and forecasts',
      path: '/weather',
      color: '#3498db',
    },
    {
      id: 'tasks',
      icon: '✓',
      title: 'Task Management',
      description: 'Plan and track farming activities',
      path: '/reminders',
      color: '#f39c12',
    },
    {
      id: 'chat',
      icon: '🤖',
      title: 'Chat Assistant',
      description: 'Get AI-powered farming guidance',
      path: '#chat',
      isChat: true,
      color: '#9b59b6',
    },
  ];

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await tasksAPI.getTasks();
      const allTasks = response.data;
      setTasks(allTasks);

      const completed = allTasks.filter((t) => t.status === 'Completed').length;
      const pending = allTasks.filter((t) => t.status !== 'Completed').length;

      setStats({
        total: allTasks.length,
        completed,
        pending,
      });
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const upcomingTasks = tasks
    .filter((t) => t.status !== 'Completed')
    .sort((a, b) => new Date(a.taskDate) - new Date(b.taskDate))
    .slice(0, 5);

  return (
    <div className="container">
      <div className="dashboard">
        <h1 style={{ marginBottom: '2rem', color: '#2ecc71' }}>
          Welcome, {user?.name}! 👋
        </h1>

        <div className="dashboard-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#27ae60' }}>
              {stats.completed}
            </div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#f39c12' }}>
              {stats.pending}
            </div>
            <div className="stat-label">Pending</div>
          </div>
          {user?.location && (
            <div className="stat-card">
              <div style={{ fontSize: '1.5rem' }}>📍</div>
              <div className="stat-label">{user.location}</div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">📋 Upcoming Tasks</div>
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : upcomingTasks.length > 0 ? (
            <div>
              {upcomingTasks.map((task) => (
                <div key={task._id} style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h4>{task.taskName}</h4>
                      <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                        {task.cropName} • {new Date(task.taskDate).toLocaleDateString()}
                      </p>
                      {task.description && (
                        <p style={{ color: '#999', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                          {task.description}
                        </p>
                      )}
                    </div>
                    <span
                      style={{
                        badge: 'true',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        backgroundColor:
                          task.priority === 'High'
                            ? '#fadbd8'
                            : task.priority === 'Medium'
                            ? '#ffeaa7'
                            : '#d5f4e6',
                        color:
                          task.priority === 'High'
                            ? '#c0392b'
                            : task.priority === 'Medium'
                            ? '#d68910'
                            : '#16a085',
                      }}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#999' }}>No upcoming tasks</p>
          )}
        </div>

        <div className="card">
          <div className="card-title">🚀 Features Available</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {features.map((feature) => (
              <div
                key={feature.id}
                onClick={() => {
                  if (feature.isChat) {
                    // Trigger chat opening (need to pass callback or use window event)
                    window.dispatchEvent(new CustomEvent('openChat'));
                  } else {
                    navigate(feature.path);
                  }
                }}
                style={{
                  padding: '1.5rem',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9',
                  border: `2px solid #eee`,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'center',
                  transform: 'translateY(0)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = `0 8px 20px rgba(46, 204, 113, 0.2)`;
                  e.currentTarget.style.borderColor = feature.color;
                  e.currentTarget.style.backgroundColor = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = '#eee';
                  e.currentTarget.style.backgroundColor = '#f9f9f9';
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
                  {feature.icon}
                </div>
                <strong style={{ fontSize: '1.1rem', color: '#333', display: 'block', marginBottom: '0.5rem' }}>
                  {feature.title}
                </strong>
                <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem', marginBottom: 0 }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
