import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAll, remove } from '../../service/apiService';
import { toast } from 'react-hot-toast';

interface Call {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  teamsMeetingLink: string | null;
  client: {
    id: string;
    email: string;
  };
  consultant: {
    id: string;
    email: string;
  };
}

const ScheduledCalls: React.FC = () => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    try {
      setLoading(true);
      const data = await getAll<Call>('/api/scheduled-calls');
      setCalls(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch calls');
      toast.error('Failed to fetch calls');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this call?')) return;

    try {
      await remove(`/api/scheduled-calls/${id}`);
      toast.success('Call cancelled successfully');
      fetchCalls();
    } catch (err) {
      toast.error('Failed to cancel call');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'text-blue-500';
      case 'IN_PROGRESS':
        return 'text-yellow-500';
      case 'COMPLETED':
        return 'text-green-500';
      case 'CANCELLED':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const filteredCalls = selectedFilter === 'all' 
    ? calls 
    : calls.filter(call => call.status === selectedFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-200">Scheduled Calls</h1>
          <p className="text-gray-400 mt-1">Manage your upcoming and past calls</p>
        </div>
        <div className="flex space-x-4">
          <select 
            className="bg-[#1a1f2b] text-gray-200 px-4 py-2 rounded-lg border border-gray-700"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <option value="all">All Calls</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <Link
            to="/schedule-call"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Schedule New Call
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      { 
      (
        <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="pb-4 font-medium">Call Title</th>
                  <th className="pb-4 font-medium">Date & Time</th>
                  <th className="pb-4 font-medium">Client</th>
                  <th className="pb-4 font-medium">Consultant</th>
                  <th className="pb-4 font-medium">Status</th>
                  <th className="pb-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredCalls.map((call) => (
                  <tr key={call.id} className="hover:bg-[#242935] transition-colors">
                    <td className="py-4 text-gray-200">{call.title}</td>
                    <td className="py-4 text-gray-200">{formatDateTime(call.startTime)}</td>
                    <td className="py-4 text-gray-200">{call.client.email}</td>
                    <td className="py-4 text-gray-200">{call.consultant.email}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(call.status)}`}>
                        {call.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex space-x-2">
                        {call.status === 'SCHEDULED' && call.teamsMeetingLink && (
                          <a
                            href={call.teamsMeetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-400"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </a>
                        )}
                        {call.status === 'SCHEDULED' && (
                          <button
                            onClick={() => handleDelete(call.id)}
                            className="text-gray-400 hover:text-gray-300"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduledCalls; 