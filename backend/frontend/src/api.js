import axios from 'axios';

// This creates a shortcut to your backend engine
const API = axios.create({
  baseURL: 'http://localhost:5000/api', 
});

// These functions are used by your Figma components to get data
export const getAuthStatus = () => API.get('/health');
export const getAnnouncements = () => API.get('/announcements');
export const getAlerts = () => API.get('/alerts');

export default API;