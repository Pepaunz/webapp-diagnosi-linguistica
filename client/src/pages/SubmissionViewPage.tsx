// src/pages/SubmissionViewPage.tsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "../layout/AppLayout";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "../components/shared/Filters";
import { Section } from "@bilinguismo/shared";
import SubmissionSectionView from "../components/questionnaire/SubmissionSectionView";
import { SubmissionDetailDTO as Submission } from "@bilinguismo/shared";


const SubmissionViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmission = async () => {
      if (!id) return;
      
      try {
        // TODO: Sostituisci con chiamata API reale
        // const data = await submissionApi.getSubmissionById(id);
        // setSubmission(data);
        
        // TEMP: Mock fino a quando non implementi l'API
        console.log("Fetching submission:", id);
        // setSubmission(mockData); // Rimuovi quando hai l'API
        
      } catch (error) {
        console.error("Error fetching submission:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <p>Caricamento...</p>
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
                onAddNote={(questionId, noteText) => {
                  console.log("Add note:", questionId, noteText);
                  // TODO: Implementa logica per aggiungere nota
                }}
              />
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};
export default SubmissionViewPage;
