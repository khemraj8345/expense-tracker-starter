import { useState } from 'react';
import { TRANSACTION_CATEGORIES, CATEGORY_COLORS } from '../constants/categories.js';

function formatCurrency(val) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-');
    if (year && month && day) {
      const date = new Date(Number(year), Number(month) - 1, Number(day));
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  } catch {
    // fallback
  }
  return dateStr;
}

function TransactionList({ transactions, onDeleteTransaction }) {
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const isFiltered = filterType !== 'all' || filterCategory !== 'all' || searchQuery.trim() !== '';

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
    const matchesSearch = searchQuery.trim() === '' ||
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase().trim());
    return matchesType && matchesCategory && matchesSearch;
  });

  const handleClearFilters = () => {
    setFilterType('all');
    setFilterCategory('all');
    setSearchQuery('');
  };

  return (
    <div className="transactions">
      <div className="transactions-header">
        <div>
          <h2>Transaction History</h2>
          <span className="card-subtitle">Detailed ledger and activity log</span>
        </div>
        <div className="transactions-count-badge">
          {filteredTransactions.length} {filteredTransactions.length === 1 ? 'transaction' : 'transactions'}
          {isFiltered && ` (filtered from ${transactions.length})`}
        </div>
      </div>

      <div className="filters-bar">
        {/* Search input */}
        <div className="search-box">
          <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search transactions"
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="filters">
          <div className="select-wrapper">
            <select
              value={filterType}
              onChange={(event) => setFilterType(event.target.value)}
              aria-label="Filter by type"
            >
              <option value="all">All Types</option>
              <option value="income">Income Only</option>
              <option value="expense">Expenses Only</option>
            </select>
            <span className="select-arrow" aria-hidden="true">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </span>
          </div>

          <div className="select-wrapper">
            <select
              value={filterCategory}
              onChange={(event) => setFilterCategory(event.target.value)}
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              {TRANSACTION_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            <span className="select-arrow" aria-hidden="true">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </span>
          </div>

          {isFiltered && (
            <button
              type="button"
              className="reset-filters-btn"
              onClick={handleClearFilters}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="table-empty-state">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          <p className="empty-title">No transactions found</p>
          <p className="empty-desc">
            {isFiltered
              ? 'Try adjusting your search query or filter selections.'
              : 'Add your first transaction above to get started.'}
          </p>
          {isFiltered && (
            <button type="button" className="btn-secondary" onClick={handleClearFilters}>
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th scope="col" className="th-date">Date</th>
                <th scope="col" className="th-desc">Description</th>
                <th scope="col" className="th-cat">Category</th>
                <th scope="col" className="th-amount">Amount</th>
                <th scope="col" className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => {
                const isIncome = transaction.type === 'income';
                const catColor = CATEGORY_COLORS[transaction.category] || CATEGORY_COLORS.other;

                return (
                  <tr key={transaction.id} className="transaction-row">
                    <td className="td-date">{formatDate(transaction.date)}</td>
                    <td className="td-desc">
                      <span className="desc-text">{transaction.description}</span>
                    </td>
                    <td className="td-cat">
                      <span className="category-pill">
                        <span
                          className="category-pill-dot"
                          style={{ backgroundColor: catColor }}
                        />
                        {transaction.category}
                      </span>
                    </td>
                    <td className={`td-amount ${isIncome ? 'income-amount' : 'expense-amount'}`}>
                      {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </td>
                    <td className="td-actions">
                      <button
                        className="delete-btn"
                        type="button"
                        aria-label={`Delete ${transaction.description}`}
                        title={`Delete "${transaction.description}"`}
                        onClick={() => {
                          if (window.confirm(`Delete "${transaction.description}"?`)) {
                            onDeleteTransaction(transaction.id);
                          }
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TransactionList;
