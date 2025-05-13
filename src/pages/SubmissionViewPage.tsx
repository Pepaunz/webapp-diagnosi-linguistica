// src/pages/SubmissionViewPage.tsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "../layout/AppLayout";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "../components/shared/Filters";
import { QuestionnaireData, Answer, Language } from "../types/questionnaire";
import SubmissionSectionView from "../components/questionnaire/SubmissionSectionView";

interface Submission {
  submission_id: string;
  fiscal_code: string;
  status: string;
  created_at: string;
  completed_at?: string;
  language_used: Language;
  questionnaire: QuestionnaireData;
  answers: Answer[];
  notes: Note[];
}

interface Note {
  note_id: string;
  question_identifier?: string;
  note_text: string;
  created_at: string;
  operator: {
    full_name: string;
  };
}

const SubmissionViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch submission data
    const fetchSubmission = async () => {
      try {
        // Mock data - in una submission reale, il questionario contiene solo la lingua utilizzata
        const mockSubmission: Submission = {
          submission_id: id || "",
          fiscal_code: "ABCDEF12G34H567I",
          status: "Completed",
          created_at: "2025-04-22T14:30:00",
          completed_at: "2025-04-22T15:45:00",
          language_used: "it",
          questionnaire: {
            questionnaireTitle: {
              it: "Questionario Bilinguismo Base v1.0",
              en: "",
              es: "",
              ar: "",
            },
            description: {
              it: "Questionario iniziale per la valutazione del bilinguismo",
              en: "",
              es: "",
              ar: "",
            },
            version: "1.0",
            defaultLanguage: "it",
            sections: [
              {
                sectionId: "s1",
                title: {
                  it: "Informazioni di Base",
                  en: "",
                  es: "",
                  ar: "",
                },
                questions: [
                  {
                    questionId: "s1_q1",
                    text: {
                      it: "Nome del bambino/a:",
                      en: "",
                      es: "",
                      ar: "",
                    },
                    type: "text",
                    required: true,
                  },
                  {
                    questionId: "s1_q2",
                    text: {
                      it: "Da chi principalmente sente parlare italiano in casa?",
                      en: "",
                      es: "",
                      ar: "",
                    },
                    type: "multiple-choice",
                    required: true,
                    options: [
                      {
                        value: "mamma",
                        text: {
                          it: "Mamma",
                          en: "",
                          es: "",
                          ar: "",
                        },
                      },
                      {
                        value: "papa",
                        text: {
                          it: "Papà",
                          en: "",
                          es: "",
                          ar: "",
                        },
                      },
                      {
                        value: "entrambi",
                        text: {
                          it: "Entrambi",
                          en: "",
                          es: "",
                          ar: "",
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          answers: [
            {
              answer_id: "1",
              submission_id: id || "",
              question_identifier: "s1_q1",
              answer_value: { value: "Mario Rossi" },
              saved_at: "2025-04-22T14:35:00",
            },
            {
              answer_id: "2",
              submission_id: id || "",
              question_identifier: "s1_q2",
              answer_value: { value: "mamma" },
              saved_at: "2025-04-22T14:36:00",
            },
          ],
          notes: [
            {
              note_id: "1",
              question_identifier: "s1_q2",
              note_text:
                "La famiglia ha specificato che anche il papà parla occasionalmente italiano con il bambino",
              created_at: "2025-04-22T16:00:00",
              operator: {
                full_name: "Dr. Giovanni Bianchi",
              },
            },
          ],
        };

        setSubmission(mockSubmission);
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

  const getLanguageName = (lang: Language): string => {
    const languageNames = {
      it: "Italiano",
      en: "English",
      es: "Español",
      ar: "العربية",
    };
    return languageNames[lang];
  };

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
              <p className="font-medium">
                {getLanguageName(submission.language_used)}
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
          {submission.questionnaire.sections.map((section, index) => (
            <SubmissionSectionView
              key={section.sectionId}
              section={section}
              sectionIndex={index}
              selectedLanguage={submission.language_used}
              answers={submission.answers}
              notes={submission.notes}
              onAddNote={(questionId, noteText) => {
                // Handle add note
                console.log("Add note:", questionId, noteText);
              }}
            />
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default SubmissionViewPage;
