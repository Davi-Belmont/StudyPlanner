import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authService } from "../services/authService";
import { tokenStorage } from "../services/http";
import type { Usuario } from "../types/api";

interface AuthContextValue {
  user: Usuario | null;
}

const AuthContext = createContext<AuthContextValue>({ user: null });

// Busca GET /me apenas se existir token salvo. Sem token, o app segue sem usuário.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);

  useEffect(() => {
    if (!tokenStorage.get()) return;

    authService
      .me()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
