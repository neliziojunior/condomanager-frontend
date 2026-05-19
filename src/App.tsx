import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Units from './pages/Units';
import Maintenance from './pages/Maintenance';
import Packages from './pages/Packages';
import Notices from './pages/Notices';
import Reservations from './pages/Reservations';
import Documents from './pages/Documents';
import Occurrences from './pages/Occurrences';
import LostFound from './pages/LostFound';
import Chatbot from './pages/Chatbot';
import Polls from './pages/Polls';
import Listings from './pages/Listings';
import Visitors from './pages/Visitors';
import Chat from './pages/Chat';
import Accounting from './pages/Accounting';
import Signatures from './pages/Signatures';
import Inventory from './pages/Inventory'; // ✅ NOVO: Inventory
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
            <Route path="/reservations" element={<Reservations />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/occurrences" element={<Occurrences />} />
            <Route path="/lostfound" element={<LostFound />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/polls" element={<Polls />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/visitors" element={<Visitors />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/accounting" element={<Accounting />} />
            <Route path="/signatures" element={<Signatures />} />
            <Route path="/inventory" element={<Inventory />} /> {/* ✅ NOVO: Inventory */}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
