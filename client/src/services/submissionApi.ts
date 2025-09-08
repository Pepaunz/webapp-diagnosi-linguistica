import { handleApiResponse } from "./utilsApi";
import { 
    SubmissionDTO,
    SubmissionDetailDTO,
    ListSubmissionsQuery,
    ModifyAnswerRequest
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
  };
  
 