import { 
    OperatorNoteDTO,
    AddNoteRequest,
    UpdateNoteRequest
  } from "@bilinguismo/shared";
  import { apiFetch } from "./utilsApi";

  export const notesApi = {
    // GET /submissions/:id/notes - Lista note per submission
    async getNotesBySubmissionId(submissionId: string): Promise<{
      notes: OperatorNoteDTO[];
      total: number;
    }> {
      return apiFetch(`/submissions/${submissionId}/notes`);
    },
  
    // POST /submissions/:id/notes - Crea nuova nota
    async createNote(submissionId: string, data: AddNoteRequest): Promise<OperatorNoteDTO> {
     const url = `/submissions/${submissionId}/notes`;
     return apiFetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
     });
    },
  
    // PUT /submissions/:submissionId/notes/:noteId - Aggiorna nota
    async updateNote(
      submissionId: string, 
      noteId: string, 
      data: UpdateNoteRequest
    ): Promise<OperatorNoteDTO> {
      const url = `/submissions/${submissionId}/notes/${noteId}`;
      return apiFetch(url, {
        method: 'PUT',
        body: JSON.stringify(data), 
      });

    },
  
    // DELETE /submissions/:submissionId/notes/:noteId - Elimina nota
    async deleteNote(submissionId: string, noteId: string): Promise<void> {
      const url = `/submissions/${submissionId}/notes/${noteId}`;
      return apiFetch(url, {
        method: 'DELETE',
      });
    },
  };