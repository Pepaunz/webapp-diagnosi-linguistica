import { useState } from "react";
import AppLayout from "../layout/AppLayout";
import { Plus, Save, Eye } from "lucide-react";
import { Button } from "../components/shared/Filters";
import {
  QuestionnaireData,
  Section,
  Question,
  QuestionType,
  Language,
} from "../types/questionnaire";
import SectionEditor from "../components/questionnaire/SectionEditor";
import LanguageSelector from "../components/questionnaire/LanguageSelector";
const QuestionnaireEditorPage = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("it");
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData>({
    questionnaireTitle: { it: "", en: "", es: "", ar: "" },
    description: { it: "", en: "", es: "", ar: "" },
    version: "1.0",
    defaultLanguage: "it",
    sections: [],
  });

  const [isPreviewMode, setIsPreviewMode] = useState(false);

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

  const handleSave = () => {
    // Implement save logic
    console.log("Saving questionnaire:", questionnaire);
    alert("Questionario salvato con successo!");
  };

  const handlePreview = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {isPreviewMode ? "Anteprima Questionario" : "Editor Questionario"}
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
          />
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
          {questionnaire.sections.map((section, index) => (
            <SectionEditor
              key={section.sectionId}
              section={section}
              sectionIndex={index}
              selectedLanguage={selectedLanguage}
              isPreviewMode={isPreviewMode}
              onUpdate={(updatedSection) =>
                handleUpdateSection(index, updatedSection)
              }
              onDelete={() => handleDeleteSection(index)}
            />
          ))}
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
