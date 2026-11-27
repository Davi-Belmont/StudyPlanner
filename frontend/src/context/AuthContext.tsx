import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";

import { authService } from "../services/authService";
import { tokenStorage } from "../services/http";
import type { Usuario } from "../types/api";

interface AuthContextValue {
  user: Usuario | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (nome: string, email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {}
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tokenStorage.get()) {
      setLoading(false);
      return;
    }

    authService
      .me()
      .then(setUser)
      .catch(() => {
        setUser(null);
        tokenStorage.clear();
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, senha: string) {
    const resposta = await authService.login({ email, senha });

    tokenStorage.set(resposta.token);
    setUser(resposta.usuario);
  }

  async function register(nome: string, email: string, senha: string) {
    const resposta = await authService.register({ nome, email, senha });

    tokenStorage.set(resposta.token);
    setUser(resposta.usuario);
  }

  function logout() {
    tokenStorage.clear();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
