import React, { useState, useEffect } from 'react';
import { budgetAPI } from '../services/api';
import '../styles/Budget.css';

export default function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Groceries',
    limit: 0,
    alertThreshold: 80
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const budgetsRes = await budgetAPI.getBudgets();
      const alertsRes = await budgetAPI.checkAlerts();
      setBudgets(budgetsRes.data);
      setAlerts(alertsRes.data.alerts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.limit || formData.limit <= 0) {
      alert('Please enter a valid budget limit');
      return;
    }

    try {
      if (editingId) {
        await budgetAPI.updateBudget(editingId, formData);
        alert('Budget updated successfully');
        setEditingId(null);
      } else {
        await budgetAPI.createBudget(formData);
        alert('Budget created successfully');
      }

      setFormData({ category: 'Groceries', limit: 0, alertThreshold: 80 });
      setShowForm(false);
      fetchData();
    } catch (error) {
      alert('Error: ' + error.response?.data?.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await budgetAPI.deleteBudget(id);
        alert('Budget deleted');
        fetchData();
      } catch (error) {
        alert('Error: ' + error.response?.data?.message);
      }
    }
  };

  const handleEdit = (budget) => {
    setFormData({
      category: budget.category,
      limit: budget.limit,
      alertThreshold: budget.alertThreshold
    });
    setEditingId(budget._id);
    setShowForm(true);
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>💰 Budget Management</h1>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div style={{ background: '#fff3cd', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ffc107' }}>
          <h3 style={{ color: '#856404', marginTop: 0 }}>⚠️ Budget Alerts</h3>
          {alerts.map((alert, index) => (
            <div key={index} style={{ marginBottom: '10px', padding: '10px', background: 'white', borderRadius: '5px' }}>
              <strong>{alert.category}</strong> — {alert.percentageUsed}% used
              <div style={{ fontSize: '14px', color: '#666' }}>
                Spent: ₹{alert.spent.toFixed(2)} / ₹{alert.limit.toFixed(2)} 
                {alert.status === 'exceeded' && <span style={{ color: '#dc3545' }}> (EXCEEDED!)</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (editingId) setEditingId(null);
          }}
          style={{
            padding: '10px 20px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: showForm ? '20px' : 0
          }}
        >
          {showForm ? 'Cancel' : '+ Add New Budget'}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ddd',
                  fontSize: '14px'
                }}
              >
                <option>Groceries</option>
                <option>Food & Dining</option>
                <option>Transport</option>
                <option>Medical</option>
                <option>Entertainment</option>
                <option>Office & Supplies</option>
                <option>Travel</option>
                <option>Shopping</option>
                <option>Utilities</option>
                <option>Other</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Monthly Limit (₹)</label>
              <input
                type="number"
                value={formData.limit}
                onChange={(e) => setFormData({ ...formData, limit: parseFloat(e.target.value) })}
                placeholder="Enter budget limit"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ddd',
                  fontSize: '14px'
                }}
                required
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Alert Threshold (%)</label>
              <input
                type="number"
                value={formData.alertThreshold}
                onChange={(e) => setFormData({ ...formData, alertThreshold: parseInt(e.target.value) })}
                min="1"
                max="100"
                placeholder="Alert when spending reaches this %"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ddd',
                  fontSize: '14px'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                padding: '10px 20px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {editingId ? 'Update Budget' : 'Create Budget'}
            </button>
          </form>
        )}
      </div>

      {/* Budgets List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {budgets.map((budget) => {
          const percentageUsed = parseFloat(budget.percentageUsed);
          const barColor = percentageUsed >= 100 ? '#dc3545' : percentageUsed >= 80 ? '#ffc107' : '#28a745';

          return (
            <div key={budget._id} style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginTop: 0, color: '#333' }}>{budget.category}</h3>
              
              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px' }}>
                  <span>Spent: ₹{budget.spent.toFixed(2)}</span>
                  <span>Limit: ₹{budget.limit.toFixed(2)}</span>
                </div>
                <div style={{ background: '#eee', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min(percentageUsed, 100)}%`,
                      height: '100%',
                      background: barColor,
                      transition: 'width 0.3s'
                    }}
                  />
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  {percentageUsed}% used | ₹{budget.remaining.toFixed(2)} remaining
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleEdit(budget)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(budget._id)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {budgets.length === 0 && !showForm && (
        <p style={{ textAlign: 'center', color: '#999', padding: '40px 20px' }}>
          No budgets yet. Create one to get started!
        </p>
      )}
    </div>
  );
}