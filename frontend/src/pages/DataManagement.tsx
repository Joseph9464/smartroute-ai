import React, { useState, useEffect } from 'react';
import { Database, Plus, RefreshCw, Download } from 'lucide-react';
import { api, generateData } from '../services/api';

const DataManagement = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/datasets/');
      setCustomers(res.data.customers || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    await generateData(30);
    await fetchCustomers();
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Data Management</h2>
        <div className="flex gap-3">
          <button onClick={handleGenerate} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Generate Synthetic Data
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
          <Database className="w-5 h-5 text-slate-500" />
          <h3 className="font-semibold text-slate-700">Customer Dataset Preview</h3>
          <span className="ml-auto bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">{customers.length} Records</span>
        </div>
        
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left">
            <thead className="bg-slate-50 sticky top-0 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600">ID</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Latitude</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Longitude</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Demand</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">No data found. Generate a dataset first.</td>
                </tr>
              ) : (
                customers.map((c: any) => (
                  <tr key={c.customer_id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-medium text-slate-700">{c.customer_id === 0 ? '0 (Depot)' : c.customer_id}</td>
                    <td className="px-6 py-3 text-slate-600">{c.latitude.toFixed(6)}</td>
                    <td className="px-6 py-3 text-slate-600">{c.longitude.toFixed(6)}</td>
                    <td className="px-6 py-3">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">{c.demand} units</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;
