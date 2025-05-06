import React from 'react';

const Analytics: React.FC = () => {
  const metrics = [
    {
      title: 'Total Projects',
      value: '156',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Completion Rate',
      value: '94%',
      change: '+3%',
      trend: 'up'
    },
    {
      title: 'Average Time',
      value: '18d',
      change: '-2d',
      trend: 'down'
    },
    {
      title: 'Client Satisfaction',
      value: '4.8',
      change: '+0.4',
      trend: 'up'
    }
  ];

  const chartData = [
    { month: 'Jan', projects: 12 },
    { month: 'Feb', projects: 15 },
    { month: 'Mar', projects: 18 },
    { month: 'Apr', projects: 14 },
    { month: 'May', projects: 21 },
    { month: 'Jun', projects: 24 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-200">Analytics Overview</h1>
          <p className="text-gray-400 mt-1">Track your performance and metrics</p>
        </div>
        <div className="flex space-x-4">
          <select className="bg-[#1a1f2b] text-gray-200 px-4 py-2 rounded-lg border border-gray-700">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Download Report
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
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

      {/* Chart Section */}
      <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-200 mb-4">Project Trends</h2>
        <div className="h-64 flex items-end justify-between">
          {chartData.map((data, index) => (
            <div key={index} className="flex flex-col items-center">
              <div 
                className="w-12 bg-blue-600 rounded-t-lg hover:bg-blue-500 transition-colors"
                style={{ height: `${data.projects * 2}%` }}
              ></div>
              <span className="text-gray-400 mt-2 text-sm">{data.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-200 mb-4">Performance Insights</h2>
        <div className="space-y-4">
          <div className="p-4 bg-[#242935] rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-200 font-medium">Project Completion Rate</h3>
              <span className="text-green-500">94%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
            </div>
          </div>
          <div className="p-4 bg-[#242935] rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-200 font-medium">Client Satisfaction Score</h3>
              <span className="text-blue-500">4.8/5.0</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '96%' }}></div>
            </div>
          </div>
          <div className="p-4 bg-[#242935] rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-200 font-medium">Resource Utilization</h3>
              <span className="text-yellow-500">78%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '78%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 