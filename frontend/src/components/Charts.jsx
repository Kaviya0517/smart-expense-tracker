import React from 'react';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140'];

export function CategoryChart({ data }) {
  // Transform stats into chart data
  const chartData = Object.entries(data.expensesByCategory || {}).map(([name, count]) => ({
    name,
    count
  }));

  if (chartData.length === 0) {
    return <p style={{ textAlign: 'center', color: '#999' }}>No data to display</p>;
  }

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
      <h3>Expenses by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#667eea" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryPieChart({ expenses }) {
  // Calculate total by category
  const categoryTotals = {};
  expenses.forEach(expense => {
    categoryTotals[expense.category] = 
      (categoryTotals[expense.category] || 0) + expense.amount;
  });

  const chartData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2))
  }));

  if (chartData.length === 0) {
    return <p style={{ textAlign: 'center', color: '#999' }}>No data to display</p>;
  }

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
      <h3>Spending Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ₹${value}`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `₹${value}`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DailySpendingChart({ expenses }) {
  // Group expenses by date
  const dailyData = {};
  expenses.forEach(expense => {
    const date = new Date(expense.date).toLocaleDateString();
    dailyData[date] = (dailyData[date] || 0) + expense.amount;
  });

  const chartData = Object.entries(dailyData)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .map(([date, amount]) => ({
      date,
      amount: parseFloat(amount.toFixed(2))
    }));

  if (chartData.length === 0) {
    return <p style={{ textAlign: 'center', color: '#999' }}>No data to display</p>;
  }

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
      <h3>Daily Spending Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            angle={-45} 
            textAnchor="end" 
            height={100}
            interval={Math.max(0, Math.floor(chartData.length / 7))}
          />
          <YAxis />
          <Tooltip formatter={(value) => `₹${value}`} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="amount" 
            stroke="#667eea" 
            strokeWidth={2}
            dot={{ fill: '#667eea', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}