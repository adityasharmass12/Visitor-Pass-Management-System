import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardShell = ({ title, subtitle, children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="shell">
      <aside className="sidebar">
        <div>
          <div className="brand">Visitor Pass</div>
          <p className="muted">{user?.role} dashboard</p>
        </div>
        <nav className="nav-links">
          <Link to="/admin">Admin</Link>
          <Link to="/security">Security</Link>
          <Link to="/host">Host</Link>
          <Link to="/visitor">Visitor</Link>
        </nav>
        <button className="ghost-button" onClick={logout}>Logout</button>
      </aside>
      <main className="workspace">
        <header className="page-header">
          <div>
            <p className="eyebrow">Visitor management system</p>
            <h1>{title}</h1>
            <p className="muted">{subtitle}</p>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
};

export default DashboardShell;
