// src/pages/SubmissionViewPage.tsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "../layout/AppLayout";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "../components/shared/Filters";
import { Submission, Language } from "../types/questionnaire";
import SubmissionSectionView from "../components/questionnaire/SubmissionSectionView";
import { submissionTemplates } from "../assets/mock-submission";
import { bilingualismQuestionnaire } from "../assets/mock-template";

const SubmissionViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch submission data
    const fetchSubmission = async () => {
      try {
        // Qui usiamo i dati importati
        const submissionData = submissionTemplates["sub_001"];
        console.log("Submission data:", submissionData);
        if (submissionData) {
          // Usa il questionario completo da questionnaireTemplates
          // ma mantieni solo la lingua selezionata nella submission
          const fullQuestionnaire = bilingualismQuestionnaire;

          setSubmission({
            ...submissionData,
            questionnaire: {
              ...fullQuestionnaire,
              // Sovrascrivi con solo i dati nella lingua utilizzata
              sections: fullQuestionnaire.sections.map((section) => ({
                ...section,
                questions: section.questions.map((question) => ({
                  ...question,
                  text: {
                    [submissionData.language_used]:
                      question.text[submissionData.language_used] || "",
                    it:
                      submissionData.language_used === "it"
                        ? question.text.it || ""
                        : "",
                    en:
                      submissionData.language_used === "en"
                        ? question.text.en || ""
                        : "",
                    es:
                      submissionData.language_used === "es"
                        ? question.text.es || ""
                        : "",
                    ar:
                      submissionData.language_used === "ar"
                        ? question.text.ar || ""
                        : "",
                  },
                  options: question.options?.map((option) => ({
                    ...option,
                    text: {
                      [submissionData.language_used]:
                        option.text[submissionData.language_used] || "",
                      it:
                        submissionData.language_used === "it"
                          ? option.text.it || ""
                          : "",
                      en:
                        submissionData.language_used === "en"
                          ? option.text.en || ""
                          : "",
                      es:
                        submissionData.language_used === "es"
                          ? option.text.es || ""
                          : "",
                      ar:
                        submissionData.language_used === "ar"
                          ? option.text.ar || ""
                          : "",
                    },
                  })),
                })),
              })),
            },
          });
        } else {
          console.error("Submission not found:", id);
        }
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
            <h2 className="text-2xl font-bold">Visualizza Compilazione</h2>
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
              <p className="font-medium">{submission.fiscal_code}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Stato</p>
              <p className="font-medium">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    submission.status === "Completed"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {submission.status === "Completed"
                    ? "Completato"
                    : "In corso"}
                </span>
              </p>
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
                  const lang = langMap[submission.language_used];
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
              <p className="text-sm text-gray-500">Completato il</p>
              <p className="font-medium">
                {submission.completed_at
                  ? new Date(submission.completed_at).toLocaleString()
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Questionnaire Content */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h3 className="text-xl font-semibold mb-2">
            {
              submission.questionnaire.questionnaireTitle[
                submission.language_used
              ]
            }
          </h3>
          <p className="text-gray-600">
            {submission.questionnaire.description[submission.language_used]}
          </p>
        </div>

        {/* Sections with Answers */}
        <div className="space-y-6">
          {submission.questionnaire.sections.map((section, index) => {
            // Calcola il numero di domande nelle sezioni precedenti
            const previousQuestionsCount = submission.questionnaire.sections
              .slice(0, index)
              .reduce((count, sect) => count + sect.questions.length, 0);

            return (
              <SubmissionSectionView
                key={section.sectionId}
                section={section}
                sectionIndex={index}
                selectedLanguage={submission.language_used}
                startingQuestionNumber={previousQuestionsCount + 1}
                answers={submission.answers}
                notes={submission.notes}
                onAddNote={(questionId, noteText) => {
                  // Handle add note
                  console.log("Add note:", questionId, noteText);
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
