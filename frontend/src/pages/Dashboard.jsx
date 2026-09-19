import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { expenseAPI, receiptAPI, budgetAPI } from '../services/api';
import {
  initializeNotifications,
  showReceiptProcessed,
  checkAndNotifyBudgetAlerts,
  getNotificationPermission
} from '../services/notificationService';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchData();
    setNotificationPermission(getNotificationPermission());
  }, []);

  const fetchData = async () => {
    try {
      const statsRes = await expenseAPI.getStats();
      const expensesRes = await expenseAPI.getAllExpenses();
      setStats(statsRes.data);
      setExpenses(expensesRes.data.expenses.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  // Show in-app toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Enable push notifications
  const handleEnableNotifications = async () => {
    const success = await initializeNotifications();
    if (success) {
      setNotificationPermission('granted');
      showToast('✅ Notifications enabled!', 'success');
      // Check budget alerts after enabling
      await checkAndNotifyBudgetAlerts(budgetAPI);
    } else {
      showToast('❌ Could not enable notifications. Please allow in browser settings.', 'error');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => setReceiptPreview(event.target.result);
    reader.readAsDataURL(file);

    setUploading(true);
    const formData = new FormData();
    formData.append('receipt', file);

    try {
      const response = await receiptAPI.uploadReceipt(formData);
      const { expense } = response.data;

      showToast(`✅ Receipt processed! ₹${expense?.amount} at ${expense?.merchant}`, 'success');

      // Show push notification
      if (notificationPermission === 'granted') {
        showReceiptProcessed(
          expense?.merchant || 'Unknown Store',
          expense?.amount || 0
        );
        // Check budget alerts after adding expense
        await checkAndNotifyBudgetAlerts(budgetAPI);
      }

      fetchData();
      e.target.value = '';
      setReceiptPreview(null);
    } catch (error) {
      showToast('❌ Error uploading receipt: ' + error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Food & Dining': '🍔',
      'Groceries': '🛒',
      'Transport': '🚗',
      'Medical': '⚕️',
      'Entertainment': '🎬',
      'Shopping': '🛍️',
      'Travel': '✈️',
      'Utilities': '💡',
      'Office & Supplies': '📎',
      'Other': '📌'
    };
    return icons[category] || '📌';
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Welcome back, {user?.name}! 👋</h1>
          <p>Here's your financial overview for today</p>
        </div>
        <div className="header-stats">
          <div className="quick-stat">
            <span>💳</span>
            <div>
              <p>Total Expenses</p>
              <strong>{stats?.totalExpenses || 0}</strong>
            </div>
          </div>
          <div className="quick-stat">
            <span>📊</span>
            <div>
              <p>This Month</p>
              <strong>₹{stats?.thisMonth || 0}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-container">

        {/* Notification Banner */}
        {notificationPermission !== 'granted' && (
          <div className="notification-banner">
            <div className="notification-banner-left">
              <span className="notification-bell">🔔</span>
              <div>
                <h4>Enable Budget Alerts</h4>
                <p>Get notified when you're close to your spending limits</p>
              </div>
            </div>
            <button
              className="btn-enable-notifications"
              onClick={handleEnableNotifications}
            >
              Enable Notifications
            </button>
          </div>
        )}

        {notificationPermission === 'granted' && (
          <div className="notification-enabled">
            <span>🔔</span>
            <p>Push notifications are enabled! You'll be alerted about budget limits.</p>
          </div>
        )}

        {/* Stats Grid */}
        <section className="stats-section">
          <h2>📈 Your Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card stat-purple">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>Total Spent</h3>
                <div className="stat-amount">₹{stats?.totalSpent || 0}</div>
                <p className="stat-subtitle">All time</p>
              </div>
            </div>

            <div className="stat-card stat-blue">
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <h3>This Month</h3>
                <div className="stat-amount">₹{stats?.thisMonth || 0}</div>
                <p className="stat-subtitle">Current month</p>
              </div>
            </div>

            <div className="stat-card stat-green">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>Last 7 Days</h3>
                <div className="stat-amount">₹{stats?.last7Days || 0}</div>
                <p className="stat-subtitle">Weekly total</p>
              </div>
            </div>

            <div className="stat-card stat-orange">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <h3>Average</h3>
                <div className="stat-amount">₹{stats?.avgExpense || 0}</div>
                <p className="stat-subtitle">Per transaction</p>
              </div>
            </div>
          </div>
        </section>

        {/* Upload Section */}
        <section className="upload-section">
          <div className="section-title">
            <h2>📸 Upload Receipt</h2>
            <p>Scan a receipt to automatically track your expense</p>
          </div>

          {receiptPreview && (
            <div className="preview-container">
              <img src={receiptPreview} alt="Receipt preview" className="receipt-preview" />
              <button
                className="btn-remove-preview"
                onClick={() => setReceiptPreview(null)}
              >✕</button>
            </div>
          )}

          <label htmlFor="receipt-upload" className="upload-area">
            <div className="upload-content">
              <span className="upload-icon">📷</span>
              <h3>Drag and drop receipt here</h3>
              <p>or tap to select a file</p>
              <p className="upload-hint">Supports JPEG, PNG, WEBP (Max 5MB)</p>
            </div>
            <button type="button" className="upload-btn" disabled={uploading}>
              {uploading ? (
                <><span className="spinner-small"></span> Processing...</>
              ) : (
                <>📥 Choose File</>
              )}
            </button>
            <input
              id="receipt-upload"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </section>

       {/* Quick Actions */}
<section className="quick-actions">
  <h2>⚡ Quick Actions</h2>
  <div className="actions-grid">
    <a href="/expenses" className="action-card">
      <span>➕</span>
      <p>Add Expense</p>
    </a>
    <a href="/budget" className="action-card">
      <span>💰</span>
      <p>Set Budget</p>
    </a>
    <a href="/analytics" className="action-card">
      <span>📊</span>
      <p>Analytics</p>
    </a>
    <a href="/expenses" className="action-card">
      <span>📥</span>
      <p>Export CSV</p>
    </a>
  </div>
</section>

        {/* Recent Expenses */}
        <section className="expenses-section">
          <div className="section-header">
            <h2>📋 Recent Expenses</h2>
            <a href="/expenses" className="see-all-link">View All →</a>
          </div>

          {expenses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No expenses yet</h3>
              <p>Upload a receipt or add an expense manually</p>
              <a href="/expenses" className="btn-primary">+ Add Expense</a>
            </div>
          ) : (
            <div className="expense-list">
              {expenses.map((expense) => (
                <div key={expense._id} className="expense-item">
                  <div className="expense-left">
                    <div className="expense-icon">
                      {getCategoryIcon(expense.category)}
                    </div>
                    <div className="expense-info">
                      <div className="expense-merchant">{expense.merchant}</div>
                      <div className="expense-details">
                        <span className="expense-category">{expense.category}</span>
                        <span className="expense-date">
                          {new Date(expense.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="expense-right">
                    <div className="expense-amount">₹{expense.amount.toFixed(2)}</div>
                    <div className={`expense-type ${expense.isManual ? 'manual' : 'receipt'}`}>
                      {expense.isManual ? 'Manual' : 'Receipt'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Tips Section */}
        <section className="tips-section">
          <h2>💡 Quick Tips</h2>
          <div className="tips-grid">
            <div className="tip-card">
              <span className="tip-icon">📸</span>
              <h4>Smart Scanning</h4>
              <p>Take a clear, straight photo of your receipt for best results</p>
            </div>
            <div className="tip-card">
              <span className="tip-icon">🔔</span>
              <h4>Budget Alerts</h4>
              <p>Enable notifications to get alerts when you're near your budget limit</p>
            </div>
            <div className="tip-card">
              <span className="tip-icon">📊</span>
              <h4>Track Trends</h4>
              <p>Check Analytics to see where your money goes each month</p>
            </div>
            <div className="tip-card">
              <span className="tip-icon">📥</span>
              <h4>Export Reports</h4>
              <p>Download CSV reports for tax filing or sharing with accountants</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}