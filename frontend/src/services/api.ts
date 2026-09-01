import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:8000');

export const api = axios.create({
  baseURL: API_URL,
});

export const generateData = async (numCustomers: number) => {
  const res = await api.post(`/api/datasets/generate?num_customers=${numCustomers}`);
  return res.data;
};

export const trainModel = async () => {
  const res = await api.post('/api/ml/train');
  return res.data;
};

export const runOptimization = async (config: any) => {
  const res = await api.post('/api/optimization/run', config);
  return res.data;
};
