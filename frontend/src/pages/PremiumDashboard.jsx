import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getGoals, getTodos, getActivities, getActivityStats } from '../services/api';

export default function PremiumDashboard() {
  const [goals, setGoals] = useState([]);
  const [todos, setTodos] = useState([]);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [goalsRes, todosRes, activitiesRes, statsRes] = await Promise.all([
        getGoals(),
        getTodos(),
        getActivities({ days: 30 }),
        getActivityStats(7)
      ]);

      setGoals(goalsRes.data);
      setTodos(todosRes.data);
      setActivities(activitiesRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate focus time per goal
  const getGoalStats = (goalId) => {
    const goalTodos = todos.filter(t => t.goal_id === goalId);
    const todoIds = goalTodos.map(t => t.id);
    
    const focusSessions = activities.filter(a => 
      a.activity_type === 'focus_session' && 
      a.extra_data?.goal_id === goalId
    );
    
    const totalFocusTime = focusSessions.reduce((sum, a) => sum + (a.duration_minutes || 0), 0);
    const completedTodos = goalTodos.filter(t => t.is_completed).length;

    return {
      totalTodos: goalTodos.length,
      completedTodos,
      activeTodos: goalTodos.length - completedTodos,
      totalFocusTime,
      sessions: focusSessions.length
    };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  const activeGoals = goals.filter(g => !g.is_achieved);

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{
          fontSize: '42px',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '12px'
        }}>
          Welcome back! 👋
        </h1>
        <p style={{ color: '#a1a1aa', fontSize: '18px' }}>
          Here's your productivity command center
        </p>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '48px'
      }}>
        <QuickStat
          icon="🎯"
          label="Active Goals"
          value={activeGoals.length}
          subtitle={`${goals.length} total`}
          color="#8b5cf6"
        />
        <QuickStat
          icon="✅"
          label="Active Todos"
          value={todos.filter(t => !t.is_completed).length}
          subtitle={`${todos.filter(t => t.is_completed).length} completed`}
          color="#10b981"
        />
        <QuickStat
          icon="⚡"
          label="Focus Time"
          value={`${stats?.total_focus_time_minutes || 0}m`}
          subtitle="Last 7 days"
          color="#f59e0b"
        />
        <QuickStat
          icon="🔥"
          label="Sessions"
          value={stats?.total_activities || 0}
          subtitle="Last 7 days"
          color="#ef4444"
        />
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#f4f4f5', marginBottom: '20px' }}>
          Quick Actions
        </h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/goals" className="btn btn-primary" style={{ fontSize: '15px', padding: '14px 28px' }}>
            🎯 New Goal
          </Link>
          <Link to="/todos" className="btn btn-secondary" style={{ fontSize: '15px', padding: '14px 28px' }}>
            ✅ New Todo
          </Link>
          <Link to="/focus" className="btn" style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
            color: 'white',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            fontSize: '15px',
            padding: '14px 28px'
          }}>
            ⚡ Start Focus Session
          </Link>
          <Link to="/boost" className="btn" style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
            color: 'white',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            fontSize: '15px',
            padding: '14px 28px'
          }}>
            🚀 Get Inspired
          </Link>
        </div>
      </div>

      {/* Goals with Todos and Focus Time */}
      {activeGoals.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#f4f4f5' }}>
              Your Active Goals
            </h2>
            <Link to="/goals" style={{ color: '#8b5cf6', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>
              View All →
            </Link>
          </div>

          <div style={{ display: 'grid', gap: '24px' }}>
            {activeGoals.slice(0, 5).map((goal) => {
              const goalStats = getGoalStats(goal.id);
              return (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  stats={goalStats}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {activeGoals.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '80px 40px' }}>
          <div style={{ fontSize: '80px', marginBottom: '24px' }}>🎯</div>
          <h3 style={{ fontSize: '28px', fontWeight: '700', color: '#f4f4f5', marginBottom: '12px' }}>
            Ready to achieve greatness?
          </h3>
          <p style={{ fontSize: '16px', color: '#a1a1aa', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
            Start by creating your first goal. Break it down into todos, then use focus sessions to make progress.
          </p>
          <Link to="/goals" className="btn btn-primary" style={{ fontSize: '16px', padding: '14px 32px' }}>
            Create Your First Goal
          </Link>
        </div>
      )}
    </div>
  );
}

function QuickStat({ icon, label, value, subtitle, color }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>{icon}</div>
      <div style={{
        fontSize: '36px',
        fontWeight: '700',
        color,
        marginBottom: '6px',
        lineHeight: '1'
      }}>
        {value}
      </div>
      <div style={{ fontSize: '15px', fontWeight: '600', color: '#f4f4f5', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ fontSize: '13px', color: '#71717a' }}>
        {subtitle}
      </div>
    </div>
  );
}

function GoalCard({ goal, stats }) {
  const progressWidth = (stats.completedTodos / (stats.totalTodos || 1)) * 100;

  return (
    <div className="card" style={{ padding: '28px' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#f4f4f5', marginBottom: '8px' }}>
              🎯 {goal.title}
            </h3>
            {goal.description && (
              <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: '1.6' }}>
                {goal.description}
              </p>
            )}
          </div>
          <span className="badge" style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
            color: 'white',
            padding: '6px 14px',
            fontSize: '13px',
            fontWeight: '700'
          }}>
            {goal.category}
          </span>
        </div>

        {/* Progress Bar */}
        {stats.totalTodos > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <span style={{ color: '#a1a1aa' }}>Progress</span>
              <span style={{ color: '#8b5cf6', fontWeight: '600' }}>
                {stats.completedTodos}/{stats.totalTodos} todos completed
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '10px',
              background: '#27272a',
              borderRadius: '5px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progressWidth}%`,
                height: '100%',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                borderRadius: '5px',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        padding: '20px',
        background: '#0a0a0a',
        borderRadius: '12px',
        border: '1px solid #27272a'
      }}>
        <StatItem
          icon="📝"
          label="Total Todos"
          value={stats.totalTodos}
          color="#3b82f6"
        />
        <StatItem
          icon="⚡"
          label="Focus Time"
          value={`${stats.totalFocusTime}m`}
          color="#f59e0b"
        />
        <StatItem
          icon="🔥"
          label="Sessions"
          value={stats.sessions}
          color="#ef4444"
        />
      </div>

      {/* Active Todos Preview */}
      {stats.activeTodos > 0 && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#a1a1aa', marginBottom: '8px' }}>
            {stats.activeTodos} active {stats.activeTodos === 1 ? 'task' : 'tasks'}
          </div>
        </div>
      )}
    </div>
  );
}

function StatItem({ icon, label, value, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '24px', marginBottom: '6px' }}>{icon}</div>
      <div style={{ fontSize: '24px', fontWeight: '700', color, marginBottom: '4px' }}>
        {value}
      </div>
      <div style={{ fontSize: '12px', color: '#71717a' }}>
        {label}
      </div>
    </div>
  );
}

