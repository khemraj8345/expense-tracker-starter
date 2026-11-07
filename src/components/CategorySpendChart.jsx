import { useMemo, useState } from 'react';
import { CATEGORY_COLORS } from '../constants/categories.js';

function formatCurrency(val) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
}

function getNiceScale(maxVal) {
  if (maxVal <= 0) {
    return { max: 100, ticks: [0, 25, 50, 75, 100] };
  }
  const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)));
  const normalized = maxVal / magnitude;
  let top;
  if (normalized <= 1) top = 1 * magnitude;
  else if (normalized <= 1.5) top = 1.5 * magnitude;
  else if (normalized <= 2) top = 2 * magnitude;
  else if (normalized <= 5) top = 5 * magnitude;
  else top = 10 * magnitude;

  const ticks = [0, top * 0.25, top * 0.5, top * 0.75, top];
  return { max: top, ticks };
}

function CategorySpendChart({ transactions }) {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const { categorySpendList, totalExpense, scaleMax, ticks } = useMemo(() => {
    const expenseTransactions = transactions.filter(
      (transaction) => transaction.type === 'expense'
    );

    const total = expenseTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    const spendMap = {};
    expenseTransactions.forEach((transaction) => {
      const cat = transaction.category || 'other';
      spendMap[cat] = (spendMap[cat] || 0) + transaction.amount;
    });

    const list = Object.entries(spendMap)
      .map(([category, amount]) => {
        const percentage = total > 0 ? (amount / total) * 100 : 0;
        return {
          category,
          amount,
          percentage,
          color: CATEGORY_COLORS[category] || CATEGORY_COLORS.other,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    const maxAmount = list.length > 0 ? Math.max(...list.map((item) => item.amount)) : 0;
    const scale = getNiceScale(maxAmount);

    return {
      categorySpendList: list,
      totalExpense: total,
      scaleMax: scale.max,
      ticks: scale.ticks,
    };
  }, [transactions]);

  if (totalExpense === 0 || categorySpendList.length === 0) {
    return (
      <div className="category-chart-card">
        <div className="category-chart-header">
          <h2>Spending Breakdown</h2>
        </div>
        <div className="chart-empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
          <p className="no-data-msg">No expense transactions recorded yet.</p>
          <span className="chart-hint-text">Add your first expense on the right to visualize category spending.</span>
        </div>
      </div>
    );
  }

  const svgWidth = 560;
  const svgHeight = 250;
  const margin = { top: 32, right: 20, bottom: 42, left: 52 };
  const plotWidth = svgWidth - margin.left - margin.right;
  const plotHeight = svgHeight - margin.top - margin.bottom;

  const slotWidth = plotWidth / categorySpendList.length;
  const barWidth = Math.min(42, Math.max(22, slotWidth * 0.52));

  const activeItem = hoveredCategory
    ? categorySpendList.find((item) => item.category === hoveredCategory)
    : null;

  return (
    <div className="category-chart-card">
      <div className="category-chart-header">
        <div>
          <h2>Spending by Category</h2>
          <span className="card-subtitle">Distribution across active budget categories</span>
        </div>
        <div className="category-total-badge">
          Total Spent: <strong>{formatCurrency(totalExpense)}</strong>
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
            const y = margin.top + plotHeight - (tick / scaleMax) * plotHeight;
            return (
              <g key={tick} className="grid-line-group">
                <line
                  x1={margin.left}
                  y1={y}
                  x2={margin.left + plotWidth}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeDasharray={tick === 0 ? '0' : '3 3'}
                  strokeWidth="1"
                />
                <text
                  x={margin.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="y-axis-label"
                >
                  ${tick >= 1000 ? `${(tick / 1000).toFixed(tick % 1000 === 0 ? 0 : 1)}k` : tick}
                </text>
              </g>
            );
          })}

          {/* Vertical Bars and X-axis labels */}
          {categorySpendList.map((item, index) => {
            const barHeight = Math.max(6, (item.amount / scaleMax) * plotHeight);
            const x = margin.left + index * slotWidth + (slotWidth - barWidth) / 2;
            const y = margin.top + plotHeight - barHeight;
            const isHovered = hoveredCategory === item.category;

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
                  rx="5"
                  className={`bar-rect ${isHovered ? 'bar-rect-hovered' : ''}`}
                  opacity={hoveredCategory && !isHovered ? 0.35 : 1}
                />

                {/* Amount label on top of bar */}
                <text
                  x={x + barWidth / 2}
                  y={y - 7}
                  textAnchor="middle"
                  className="bar-amount-label"
                  fill={isHovered ? item.color : '#475569'}
                  fontWeight={isHovered ? '700' : '500'}
                >
                  ${item.amount >= 1000 ? `${(item.amount / 1000).toFixed(1)}k` : item.amount}
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
            );
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
              <span className="active-category-name">{activeItem.category}</span>
              <span className="active-category-divider">·</span>
              <span className="active-category-amount">{formatCurrency(activeItem.amount)}</span>
              <span className="active-category-pct">
                ({activeItem.percentage.toFixed(1)}% of expenses)
              </span>
            </div>
          ) : (
            <span className="chart-hint-text">
              Hover over or focus on a bar to inspect category share
            </span>
          )}
        </div>
      </div>

      {/* Category breakdown summary list */}
      <div className="category-legend-grid">
        {categorySpendList.map((item) => (
          <button
            type="button"
            key={item.category}
            className={`legend-chip ${hoveredCategory === item.category ? 'legend-chip-active' : ''}`}
            onMouseEnter={() => setHoveredCategory(item.category)}
            onMouseLeave={() => setHoveredCategory(null)}
            onClick={() => setHoveredCategory(hoveredCategory === item.category ? null : item.category)}
            aria-pressed={hoveredCategory === item.category}
          >
            <span
              className="category-indicator"
              style={{ backgroundColor: item.color }}
            />
            <span className="chip-name">{item.category}</span>
            <span className="chip-amount">{formatCurrency(item.amount)}</span>
            <span className="chip-pct">{item.percentage.toFixed(0)}%</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default CategorySpendChart;
