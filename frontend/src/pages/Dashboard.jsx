import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getGoals, getTodos, getActivityStats, getRecommendations } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    goals: { total: 0, active: 0 },
    todos: { total: 0, completed: 0 },
    activities: null,
    videos: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [goalsRes, todosRes, activityRes, videosRes] = await Promise.all([
        getGoals(),
        getTodos(),
        getActivityStats(7),
        getRecommendations(3)
      ]);

      const goals = goalsRes.data;
      const todos = todosRes.data;

      setStats({
        goals: {
          total: goals.length,
          active: goals.filter(g => !g.is_achieved).length
        },
        todos: {
          total: todos.length,
          completed: todos.filter(t => t.is_completed).length
        },
        activities: activityRes.data,
        videos: videosRes.data.videos || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: 'white' }}>
        Welcome back! 👋
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }}>
        Here's your productivity overview
      </p>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <StatCard
          icon="🎯"
          title="Active Goals"
          value={stats.goals.active}
          subtitle={`${stats.goals.total} total goals`}
          color="#667eea"
          link="/goals"
        />
        <StatCard
          icon="✅"
          title="Completed Todos"
          value={stats.todos.completed}
          subtitle={`${stats.todos.total} total todos`}
          color="#10b981"
          link="/todos"
        />
        <StatCard
          icon="⚡"
          title="Focus Time"
          value={`${stats.activities?.total_focus_time_minutes || 0}m`}
          subtitle="Last 7 days"
          color="#f59e0b"
        />
        <StatCard
          icon="🔥"
          title="Activities"
          value={stats.activities?.total_activities || 0}
          subtitle="Last 7 days"
          color="#ef4444"
        />
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
          Quick Actions
        </h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/goals" className="btn btn-primary">
            + New Goal
          </Link>
          <Link to="/todos" className="btn btn-secondary">
            + New Todo
          </Link>
          <Link to="/boost" className="btn" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', color: 'white' }}>
            🚀 Get Boost
          </Link>
        </div>
      </div>

      {/* Recommended Videos */}
      {stats.videos.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600' }}>
              Recommended for You 🎥
            </h2>
            <Link to="/boost" style={{ color: '#667eea', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>
              View All →
            </Link>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px'
          }}>
            {stats.videos.slice(0, 3).map((video) => (
              <VideoCard key={video.video_id} video={video} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, title, value, subtitle, color, link }) {
  const content = (
    <div className="card" style={{
      background: 'white',
      cursor: link ? 'pointer' : 'default',
      transition: 'transform 0.2s'
    }}
    onMouseEnter={(e) => link && (e.currentTarget.style.transform = 'translateY(-4px)')}
    onMouseLeave={(e) => link && (e.currentTarget.style.transform = 'translateY(0)')}
    >
      <div style={{ fontSize: '32px', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontSize: '28px', fontWeight: '700', color, marginBottom: '4px' }}>
        {value}
      </div>
      <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
        {title}
      </div>
      <div style={{ fontSize: '12px', color: '#9ca3af' }}>
        {subtitle}
      </div>
    </div>
  );

  return link ? <Link to={link} style={{ textDecoration: 'none' }}>{content}</Link> : content;
}

function VideoCard({ video }) {
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden',
        transition: 'all 0.2s',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
      >
        <img
          src={video.thumbnail_url}
          alt={video.title}
          style={{ width: '100%', height: '160px', objectFit: 'cover' }}
        />
        <div style={{ padding: '12px' }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '4px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {video.title}
          </h3>
          <p style={{ fontSize: '12px', color: '#6b7280' }}>
            {video.channel_title}
          </p>
        </div>
      </div>
    </a>
  );
}

