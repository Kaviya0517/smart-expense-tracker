import React, { useState, useEffect } from 'react';
import { expenseAPI } from '../services/api';
import '../styles/ExpenseList.css';

export default function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('date-desc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    merchant: '',
    amount: 0,
    category: 'Groceries',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  useEffect(() => {
    fetchExpenses();
  }, [filterCategory, sortBy, startDate, endDate]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = {};

      if (filterCategory !== 'All') {
        params.category = filterCategory;
      }
      if (sortBy) {
        params.sortBy = sortBy;
      }
      if (startDate) {
        params.startDate = startDate;
      }
      if (endDate) {
        params.endDate = endDate;
      }

      const response = await expenseAPI.getAllExpenses(params);
      setExpenses(response.data.expenses);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();

    if (!formData.merchant || !formData.amount) {
      alert('Please fill all required fields');
      return;
    }

    try {
      await expenseAPI.createExpense(formData);
      alert('Expense added successfully');
      setFormData({
        merchant: '',
        amount: 0,
        category: 'Groceries',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
      setShowForm(false);
      fetchExpenses();
    } catch (error) {
      alert('Error: ' + error.response?.data?.message);
    }
  };

  const handleEditExpense = (expense) => {
    setEditingId(expense._id);
    setEditData({
      merchant: expense.merchant,
      amount: expense.amount,
      category: expense.category,
      description: expense.description
    });
  };

  const handleSaveEdit = async (id) => {
    try {
      await expenseAPI.updateExpense(id, editData);
      alert('Expense updated successfully');
      setEditingId(null);
      fetchExpenses();
    } catch (error) {
      alert('Error: ' + error.response?.data?.message);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseAPI.deleteExpense(id);
        alert('Expense deleted');
        fetchExpenses();
      } catch (error) {
        alert('Error: ' + error.response?.data?.message);
      }
    }
  };

  const handleExportCSV = () => {
    if (expenses.length === 0) {
      alert('No expenses to export');
      return;
    }

    // Prepare CSV content
    const headers = ['Date', 'Merchant', 'Amount', 'Category', 'Description', 'Type'];
    const rows = expenses.map(exp => [
      new Date(exp.date).toLocaleDateString(),
      exp.merchant,
      exp.amount,
      exp.category,
      exp.description || '',
      exp.isManual ? 'Manual' : 'Receipt'
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1>📋 All Expenses</h1>

      {/* Filter & Sort Section */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Category</label>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option>All</option>
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

        <div className="filter-group">
          <label>Sort By</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
        </div>

        <div className="filter-group">
          <label>From Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>To Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <button
          onClick={() => {
            setStartDate('');
            setEndDate('');
            setFilterCategory('All');
            setSortBy('date-desc');
          }}
          className="btn-reset"
        >
          Reset Filters
        </button>

        <button onClick={handleExportCSV} className="btn-export">
          📥 Export CSV
        </button>

        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-add"
        >
          {showForm ? '✕ Cancel' : '+ Add Expense'}
        </button>
      </div>

      {/* Add Expense Form */}
      {showForm && (
        <div className="add-expense-form">
          <h3>Add New Expense</h3>
          <form onSubmit={handleAddExpense}>
            <div className="form-row">
              <div className="form-group">
                <label>Merchant</label>
                <input
                  type="text"
                  placeholder="Shop name"
                  value={formData.merchant}
                  onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  required
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                placeholder="Optional description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <button type="submit" className="btn-submit">
              Save Expense
            </button>
          </form>
        </div>
      )}

      {/* Expenses Table */}
      <div className="expenses-table-container">
        {expenses.length === 0 ? (
          <p className="empty-message">No expenses found. Add one to get started!</p>
        ) : (
          <table className="expenses-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Merchant</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense._id}>
                  <td>{new Date(expense.date).toLocaleDateString()}</td>
                  <td>
                    {editingId === expense._id ? (
                      <input
                        type="text"
                        value={editData.merchant}
                        onChange={(e) => setEditData({ ...editData, merchant: e.target.value })}
                        className="edit-input"
                      />
                    ) : (
                      expense.merchant
                    )}
                  </td>
                  <td>
                    {editingId === expense._id ? (
                      <select
                        value={editData.category}
                        onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                        className="edit-input"
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
                    ) : (
                      <span className="category-badge">{expense.category}</span>
                    )}
                  </td>
                  <td>{expense.description || '—'}</td>
                  <td className="amount">
                    {editingId === expense._id ? (
                      <input
                        type="number"
                        value={editData.amount}
                        onChange={(e) => setEditData({ ...editData, amount: parseFloat(e.target.value) })}
                        className="edit-input"
                        step="0.01"
                      />
                    ) : (
                      `₹${expense.amount.toFixed(2)}`
                    )}
                  </td>
                  <td>
                    <span className={expense.isManual ? 'badge-manual' : 'badge-receipt'}>
                      {expense.isManual ? 'Manual' : 'Receipt'}
                    </span>
                  </td>
                  <td className="actions">
                    {editingId === expense._id ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(expense._id)}
                          className="btn-save"
                        >
                          ✓ Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="btn-cancel"
                        >
                          ✕ Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditExpense(expense)}
                          className="btn-edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense._id)}
                          className="btn-delete"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary */}
      {expenses.length > 0 && (
        <div className="summary-section">
          <div className="summary-card">
            <h4>Total Expenses</h4>
            <p>₹{expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}</p>
          </div>
          <div className="summary-card">
            <h4>Count</h4>
            <p>{expenses.length}</p>
          </div>
          <div className="summary-card">
            <h4>Average</h4>
            <p>₹{(expenses.reduce((sum, exp) => sum + exp.amount, 0) / expenses.length).toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
}