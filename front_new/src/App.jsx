import RoutesIndex from './routes';
import { AuthProvider } from './contexts/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <RoutesIndex />
    </AuthProvider>
  );
}
