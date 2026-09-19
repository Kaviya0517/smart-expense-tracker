import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { authAPI } from '../services/api';
export default function Profile() {
  const { user, login } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    currency: '₹',
    bio: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSaveProfile = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const response = await authAPI.updateProfile(formData);
    const updatedUser = { ...user, ...response.data.user };
    login(updatedUser, localStorage.getItem('token'));
    showToast('✅ Profile updated successfully!', 'success');
    setEditing(false);
  } catch (error) {
    showToast('❌ ' + (error.response?.data?.message || 'Failed to update'), 'error');
  } finally {
    setLoading(false);
  }
};

  const handleChangePassword = async (e) => {
  e.preventDefault();
  if (passwordData.newPassword !== passwordData.confirmPassword) {
    showToast('❌ Passwords do not match!', 'error');
    return;
  }
  setLoading(true);
  try {
    await authAPI.changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
    showToast('✅ Password changed successfully!', 'success');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordForm(false);
  } catch (error) {
    showToast('❌ ' + (error.response?.data?.message || 'Failed to change password'), 'error');
  } finally {
    setLoading(false);
  }
};

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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
        <h1 style={styles.pageTitle}>👤 My Profile</h1>

        <div style={styles.grid}>
          {/* LEFT COLUMN */}
          <div style={styles.leftCol}>
            {/* Avatar Card */}
            <div style={styles.card}>
              <div style={styles.avatarCircle}>
                {getInitials(user?.name)}
              </div>
              <h2 style={styles.userName}>{user?.name}</h2>
              <p style={styles.userEmail}>{user?.email}</p>

              <div style={styles.badgeRow}>
                <span style={styles.badge}>🗓️ Member</span>
                <span style={styles.badge}>✅ Verified</span>
              </div>

              <div style={styles.quickStats}>
                <div style={styles.quickStat}>
                  <strong style={styles.statNum}>Active</strong>
                  <span style={styles.statLabel}>Status</span>
                </div>
                <div style={styles.quickStat}>
                  <strong style={styles.statNum}>Free</strong>
                  <span style={styles.statLabel}>Plan</span>
                </div>
              </div>

              {!editing && (
                <button
                  style={styles.btnEdit}
                  onClick={() => setEditing(true)}
                >
                  ✏️ Edit Profile
                </button>
              )}
            </div>

            {/* Account Status */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Account Status</h3>
              {[
                { icon: '✅', label: 'Email Verified' },
                { icon: '🔒', label: 'Account Secure' },
                { icon: '🔔', label: 'Alerts Enabled' },
                { icon: '💳', label: 'Free Plan Active' }
              ].map((item, i) => (
                <div key={i} style={styles.statusItem}>
                  <span>{item.icon}</span>
                  <span style={styles.statusLabel}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={styles.rightCol}>
            {/* Personal Info */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Personal Information</h3>
                {!editing && (
                  <button style={styles.btnText} onClick={() => setEditing(true)}>
                    ✏️ Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveProfile}>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Full Name</label>
                    <input
                      style={{
                        ...styles.input,
                        background: editing ? 'white' : '#f8f9fa',
                        cursor: editing ? 'text' : 'not-allowed'
                      }}
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!editing}
                      placeholder="Your full name"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Email Address</label>
                    <input
                      style={{
                        ...styles.input,
                        background: editing ? 'white' : '#f8f9fa',
                        cursor: editing ? 'text' : 'not-allowed'
                      }}
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!editing}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Phone Number</label>
                    <input
                      style={{
                        ...styles.input,
                        background: editing ? 'white' : '#f8f9fa',
                        cursor: editing ? 'text' : 'not-allowed'
                      }}
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!editing}
                      placeholder="+91 9876543210"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Preferred Currency</label>
                    <select
                      style={{
                        ...styles.input,
                        background: editing ? 'white' : '#f8f9fa',
                        cursor: editing ? 'pointer' : 'not-allowed'
                      }}
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      disabled={!editing}
                    >
                      <option value="₹">₹ Indian Rupee (INR)</option>
                      <option value="$">$ US Dollar (USD)</option>
                      <option value="€">€ Euro (EUR)</option>
                      <option value="£">£ British Pound (GBP)</option>
                    </select>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Bio</label>
                  <textarea
                    style={{
                      ...styles.input,
                      height: '80px',
                      resize: 'vertical',
                      background: editing ? 'white' : '#f8f9fa',
                      cursor: editing ? 'text' : 'not-allowed'
                    }}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    disabled={!editing}
                    placeholder="A short bio about yourself..."
                  />
                </div>

                {editing && (
                  <div style={styles.formActions}>
                    <button type="submit" style={styles.btnSave} disabled={loading}>
                      {loading ? 'Saving...' : '✅ Save Changes'}
                    </button>
                    <button
                      type="button"
                      style={styles.btnCancel}
                      onClick={() => {
                        setEditing(false);
                        setFormData({ name: user?.name || '', email: user?.email || '', phone: '', currency: '₹', bio: '' });
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Change Password */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>🔒 Change Password</h3>
                <button
                  style={styles.btnText}
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                >
                  {showPasswordForm ? 'Cancel' : 'Change'}
                </button>
              </div>

              {!showPasswordForm ? (
                <p style={styles.mutedText}>
                  Keep your account secure by using a strong password. Click "Change" to update it.
                </p>
              ) : (
                <form onSubmit={handleChangePassword}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Current Password</label>
                    <input
                      style={styles.input}
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                      required
                    />
                  </div>
                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>New Password</label>
                      <input
                        style={styles.input}
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="Min 6 characters"
                        required
                        minLength={6}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Confirm Password</label>
                      <input
                        style={styles.input}
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="Repeat new password"
                        required
                      />
                    </div>
                  </div>
                  <div style={styles.formActions}>
                    <button type="submit" style={styles.btnSave} disabled={loading}>
                      {loading ? 'Updating...' : '🔒 Update Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Danger Zone */}
            <div style={{ ...styles.card, borderLeft: '4px solid #dc3545' }}>
              <h3 style={{ ...styles.cardTitle, color: '#dc3545' }}>⚠️ Danger Zone</h3>
              <p style={styles.mutedText}>
                Once you delete your account, all your data will be permanently removed and cannot be recovered.
              </p>
              <button
                style={styles.btnDanger}
                onClick={() => {
                  if (window.confirm('Are you absolutely sure? This cannot be undone!')) {
                    showToast('Contact support to delete your account.', 'error');
                  }
                }}
              >
                🗑️ Delete My Account
              </button>
            </div>
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
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    animation: 'slideIn 0.4s ease'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '24px',
    color: '#212529'
  },
 // Replace with:
grid: {
  display: 'grid',
  gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '300px 1fr',
  gap: '24px',
  alignItems: 'start'
},
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
  },
  avatarCircle: {
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    fontSize: '32px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px'
  },
  userName: {
    textAlign: 'center',
    fontSize: '20px',
    fontWeight: '700',
    margin: '0 0 6px',
    color: '#212529'
  },
  userEmail: {
    textAlign: 'center',
    color: '#6c757d',
    fontSize: '14px',
    margin: '0 0 16px'
  },
  badgeRow: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
    marginBottom: '16px',
    flexWrap: 'wrap'
  },
  badge: {
    padding: '4px 12px',
    background: '#f0f1ff',
    color: '#667eea',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  },
  quickStats: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '16px 0',
    borderTop: '1px solid #e9ecef',
    borderBottom: '1px solid #e9ecef',
    marginBottom: '16px'
  },
  quickStat: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  statNum: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#667eea'
  },
  statLabel: {
    fontSize: '12px',
    color: '#6c757d'
  },
  btnEdit: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer'
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    margin: '0 0 16px',
    color: '#212529'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  statusItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 0',
    borderBottom: '1px solid #f8f9fa'
  },
  statusLabel: {
    fontSize: '14px',
    color: '#495057',
    fontWeight: '500'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '16px'
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#495057'
  },
  input: {
    padding: '10px 14px',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    fontSize: '14px',
    width: '100%',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border 0.3s'
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px'
  },
  btnSave: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer'
  },
  btnCancel: {
    padding: '12px 24px',
    background: '#f8f9fa',
    color: '#6c757d',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer'
  },
  btnText: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '4px 8px'
  },
  mutedText: {
    color: '#6c757d',
    fontSize: '14px',
    margin: '0',
    lineHeight: '1.6'
  },
  btnDanger: {
    marginTop: '12px',
    padding: '12px 24px',
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer'
  }
};