import React from 'react';

const Finance: React.FC = () => {
  const financialMetrics = [
    {
      title: 'Total Revenue',
      value: '$128.5k',
      change: '+24%',
      trend: 'up'
    },
    {
      title: 'Expenses',
      value: '$38.2k',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Net Profit',
      value: '$90.3k',
      change: '+18%',
      trend: 'up'
    },
    {
      title: 'Pending Invoices',
      value: '$15.8k',
      change: '-8%',
      trend: 'down'
    }
  ];

  const recentTransactions = [
    {
      id: 1,
      client: 'Tech Solutions Inc.',
      amount: 12500,
      status: 'completed',
      date: '2024-02-15'
    },
    {
      id: 2,
      client: 'Global Innovations Ltd.',
      amount: 8750,
      status: 'pending',
      date: '2024-02-14'
    },
    {
      id: 3,
      client: 'Digital Systems Corp.',
      amount: 15000,
      status: 'completed',
      date: '2024-02-13'
    },
    {
      id: 4,
      client: 'Future Analytics',
      amount: 6300,
      status: 'processing',
      date: '2024-02-12'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-200">Financial Overview</h1>
          <p className="text-gray-400 mt-1">Monitor your financial performance</p>
        </div>
        <div className="flex space-x-4">
          <select className="bg-[#1a1f2b] text-gray-200 px-4 py-2 rounded-lg border border-gray-700">
            <option>This Month</option>
            <option>Last Month</option>
            <option>Last Quarter</option>
            <option>This Year</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {financialMetrics.map((metric, index) => (
          <div key={index} className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-400 text-sm font-medium">{metric.title}</h3>
              <span className={`text-sm font-medium ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {metric.change}
              </span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-200">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="bg-[#1a1f2b] rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-gray-200">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left bg-[#242935]">
                <th className="px-6 py-3 text-xs font-medium text-gray-400">Client</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-400">Amount</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-400">Status</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-400">Date</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {recentTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-[#242935] transition-colors">
                  <td className="px-6 py-4 text-gray-200">{transaction.client}</td>
                  <td className="px-6 py-4 text-gray-200">${transaction.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${transaction.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                        transaction.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-blue-500/10 text-blue-500'}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{transaction.date}</td>
                  <td className="px-6 py-4">
                    <button className="text-blue-500 hover:text-blue-400">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-200 mb-4">Revenue vs Expenses</h2>
          <div className="h-64 flex items-end space-x-2">
            {[65, 59, 80, 81, 56, 55, 40].map((value, index) => (
              <div key={index} className="flex-1 flex items-end space-x-1">
                <div
                  className="flex-1 bg-blue-600 rounded-t-sm hover:bg-blue-500 transition-colors"
                  style={{ height: `${value}%` }}
                ></div>
                <div
                  className="flex-1 bg-red-600 rounded-t-sm hover:bg-red-500 transition-colors"
                  style={{ height: `${value * 0.4}%` }}
                ></div>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4 space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
              <span className="text-gray-400 text-sm">Revenue</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
              <span className="text-gray-400 text-sm">Expenses</span>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-200 mb-4">Invoice Status</h2>
          <div className="relative h-64">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-200">82%</div>
                <div className="text-gray-400">Collection Rate</div>
              </div>
            </div>
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeDasharray="82, 100"
                className="stroke-current text-blue-600"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#374151"
                strokeWidth="2"
                className="stroke-current text-gray-700"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Finance; 