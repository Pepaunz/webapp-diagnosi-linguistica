
import { 
    Template, 
    CreateTemplateInput, 
    UpdateTemplateInput, 
    ListTemplatesQuery 
  } from "@bilinguismo/shared";
  import { apiFetch } from "./utilsApi";
  

  
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
      
      const url = `/templates${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
      
      return apiFetch(url);
    },
  
    // GET /templates/:id
    async getTemplateById(templateId: string): Promise<Template> {
      const url = `/templates/${templateId}`;
      return apiFetch(url);
    },
  
    // POST /templates
    async createTemplate(data: CreateTemplateInput): Promise<Template> {
     const url =  `/templates`;
     return apiFetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    // PUT /templates/:id - Aggiorna template
  async updateTemplate(templateId: string, data: UpdateTemplateInput): Promise<Template> {
   const url = `/templates/${templateId}`;
    return apiFetch(url, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
  },

  
    // PATCH /templates/:id
    async deactivateTemplate(templateId: string, data: UpdateTemplateInput): Promise<Template> {
    const url = `$/templates/${templateId}`;
    return apiFetch(url, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
    },
  
    // DELETE /templates/:id
    async deleteTemplate(templateId: string): Promise<void> {
     const url = `/templates/${templateId}`;
     return apiFetch(url, {
        method: 'DELETE',
      });
    },

  };
  
  