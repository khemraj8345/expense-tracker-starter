import { useMemo, useState } from 'react'

const CATEGORY_COLORS = {
  housing: '#3b82f6',
  food: '#10b981',
  utilities: '#f59e0b',
  transport: '#8b5cf6',
  entertainment: '#ec4899',
  salary: '#14b8a6',
  other: '#6b7280',
}

function getNiceScale(maxVal) {
  if (maxVal <= 0) {
    return { max: 100, ticks: [0, 25, 50, 75, 100] }
  }
  const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)))
  const normalized = maxVal / magnitude
  let top
  if (normalized <= 1) top = 1 * magnitude
  else if (normalized <= 1.5) top = 1.5 * magnitude
  else if (normalized <= 2) top = 2 * magnitude
  else if (normalized <= 5) top = 5 * magnitude
  else top = 10 * magnitude

  const ticks = [0, top * 0.25, top * 0.5, top * 0.75, top]
  return { max: top, ticks }
}

function CategorySpendChart({ transactions }) {
  const [hoveredCategory, setHoveredCategory] = useState(null)

  const { categorySpendList, totalExpense, scaleMax, ticks } = useMemo(() => {
    const expenseTransactions = transactions.filter(
      (transaction) => transaction.type === 'expense'
    )

    const total = expenseTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    )

    const spendMap = {}
    expenseTransactions.forEach((transaction) => {
      const cat = transaction.category || 'other'
      spendMap[cat] = (spendMap[cat] || 0) + transaction.amount
    })

    const list = Object.entries(spendMap)
      .map(([category, amount]) => {
        const percentage = total > 0 ? (amount / total) * 100 : 0
        return {
          category,
          amount,
          percentage,
          color: CATEGORY_COLORS[category] || CATEGORY_COLORS.other,
        }
      })
      .sort((a, b) => b.amount - a.amount)

    const maxAmount = list.length > 0 ? Math.max(...list.map((item) => item.amount)) : 0
    const scale = getNiceScale(maxAmount)

    return {
      categorySpendList: list,
      totalExpense: total,
      scaleMax: scale.max,
      ticks: scale.ticks,
    }
  }, [transactions])

  if (totalExpense === 0 || categorySpendList.length === 0) {
    return (
      <div className="category-chart-card">
        <h2>Spending by Category</h2>
        <p className="no-data-msg">No expense transactions recorded yet.</p>
      </div>
    )
  }

  const svgWidth = 600
  const svgHeight = 260
  const margin = { top: 30, right: 25, bottom: 45, left: 55 }
  const plotWidth = svgWidth - margin.left - margin.right
  const plotHeight = svgHeight - margin.top - margin.bottom

  const slotWidth = plotWidth / categorySpendList.length
  const barWidth = Math.min(48, Math.max(24, slotWidth * 0.55))

  const activeItem = hoveredCategory
    ? categorySpendList.find((item) => item.category === hoveredCategory)
    : null

  return (
    <div className="category-chart-card">
      <div className="category-chart-header">
        <h2>Spending by Category</h2>
        <div className="category-total-badge">
          Total Expenses: <strong>${totalExpense}</strong>
        </div>
      </div>

      <div className="bar-chart-container">
        <svg
          className="bar-chart-svg"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Category spending bar chart"
        >
          {/* Horizontal gridlines and Y-axis tick labels */}
          {ticks.map((tick) => {
            const y = margin.top + plotHeight - (tick / scaleMax) * plotHeight
            return (
              <g key={tick} className="grid-line-group">
                <line
                  x1={margin.left}
                  y1={y}
                  x2={margin.left + plotWidth}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeDasharray={tick === 0 ? '0' : '4 4'}
                  strokeWidth="1"
                />
                <text
                  x={margin.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="y-axis-label"
                >
                  ${tick >= 1000 ? `${(tick / 1000).toFixed(1)}k` : tick}
                </text>
              </g>
            )
          })}

          {/* Vertical Bars and X-axis labels */}
          {categorySpendList.map((item, index) => {
            const barHeight = Math.max(4, (item.amount / scaleMax) * plotHeight)
            const x = margin.left + index * slotWidth + (slotWidth - barWidth) / 2
            const y = margin.top + plotHeight - barHeight
            const isHovered = hoveredCategory === item.category

            return (
              <g
                key={item.category}
                className="bar-group"
                onMouseEnter={() => setHoveredCategory(item.category)}
                onMouseLeave={() => setHoveredCategory(null)}
                tabIndex="0"
                onFocus={() => setHoveredCategory(item.category)}
                onBlur={() => setHoveredCategory(null)}
                role="graphics-symbol"
                aria-label={`${item.category}: $${item.amount} (${item.percentage.toFixed(1)}%)`}
              >
                {/* Bar rect */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={item.color}
                  rx="4"
                  className={`bar-rect ${isHovered ? 'bar-rect-hovered' : ''}`}
                  opacity={hoveredCategory && !isHovered ? 0.45 : 1}
                />

                {/* Amount label on top of bar */}
                <text
                  x={x + barWidth / 2}
                  y={y - 8}
                  textAnchor="middle"
                  className="bar-amount-label"
                  fill={isHovered ? item.color : '#374151'}
                  fontWeight={isHovered ? 'bold' : 'normal'}
                >
                  ${item.amount}
                </text>

                {/* Category name below bar */}
                <text
                  x={x + barWidth / 2}
                  y={margin.top + plotHeight + 20}
                  textAnchor="middle"
                  className="bar-category-label"
                >
                  {item.category}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Dynamic Detail Card / Tooltip Info */}
        <div className="chart-active-detail">
          {activeItem ? (
            <div className="active-detail-content">
              <span
                className="category-indicator"
                style={{ backgroundColor: activeItem.color }}
              />
              <span className="active-category-name">{activeItem.category}:</span>
              <span className="active-category-amount">${activeItem.amount}</span>
              <span className="active-category-pct">
                ({activeItem.percentage.toFixed(1)}% of spending)
              </span>
            </div>
          ) : (
            <span className="chart-hint-text">
              Hover over or tap any bar to view category percentage
            </span>
          )}
        </div>
      </div>

      {/* Category breakdown summary list */}
      <div className="category-legend-grid">
        {categorySpendList.map((item) => (
          <div
            key={item.category}
            className={`legend-chip ${hoveredCategory === item.category ? 'legend-chip-active' : ''}`}
            onMouseEnter={() => setHoveredCategory(item.category)}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            <span
              className="category-indicator"
              style={{ backgroundColor: item.color }}
            />
            <span className="chip-name">{item.category}</span>
            <span className="chip-amount">${item.amount}</span>
            <span className="chip-pct">({item.percentage.toFixed(1)}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CategorySpendChart
