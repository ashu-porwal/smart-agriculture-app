import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tasksAPI } from '../services/api';

function Reminders() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    cropName: '',
    taskName: 'Crop sowing',
    taskDate: '',
    description: '',
    priority: 'Medium',
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await tasksAPI.getTasks();
      setTasks(response.data);
    } catch (err) {
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.cropName || !formData.taskDate) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      if (editingId) {
        // Update task status (for demo)
        await tasksAPI.updateTask(editingId, 'Pending');
        setSuccess('Task updated successfully');
      } else {
        // Create new task
        await tasksAPI.createTask(
          formData.cropName,
          formData.taskName,
          new Date(formData.taskDate).toISOString(),
          formData.description,
          formData.priority
        );
        setSuccess('Task created successfully');
      }

      setFormData({
        cropName: '',
        taskName: 'Crop sowing',
        taskDate: '',
        description: '',
        priority: 'Medium',
      });
      setEditingId(null);
      setShowForm(false);
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await tasksAPI.deleteTask(taskId);
        setSuccess('Task deleted successfully');
        fetchTasks();
      } catch (err) {
        setError('Failed to delete task');
      }
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await tasksAPI.updateTask(taskId, newStatus);
      setSuccess('Task status updated');
      fetchTasks();
    } catch (err) {
      setError('Failed to update task status');
    }
  };

  const sortedTasks = tasks.sort((a, b) => new Date(a.taskDate) - new Date(b.taskDate));

  const tasksByStatus = {
    Completed: sortedTasks.filter((t) => t.status === 'Completed'),
    'In Progress': sortedTasks.filter((t) => t.status === 'In Progress'),
    Pending: sortedTasks.filter((t) => t.status === 'Pending'),
  };

  const getTaskIcon = (taskName) => {
    const icons = {
      'Crop sowing': '🌱',
      'Irrigation': '💧',
      'Fertilizer application': '🧪',
      'Pesticide spraying': '🔬',
      'Harvesting': '🌾',
      'Other': '✓',
    };
    return icons[taskName] || '✓';
  };

  return (
    <div className="container">
      <div style={{ padding: '2rem 0' }}>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-secondary"
          style={{ marginBottom: '1rem' }}
        >
          ← Back to Dashboard
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#2ecc71' }}>📋 Farm Tasks & Reminders</h1>
          <button onClick={() => setShowForm(!showForm)} style={{ backgroundColor: '#3498db' }}>
            {showForm ? 'Cancel' : '+ Add Task'}
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {showForm && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Add New Task</h3>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="cropName">Crop Name *</label>
                <input
                  id="cropName"
                  type="text"
                  value={formData.cropName}
                  onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                  placeholder="e.g., Wheat, Rice, Tomato"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="taskName">Task Type *</label>
                <select
                  id="taskName"
                  value={formData.taskName}
                  onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
                >
                  <option>Crop sowing</option>
                  <option>Irrigation</option>
                  <option>Fertilizer application</option>
                  <option>Pesticide spraying</option>
                  <option>Harvesting</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="taskDate">Due Date *</label>
                <input
                  id="taskDate"
                  type="datetime-local"
                  value={formData.taskDate}
                  onChange={(e) => setFormData({ ...formData, taskDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description (Optional)</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add notes or details for this task"
                  rows="3"
                />
              </div>

              <button type="submit">Save Task</button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ color: '#999', marginBottom: '1rem' }}>No tasks yet</p>
            <button onClick={() => setShowForm(true)} className="btn-secondary">
              Create your first task
            </button>
          </div>
        ) : (
          <>
            {/* Pending Tasks */}
            {tasksByStatus.Pending.length > 0 && (
              <div className="card" style={{ marginBottom: '2rem' }}>
                <div className="card-title">
                  ⏳ Pending Tasks ({tasksByStatus.Pending.length})
                </div>

                {tasksByStatus.Pending.map((task) => (
                  <div
                    key={task._id}
                    style={{
                      padding: '1rem',
                      borderBottom: '1px solid #eee',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>{getTaskIcon(task.taskName)}</span>
                        <h4 style={{ margin: 0 }}>{task.taskName}</h4>
                      </div>
                      <p style={{ color: '#666', fontSize: '0.9rem', margin: '0.25rem 0' }}>
                        {task.cropName} • {new Date(task.taskDate).toLocaleDateString()}
                      </p>
                      {task.description && (
                        <p style={{ color: '#999', fontSize: '0.85rem', margin: '0.5rem 0 0 0' }}>
                          {task.description}
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span
                        style={{
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
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {task.priority}
                      </span>
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                      >
                        <option>Pending</option>
                        <option>In Progress</option>
                        <option>Completed</option>
                      </select>
                      <button
                        onClick={() => handleDelete(task._id)}
                        className="btn-danger"
                        style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* In Progress Tasks */}
            {tasksByStatus['In Progress'].length > 0 && (
              <div className="card" style={{ marginBottom: '2rem' }}>
                <div className="card-title">
                  🔄 In Progress ({tasksByStatus['In Progress'].length})
                </div>

                {tasksByStatus['In Progress'].map((task) => (
                  <div
                    key={task._id}
                    style={{
                      padding: '1rem',
                      borderBottom: '1px solid #eee',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      gap: '1rem',
                      backgroundColor: '#fffbf0',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>{getTaskIcon(task.taskName)}</span>
                        <h4 style={{ margin: 0 }}>{task.taskName}</h4>
                      </div>
                      <p style={{ color: '#666', fontSize: '0.9rem', margin: '0.25rem 0' }}>
                        {task.cropName} • {new Date(task.taskDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                      >
                        <option>Pending</option>
                        <option>In Progress</option>
                        <option>Completed</option>
                      </select>
                      <button
                        onClick={() => handleDelete(task._id)}
                        className="btn-danger"
                        style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Completed Tasks */}
            {tasksByStatus.Completed.length > 0 && (
              <div className="card">
                <div className="card-title">
                  ✓ Completed ({tasksByStatus.Completed.length})
                </div>

                {tasksByStatus.Completed.map((task) => (
                  <div
                    key={task._id}
                    style={{
                      padding: '1rem',
                      borderBottom: '1px solid #eee',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      gap: '1rem',
                      backgroundColor: '#f0fdf4',
                      opacity: 0.7,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>✅</span>
                        <h4 style={{ margin: 0, textDecoration: 'line-through' }}>{task.taskName}</h4>
                      </div>
                      <p style={{ color: '#666', fontSize: '0.9rem', margin: '0.25rem 0' }}>
                        {task.cropName} • {new Date(task.taskDate).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDelete(task._id)}
                      className="btn-danger"
                      style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Reminders;
