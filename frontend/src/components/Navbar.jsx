import React, { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Navbar.css';

export default function Navbar({ isDarkMode, onToggleDarkMode }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/budget', label: 'Budget', icon: '💰' },
    { path: '/expenses', label: 'Expenses', icon: '📋' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Desktop/Tablet Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          {/* Logo */}
          <a href="/dashboard" className="navbar-logo">
            <span className="logo-icon">💳</span>
            <span className="logo-text">ExpenseTrack</span>
          </a>

          {/* Desktop Navigation Items */}
          <ul className="nav-items">
            {navItems.map((item) => (
              <li key={item.path}>
                <a
                  href={item.path}
                  className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>

          {/* Right Section */}
          <div className="navbar-right">
            {/* Dark Mode Toggle */}
            <button
              className="btn-icon"
              onClick={onToggleDarkMode}
              title="Toggle dark mode"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            {/* User Dropdown */}
            <div className="user-dropdown">
              <button
                className="btn-user"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="user-avatar">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
                <span className="user-name">{user?.name}</span>
                <span className="dropdown-arrow">
                  {isDropdownOpen ? '▲' : '▼'}
                </span>
              </button>

              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #e9ecef',
                    fontSize: '12px',
                    color: '#6c757d'
                  }}>
                    Signed in as<br />
                    <strong style={{ color: '#212529', fontSize: '13px' }}>
                      {user?.email}
                    </strong>
                  </div>
                  <a href="/profile" className="dropdown-item">
                    👤 Profile
                  </a>
                  <a href="/settings" className="dropdown-item">
                    ⚙️ Settings
                  </a>
                  <button
                    onClick={onToggleDarkMode}
                    className="dropdown-item"
                  >
                    {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                  </button>
                  <hr />
                  <button
                    onClick={handleLogout}
                    className="dropdown-item logout"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <ul className="mobile-nav-items">
          {navItems.map((item) => (
            <li key={item.path}>
              <a
                href={item.path}
                className={`mobile-nav-link ${isActive(item.path) ? 'active' : ''}`}
              >
                <span>{item.icon}</span>
                <span className="mobile-nav-label">{item.label}</span>
              </a>
            </li>
          ))}
          <li>
            <button
              className="mobile-nav-link"
              onClick={onToggleDarkMode}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <span>{isDarkMode ? '☀️' : '🌙'}</span>
              <span className="mobile-nav-label">Theme</span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}