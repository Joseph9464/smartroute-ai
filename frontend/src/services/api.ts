import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:8000/api');

export const api = axios.create({
  baseURL: API_URL,
});

export const generateData = async (numCustomers: number) => {
  const res = await api.post(`/datasets/generate?num_customers=${numCustomers}`);
  return res.data;
};

export const trainModel = async () => {
  const res = await api.post('/ml/train');
  return res.data;
};

export const runOptimization = async (config: any) => {
  const res = await api.post('/optimization/run', config);
  return res.data;
};
