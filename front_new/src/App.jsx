import { useEffect } from 'react';
import RoutesIndex from './routes';
import api from './services/api';
import jwt_decode from 'jwt-decode';

export default function App() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  return <RoutesIndex />;
}
