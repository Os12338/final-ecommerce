import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    const result = await logout();
    if (!result.success) {
      console.error('Logout failed:', result.error);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Final Ecommerce Dashboard</h1>
          <div className="user-info">
            <span className="welcome-text">Welcome back, {user?.name || 'User'}!</span>
            <button onClick={handleLogout} className="logout-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16,17 21,12 16,7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon orders">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
              </svg>
            </div>
            <div className="stat-info">
              <h3 className="stat-number">24</h3>
              <p className="stat-label">Total Orders</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon products">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <div className="stat-info">
              <h3 className="stat-number">156</h3>
              <p className="stat-label">Products</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon customers">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div className="stat-info">
              <h3 className="stat-number">1,234</h3>
              <p className="stat-label">Customers</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon revenue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div className="stat-info">
              <h3 className="stat-number">$12,345</h3>
              <p className="stat-label">Revenue</p>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h2 className="card-title">Recent Orders</h2>
            <div className="order-list">
              <div className="order-item">
                <div className="order-info">
                  <span className="order-id">#ORD-001</span>
                  <span className="order-customer">John Doe</span>
                </div>
                <span className="order-status pending">Pending</span>
                <span className="order-amount">$299.99</span>
              </div>
              <div className="order-item">
                <div className="order-info">
                  <span className="order-id">#ORD-002</span>
                  <span className="order-customer">Jane Smith</span>
                </div>
                <span className="order-status completed">Completed</span>
                <span className="order-amount">$149.50</span>
              </div>
              <div className="order-item">
                <div className="order-info">
                  <span className="order-id">#ORD-003</span>
                  <span className="order-customer">Bob Johnson</span>
                </div>
                <span className="order-status shipped">Shipped</span>
                <span className="order-amount">$89.99</span>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <h2 className="card-title">Quick Actions</h2>
            <div className="action-buttons">
              <button className="action-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="16"/>
                  <line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
                Add Product
              </button>
              <button className="action-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                </svg>
                View Orders
              </button>
              <button className="action-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                Manage Users
              </button>
              <button className="action-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3h18v18H3zM9 9h6v6H9z"/>
                </svg>
                Analytics
              </button>
            </div>
          </div>
        </div>

        <div className="user-profile-card">
          <h2 className="card-title">Profile Information</h2>
          <div className="profile-info">
            <div className="profile-avatar">
              <div className="avatar-placeholder">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
            <div className="profile-details">
              <h3 className="profile-name">{user?.name || 'Demo User'}</h3>
              <p className="profile-email">{user?.email || 'demo@example.com'}</p>
              <p className="profile-role">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;