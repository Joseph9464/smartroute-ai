import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Activity, LayoutDashboard, Database, BrainCircuit, Route as RouteIcon, BarChart3, Settings } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import DataManagement from './pages/DataManagement';
import MachineLearning from './pages/MachineLearning';
import Optimization from './pages/Optimization';
import Analytics from './pages/Analytics';

const Sidebar = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: '/data', label: 'Data Management', icon: <Database className="w-5 h-5" /> },
    { path: '/ml', label: 'Machine Learning', icon: <BrainCircuit className="w-5 h-5" /> },
    { path: '/optimization', label: 'Route Optimization', icon: <RouteIcon className="w-5 h-5" /> },
    { path: '/analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
  ];

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 flex items-center gap-3 text-white">
        <Activity className="w-8 h-8 text-blue-500" />
        <h1 className="text-xl font-bold">SmartRoute AI</h1>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map(item => (
          <Link 
            key={item.path} 
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === item.path ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4">
        <div className="bg-slate-800 rounded-lg p-4 flex items-center gap-3 text-sm">
          <Settings className="w-5 h-5" />
          <span>System Settings</span>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/data" element={<DataManagement />} />
            <Route path="/ml" element={<MachineLearning />} />
            <Route path="/optimization" element={<Optimization />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
