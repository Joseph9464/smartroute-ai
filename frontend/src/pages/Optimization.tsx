import React, { useState } from 'react';
import { generateData, trainModel, runOptimization } from '../services/api';
import { RouteMap } from '../components/RouteMap';
import { Play, CheckCircle, Circle, AlertCircle, Download } from 'lucide-react';

type StepStatus = 'idle' | 'loading' | 'success' | 'error';

interface Step {
  id: string;
  label: string;
  status: StepStatus;
  message?: string;
}

const Optimization = () => {
  const [loading, setLoading] = useState(false);
  const [optResult, setOptResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [numCustomers, setNumCustomers] = useState(30);
  const [numVehicles, setNumVehicles] = useState(3);
  const [vehicleCapacity, setVehicleCapacity] = useState(100);

  const [steps, setSteps] = useState<Step[]>([
    { id: 'data', label: 'Generating customers', status: 'idle' },
    { id: 'ml', label: 'Training ML models', status: 'idle' },
    { id: 'opt', label: 'Running VRP solver', status: 'idle' },
  ]);

  const updateStep = (id: string, status: StepStatus, message?: string) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, status, message } : s));
  };

  const handlePipeline = async () => {
    setLoading(true);
    setOptResult(null);
    setErrorMsg(null);
    setSteps(steps.map(s => ({ ...s, status: 'idle', message: undefined })));

    try {
      updateStep('data', 'loading');
      await generateData(numCustomers);
      updateStep('data', 'success', 'Dataset generated');
      
      updateStep('ml', 'loading');
      const m = await trainModel();
      updateStep('ml', 'success', `Trained: ${m.best_model}`);
      
      updateStep('opt', 'loading');
      const res = await runOptimization({
        number_of_vehicles: numVehicles,
        vehicle_capacity: vehicleCapacity,
        objective: 'minimize_travel_time'
      });
      
      setOptResult(res);
      updateStep('opt', 'success', 'Optimization completed');
      
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || err.message || 'An error occurred';
      setErrorMsg(errMsg);
      setSteps(prev => prev.map(s => s.status === 'loading' ? { ...s, status: 'error', message: errMsg } : s));
    } finally {
      setLoading(false);
    }
  };

  const renderStepIcon = (status: StepStatus) => {
    if (status === 'success') return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (status === 'loading') return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>;
    if (status === 'error') return <AlertCircle className="w-5 h-5 text-red-500" />;
    return <Circle className="w-5 h-5 text-slate-300" />;
  };

  const downloadJSON = () => {
    if (!optResult) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(optResult, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "optimization_results.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Route Optimization</h2>
        {optResult && (
          <button onClick={downloadJSON} className="bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-700">
            <Download className="w-4 h-4" /> Export Results
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Settings Panel */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit space-y-6">
          <div>
            <h3 className="font-semibold text-slate-800 mb-4">Pipeline Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Customers</label>
                <input type="number" className="w-full border p-2 rounded" value={numCustomers} onChange={e => setNumCustomers(Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Vehicles</label>
                <input type="number" className="w-full border p-2 rounded" value={numVehicles} onChange={e => setNumVehicles(Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Vehicle Capacity</label>
                <input type="number" className="w-full border p-2 rounded" value={vehicleCapacity} onChange={e => setVehicleCapacity(Number(e.target.value))} />
              </div>
              <button 
                onClick={handlePipeline}
                disabled={loading}
                className={`w-full py-3 mt-2 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-colors ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {loading ? <span className="animate-pulse">Processing...</span> : <><Play className="w-5 h-5" /> Run Full Pipeline</>}
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-md font-semibold mb-3 text-slate-700">Execution Status</h3>
            <div className="space-y-3">
              {steps.map(step => (
                <div key={step.id} className="flex items-start gap-3">
                  <div className="mt-0.5">{renderStepIcon(step.status)}</div>
                  <div>
                    <p className={`text-sm font-medium ${step.status === 'error' ? 'text-red-600' : 'text-slate-700'}`}>{step.label}</p>
                    {step.message && <p className="text-xs text-slate-500 mt-0.5">{step.status === 'success' ? `✓ ${step.message}` : step.message}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Map & Results */}
        <div className="col-span-1 lg:col-span-2 space-y-6 flex flex-col">
          
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold">Optimization Failed</h4>
                <p className="text-sm mt-1">{errorMsg}</p>
              </div>
            </div>
          )}

          {optResult && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <p className="text-sm text-slate-500 font-medium">Distance</p>
                <p className="text-xl font-bold text-slate-800">{optResult.total_distance.toFixed(1)} km</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <p className="text-sm text-slate-500 font-medium">Pred. Time</p>
                <p className="text-xl font-bold text-slate-800">{optResult.total_predicted_time.toFixed(1)} min</p>
              </div>
              <div className="bg-slate-100 p-4 rounded-xl shadow-sm border border-slate-300">
                <p className="text-sm text-slate-600 font-medium">Baseline Time</p>
                <p className="text-xl font-bold text-slate-700">{optResult.baseline_time?.toFixed(1)} min</p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl shadow-sm border border-green-200">
                <p className="text-sm text-green-700 font-medium">Improvement</p>
                <p className="text-xl font-bold text-green-700">+{optResult.improvement.toFixed(1)}%</p>
              </div>
            </div>
          )}
          
          <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 flex-1 min-h-[500px] relative">
            <RouteMap routes={optResult ? optResult.routes : []} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Optimization;
