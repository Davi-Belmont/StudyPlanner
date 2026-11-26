import type { Usuario } from "../types/api";
import { http } from "./http";

export const authService = {
  me: () => http.get<Usuario>("/me")
};
