import { authApi } from "./authApi";
interface ApiErrorResponse {
  message: string;
  details?: any;
  field?: string;
}

export class ApiError extends Error {
  public status: number;
  public response?: ApiErrorResponse;

  constructor(status: number, message: string, response?: ApiErrorResponse) {
    super(message);
    this.status = status;
    this.response = response;
    this.name = "ApiError";
  }
}
let onUnauthorized: () => void = () => {};
export const setUnauthorizedCallback = (callback: () => void) => {
  onUnauthorized = callback;
};

const handleApiResponse = async <T>(response: Response): Promise<T> => {
  // Se la risposta è 401, chiama il callback di logout
  if (response.status === 401) {
    onUnauthorized(); // Attiva l'azione di logout globale
    throw new ApiError(
      401,
      "Sessione scaduta o non valida. Effettua nuovamente il login."
    );
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.message || "Errore sconosciuto"
    );
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
};

export const apiFetch = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = authApi.getToken();

  const headers = new Headers({
    "Content-Type": "application/json",

    ...(options.headers || {}),
  });

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(`/api/v1${endpoint}`, {
      ...options,

      headers: headers,
    });

    return await handleApiResponse<T>(response);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      console.warn(
        "Unauthorized (401) response detected. Triggering global logout."
      );
      onUnauthorized();
    }
    throw error;
  }
};
