// src/pages/SubmissionViewPage.tsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "../layout/AppLayout";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "../components/shared/Filters";
import { Section } from "@bilinguismo/shared";
import SubmissionSectionView from "../components/questionnaire/SubmissionSectionView";
import { SubmissionDetailDTO as Submission } from "@bilinguismo/shared";
import {submissionTemplates} from "../assets/mock-submission";
import {useError} from "../context/ErrorContext";
import { LoadingSpinner } from "../../../family-client/src/components/ui";
import {addNoteRequestSchema,uuidParamSchema} from "../../../shared/src/schemas";
import {z} from "zod";


const SubmissionViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingNote, setAddingNote] = useState<string | null>(null); // questionId being noted
  const { showError, showSuccess } = useError();

  useEffect(() => {
    // Valida ID usando schema Zod
    if (id) {
      try {
        uuidParamSchema.parse({ id });
        fetchSubmission();
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errorMessage = error.issues[0].message;
          showError(`ID submission non valido: ${errorMessage}`, 'validation');
          navigate('/');
          return;
        }
      }
    }
  }, [id]);

  const fetchSubmission = async () => {
    if (!id) {
      showError("ID submission non valido", 'validation');
      navigate('/');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Fetching submission:", id);
      
      // TODO: Sostituisci con vera chiamata API
      // const response = await submissionApi.getSubmissionById(id);
      // setSubmission(response);
      
      // MOCK: Simula caricamento con possibili errori
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockData = submissionTemplates[id] || submissionTemplates["sub_001"];
      
      if (!mockData) {
        throw new Error("Submission non trovata");
      }
      
      setSubmission(mockData);
      
    } catch (error) {
      console.error("Error fetching submission:", error);
      showError("Errore nel caricamento della compilazione", 'server');
      
      // Naviga indietro dopo un errore di caricamento
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (questionId: string, noteText: string) => {
    // Validazione usando schema Zod
    try {
      addNoteRequestSchema.parse({
        note_text: noteText,
        question_identifier: questionId
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.issues[0].message;
        showError(`Errore validazione nota: ${errorMessage}`, 'validation');
        return;
      }
    }
  
    setAddingNote(questionId);
    
    try {
      console.log("Adding note:", questionId, noteText);
      
      // TODO: Sostituire con vera chiamata API
      // await notesApi.addNote(submission!.submission.id, {
      //   note_text: noteText,
      //   question_identifier: questionId
      // });
      
      // MOCK: Simula aggiunta nota
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simula aggiunta della nota alla lista locale
      const newNote = {
        note_id: `note_${Date.now()}`,
        question_identifier: questionId,
        note_text: noteText,
        operator_full_name: "Operatore Corrente", // TODO: prendere da auth
        created_at: new Date().toISOString(),
      };
      
      if (submission) {
        setSubmission({
          ...submission,
          notes: [...submission.notes, newNote]
        });
      }
      
      showSuccess("Nota aggiunta con successo");
      
    } catch (error) {
      console.error("Error adding note:", error);
      showError("Errore nell'aggiunta della nota", 'server');
    } finally {
      setAddingNote(null);
    }
  };

  const handleRefreshSubmission = async () => {
    await fetchSubmission();
    showSuccess("Dati aggiornati");
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" text="Caricamento compilazione..." />
        </div>
      </AppLayout>
    );
  }
  
  if (!submission) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-gray-500 text-lg">Compilazione non trovata</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Torna alla Dashboard
          </button>
        </div>
      </AppLayout>
    );
  }

  if (!submission) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <p>Submission non trovata</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-2xl font-bold">
              Visualizza Compilazione #{submission.submission.id}
            </h2>
            <button
              onClick={handleRefreshSubmission}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
              disabled={loading}
            >
              Aggiorna dati
            </button>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                /* Export logic */
              }}
              variant="secondary"
              icon={<FileText size={16} />}
            >
              Esporta
            </Button>
          </div>
        </div>

        {/* Submission Info */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Codice Fiscale</p>
              <p className="font-medium">{submission.submission.fiscalCode}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Template</p>
              <p className="font-medium">{submission.submission.template}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Stato</p>
              <p className="font-medium">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    submission.submission.status === "Completed"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {submission.submission.status === "Completed"
                    ? "Completato"
                    : "In corso"}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Progresso</p>
              <p className="font-medium">{submission.submission.progress}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Lingua utilizzata</p>
              <p className="font-medium flex items-center gap-2">
                {(() => {
                  const langMap = {
                    it: { name: "Italiano", flag: "🇮🇹" },
                    en: { name: "English", flag: "🇬🇧" },
                    es: { name: "Español", flag: "🇪🇸" },
                    ar: { name: "العربية", flag: "🇸🇦" },
                  };
                  const lang = langMap[submission.submission.language];
                  return (
                    <>
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </>
                  );
                })()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ultimo aggiornamento</p>
              <p className="font-medium">
                {new Date(submission.submission.lastUpdated).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Completato il</p>
              <p className="font-medium">
                {submission.submission.completedOn
                  ? new Date(submission.submission.completedOn).toLocaleString()
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Questionnaire Content */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h3 className="text-xl font-semibold mb-2">
            {submission.template.structure_definition.questionnaireTitle?.[submission.submission.language] || submission.template.name}
          </h3>
          <p className="text-gray-600">
            {submission.template.structure_definition.description?.[submission.submission.language] || submission.template.description}
          </p>
        </div>

        {/* Sections with Answers */}
        <div className="space-y-6">
          {submission.template.structure_definition.sections.map((section: Section, index: number) => {
            // Calcola il numero di domande nelle sezioni precedenti
            const previousQuestionsCount = submission.template.structure_definition.sections
              .slice(0, index)
              .reduce((count: number, sect: Section) => count + sect.questions.length, 0);

            return (
              <SubmissionSectionView
                key={section.sectionId}
                section={section}
                sectionIndex={index}
                selectedLanguage={submission.submission.language}
                startingQuestionNumber={previousQuestionsCount + 1}
                answers={submission.answers}
                notes={submission.notes}
                onAddNote={handleAddNote}
                addingNoteToQuestion={addingNote}
              />
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};
export default SubmissionViewPage;
