import React, { useState, useEffect } from 'react';
import { expenseAPI } from '../services/api';
import { CategoryChart, CategoryPieChart, DailySpendingChart } from '../components/Charts';
import '../styles/Analytics.css';

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const statsRes = await expenseAPI.getStats();
      const expensesRes = await expenseAPI.getAllExpenses();
      setStats(statsRes.data);
      setExpenses(expensesRes.data.expenses);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const getFilteredExpenses = () => {
    if (filterCategory === 'All') {
      return expenses;
    }
    return expenses.filter(exp => exp.category === filterCategory);
  };

  const filteredExpenses = getFilteredExpenses();

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1>📊 Analytics & Reports</h1>

      {/* Filter Section */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>Filter by Category</h3>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            padding: '10px 15px',
            fontSize: '14px',
            borderRadius: '5px',
            border: '1px solid #ddd',
            cursor: 'pointer'
          }}
        >
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

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ margin: 0, color: '#999', fontSize: '14px' }}>Total Expenses</h3>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#667eea', marginTop: '10px' }}>
            {filteredExpenses.length}
          </div>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ margin: 0, color: '#999', fontSize: '14px' }}>Total Spent</h3>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#667eea', marginTop: '10px' }}>
            ₹{filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
          </div>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ margin: 0, color: '#999', fontSize: '14px' }}>Average Expense</h3>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#667eea', marginTop: '10px' }}>
            ₹{filteredExpenses.length > 0 ? (filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0) / filteredExpenses.length).toFixed(2) : '0'}
          </div>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ margin: 0, color: '#999', fontSize: '14px' }}>Highest Expense</h3>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#667eea', marginTop: '10px' }}>
            ₹{filteredExpenses.length > 0 ? Math.max(...filteredExpenses.map(e => e.amount)).toFixed(2) : '0'}
          </div>
        </div>
      </div>

      {/* Charts */}
      {filterCategory === 'All' && (
        <>
          <CategoryChart data={stats} />
          <CategoryPieChart expenses={filteredExpenses} />
          <DailySpendingChart expenses={filteredExpenses} />
        </>
      )}

      {filterCategory !== 'All' && (
        <DailySpendingChart expenses={filteredExpenses} />
      )}
    </div>
  );
}