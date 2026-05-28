import { createContext, useContext, useState, ReactNode } from 'react';
import api from '../services/api';

interface AuthContextType {
  token: string | null;
  role: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(localStorage.getItem('@condomanager:token'));
  const [role, setRole] = useState<string | null>(null);

  // Extrair role do token
  const getRole = (tk: string) => {
    try {
      const payload = JSON.parse(atob(tk.split('.')[1]));
      return payload.role;
    } catch { return null; }
  };

  // Inicializar role
  useState(() => {
    if (token) setRole(getRole(token));
  });

  async function login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('@condomanager:token', data.access_token);
    setToken(data.access_token);
    setRole(getRole(data.access_token));
  }

  async function register(name: string, email: string, password: string) {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('@condomanager:token', data.access_token);
    setToken(data.access_token);
    setRole(getRole(data.access_token));
  }

  function logout() {
    localStorage.removeItem('@condomanager:token');
    setToken(null);
    setRole(null);
  }

  return (
    <AuthContext.Provider value={{ token, role, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
