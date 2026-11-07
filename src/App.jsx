import { useState } from 'react';
import './App.css';
import Summary from './components/Summary.jsx';
import CategorySpendChart from './components/CategorySpendChart.jsx';
import TransactionForm from './components/TransactionForm.jsx';
import TransactionList from './components/TransactionList.jsx';

const initialTransactions = [
  { id: 1, description: 'Salary', amount: 5000, type: 'income', category: 'salary', date: '2025-01-01' },
  { id: 2, description: 'Rent', amount: 1200, type: 'expense', category: 'housing', date: '2025-01-02' },
  { id: 3, description: 'Groceries', amount: 150, type: 'expense', category: 'food', date: '2025-01-03' },
  { id: 4, description: 'Freelance Work', amount: 800, type: 'income', category: 'salary', date: '2025-01-05' },
  { id: 5, description: 'Electric Bill', amount: 95, type: 'expense', category: 'utilities', date: '2025-01-06' },
  { id: 6, description: 'Dinner Out', amount: 65, type: 'expense', category: 'food', date: '2025-01-07' },
  { id: 7, description: 'Gas', amount: 45, type: 'expense', category: 'transport', date: '2025-01-08' },
  { id: 8, description: 'Netflix', amount: 15, type: 'expense', category: 'entertainment', date: '2025-01-10' },
];

function App() {
  const [transactions, setTransactions] = useState(initialTransactions);

  const handleAddTransaction = (transaction) => {
    setTransactions((currentTransactions) => [
      {
        ...transaction,
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
      },
      ...currentTransactions,
    ]);
  };

  const handleDeleteTransaction = (transactionId) => {
    setTransactions((currentTransactions) =>
      currentTransactions.filter((transaction) => transaction.id !== transactionId)
    );
  };

  return (
    <div className="app">
      {/* Top Navigation & Brand Header */}
      <header className="app-header">
        <div className="brand-group">
          <div className="brand-icon-box" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="3" />
              <line x1="2" y1="10" x2="22" y2="10" />
              <circle cx="18" cy="15" r="1.5" />
            </svg>
          </div>
          <div>
            <h1>Finance Tracker</h1>
            <p className="subtitle">Real-time cashflow, category allocation, and personal ledger</p>
          </div>
        </div>

        <div className="header-meta">
          <div className="period-pill">
            <span className="pulse-dot" aria-hidden="true" />
            <span>Active Accounting Cycle</span>
          </div>
        </div>
      </header>

      {/* Main KPI Summary Metrics */}
      <Summary transactions={transactions} />

      {/* Interactive Middle Split: Chart & Entry Form */}
      <div className="dashboard-grid">
        <div className="dashboard-chart-column">
          <CategorySpendChart transactions={transactions} />
        </div>
        <div className="dashboard-form-column">
          <TransactionForm onAddTransaction={handleAddTransaction} />
        </div>
      </div>

      {/* Full Width Ledger History */}
      <TransactionList
        transactions={transactions}
        onDeleteTransaction={handleDeleteTransaction}
      />

      {/* Polite Footer */}
      <footer className="app-footer">
        <span>Finance Tracker · Built with precision and care</span>
      </footer>
    </div>
  );
}

export default App;
