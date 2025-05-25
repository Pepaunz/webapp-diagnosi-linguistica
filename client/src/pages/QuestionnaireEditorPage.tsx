import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "../layout/AppLayout";
import { Plus, Save, Eye } from "lucide-react";
import { Button } from "../components/shared/Filters";
import {
  QuestionnaireData,
  Section,
  Question,
  QuestionType,
} from "@shared/types/questionnaire.types";
import { Language } from "@shared/types/common.types";
import SectionEditor from "../components/questionnaire/SectionEditor";
import LanguageSelector from "../components/questionnaire/LanguageSelector";
import { questionnaireTemplates } from "../assets/mock-template";

const QuestionnaireEditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("it");
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData>({
    questionnaireTitle: { it: "", en: "", es: "", ar: "" },
    description: { it: "", en: "", es: "", ar: "" },
    version: "1.0",
    defaultLanguage: "it",
    sections: [],
  });
  const [loading, setLoading] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const sectionsEndRef = useRef<HTMLDivElement>(null);
  const isEditMode = !!id; // Se c'è un ID, stiamo editando
  const [hasUserAddedSection, setHasUserAddedSection] = useState(false);

  // Scroll intelligente per mantenere la nuova sezione al centro della viewport
  useEffect(() => {
    if (hasUserAddedSection && sectionsEndRef.current) {
      const element = sectionsEndRef.current;
      const elementRect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const elementTop = elementRect.top;
      const elementMiddle = elementTop + elementRect.height / 2;
      const viewportMiddle = viewportHeight / 2;

      // Se l'elemento è sotto la metà della viewport, scrolla per metterlo al centro
      if (elementMiddle > viewportMiddle) {
        const scrollTop =
          window.scrollY + elementTop - viewportMiddle + elementRect.height / 2;
        window.scrollTo({
          top: scrollTop,
          behavior: "smooth",
        });
      }

      setHasUserAddedSection(false);
    }
  }, [hasUserAddedSection]);

  useEffect(() => {
    if (id) {
      loadQuestionnaire();
    }
  }, [id]);

  const loadQuestionnaire = async () => {
    setLoading(true);
    try {
      // Cerca il questionario nei template predefiniti
      const templateName = decodeURIComponent(id || "");
      const template = questionnaireTemplates[templateName];

      if (template) {
        setQuestionnaire(template);
      } else {
        // Se non è un template predefinito, potresti caricarlo dal backend
        console.log("Template non trovato:", templateName);
        // Qui potresti fare una chiamata API per caricare un questionario personalizzato
      }
    } catch (error) {
      console.error("Error loading questionnaire:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = () => {
    const newSection: Section = {
      sectionId: `s${questionnaire.sections.length + 1}`,
      title: { it: "", en: "", es: "", ar: "" },
      description: { it: "", en: "", es: "", ar: "" },
      questions: [],
    };

    setQuestionnaire({
      ...questionnaire,
      sections: [...questionnaire.sections, newSection],
    });

    // Attiva lo scroll
    setHasUserAddedSection(true);
  };

  const handleUpdateSection = (index: number, updatedSection: Section) => {
    const updatedSections = [...questionnaire.sections];
    updatedSections[index] = updatedSection;
    setQuestionnaire({
      ...questionnaire,
      sections: updatedSections,
    });
  };

  const handleDeleteSection = (index: number) => {
    if (confirm("Sei sicuro di voler eliminare questa sezione?")) {
      const updatedSections = questionnaire.sections.filter(
        (_, i) => i !== index
      );
      setQuestionnaire({
        ...questionnaire,
        sections: updatedSections,
      });
    }
  };

  const handleSave = async () => {
    try {
      // Implementa la logica di salvataggio
      console.log("Saving questionnaire:", questionnaire);

      // In un'app reale, faresti una chiamata API qui
      // const response = await api.saveQuestionnaire(id || 'new', questionnaire);

      alert("Questionario salvato con successo!");

      // Se è un nuovo questionario, naviga alla lista dopo il salvataggio
      if (!id) {
        navigate("/templates");
      }
    } catch (error) {
      console.error("Error saving questionnaire:", error);
      alert("Errore nel salvataggio del questionario");
    }
  };

  const handlePreview = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  // Funzione per determinare quali lingue sono disponibili nel questionario
  const getAvailableLanguages = (): Language[] => {
    const languages: Language[] = ["it", "en", "es", "ar"];
    const available: Language[] = [];

    languages.forEach((lang) => {
      // Controlla se almeno il titolo del questionario è presente per questa lingua
      if (questionnaire.questionnaireTitle[lang]) {
        available.push(lang);
      }
    });

    // Se nessuna lingua è disponibile, ritorna almeno quella di default
    return available.length > 0
      ? available
      : [questionnaire.defaultLanguage as Language];
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <p>Caricamento questionario...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {id ? "Modifica Questionario" : "Crea Nuovo Questionario"}
          </h2>
          <div className="flex gap-2">
            <Button
              onClick={handlePreview}
              variant="secondary"
              icon={<Eye size={16} />}
            >
              {isPreviewMode ? "Modifica" : "Anteprima"}
            </Button>
            <Button
              onClick={handleSave}
              variant="primary"
              icon={<Save size={16} />}
            >
              Salva
            </Button>
          </div>
        </div>

        {/* Language Selector */}
        <div className="mb-6">
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            availableLanguages={getAvailableLanguages()}
            isEditMode={!isPreviewMode}
          />
          {!getAvailableLanguages().includes(selectedLanguage) &&
            !isPreviewMode && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Stai aggiungendo contenuti per la lingua{" "}
                  <strong>{selectedLanguage.toUpperCase()}</strong>. Completa
                  almeno il titolo del questionario per rendere disponibile
                  questa lingua.
                </p>
              </div>
            )}
        </div>

        {/* Title and Description */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titolo Questionario
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={questionnaire.questionnaireTitle[selectedLanguage] || ""}
              onChange={(e) =>
                setQuestionnaire({
                  ...questionnaire,
                  questionnaireTitle: {
                    ...questionnaire.questionnaireTitle,
                    [selectedLanguage]: e.target.value,
                  },
                })
              }
              disabled={isPreviewMode}
              placeholder={`Inserisci il titolo in ${selectedLanguage.toUpperCase()}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrizione
            </label>
            <textarea
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={questionnaire.description[selectedLanguage] || ""}
              onChange={(e) =>
                setQuestionnaire({
                  ...questionnaire,
                  description: {
                    ...questionnaire.description,
                    [selectedLanguage]: e.target.value,
                  },
                })
              }
              disabled={isPreviewMode}
              placeholder={`Inserisci la descrizione in ${selectedLanguage.toUpperCase()}`}
            />
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {questionnaire.sections.map((section, index) => {
            // Calcola il numero di domande nelle sezioni precedenti
            const previousQuestionsCount = questionnaire.sections
              .slice(0, index)
              .reduce((count, sect) => count + sect.questions.length, 0);

            return (
              <SectionEditor
                key={section.sectionId}
                section={section}
                sectionIndex={index}
                selectedLanguage={selectedLanguage}
                isPreviewMode={isPreviewMode}
                startingQuestionNumber={previousQuestionsCount + 1}
                onUpdate={(updatedSection) =>
                  handleUpdateSection(index, updatedSection)
                }
                onDelete={() => handleDeleteSection(index)}
              />
            );
          })}
          <div ref={sectionsEndRef} />
        </div>

        {/* Add Section Button */}
        {!isPreviewMode && (
          <div className="mt-6 text-center">
            <Button
              onClick={handleAddSection}
              variant="primary"
              icon={<Plus size={16} />}
            >
              Aggiungi Sezione
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default QuestionnaireEditorPage;
