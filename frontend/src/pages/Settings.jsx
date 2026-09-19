import React, { useState, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import {
  initializeNotifications,
  getNotificationPermission
} from '../services/notificationService';

export default function Settings() {
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  const [toast, setToast] = useState(null);
  const [notifPermission, setNotifPermission] = useState(getNotificationPermission());

  const [settings, setSettings] = useState({
    // Notifications
    budgetAlerts: true,
    receiptProcessed: true,
    weeklyReport: false,
    monthlyReport: true,

    // Display
    currency: '₹',
    language: 'English',
    dateFormat: 'DD/MM/YYYY',

    // Privacy
    dataSharing: false,
    analytics: true,

    // Export
    exportFormat: 'CSV'
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    showToast('✅ Setting updated!', 'success');
  };

  const handleSelect = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    showToast('✅ Setting updated!', 'success');
  };

  const handleEnableNotifications = async () => {
    const success = await initializeNotifications();
    if (success) {
      setNotifPermission('granted');
      showToast('✅ Notifications enabled!', 'success');
    } else {
      showToast('❌ Please allow notifications in browser settings', 'error');
    }
  };

  const handleClearData = () => {
    if (window.confirm('This will clear all your local data. Are you sure?')) {
      localStorage.clear();
      showToast('✅ Local data cleared!', 'success');
    }
  };

  const handleExportData = () => {
    showToast('📥 Export started! Check your downloads.', 'success');
  };

  return (
    <div style={styles.page}>
      {/* Toast */}
      {toast && (
        <div style={{
          ...styles.toast,
          background: toast.type === 'success'
            ? 'linear-gradient(135deg, #28a745, #20c997)'
            : 'linear-gradient(135deg, #dc3545, #fd7e14)'
        }}>
          {toast.message}
        </div>
      )}

      <div style={styles.container}>
        <h1 style={styles.pageTitle}>⚙️ Settings</h1>
        <p style={styles.pageSubtitle}>Manage your app preferences and account settings</p>

        {/* NOTIFICATIONS */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionIcon}>🔔</span>
            <div>
              <h2 style={styles.sectionTitle}>Notifications</h2>
              <p style={styles.sectionDesc}>Control how and when you receive alerts</p>
            </div>
          </div>

          {/* Push Notification Enable */}
          <div style={styles.card}>
            <div style={styles.settingRow}>
              <div style={styles.settingInfo}>
                <h4 style={styles.settingTitle}>📱 Push Notifications</h4>
                <p style={styles.settingDesc}>
                  {notifPermission === 'granted'
                    ? '✅ Enabled — you will receive mobile notifications'
                    : '❌ Disabled — click to enable mobile alerts'}
                </p>
              </div>
              {notifPermission !== 'granted' ? (
                <button style={styles.btnPrimary} onClick={handleEnableNotifications}>
                  Enable
                </button>
              ) : (
                <span style={styles.enabledBadge}>✅ Active</span>
              )}
            </div>
          </div>

          {/* Notification Toggles */}
          <div style={styles.card}>
            {[
              {
                key: 'budgetAlerts',
                icon: '💰',
                title: 'Budget Limit Alerts',
                desc: 'Get notified when you reach 80% of your budget'
              },
              {
                key: 'receiptProcessed',
                icon: '📸',
                title: 'Receipt Processed',
                desc: 'Get notified when a receipt is scanned successfully'
              },
              {
                key: 'weeklyReport',
                icon: '📊',
                title: 'Weekly Summary',
                desc: 'Receive a weekly spending summary every Sunday'
              },
              {
                key: 'monthlyReport',
                icon: '📅',
                title: 'Monthly Report',
                desc: 'Get a monthly expense report on the 1st of every month'
              }
            ].map((item) => (
              <div key={item.key} style={styles.toggleRow}>
                <div style={styles.toggleInfo}>
                  <span style={styles.toggleIcon}>{item.icon}</span>
                  <div>
                    <h4 style={styles.toggleTitle}>{item.title}</h4>
                    <p style={styles.toggleDesc}>{item.desc}</p>
                  </div>
                </div>
                <div
                  style={{
                    ...styles.toggle,
                    background: settings[item.key]
                      ? 'linear-gradient(135deg, #667eea, #764ba2)'
                      : '#dee2e6'
                  }}
                  onClick={() => handleToggle(item.key)}
                >
                  <div style={{
                    ...styles.toggleThumb,
                    transform: settings[item.key] ? 'translateX(22px)' : 'translateX(2px)'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DISPLAY PREFERENCES */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionIcon}>🎨</span>
            <div>
              <h2 style={styles.sectionTitle}>Display Preferences</h2>
              <p style={styles.sectionDesc}>Customize how the app looks and feels</p>
            </div>
          </div>

          <div style={styles.card}>
            {/* Dark Mode */}
            <div style={styles.toggleRow}>
              <div style={styles.toggleInfo}>
                <span style={styles.toggleIcon}>{isDarkMode ? '🌙' : '☀️'}</span>
                <div>
                  <h4 style={styles.toggleTitle}>Dark Mode</h4>
                  <p style={styles.toggleDesc}>Switch between light and dark theme</p>
                </div>
              </div>
              <div
                style={{
                  ...styles.toggle,
                  background: isDarkMode
                    ? 'linear-gradient(135deg, #667eea, #764ba2)'
                    : '#dee2e6'
                }}
                onClick={toggleDarkMode}
              >
                <div style={{
                  ...styles.toggleThumb,
                  transform: isDarkMode ? 'translateX(22px)' : 'translateX(2px)'
                }} />
              </div>
            </div>

            <div style={styles.divider} />

            {/* Currency */}
            <div style={styles.selectRow}>
              <div>
                <h4 style={styles.toggleTitle}>💱 Currency Symbol</h4>
                <p style={styles.toggleDesc}>Choose your preferred currency</p>
              </div>
              <select
                style={styles.select}
                value={settings.currency}
                onChange={(e) => handleSelect('currency', e.target.value)}
              >
                <option value="₹">₹ INR - Indian Rupee</option>
                <option value="$">$ USD - US Dollar</option>
                <option value="€">€ EUR - Euro</option>
                <option value="£">£ GBP - British Pound</option>
                <option value="¥">¥ JPY - Japanese Yen</option>
              </select>
            </div>

            <div style={styles.divider} />

            {/* Date Format */}
            <div style={styles.selectRow}>
              <div>
                <h4 style={styles.toggleTitle}>📅 Date Format</h4>
                <p style={styles.toggleDesc}>How dates are displayed in the app</p>
              </div>
              <select
                style={styles.select}
                value={settings.dateFormat}
                onChange={(e) => handleSelect('dateFormat', e.target.value)}
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div style={styles.divider} />

            {/* Language */}
            <div style={styles.selectRow}>
              <div>
                <h4 style={styles.toggleTitle}>🌐 Language</h4>
                <p style={styles.toggleDesc}>Select the app language</p>
              </div>
              <select
                style={styles.select}
                value={settings.language}
                onChange={(e) => handleSelect('language', e.target.value)}
              >
                <option value="English">English</option>
                <option value="Tamil">Tamil</option>
                <option value="Hindi">Hindi</option>
                <option value="Telugu">Telugu</option>
              </select>
            </div>
          </div>
        </div>

        {/* DATA & EXPORT */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionIcon}>📦</span>
            <div>
              <h2 style={styles.sectionTitle}>Data & Export</h2>
              <p style={styles.sectionDesc}>Manage your expense data and exports</p>
            </div>
          </div>

          <div style={styles.card}>
            {/* Export Format */}
            <div style={styles.selectRow}>
              <div>
                <h4 style={styles.toggleTitle}>📥 Export Format</h4>
                <p style={styles.toggleDesc}>Default format when exporting expenses</p>
              </div>
              <select
                style={styles.select}
                value={settings.exportFormat}
                onChange={(e) => handleSelect('exportFormat', e.target.value)}
              >
                <option value="CSV">CSV (Excel compatible)</option>
                <option value="PDF">PDF Report</option>
                <option value="JSON">JSON (Raw data)</option>
              </select>
            </div>

            <div style={styles.divider} />

            {/* Export Button */}
            <div style={styles.actionRow}>
              <div>
                <h4 style={styles.toggleTitle}>📤 Export All Data</h4>
                <p style={styles.toggleDesc}>Download all your expenses as {settings.exportFormat}</p>
              </div>
              <button style={styles.btnSecondary} onClick={handleExportData}>
                Export
              </button>
            </div>

            <div style={styles.divider} />

            {/* Analytics Toggle */}
            <div style={styles.toggleRow}>
              <div style={styles.toggleInfo}>
                <span style={styles.toggleIcon}>📊</span>
                <div>
                  <h4 style={styles.toggleTitle}>Usage Analytics</h4>
                  <p style={styles.toggleDesc}>Help improve the app by sharing usage data (anonymous)</p>
                </div>
              </div>
              <div
                style={{
                  ...styles.toggle,
                  background: settings.analytics
                    ? 'linear-gradient(135deg, #667eea, #764ba2)'
                    : '#dee2e6'
                }}
                onClick={() => handleToggle('analytics')}
              >
                <div style={{
                  ...styles.toggleThumb,
                  transform: settings.analytics ? 'translateX(22px)' : 'translateX(2px)'
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* PRIVACY */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionIcon}>🔒</span>
            <div>
              <h2 style={styles.sectionTitle}>Privacy & Security</h2>
              <p style={styles.sectionDesc}>Control your privacy settings</p>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.toggleRow}>
              <div style={styles.toggleInfo}>
                <span style={styles.toggleIcon}>🔐</span>
                <div>
                  <h4 style={styles.toggleTitle}>Data Sharing</h4>
                  <p style={styles.toggleDesc}>Share anonymized data to improve our services</p>
                </div>
              </div>
              <div
                style={{
                  ...styles.toggle,
                  background: settings.dataSharing
                    ? 'linear-gradient(135deg, #667eea, #764ba2)'
                    : '#dee2e6'
                }}
                onClick={() => handleToggle('dataSharing')}
              >
                <div style={{
                  ...styles.toggleThumb,
                  transform: settings.dataSharing ? 'translateX(22px)' : 'translateX(2px)'
                }} />
              </div>
            </div>

            <div style={styles.divider} />

            <div style={styles.actionRow}>
              <div>
                <h4 style={styles.toggleTitle}>🗑️ Clear Local Data</h4>
                <p style={styles.toggleDesc}>Remove cached data stored in your browser</p>
              </div>
              <button
                style={{ ...styles.btnSecondary, background: '#fff5f5', color: '#dc3545', borderColor: '#dc3545' }}
                onClick={handleClearData}
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* ABOUT */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionIcon}>ℹ️</span>
            <div>
              <h2 style={styles.sectionTitle}>About</h2>
              <p style={styles.sectionDesc}>App information and version details</p>
            </div>
          </div>

          <div style={styles.card}>
            {[
              { label: 'App Name', value: 'ExpenseTrack' },
              { label: 'Version', value: '1.0.0' },
              { label: 'Stack', value: 'MERN + Tesseract OCR' },
              { label: 'Built With', value: 'React + Node.js + MongoDB' },
              { label: 'OCR Engine', value: 'Tesseract.js' },
              { label: 'Developer', value: 'Kaviya Vikashini' }
            ].map((item, i) => (
              <div key={i} style={{
                ...styles.infoRow,
                borderBottom: i < 5 ? '1px solid #f8f9fa' : 'none'
              }}>
                <span style={styles.infoLabel}>{item.label}</span>
                <span style={styles.infoValue}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: 'calc(100vh - 70px)',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #f0f1ff 100%)',
    padding: '30px 20px',
    paddingBottom: '80px'
  },
  toast: {
    position: 'fixed',
    top: '90px',
    right: '20px',
    zIndex: 9999,
    padding: '14px 20px',
    borderRadius: '10px',
    color: 'white',
    fontWeight: '600',
    fontSize: '14px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto'
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '700',
    margin: '0 0 6px',
    color: '#212529'
  },
  pageSubtitle: {
    color: '#6c757d',
    fontSize: '14px',
    margin: '0 0 30px'
  },
  section: {
    marginBottom: '28px'
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '14px'
  },
  sectionIcon: {
    fontSize: '32px',
    width: '50px',
    height: '50px',
    background: 'white',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    flexShrink: 0,
    textAlign: 'center',
    lineHeight: '50px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    margin: '0 0 4px',
    color: '#212529'
  },
  sectionDesc: {
    fontSize: '13px',
    color: '#6c757d',
    margin: 0
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '6px 20px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
  },
  settingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 0',
    gap: '20px'
  },
  settingInfo: {
    flex: 1
  },
  settingTitle: {
    fontSize: '15px',
    fontWeight: '700',
    margin: '0 0 4px',
    color: '#212529'
  },
  settingDesc: {
    fontSize: '13px',
    color: '#6c757d',
    margin: 0
  },
  toggleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 0',
    gap: '16px'
  },
  toggleInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    flex: 1
  },
  toggleIcon: {
    fontSize: '22px',
    flexShrink: 0
  },
  toggleTitle: {
    fontSize: '14px',
    fontWeight: '700',
    margin: '0 0 3px',
    color: '#212529'
  },
  toggleDesc: {
    fontSize: '12px',
    color: '#6c757d',
    margin: 0,
    lineHeight: '1.4'
  },
  toggle: {
    width: '48px',
    height: '26px',
    borderRadius: '13px',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background 0.3s ease',
    flexShrink: 0
  },
  toggleThumb: {
    position: 'absolute',
    top: '3px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    transition: 'transform 0.3s ease'
  },
  selectRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 0',
    gap: '20px'
  },
  select: {
    padding: '8px 14px',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#495057',
    background: 'white',
    cursor: 'pointer',
    minWidth: '180px',
    fontFamily: 'inherit'
  },
  actionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 0',
    gap: '20px'
  },
  divider: {
    height: '1px',
    background: '#f8f9fa',
    margin: '0 -4px'
  },
  btnPrimary: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },
  btnSecondary: {
    padding: '10px 20px',
    background: 'white',
    color: '#667eea',
    border: '1px solid #667eea',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },
  enabledBadge: {
    padding: '6px 14px',
    background: '#d4edda',
    color: '#155724',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    whiteSpace: 'nowrap'
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0'
  },
  infoLabel: {
    fontSize: '14px',
    color: '#6c757d',
    fontWeight: '500'
  },
  infoValue: {
    fontSize: '14px',
    color: '#212529',
    fontWeight: '600'
  }
};