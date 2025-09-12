import { apiFetch } from "./utilsApi";
import { LoginInput,  } from "@bilinguismo/shared";

const API_BASE_URL = "/api/v1";

interface AuthResponse {
  access_token: string;
}
// ====================================================================
// AUTH API CALLS
// ====================================================================

export const authApi = {
  // POST /auth/login - Login operatori
  async login(credentials: LoginInput): Promise<AuthResponse> {
    return apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Funzioni utility per gestione token localStorage
  saveToken(token: string): void {
    localStorage.setItem('authToken', token);
  },

  getToken(): string | null {
    return localStorage.getItem('authToken');
  },

  removeToken(): void {
    localStorage.removeItem('authToken');
  },

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null;
  },

  // Logout (rimuove solo il token locale, il server-side è stateless)
  logout(): void {
    this.removeToken();
  },
};