import React, { useState, useEffect } from 'react';
import { trainModel } from '../services/api';
import { BrainCircuit, Play, BarChart2, Clock } from 'lucide-react';

const MachineLearning = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleTrain = async () => {
    setLoading(true);
    try {
      const res = await trainModel();
      setResults(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Machine Learning Models</h2>
        <button 
          onClick={handleTrain} 
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? <span className="animate-pulse">Training Models...</span> : <><Play className="w-4 h-4" /> Train Models</>}
        </button>
      </div>

      {!results && !loading && (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
          <BrainCircuit className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <p>No models trained yet. Click "Train Models" to evaluate algorithms.</p>
        </div>
      )}

      {results && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-start gap-4">
            <BrainCircuit className="w-8 h-8 text-green-600 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-green-800">Best Model Selected: {results.best_model}</h3>
              <p className="text-sm text-green-700 mt-1">This model has automatically been set as the active predictor for route optimization.</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-600">Model Name</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">MAE (min)</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">RMSE (min)</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">R² Score</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">Training Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.models.map((m: any) => (
                  <tr key={m.model_name} className={m.model_name === results.best_model ? 'bg-blue-50/50' : ''}>
                    <td className="px-6 py-4 font-medium flex items-center gap-2">
                      {m.model_name === results.best_model && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                      {m.model_name}
                    </td>
                    <td className="px-6 py-4">{m.mae.toFixed(3)}</td>
                    <td className="px-6 py-4 font-semibold">{m.rmse.toFixed(3)}</td>
                    <td className="px-6 py-4">{m.r2.toFixed(3)}</td>
                    <td className="px-6 py-4 flex items-center gap-1 text-slate-500">
                      <Clock className="w-4 h-4" /> {m.training_time.toFixed(2)}s
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

export default MachineLearning;
