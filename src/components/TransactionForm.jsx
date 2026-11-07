import { useState } from 'react';
import { TRANSACTION_CATEGORIES, CATEGORY_LABELS } from '../constants/categories.js';

function TransactionForm({ onAddTransaction }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('food');
  const [hasError, setHasError] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const numericAmount = parseFloat(amount);

    if (!description.trim() || isNaN(numericAmount) || numericAmount <= 0) {
      setHasError(true);
      return;
    }

    setHasError(false);
    onAddTransaction({
      description: description.trim(),
      amount: numericAmount,
      type,
      category,
    });

    setDescription('');
    setAmount('');
    setType('expense');
    setCategory('food');
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'income' && category === 'food') {
      setCategory('salary');
    } else if (newType === 'expense' && category === 'salary') {
      setCategory('food');
    }
  };

  return (
    <div className="add-transaction">
      <div className="form-card-header">
        <h2>Add Transaction</h2>
        <span className="card-subtitle">Quickly log cash inflow or spending</span>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Transaction Type Segmented Toggle */}
        <div className="type-toggle-group" role="group" aria-label="Transaction Type">
          <button
            type="button"
            className={`type-toggle-btn type-toggle-expense ${type === 'expense' ? 'active' : ''}`}
            onClick={() => handleTypeChange('expense')}
            aria-pressed={type === 'expense'}
          >
            <span className="type-dot dot-expense" />
            Expense
          </button>
          <button
            type="button"
            className={`type-toggle-btn type-toggle-income ${type === 'income' ? 'active' : ''}`}
            onClick={() => handleTypeChange('income')}
            aria-pressed={type === 'income'}
          >
            <span className="type-dot dot-income" />
            Income
          </button>
        </div>

        {/* Amount Input */}
        <div className="form-group">
          <label htmlFor="tx-amount" className="form-label">Amount</label>
          <div className="input-with-addon">
            <span className="input-addon">$</span>
            <input
              id="tx-amount"
              type="number"
              step="any"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
                if (hasError) setHasError(false);
              }}
              required
            />
          </div>
        </div>

        {/* Description Input */}
        <div className="form-group">
          <label htmlFor="tx-desc" className="form-label">Description</label>
          <input
            id="tx-desc"
            type="text"
            placeholder={type === 'income' ? 'e.g. Monthly salary, Consulting fee' : 'e.g. Whole Foods groceries, Internet bill'}
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              if (hasError) setHasError(false);
            }}
            required
          />
        </div>

        {/* Category Select */}
        <div className="form-group">
          <label htmlFor="tx-category" className="form-label">Category</label>
          <div className="select-wrapper">
            <select
              id="tx-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {TRANSACTION_CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {CATEGORY_LABELS[option] || option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
            <span className="select-arrow" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </span>
          </div>
        </div>

        {hasError && (
          <p className="form-error-msg" role="alert">
            Please enter a description and an amount greater than 0.
          </p>
        )}

        <button type="submit" className="submit-btn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Record {type === 'income' ? 'Income' : 'Expense'}
        </button>
      </form>
    </div>
  );
}

export default TransactionForm;
