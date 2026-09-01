import React from 'react';
import { Truck, Map, Clock, TrendingUp, Package, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Logistics Overview</h2>
          <p className="text-slate-500 mt-1">SmartRoute AI Production Dashboard</p>
        </div>
        <Link to="/optimization" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2">
          <Zap className="w-4 h-4" /> Run Pipeline
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Active Fleet</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">3 <span className="text-sm font-normal text-slate-500">Vehicles</span></p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600"><Truck className="w-6 h-6" /></div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Customers Today</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">30 <span className="text-sm font-normal text-slate-500">Stops</span></p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600"><Map className="w-6 h-6" /></div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Avg. Predict Time</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">175 <span className="text-sm font-normal text-slate-500">min</span></p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600"><Clock className="w-6 h-6" /></div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-green-200 shadow-sm flex items-start justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -z-10"></div>
          <div>
            <p className="text-sm font-medium text-green-800">Opt. Improvement</p>
            <p className="text-3xl font-bold text-green-700 mt-2">~ 20%</p>
          </div>
          <div className="p-3 bg-green-100 rounded-lg text-green-700"><TrendingUp className="w-6 h-6" /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Package className="w-5 h-5" /> Recent Operations</h3>
          <div className="text-center text-slate-500 py-12">
            Run the optimization pipeline to see operations data.
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm text-white">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-400" /> System Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="text-slate-400">ML Engine</span>
              <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">Online</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="text-slate-400">OR-Tools Solver</span>
              <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">Online</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="text-slate-400">Database Layer</span>
              <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">In-Memory</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
