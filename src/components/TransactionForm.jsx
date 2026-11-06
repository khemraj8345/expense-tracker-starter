import { useState } from 'react'
import { TRANSACTION_CATEGORIES } from '../constants/categories.js'

function TransactionForm({ onAddTransaction }) {
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState("expense")
  const [category, setCategory] = useState("food")

  const handleSubmit = (event) => {
    event.preventDefault()
    const numericAmount = Number(amount)

    if (!description.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) return

    onAddTransaction({
      description: description.trim(),
      amount: numericAmount,
      type,
      category,
    })

    setDescription("")
    setAmount("")
    setType("expense")
    setCategory("food")
  }

  return (
    <div className="add-transaction">
      <h2>Add Transaction</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
        <select value={type} onChange={(event) => setType(event.target.value)}>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          {TRANSACTION_CATEGORIES.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <button type="submit">Add</button>
      </form>
    </div>
  )
}

export default TransactionForm
