import { 
    OperatorNoteDTO,
    AddNoteRequest,
    UpdateNoteRequest
  } from "@bilinguismo/shared";
  import { handleApiResponse } from "./utilsApi";
  const API_BASE_URL = "/api/v1";

  export const notesApi = {
    // GET /submissions/:id/notes - Lista note per submission
    async getNotesBySubmissionId(submissionId: string): Promise<{
      notes: OperatorNoteDTO[];
      total: number;
    }> {
      const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}/notes`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      
      return handleApiResponse(response);
    },
  
    // POST /submissions/:id/notes - Crea nuova nota
    async createNote(submissionId: string, data: AddNoteRequest): Promise<OperatorNoteDTO> {
      const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(data),
      });
      
      return handleApiResponse(response);
    },
  
    // PUT /submissions/:submissionId/notes/:noteId - Aggiorna nota
    async updateNote(
      submissionId: string, 
      noteId: string, 
      data: UpdateNoteRequest
    ): Promise<OperatorNoteDTO> {
      const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(data),
      });
      
      return handleApiResponse(response);

    },
  
    // DELETE /submissions/:submissionId/notes/:noteId - Elimina nota
    async deleteNote(submissionId: string, noteId: string): Promise<void> {
      const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      return handleApiResponse(response);
    },
  };