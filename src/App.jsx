import React, { useState, useMemo, useEffect } from 'react';
import { TrendingUp, TrendingDown, Plus, Edit2, Search, Download, Moon, Sun } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FinanceDashboard = () => {
  const initialTransactions = [
    { id: 1, date: '2024-04-01', amount: 2500, category: 'Salary', type: 'income', description: 'Monthly salary' },
    { id: 2, date: '2024-04-02', amount: 120, category: 'Groceries', type: 'expense', description: 'Weekly shopping' },
    { id: 3, date: '2024-04-03', amount: 45, category: 'Transport', type: 'expense', description: 'Gas' },
    { id: 4, date: '2024-04-05', amount: 500, category: 'Utilities', type: 'expense', description: 'Electric bill' },
    { id: 5, date: '2024-04-06', amount: 1200, category: 'Rent', type: 'expense', description: 'Monthly rent' },
    { id: 6, date: '2024-04-08', amount: 80, category: 'Entertainment', type: 'expense', description: 'Movie tickets' },
    { id: 7, date: '2024-04-10', amount: 200, category: 'Groceries', type: 'expense', description: 'Costco' },
    { id: 8, date: '2024-04-12', amount: 1500, category: 'Investment', type: 'income', description: 'Stock dividend' },
    { id: 9, date: '2024-04-15', amount: 60, category: 'Transport', type: 'expense', description: 'Uber' },
    { id: 10, date: '2024-04-18', amount: 150, category: 'Healthcare', type: 'expense', description: 'Doctor visit' },
    { id: 11, date: '2024-04-20', amount: 2500, category: 'Salary', type: 'income', description: 'Monthly salary' },
    { id: 12, date: '2024-04-22', amount: 90, category: 'Entertainment', type: 'expense', description: 'Dinner' },
  ];

  // Load dark mode from localStorage
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('darkMode');
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  // Load role from localStorage
  const [role, setRole] = useState(() => {
    try {
      const saved = localStorage.getItem('role');
      return saved || 'viewer';
    } catch {
      return 'viewer';
    }
  });

  // Load transactions from localStorage
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem('transactions');
      return saved ? JSON.parse(saved) : initialTransactions;
    } catch {
      return initialTransactions;
    }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newTransaction, setNewTransaction] = useState({
    date: '',
    amount: '',
    category: 'Groceries',
    type: 'expense',
    description: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);

  // Save dark mode to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('darkMode', JSON.stringify(darkMode));
    } catch (e) {
      console.error('Error saving dark mode:', e);
    }
  }, [darkMode]);

  // Save role to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('role', role);
    } catch (e) {
      console.error('Error saving role:', e);
    }
  }, [role]);

  // Save transactions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('transactions', JSON.stringify(transactions));
    } catch (e) {
      console.error('Error saving transactions:', e);
    }
  }, [transactions]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpenses;
    return { totalIncome, totalExpenses, balance };
  }, [transactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch =
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [transactions, searchTerm, selectedCategory]);

  // Category spending
  const categorySpending = useMemo(() => {
    const grouped = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        grouped[t.category] = (grouped[t.category] || 0) + t.amount;
      });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  // Monthly trend
  const monthlyTrend = useMemo(() => {
    const trend = {};
    transactions.forEach(t => {
      const month = t.date.substring(0, 7);
      if (!trend[month]) trend[month] = { month, income: 0, expense: 0 };
      if (t.type === 'income') trend[month].income += t.amount;
      else trend[month].expense += t.amount;
    });
    return Object.values(trend).sort((a, b) => a.month.localeCompare(b.month));
  }, [transactions]);

  // Insights
  const insights = useMemo(() => {
    if (categorySpending.length === 0) {
      return { topCategory: null, savingsRate: 0, avgTransaction: 0 };
    }
    const topCategory = categorySpending.reduce((max, curr) =>
      curr.value > max.value ? curr : max,
      categorySpending[0]
    );
    const savingsRate =
      metrics.totalIncome > 0
        ? ((metrics.balance / metrics.totalIncome) * 100).toFixed(1)
        : 0;
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const avgTransaction =
      expenseTransactions.length > 0
        ? (metrics.totalExpenses / expenseTransactions.length).toFixed(0)
        : 0;
    return { topCategory, savingsRate, avgTransaction };
  }, [categorySpending, metrics, transactions]);

  // Handle add transaction
  const handleAddTransaction = () => {
    if (newTransaction.date && newTransaction.amount) {
      const nextId = Math.max(...transactions.map(t => t.id), 0) + 1;
      setTransactions([
        ...transactions,
        {
          ...newTransaction,
          id: nextId,
          amount: parseFloat(newTransaction.amount)
        }
      ]);
      setNewTransaction({
        date: '',
        amount: '',
        category: 'Groceries',
        type: 'expense',
        description: ''
      });
      setShowAddForm(false);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
    const rows = filteredTransactions.map(t => [
      t.date,
      t.description,
      t.category,
      t.type,
      t.amount
    ]);

    const csv = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? 'bg-slate-950 text-white'
          : 'bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900'
      }`}
    >
      {/* Header */}
      <div
        className={`${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        } border-b shadow-sm sticky top-0 z-50`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg ${
                darkMode ? 'bg-blue-600' : 'bg-blue-500'
              } flex items-center justify-center text-white font-bold`}
            >
              ₹
            </div>
            <h1 className="text-2xl font-bold">FinanceHub</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium opacity-75">Role:</span>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium cursor-pointer transition-colors ${
                  darkMode
                    ? 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                    : 'bg-slate-100 border-slate-300 hover:bg-slate-200'
                }`}
              >
                <option value="viewer">Viewer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-200 hover:bg-slate-300'
              }`}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Total Balance',
              value: `₹${metrics.balance.toLocaleString()}`,
              icon: TrendingUp,
              color: 'blue'
            },
            {
              title: 'Total Income',
              value: `₹${metrics.totalIncome.toLocaleString()}`,
              icon: TrendingUp,
              color: 'green'
            },
            {
              title: 'Total Expenses',
              value: `₹${metrics.totalExpenses.toLocaleString()}`,
              icon: TrendingDown,
              color: 'red'
            }
          ].map((card, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl transition-all duration-300 hover:shadow-lg transform hover:scale-105 ${
                darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:shadow-xl'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-medium opacity-75">{card.title}</h3>
                <div
                  className={`p-2 rounded-lg ${
                    card.color === 'blue'
                      ? darkMode
                        ? 'bg-blue-900'
                        : 'bg-blue-100'
                      : card.color === 'green'
                      ? darkMode
                        ? 'bg-green-900'
                        : 'bg-green-100'
                      : darkMode
                      ? 'bg-red-900'
                      : 'bg-red-100'
                  }`}
                >
                  <card.icon
                    size={20}
                    className={
                      card.color === 'blue'
                        ? 'text-blue-500'
                        : card.color === 'green'
                        ? 'text-green-500'
                        : 'text-red-500'
                    }
                  />
                </div>
              </div>
              <p className="text-3xl font-bold">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trend */}
          <div className={`p-6 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <h2 className="text-lg font-bold mb-4">Monthly Trend</h2>
            {monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={darkMode ? '#334155' : '#e2e8f0'}
                  />
                  <XAxis dataKey="month" stroke={darkMode ? '#94a3b8' : '#64748b'} />
                  <YAxis stroke={darkMode ? '#94a3b8' : '#64748b'} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: darkMode ? '#1e293b' : '#fff',
                      border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className={`h-80 flex items-center justify-center rounded-lg ${
                darkMode ? 'bg-slate-700' : 'bg-slate-100'
              }`}>
                <p className="text-center opacity-50">No data available for monthly trend</p>
              </div>
            )}
          </div>

          {/* Category Breakdown */}
          <div className={`p-6 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <h2 className="text-lg font-bold mb-4">Spending by Category</h2>
            {categorySpending.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categorySpending}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ₹${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categorySpending.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={value => `₹${value}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className={`h-80 flex items-center justify-center rounded-lg ${
                darkMode ? 'bg-slate-700' : 'bg-slate-100'
              }`}>
                <p className="text-center opacity-50">No expense data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Insights Section */}
        <div className={`p-6 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <h2 className="text-lg font-bold mb-4">Financial Insights</h2>
          {transactions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  label: 'Top Spending Category',
                  value: insights.topCategory?.name || 'N/A',
                  subvalue: insights.topCategory ? `₹${insights.topCategory?.value}` : 'No expenses'
                },
                {
                  label: 'Savings Rate',
                  value: `${insights.savingsRate}%`,
                  subvalue: 'of income saved'
                },
                {
                  label: 'Avg Transaction',
                  value: `₹${insights.avgTransaction}`,
                  subvalue: 'per expense'
                }
              ].map((insight, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}
                >
                  <p className="text-sm opacity-75 mb-1">{insight.label}</p>
                  <p className="text-2xl font-bold">{insight.value}</p>
                  <p className="text-sm opacity-60">{insight.subvalue}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className={`p-8 rounded-lg text-center ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <p className="opacity-50">No transactions to analyze</p>
            </div>
          )}
        </div>

        {/* Transactions Section */}
        <div className={`p-6 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
            <h2 className="text-lg font-bold">Transactions</h2>
            <div className="flex gap-2">
              {role === 'admin' && (
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <Plus size={18} /> Add Transaction
                </button>
              )}
              {filteredTransactions.length > 0 && (
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  <Download size={18} /> Export CSV
                </button>
              )}
            </div>
          </div>

          {/* Add Transaction Form */}
          {showAddForm && role === 'admin' && (
            <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
                <input
                  type="date"
                  value={newTransaction.date}
                  onChange={e => setNewTransaction({ ...newTransaction, date: e.target.value })}
                  className={`px-3 py-2 rounded border text-sm ${
                    darkMode ? 'bg-slate-600 border-slate-500 text-white' : 'bg-white border-slate-300'
                  }`}
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={newTransaction.amount}
                  onChange={e => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                  className={`px-3 py-2 rounded border text-sm ${
                    darkMode ? 'bg-slate-600 border-slate-500 text-white' : 'bg-white border-slate-300'
                  }`}
                />
                <select
                  value={newTransaction.category}
                  onChange={e => setNewTransaction({ ...newTransaction, category: e.target.value })}
                  className={`px-3 py-2 rounded border text-sm ${
                    darkMode ? 'bg-slate-600 border-slate-500 text-white' : 'bg-white border-slate-300'
                  }`}
                >
                  <option>Groceries</option>
                  <option>Transport</option>
                  <option>Utilities</option>
                  <option>Rent</option>
                  <option>Entertainment</option>
                  <option>Healthcare</option>
                  <option>Salary</option>
                  <option>Investment</option>
                </select>
                <select
                  value={newTransaction.type}
                  onChange={e => setNewTransaction({ ...newTransaction, type: e.target.value })}
                  className={`px-3 py-2 rounded border text-sm ${
                    darkMode ? 'bg-slate-600 border-slate-500 text-white' : 'bg-white border-slate-300'
                  }`}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
                <input
                  type="text"
                  placeholder="Description"
                  value={newTransaction.description}
                  onChange={e =>
                    setNewTransaction({ ...newTransaction, description: e.target.value })
                  }
                  className={`px-3 py-2 rounded border text-sm ${
                    darkMode ? 'bg-slate-600 border-slate-500 text-white' : 'bg-white border-slate-300'
                  }`}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddTransaction}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                    darkMode ? 'bg-slate-600 hover:bg-slate-500' : 'bg-slate-200 hover:bg-slate-300'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border text-sm ${
                  darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300'
                }`}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className={`px-4 py-2 rounded-lg border text-sm ${
                darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300'
              }`}
            >
              <option value="all">All Categories</option>
              {[...new Set(transactions.map(t => t.category))].map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Transactions Table */}
          {filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className={`border-b ${
                      darkMode ? 'border-slate-700' : 'border-slate-200'
                    }`}
                  >
                    <th className="text-left py-3 px-4 font-semibold">Date</th>
                    <th className="text-left py-3 px-4 font-semibold">Description</th>
                    <th className="text-left py-3 px-4 font-semibold">Category</th>
                    <th className="text-left py-3 px-4 font-semibold">Type</th>
                    <th className="text-right py-3 px-4 font-semibold">Amount</th>
                    {role === 'admin' && (
                      <th className="text-center py-3 px-4 font-semibold">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map(tx => (
                    <tr
                      key={tx.id}
                      className={`border-b ${
                        darkMode
                          ? 'border-slate-700 hover:bg-slate-700'
                          : 'border-slate-200 hover:bg-slate-50'
                      } transition-colors`}
                    >
                      <td className="py-3 px-4">{tx.date}</td>
                      <td className="py-3 px-4">{tx.description}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            tx.type === 'income'
                              ? darkMode
                                ? 'bg-green-900 text-green-200'
                                : 'bg-green-100 text-green-700'
                              : darkMode
                              ? 'bg-red-900 text-red-200'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="capitalize text-xs font-medium opacity-75">
                          {tx.type}
                        </span>
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-semibold ${
                          tx.type === 'income' ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                      </td>
                      {role === 'admin' && (
                        <td className="py-3 px-4 text-center">
                          <button
                            className={`p-1 rounded transition-colors ${
                              darkMode ? 'hover:bg-slate-600' : 'hover:bg-slate-200'
                            }`}
                          >
                            <Edit2 size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div
              className={`p-12 rounded-lg text-center ${
                darkMode ? 'bg-slate-700' : 'bg-slate-50'
              }`}
            >
              <div className="mb-3 text-4xl opacity-20">📭</div>
              <p className="text-lg font-semibold mb-2">No transactions found</p>
              <p className="text-sm opacity-60">
                {searchTerm || selectedCategory !== 'all'
                  ? 'Try adjusting your filters'
                  : role === 'admin'
                  ? 'Click "Add Transaction" to get started'
                  : 'No transactions available'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
