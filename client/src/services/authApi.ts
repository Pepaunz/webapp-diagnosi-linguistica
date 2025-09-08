import { handleApiResponse } from "./utilsApi";
import { LoginInput } from "@bilinguismo/shared";

const API_BASE_URL = "/api/v1";


// ====================================================================
// AUTH API CALLS
// ====================================================================

export const authApi = {
  // POST /auth/login - Login operatori
  async login(credentials: LoginInput): Promise<{
    access_token: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    return handleApiResponse(response);
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