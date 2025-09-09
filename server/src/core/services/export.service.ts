import { Submission, Template, Answer, OperatorNote } from '@prisma/client';
import ExcelJS from 'exceljs';
import { getLocalizedText } from '@bilinguismo/shared';


type SubmissionWithDetails = Submission & {
  template: Template;
  answers: Answer[];
  notes: (OperatorNote & { operator: { full_name: string | null } })[];
};

export const generateSubmissionExcel = async (submission: SubmissionWithDetails): Promise<ExcelJS.Buffer> => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Bilinguismo App';
  workbook.created = new Date();

  const lang = submission.language_used as 'it' | 'en' | 'es' | 'ar' || 'it';
  const structure = submission.template.structure_definition as any;

  // --- Foglio 1: Riepilogo (Summary) ---
  const summarySheet = workbook.addWorksheet('Riepilogo');
  summarySheet.columns = [
    { header: 'Campo', key: 'field', width: 30 },
    { header: 'Valore', key: 'value', width: 50 },
  ];
  summarySheet.addRow({ field: 'ID Compilazione', value: submission.submission_id });
  summarySheet.addRow({ field: 'Codice Fiscale', value: submission.fiscal_code });
  summarySheet.addRow({ field: 'Template Usato', value: submission.template.name });
  summarySheet.addRow({ field: 'Stato', value: submission.status });
  summarySheet.addRow({ field: 'Lingua', value: submission.language_used.toUpperCase() });
  summarySheet.addRow({ field: 'Avviata il', value: new Date(submission.created_at).toLocaleString('it-IT') });
  summarySheet.addRow({ field: 'Completata il', value: submission.completed_at ? new Date(submission.completed_at).toLocaleString('it-IT') : 'N/A' });
  summarySheet.addRow({ field: 'Ultima Modifica', value: new Date(submission.last_updated_at).toLocaleString('it-IT') });

  // Stile per il riepilogo
  summarySheet.getRow(1).font = { bold: true };


  // --- Fogli per ogni Sezione ---
  const answersMap = new Map(submission.answers.map(a => [a.question_identifier, (a.answer_value as any)?.value]));
  const notesMap = new Map<string, string[]>();
  submission.notes.forEach(note => {
      if(note.question_identifier){
        if (!notesMap.has(note.question_identifier)) {
            notesMap.set(note.question_identifier, []);
        }
        notesMap.get(note.question_identifier)!.push(
            `"${note.note_text}" (${note.operator.full_name || 'N/A'} il ${new Date(note.created_at).toLocaleDateString('it-IT')})`
        );
      }
  });


  structure.sections.forEach((section: any, index: number) => {
    // Tronca i nomi dei fogli se troppo lunghi 
    const sectionTitle = getLocalizedText(section.title, lang).substring(0, 25);
    const sheet = workbook.addWorksheet(`S${index + 1} - ${sectionTitle}`);

    sheet.columns = [
      { header: 'ID Domanda', key: 'id', width: 15 },
      { header: 'Testo Domanda', key: 'question', width: 60 },
      { header: 'Risposta Fornita', key: 'answer', width: 40 },
      { header: 'Note Operatore', key: 'notes', width: 60 },
    ];
    sheet.getRow(1).font = { bold: true };

    section.questions.forEach((question: any) => {
      const questionId = question.questionId;
      const questionText = getLocalizedText(question.text, lang);
      let answerText = answersMap.get(questionId) ?? 'N/A';

      
      if ((question.type === 'multiple-choice' || question.type === 'rating') && question.options) {
        const option = question.options.find((opt: any) => opt.value === answerText);
        if (option) {
          answerText = getLocalizedText(option.text, lang);
        }
      }

      const questionNotes = notesMap.get(questionId)?.join('\n') || ''; // Unisci più note con un a capo

      sheet.addRow({
        id: questionId,
        question: questionText,
        answer: answerText,
        notes: questionNotes,
      });
    });
    

    sheet.getColumn('question').alignment = { wrapText: true, vertical: 'top' };
    sheet.getColumn('answer').alignment = { wrapText: true, vertical: 'top' };
    sheet.getColumn('notes').alignment = { wrapText: true, vertical: 'top' };
  });

  
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer ;
};