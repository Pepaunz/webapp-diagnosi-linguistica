import { apiFetch } from "./utilsApi";
import { 
    SubmissionDTO,
    SubmissionDetailDTO,
    ListSubmissionsQuery,
  } from "@bilinguismo/shared";
  
  
  

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
      
      const url = `/submissions${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
      
      return apiFetch(url);
    },
  
    // GET /submissions/:id - Dettagli completi submission
    async getSubmissionById(submissionId: string): Promise<SubmissionDetailDTO> {
      const endpoint = `/submissions/${submissionId}`;
      return apiFetch(endpoint);
    },
  
    // DELETE /submissions/:id - Elimina submission
    async deleteSubmission(submissionId: string): Promise<void> {
      const endpoint = `/submissions/${submissionId}`;
      return apiFetch(endpoint, {
        method: 'DELETE',
      });
    },


    async exportSubmissionById(submissionId: string): Promise<Blob> {
      const response = await fetch(`/submissions/${submissionId}/export`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
     
      if (response.status === 401) {
        throw new Error("Sessione scaduta"); 
      }
      if (!response.ok) {
          // Se c'è un errore, il corpo sarà probabilmente JSON
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP Error: ${response.status}`);
      }
      
      // Restituisce i dati del file come un Blob
      return response.blob();
    },
  };

  
  
 