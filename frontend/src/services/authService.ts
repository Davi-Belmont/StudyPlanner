import type { Usuario } from "../types/api";
import { http } from "./http";

interface AuthResponse {
  usuario: Usuario;
  token: string;
}

interface LoginData {
  email: string;
  senha: string;
}

interface RegisterData extends LoginData {
  nome: string;
}

export const authService = {
  me: () => http.get<Usuario>("/me"),

  login: (data: LoginData) => http.post<AuthResponse>("/auth/login", data),

  register: (data: RegisterData) => http.post<AuthResponse>("/auth/register", data)
};
