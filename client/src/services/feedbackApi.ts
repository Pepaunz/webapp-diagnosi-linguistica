import { apiFetch } from "./utilsApi";
import { 
    ListFeedbackQuery, 
    UpdateFeedbackInput, 
    FeedbackDTO as Feedback, 
  } from "@bilinguismo/shared";
  

  
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
      
      const url = `/feedback${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
      
     return apiFetch(url);
    },
  
    // PUT /feedback/:uuid - Update status 
    async updateStatus(feedbackUuid: string, data: UpdateFeedbackInput): Promise<Feedback> {
      const url = `/feedback/${feedbackUuid}`;
      return apiFetch(url, {
          method: 'PUT',
          body: JSON.stringify(data),
        }); 
    },
  };
