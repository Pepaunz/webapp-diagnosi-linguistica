// client/src/services/feedbackApi.ts - SERVIZIO API PER FEEDBACK
import { 
    ListFeedbackQuery, 
    UpdateFeedbackInput, 
    Feedback 
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
  
    // PUT /feedback/:uuid - Update status (ora usa UUID)
    async updateStatus(feedbackUuid: string, data: UpdateFeedbackInput): Promise<Feedback> {
      const response = await fetch(`${API_BASE_URL}/feedback/${feedbackUuid}`, { // ✅ USA UUID
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
  
  // ====================================================================
  // MOCK API CALLS (per sviluppo senza backend)
  // ====================================================================
  
  export const mockFeedbackApi = {
    async getFeedbacks(query?: Partial<ListFeedbackQuery>) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data (stesso del componente)
      const mockFeedbacks = [
        {
          id: 1,
          feedback_id: "uuid-feedback-1",
          template_name: "Standard Bilinguismo",
          question_identifier: "s1_q1",
          feedback_text: "The options for language preference should include more regional dialects...",
          status: "New" as const,
          submitted_at: "2025-04-22T14:30:00",
        },
        // Altri feedback mock...
      ];
  
      // Applica filtri mock
      let filteredFeedbacks = mockFeedbacks;
      
      if (query?.status) {
        filteredFeedbacks = filteredFeedbacks.filter(f => f.status === query.status);
      }
  
      return { 
        feedbacks: filteredFeedbacks, 
        total: filteredFeedbacks.length 
      };
    },
  
    async updateStatus(feedbackId: string, data: UpdateFeedbackInput) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock business logic: alcuni feedback non possono cambiare stato
      if (feedbackId === "1" && data.status === "Resolved") {
        const error = new Error("This feedback requires manager approval before resolving");
        (error as any).status = 400;
        throw error;
      }
      
      return {
        id: parseInt(feedbackId),
        feedback_id: `uuid-feedback-${feedbackId}`,
        status: data.status,
       
      };
    }
  };