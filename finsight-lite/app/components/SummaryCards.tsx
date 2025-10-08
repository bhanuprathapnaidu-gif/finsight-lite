interface SummaryCardsProps {
  summary: {
    averageBalance: number
    totalIncome: number
    totalExpenses: number
    highestInflow: number
    lowestBalance: number
    irregularTransactions: number
  }
}

export default function SummaryCards({ summary }: SummaryCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const cards = [
    {
      title: 'Average Balance',
      value: formatCurrency(summary.averageBalance),
      icon: '💰',
      color: 'bg-blue-500',
    },
    {
      title: 'Total Income',
      value: formatCurrency(summary.totalIncome),
      icon: '📈',
      color: 'bg-green-500',
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(summary.totalExpenses),
      icon: '📉',
      color: 'bg-red-500',
    },
    {
      title: 'Highest Inflow',
      value: formatCurrency(summary.highestInflow),
      icon: '⭐',
      color: 'bg-purple-500',
    },
    {
      title: 'Lowest Balance',
      value: formatCurrency(summary.lowestBalance),
      icon: '⚠️',
      color: 'bg-orange-500',
    },
    {
      title: 'Irregular Transactions',
      value: summary.irregularTransactions.toString(),
      icon: '🔍',
      color: 'bg-amber-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">{card.icon}</span>
            <div className={`w-2 h-2 rounded-full ${card.color}`}></div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">{card.title}</h3>
          <p className="text-2xl font-bold text-gray-800">{card.value}</p>
        </div>
      ))}
    </div>
  )
}