import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { BarChart3 } from 'lucide-react';

const Analytics = () => {
  // Mock data for display purposes before optimization run is wired to global state
  // In a full implementation, this would read from a global Redux/Zustand store containing `optResult`
  const mockLoadData = [
    { name: 'Vehicle 1', load: 82, capacity: 100 },
    { name: 'Vehicle 2', load: 95, capacity: 100 },
    { name: 'Vehicle 3', load: 60, capacity: 100 },
  ];

  const mockTimeData = [
    { name: 'Vehicle 1', baseline: 65, optimized: 54 },
    { name: 'Vehicle 2', baseline: 80, optimized: 68 },
    { name: 'Vehicle 3', baseline: 55, optimized: 40 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Advanced Analytics</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Load Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" /> Vehicle Load Distribution
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockLoadData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Legend />
                <Bar dataKey="load" name="Assigned Load" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="capacity" name="Max Capacity" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Travel Time Comparison */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-500" /> Travel Time: Baseline vs Optimized
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockTimeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="baseline" name="Baseline Time" stroke="#94a3b8" strokeWidth={2} dot={{r: 4}} />
                <Line type="monotone" dataKey="optimized" name="Optimized Time" stroke="#10b981" strokeWidth={3} dot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
