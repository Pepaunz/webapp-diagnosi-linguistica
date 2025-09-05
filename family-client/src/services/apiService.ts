// src/services/apiService.ts - API Service per Family Client
import { 
    StartOrResumeRequest, 
    SaveProgressRequest, 
    CompleteSubmissionBody,
    SubmitFeedbackInput
  } from '@bilinguismo/shared';
  
  const API_BASE_URL = '/api/v1';
  
  // Utility per gestione errori
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
      this.name = 'ApiError';
    }
  }
  
  const handleApiResponse = async (response: Response) => {
    if (!response.ok) {
      let errorData: ApiErrorResponse;
      
      try {
        errorData = await response.json();
      } catch {
        // Se la risposta non è JSON, usa messaggio generico
        errorData = { 
          message: response.status === 500 
            ? 'Errore interno del server' 
            : `Errore HTTP${response.status}`
        };
      }
      
      throw new ApiError(response.status, errorData.message, errorData);
    }
    
    return response.json();
  };
  
  // ====================================================================
  // API CALLS PER SUBMISSION
  // ====================================================================
  
  export const submissionApi = {
    // POST /submissions/start_or_resume
    async startOrResume(data: StartOrResumeRequest): Promise<{
      submission_id: string;
      status: 'InProgress';
      current_step_identifier: string | null;
      answers: any[];
      questionnaire_template: any;
    }> {
      const response = await fetch(`${API_BASE_URL}/submissions/start_or_resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      return handleApiResponse(response);
    },
  
    // PUT /submissions/:id/save_progress
    async saveProgress(submissionId: string, data: SaveProgressRequest): Promise<{
      message: string;
      last_updated_at: string;
    }> {
      const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}/save_progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      return handleApiResponse(response);
    },
  
    // POST /submissions/:id/complete
    async complete(submissionId: string, data: CompleteSubmissionBody): Promise<{
      message: string;
      submission: any;
    }> {
      const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      return handleApiResponse(response);
    },
  };
  
  // ====================================================================
  // API CALLS PER FEEDBACK
  // ====================================================================
  
  export const feedbackApi = {
    // POST /feedback
    async submitFeedback(data: SubmitFeedbackInput): Promise<{
      feedback_id: string;
      message: string;
      submitted_at: string;
    }> {
      const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      return handleApiResponse(response);
    },
  };
  
  // ====================================================================
  // UTILITY FUNCTIONS PER ERROR HANDLING
  // ====================================================================
  
  export const getErrorMessage = (error: unknown): string => {
    if (error instanceof ApiError) {
      return error.message;
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    return 'Si è verificato un errore imprevisto';
  };
  
  export const isNetworkError = (error: unknown): boolean => {
    return error instanceof TypeError && error.message.includes('Failed to fetch');
  };
  
  export const getNetworkErrorMessage = (): string => {
    return 'Problemi di connessione. Controlla la connessione internet e riprova.';
  };
  
  export const getValidationErrorMessage = (error: ApiError): string => {
    if (error.status === 400 && error.response?.details) {
      // Gestisci errori di validazione Zod
      const details = error.response.details;
      if (Array.isArray(details)) {
        return details[0]?.message || error.message;
      }
    }
    
    return error.message;
  };