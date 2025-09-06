// client/src/services/feedbackApi.ts - SERVIZIO API PER FEEDBACK
import { 
    ListFeedbackQuery, 
    UpdateFeedbackInput, 
    FeedbackDTO as Feedback, 
  } from "@bilinguismo/shared";
  
  const API_BASE_URL = "/api/v1";
  
  // Utility per gestione errori
  const handleApiResponse = async (response: Response) => {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || `HTTP ${response.status}`);
      (error as any).status = response.status;
      (error as any).response = { data: errorData };
      throw error;
    }
    return response.json();
  };
  
  // ====================================================================
  // FEEDBACK API CALLS
  // ====================================================================
  
  export const feedbackApi = {
    // GET /feedback
    async getFeedbacks(query?: Partial<ListFeedbackQuery>): Promise<{ 
      feedbacks: Feedback[], 
      total: number 
    }> {
      const searchParams = new URLSearchParams();
      
      if (query) {
        Object.entries(query).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, String(value));
          }
        });
      }
      
      const url = `${API_BASE_URL}/feedback${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      
      return handleApiResponse(response);
    },
  
    // PUT /feedback/:uuid - Update status 
    async updateStatus(feedbackUuid: string, data: UpdateFeedbackInput): Promise<Feedback> {
      const response = await fetch(`${API_BASE_URL}/feedback/${feedbackUuid}`, { 
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(data),
      });
      
      return handleApiResponse(response);
    },
  };
