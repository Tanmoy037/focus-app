import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      background: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <Link to="/dashboard" style={{
            fontSize: '24px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textDecoration: 'none'
          }}>
            🎯 Focus App
          </Link>
          
          <div style={{ display: 'flex', gap: '24px' }}>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/goals">Goals</NavLink>
            <NavLink to="/todos">Todos</NavLink>
            <NavLink to="/boost">🚀 Boost</NavLink>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#6b7280', fontSize: '14px' }}>
            👋 {user?.full_name || user?.username}
          </span>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 16px' }}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      style={{
        textDecoration: 'none',
        color: '#374151',
        fontWeight: '500',
        padding: '8px 12px',
        borderRadius: '6px',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = '#f3f4f6';
        e.target.style.color = '#667eea';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'transparent';
        e.target.style.color = '#374151';
      }}
    >
      {children}
    </Link>
  );
}

