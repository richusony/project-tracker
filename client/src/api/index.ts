import axios from 'axios';
import { IProject, INote } from '../types';

const api = axios.create({ baseURL: '/api' });

// Projects
export const getProjects = () => api.get<IProject[]>('/projects').then(r => r.data);
export const getProject = (id: string) => api.get<IProject>(`/projects/${id}`).then(r => r.data);
export const createProject = (data: { name: string; brief?: string }) =>
  api.post<IProject>('/projects', data).then(r => r.data);
export const deleteProject = (id: string) => api.delete(`/projects/${id}`).then(r => r.data);
export const updateProject = (id: string, data: Partial<IProject>) =>
  api.patch<IProject>(`/projects/${id}`, data).then(r => r.data);

// Timer
export const startTimer = (id: string) => api.post<IProject>(`/projects/${id}/timer/start`).then(r => r.data);
export const pauseTimer = (id: string) => api.post<IProject>(`/projects/${id}/timer/pause`).then(r => r.data);
export const stopTimer = (id: string) => api.post<IProject>(`/projects/${id}/timer/stop`).then(r => r.data);

// Config files
export const addConfigFile = (id: string, data: { name: string; path: string; content: string }) =>
  api.post<IProject>(`/projects/${id}/config-files`, data).then(r => r.data);
export const deleteConfigFile = (id: string, fileId: string) =>
  api.delete<IProject>(`/projects/${id}/config-files/${fileId}`).then(r => r.data);

// Env variables
export const addEnvVariable = (id: string, data: { key: string; value: string; scope?: string }) =>
  api.post<IProject>(`/projects/${id}/env-variables`, data).then(r => r.data);
export const deleteEnvVariable = (id: string, varId: string) =>
  api.delete<IProject>(`/projects/${id}/env-variables/${varId}`).then(r => r.data);

// Pricing
export const updatePricing = (id: string, data: object) =>
  api.patch<IProject>(`/projects/${id}/pricing`, data).then(r => r.data);
export const addHourlyPayment = (id: string, data: { amount: number; description?: string }) =>
  api.post<IProject>(`/projects/${id}/pricing/hourly-payment`, data).then(r => r.data);
export const updateHourlyPayment = (id: string, payId: string, data: object) =>
  api.patch<IProject>(`/projects/${id}/pricing/hourly-payment/${payId}`, data).then(r => r.data);

// Notes
export const getNotesByProject = (projectId: string) =>
  api.get<INote[]>(`/notes/project/${projectId}`).then(r => r.data);
export const getNote = (id: string) => api.get<INote>(`/notes/${id}`).then(r => r.data);
export const createNote = (data: { projectId: string; title: string; content?: string }) =>
  api.post<INote>('/notes', data).then(r => r.data);
export const updateNote = (id: string, data: { title: string; content: string }) =>
  api.patch<INote>(`/notes/${id}`, data).then(r => r.data);
export const deleteNote = (id: string) => api.delete(`/notes/${id}`).then(r => r.data);

// Currency conversion - using open exchange rate
export const getExchangeRate = async (from: string): Promise<number> => {
  if (from === 'INR') return 1;
  try {
    const res = await axios.get(`https://api.exchangerate-api.com/v4/latest/${from}`);
    return res.data.rates.INR || 0;
  } catch {
    return 0;
  }
};
