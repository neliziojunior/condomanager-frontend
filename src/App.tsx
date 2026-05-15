import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Units from './pages/Units';
import Maintenance from './pages/Maintenance';
import Packages from './pages/Packages';
import Notices from './pages/Notices';
import Layout from './components/Layout';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/units" element={<Units />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/notices" element={<Notices />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
