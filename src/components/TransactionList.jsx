import { useState } from 'react'
import { TRANSACTION_CATEGORIES } from '../constants/categories.js'

function TransactionList({ transactions, onDeleteTransaction }) {
  const [filterType, setFilterType] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesType = filterType === "all" || transaction.type === filterType
    const matchesCategory = filterCategory === "all" || transaction.category === filterCategory
    return matchesType && matchesCategory
  })

  return (
    <div className="transactions">
      <h2>Transactions</h2>
      <div className="filters">
        <select value={filterType} onChange={(event) => setFilterType(event.target.value)}>
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select value={filterCategory} onChange={(event) => setFilterCategory(event.target.value)}>
          <option value="all">All Categories</option>
          {TRANSACTION_CATEGORIES.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{transaction.date}</td>
              <td>{transaction.description}</td>
              <td>{transaction.category}</td>
              <td className={transaction.type === "income" ? "income-amount" : "expense-amount"}>
                {transaction.type === "income" ? "+" : "-"}${transaction.amount}
              </td>
              <td>
                <button
                  className="delete-btn"
                  type="button"
                  aria-label={`Delete ${transaction.description}`}
                  onClick={() => {
                    if (window.confirm(`Delete "${transaction.description}"?`)) {
                      onDeleteTransaction(transaction.id)
                    }
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TransactionList
