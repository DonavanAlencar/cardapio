import axios from 'axios';

const api = axios.create({
  //baseURL: 'http://localhost:4000/api',
  baseURL: process.env.REACT_APP_API_BASE_URL,  // usa a env var
});

export default api;