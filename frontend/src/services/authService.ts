import type { Usuario } from "../types/api";
import { http } from "./http";

interface LoginResponse {
  usuario: Usuario;
  token: string;
}

interface LoginData {
  email: string;
  senha: string;
}

export const authService = {
  me: () => http.get<Usuario>("/me"),

  login: (data: LoginData) =>
    http.post<LoginResponse>("/auth/login", data)
};
