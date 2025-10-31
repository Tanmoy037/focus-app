import { useState, useEffect } from 'react';
import { getGoals, createGoal, updateGoal, deleteGoal, getGoalVideos } from '../services/api';
import { format } from 'date-fns';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [showVideos, setShowVideos] = useState(false);
  const [videos, setVideos] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'personal',
    target_date: ''
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const { data } = await getGoals();
      setGoals(data);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createGoal(formData);
      setFormData({ title: '', description: '', category: 'personal', target_date: '' });
      setShowModal(false);
      fetchGoals();
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await deleteGoal(id);
        fetchGoals();
      } catch (error) {
        console.error('Error deleting goal:', error);
      }
    }
  };

  const handleMarkAchieved = async (goal) => {
    try {
      await updateGoal(goal.id, { is_achieved: !goal.is_achieved, progress_percentage: goal.is_achieved ? 0 : 100 });
      fetchGoals();
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const handleViewVideos = async (goal) => {
    setSelectedGoal(goal);
    setShowVideos(true);
    try {
      const { data } = await getGoalVideos(goal.id, 5);
      setVideos(data.videos || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  if (loading) {
    return <div className="container" style={{ paddingTop: '40px' }}><div className="spinner"></div></div>;
  }

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>
            My Goals 🎯
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.9)' }}>
            {goals.filter(g => !g.is_achieved).length} active goals
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          + New Goal
        </button>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onDelete={handleDelete}
            onMarkAchieved={handleMarkAchieved}
            onViewVideos={handleViewVideos}
          />
        ))}
        
        {goals.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎯</div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>No goals yet</h3>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>Create your first goal to get started!</p>
            <button onClick={() => setShowModal(true)} className="btn btn-primary">
              Create Goal
            </button>
          </div>
        )}
      </div>

      {/* Create Goal Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>Create New Goal</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Title</label>
                <input
                  type="text"
                  className="input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Learn Python Programming"
                  required
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Description</label>
                <textarea
                  className="textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your goal..."
                  rows="3"
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Category</label>
                <select
                  className="input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="personal">Personal</option>
                  <option value="career">Career</option>
                  <option value="health">Health</option>
                  <option value="learning">Learning</option>
                  <option value="finance">Finance</option>
                  <option value="productivity">Productivity</option>
                </select>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Target Date (Optional)</label>
                <input
                  type="date"
                  className="input"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Create Goal
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Videos Modal */}
      {showVideos && selectedGoal && (
        <div className="modal-overlay" onClick={() => setShowVideos(false)}>
          <div className="modal" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
              Videos for: {selectedGoal.title}
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>Recommended videos to help you achieve this goal</p>
            
            {videos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div className="spinner"></div>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {videos.map((video) => (
                  <a
                    key={video.video_id}
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      gap: '16px',
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      style={{ width: '160px', height: '90px', objectFit: 'cover', borderRadius: '6px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>{video.title}</h3>
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>{video.channel_title}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
            
            <button onClick={() => setShowVideos(false)} className="btn btn-secondary" style={{ width: '100%', marginTop: '16px' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function GoalCard({ goal, onDelete, onMarkAchieved, onViewVideos }) {
  const getCategoryColor = (category) => {
    const colors = {
      personal: '#8b5cf6',
      career: '#3b82f6',
      health: '#10b981',
      learning: '#f59e0b',
      finance: '#059669',
      productivity: '#ef4444'
    };
    return colors[category] || '#6b7280';
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              textDecoration: goal.is_achieved ? 'line-through' : 'none',
              color: goal.is_achieved ? '#9ca3af' : '#111827'
            }}>
              {goal.title}
            </h3>
            <span className="badge" style={{ background: getCategoryColor(goal.category) + '20', color: getCategoryColor(goal.category) }}>
              {goal.category}
            </span>
            {goal.is_achieved && <span className="badge badge-success">✓ Achieved</span>}
          </div>
          {goal.description && (
            <p style={{ color: '#6b7280', marginBottom: '12px' }}>{goal.description}</p>
          )}
          <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#9ca3af' }}>
            <span>Progress: {goal.progress_percentage}%</span>
            {goal.target_date && <span>Target: {format(new Date(goal.target_date), 'MMM dd, yyyy')}</span>}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
        <button onClick={() => onViewVideos(goal)} className="btn btn-secondary" style={{ fontSize: '14px', padding: '8px 16px' }}>
          🎥 Get Videos
        </button>
        <button
          onClick={() => onMarkAchieved(goal)}
          className={`btn ${goal.is_achieved ? 'btn-secondary' : 'btn-success'}`}
          style={{ fontSize: '14px', padding: '8px 16px' }}
        >
          {goal.is_achieved ? 'Mark as Active' : 'Mark as Achieved'}
        </button>
        <button
          onClick={() => onDelete(goal.id)}
          className="btn btn-danger"
          style={{ fontSize: '14px', padding: '8px 16px', marginLeft: 'auto' }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

