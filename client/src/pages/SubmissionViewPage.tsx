// src/pages/SubmissionViewPage.tsx

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "../layout/AppLayout";
import { ArrowLeft, FileText, Loader2 } from "lucide-react";
import { Button } from "../components/shared/Filters";
import { Section } from "@bilinguismo/shared";
import SubmissionSectionView from "../components/questionnaire/SubmissionSectionView";
import { SubmissionDetailDTO as Submission } from "@bilinguismo/shared";
import { AddNoteRequest } from "@bilinguismo/shared";
import {useError} from "../context/ErrorContext";
import { LoadingSpinner } from "../../../family-client/src/components/ui";
import { submissionApi } from "../services/submissionApi";
import { notesApi } from "../services/notesApi";


const SubmissionViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingNote, setAddingNote] = useState<string | null>(null); // questionId being noted
  const [isExporting, setIsExporting] = useState(false); 
  const { showError, showSuccess } = useError();


  const fetchSubmission = useCallback (async () => {
    if (!id) return;
    
    setLoading(true);
    
    try {
      console.log("Fetching submission:", id);
      
    
      const response = await submissionApi.getSubmissionById(id);
      setSubmission(response);

      
    } catch (error) {
      console.error("Error fetching submission:", error);
      showError("Errore nel caricamento della compilazione", 'server');

      setTimeout(() => {
        navigate('/');
      }, 3000);
    } finally {
      setLoading(false);
    }
  },[id, navigate, showError]);


  useEffect(() => {
    if (id) {
      fetchSubmission();
    } else {
      showError("ID submission mancante.", 'validation');
      navigate('/');
    }
  }, [id, fetchSubmission, navigate, showError]);

  

  const handleAddNote = async (questionId: string, noteText: string) => {
    if(!submission) return;

    const noteData: AddNoteRequest = {
      note_text: noteText,
      question_identifier: questionId,
    };
    
  
    setAddingNote(questionId);
    try {
      console.log("Adding note:", questionId, noteText);

      const newNote = await notesApi.createNote(submission.submission.uuid, noteData);
      
      // Aggiorna lo stato locale con la nota restituita dal server
      setSubmission(prev => prev ? { ...prev, notes: [...prev.notes, newNote] } : null);
      
      showSuccess("Nota aggiunta con successo");
      
    } catch (error) {
      console.error("Error adding note:", error);
      showError("Errore nell'aggiunta della nota", 'server');
    } finally {
      setAddingNote(null);
    }
  };

  const handleExport = async () => {
    if (!id) return;
    
    setIsExporting(true);
    showSuccess('Preparazione del file in corso...'); // Feedback immediato
    
    try {
        
        const blob = await submissionApi.exportSubmissionById(id);       
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fileName = `submission_${submission?.submission.fiscalCode}_${new Date().toISOString().split('T')[0]}.xlsx`;
        a.download = fileName; 
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();

    } catch (error: any) {
        console.error("Error exporting submission:", error);
        showError(error.message || "Errore durante l'esportazione.", 'server');
    } finally {
        setIsExporting(false);
    }
  };

  const handleRefreshSubmission = useCallback(async () => {
    await fetchSubmission();
    showSuccess("Dati aggiornati");
  }, [fetchSubmission, showSuccess]);


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
              Visualizza Compilazione
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
            onClick={handleExport}
            variant="primary"
            icon={isExporting ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
            disabled={isExporting}
          >
            {isExporting ? 'Esportando...' : 'Esporta'}
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
                {new Date(submission.submission.lastUpdated).toLocaleDateString("it-IT", {
              year: "numeric", month: "long", day: "numeric", timeZone: 'UTC'
              })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Completato il</p>
              <p className="font-medium">
                {submission.submission.completedOn
                  ? new Date(submission.submission.completedOn).toLocaleDateString(
                    "it-IT", {
              year: "numeric", month: "long", day: "numeric", timeZone: 'UTC'
              }
                  )
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
