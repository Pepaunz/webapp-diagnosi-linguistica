
import { 
    Template, 
    CreateTemplateInput, 
    UpdateTemplateInput, 
    ListTemplatesQuery 
  } from "@bilinguismo/shared";
  import { handleApiResponse } from "./utilsApi";
  
  const API_BASE_URL = "/api/v1";
  
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

    // PUT /templates/:id - Aggiorna template
  async updateTemplate(templateId: string, data: UpdateTemplateInput): Promise<Template> {
    const response = await fetch(`${API_BASE_URL}/templates/${templateId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(data),
    });
    
    return handleApiResponse(response);
  },

  
    // PATCH /templates/:id
    async deactivateTemplate(templateId: string, data: UpdateTemplateInput): Promise<Template> {
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
      return handleApiResponse(response)
    },

  };
  
  