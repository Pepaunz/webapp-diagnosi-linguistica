// client/src/services/templateApi.ts - SERVIZIO API PER TEMPLATE
import { 
    Template, 
    CreateTemplateInput, 
    UpdateTemplateInput, 
    ListTemplatesQuery 
  } from "@bilinguismo/shared";
  
  // Configurazione base API
  const API_BASE_URL = "/api/v1";
  
  // Utility per gestione errori fetch
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
  // TEMPLATE API CALLS
  // ====================================================================
  
  export const templateApi = {
    // GET /templates
    async getTemplates(query?: Partial<ListTemplatesQuery>): Promise<{ 
      templates: Template[], 
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
      
      const url = `${API_BASE_URL}/templates${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // TODO: gestire auth
        },
      });
      
      return handleApiResponse(response);
    },
  
    // GET /templates/:id
    async getTemplateById(templateId: string): Promise<Template> {
      const response = await fetch(`${API_BASE_URL}/templates/${templateId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      
      return handleApiResponse(response);
    },
  
    // POST /templates
    async createTemplate(data: CreateTemplateInput): Promise<Template> {
      const response = await fetch(`${API_BASE_URL}/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(data),
      });
      
      return handleApiResponse(response);
    },
  
    // PATCH /templates/:id
    async updateTemplate(templateId: string, data: UpdateTemplateInput): Promise<Template> {
      const response = await fetch(`${API_BASE_URL}/templates/${templateId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(data),
      });
      
      return handleApiResponse(response);
    },
  
    // DELETE /templates/:id
    async deleteTemplate(templateId: string): Promise<void> {
      const response = await fetch(`${API_BASE_URL}/templates/${templateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `HTTP ${response.status}`);
        (error as any).status = response.status;
        (error as any).response = { data: errorData };
        throw error;
      }
    },
  
    // GET /templates/:id/submissions/count - Controlla se template ha submission
    async getSubmissionCount(templateId: string): Promise<{ count: number }> {
      const response = await fetch(`${API_BASE_URL}/templates/${templateId}/submissions/count`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      
      return handleApiResponse(response);
    },
  };
  
  // ====================================================================
  // MOCK API CALLS (per sviluppo senza backend)
  // ====================================================================
  
  export const mockTemplateApi = {
    async getTemplates(query?: Partial<ListTemplatesQuery>) {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simula latenza
      
      // Mock data che simula risposta backend
      const mockTemplates: Template[] = [
        {
          template_id: "uuid-1",
          name: "Standard Bilinguismo",
          description: "Template standard per valutazione bilinguismo", 
          structure_definition: {} as any, // Mock
          is_active: true,
          available_languages: ["it", "en"],
          created_at: new Date("2025-04-20"),
          updated_at: new Date("2025-04-24")
        },
        // Altri mock templates...
      ];
  
      return { templates: mockTemplates, total: mockTemplates.length };
    },
  
    async deleteTemplate(templateId: string) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock business logic: alcuni template non possono essere eliminati
      if (templateId === "uuid-1") {
        const error = new Error("Cannot delete template with associated submissions. Found 5 linked submissions.");
        (error as any).status = 400;
        (error as any).response = { 
          data: { 
            message: "Cannot delete template with associated submissions. Found 5 linked submissions.",
            status_code: 400 
          } 
        };
        throw error;
      }
      
      // Successo
      return;
    },
  
    async getSubmissionCount(templateId: string) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mock logic
      const mockCounts: Record<string, number> = {
        "uuid-1": 5,  // Ha submission
        "uuid-2": 0,  // Nessuna submission 
        "uuid-3": 2   // Ha submission
      };
      
      return { count: mockCounts[templateId] || 0 };
    }
  };