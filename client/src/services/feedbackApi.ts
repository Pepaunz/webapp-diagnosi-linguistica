import { handleApiResponse } from "./utilsApi";
import { 
    ListFeedbackQuery, 
    UpdateFeedbackInput, 
    FeedbackDTO as Feedback, 
  } from "@bilinguismo/shared";
  
  const API_BASE_URL = "/api/v1";
  
  // ====================================================================
  // FEEDBACK API CALLS
  // ====================================================================
  
  export const feedbackApi = {
    // GET /feedback
    async getFeedbacks(query?: Partial<ListFeedbackQuery>): Promise<{ 
      feedback: Feedback[], 
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
