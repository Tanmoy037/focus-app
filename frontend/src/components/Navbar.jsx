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
      background: '#0a0a0a',
      borderBottom: '1px solid #27272a',
      boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
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
            background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
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
            <NavLink to="/focus">⚡ Focus</NavLink>
            <NavLink to="/boost">🚀 Boost</NavLink>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#a1a1aa', fontSize: '14px' }}>
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
        color: '#a1a1aa',
        fontWeight: '500',
        padding: '8px 12px',
        borderRadius: '6px',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = '#18181b';
        e.target.style.color = '#8b5cf6';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'transparent';
        e.target.style.color = '#a1a1aa';
      }}
    >
      {children}
    </Link>
  );
}

