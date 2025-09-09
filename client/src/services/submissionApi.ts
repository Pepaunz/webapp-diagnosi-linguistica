import { handleApiResponse } from "./utilsApi";
import { 
    SubmissionDTO,
    SubmissionDetailDTO,
    ListSubmissionsQuery,
  } from "@bilinguismo/shared";
  
  const API_BASE_URL = "/api/v1";
  

  // ====================================================================
  // SUBMISSION API CALLS (OPERATOR SIDE)
  // ====================================================================
  
  export const submissionApi = {
    // GET /submissions - Lista submission per operatori
    async getSubmissions(query?: Partial<ListSubmissionsQuery>): Promise<{
      submissions: SubmissionDTO[];
      total: number;
      pagination: {
        limit: number;
        offset: number;
        has_more: boolean;
      };
    }> {
      const searchParams = new URLSearchParams();
      
      if (query) {
        Object.entries(query).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, String(value));
          }
        });
      }
      
      const url = `${API_BASE_URL}/submissions${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      
      return handleApiResponse(response);
    },
  
    // GET /submissions/:id - Dettagli completi submission
    async getSubmissionById(submissionId: string): Promise<SubmissionDetailDTO> {
      const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      
      return handleApiResponse(response);
    },
  
    // DELETE /submissions/:id - Elimina submission
    async deleteSubmission(submissionId: string): Promise<void> {
      const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      
    return handleApiResponse(response)
    },


    async exportSubmissionById(submissionId: string): Promise<Blob> {
      const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}/export`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
     
      if (!response.ok) {
          // Se c'è un errore, il corpo sarà probabilmente JSON
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP Error: ${response.status}`);
      }
      
      // Restituisce i dati del file come un Blob
      return response.blob();
    },
  };

  
  
 