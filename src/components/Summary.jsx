function formatCurrency(val) {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(val));
  return val < 0 ? `-${formatted}` : formatted;
}

function Summary({ transactions }) {
  const incomeTransactions = transactions.filter((t) => t.type === 'income');
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');

  const totalIncome = incomeTransactions.reduce((total, t) => total + t.amount, 0);
  const totalExpenses = expenseTransactions.reduce((total, t) => total + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  const savingsRate = totalIncome > 0
    ? Math.max(0, Math.round(((totalIncome - totalExpenses) / totalIncome) * 100))
    : 0;

  const expenseRatio = totalIncome > 0
    ? Math.min(100, Math.round((totalExpenses / totalIncome) * 100))
    : (totalExpenses > 0 ? 100 : 0);

  return (
    <section className="summary" aria-label="Financial overview">
      <div className="summary-card summary-card-income">
        <div className="summary-card-header">
          <h3>Total Income</h3>
          <span className="summary-badge summary-badge-income">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="7" y1="17" x2="17" y2="7"></line>
              <polyline points="7 7 17 7 17 17"></polyline>
            </svg>
            Inflow
          </span>
        </div>
        <p className="income-amount">{formatCurrency(totalIncome)}</p>
        <span className="summary-subtext">
          {incomeTransactions.length} {incomeTransactions.length === 1 ? 'source' : 'sources'} recorded
        </span>
      </div>

      <div className="summary-card summary-card-expense">
        <div className="summary-card-header">
          <h3>Total Expenses</h3>
          <span className="summary-badge summary-badge-expense">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="7" y1="7" x2="17" y2="17"></line>
              <polyline points="17 7 17 17 7 17"></polyline>
            </svg>
            Outflow
          </span>
        </div>
        <p className="expense-amount">{formatCurrency(totalExpenses)}</p>
        <span className="summary-subtext">
          {expenseRatio}% of total income
        </span>
      </div>

      <div className={`summary-card summary-card-balance ${balance >= 0 ? 'balance-positive' : 'balance-negative'}`}>
        <div className="summary-card-header">
          <h3>Net Balance</h3>
          <span className={`summary-badge ${balance >= 0 ? 'summary-badge-income' : 'summary-badge-expense'}`}>
            {balance >= 0 ? 'Surplus' : 'Deficit'}
          </span>
        </div>
        <p className="balance-amount">{formatCurrency(balance)}</p>
        <div className="summary-meter-container">
          <div className="summary-meter-track" title={`${savingsRate}% savings rate`}>
            <div
              className="summary-meter-fill"
              style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
            />
          </div>
          <span className="summary-subtext">
            {savingsRate}% net savings rate
          </span>
        </div>
      </div>
    </section>
  );
}

export default Summary;
