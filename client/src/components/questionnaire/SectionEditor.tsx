// src/components/questionnaire/SectionEditor.tsx

import React, { useState, useEffect, useRef } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import {
  Section,
  Question,
  QuestionType,
} from "@shared/types/questionnaire.types";
import { Language } from "@shared/types/common.types";
import QuestionEditor from "./QuestionEditor";
import QuestionTypeSelector from "./QuestionTypeSelector";
import { Button } from "../shared/Filters";

interface SectionEditorProps {
  section: Section;
  sectionIndex: number;
  selectedLanguage: Language;
  isPreviewMode: boolean;
  startingQuestionNumber: number; // Nuovo prop
  onUpdate: (section: Section) => void;
  onDelete: () => void;
}

const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  sectionIndex,
  selectedLanguage,
  isPreviewMode,
  startingQuestionNumber,
  onUpdate,
  onDelete,
}) => {
  const [showQuestionTypeSelector, setShowQuestionTypeSelector] =
    useState(false);
  const [editMode, setEditMode] = useState(false);
  const questionsEndRef = useRef<HTMLDivElement>(null);
  const [hasUserAddedQuestion, setHasUserAddedQuestion] = useState(false);

  // Scroll intelligente per mantenere la nuova domanda al centro della viewport
  useEffect(() => {
    if (hasUserAddedQuestion && questionsEndRef.current) {
      setTimeout(() => {
        const element = questionsEndRef.current;
        if (!element) return;

        const elementRect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const elementTop = elementRect.top;
        const elementMiddle = elementTop + elementRect.height / 2;
        const viewportMiddle = viewportHeight / 2;

        // Se l'elemento è sotto la metà della viewport, scrolla per metterlo al centro
        if (elementMiddle > viewportMiddle) {
          const scrollTop =
            window.scrollY +
            elementTop -
            viewportMiddle +
            elementRect.height / 2;
          window.scrollTo({
            top: scrollTop,
            behavior: "smooth",
          });
        }

        setHasUserAddedQuestion(false);
      }, 100); // Piccolo delay per assicurarsi che il DOM sia aggiornato
    }
  }, [hasUserAddedQuestion]);

  const handleAddQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      questionId: `${section.sectionId}_q${section.questions.length + 1}`,
      text: { it: "", en: "", es: "", ar: "" },
      type,
      required: false,
      options:
        type === "multiple-choice"
          ? [
              { value: "option1", text: { it: "", en: "", es: "", ar: "" } },
              { value: "option2", text: { it: "", en: "", es: "", ar: "" } },
            ]
          : undefined,
      minValue: type === "rating" ? 1 : undefined,
      maxValue: type === "rating" ? 10 : undefined,
    };

    onUpdate({
      ...section,
      questions: [...section.questions, newQuestion],
    });
    setShowQuestionTypeSelector(false);

    // Attiva lo scroll
    setHasUserAddedQuestion(true);
  };

  const handleUpdateQuestion = (index: number, updatedQuestion: Question) => {
    const updatedQuestions = [...section.questions];
    updatedQuestions[index] = updatedQuestion;
    onUpdate({
      ...section,
      questions: updatedQuestions,
    });
  };

  const handleDeleteQuestion = (index: number) => {
    if (confirm("Sei sicuro di voler eliminare questa domanda?")) {
      const updatedQuestions = section.questions.filter((_, i) => i !== index);
      onUpdate({
        ...section,
        questions: updatedQuestions,
      });
    }
  };

  const handleMoveQuestion = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= section.questions.length) return;

    const updatedQuestions = [...section.questions];
    [updatedQuestions[index], updatedQuestions[newIndex]] = [
      updatedQuestions[newIndex],
      updatedQuestions[index],
    ];

    onUpdate({
      ...section,
      questions: updatedQuestions,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div
        className={`p-6 ${
          !isPreviewMode && !editMode ? "cursor-pointer hover:bg-gray-50" : ""
        }`}
        onClick={() => !isPreviewMode && setEditMode(true)}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            {!isPreviewMode && (
              <GripVertical className="text-gray-400" size={20} />
            )}
            <h3 className="text-lg font-semibold">
              Sezione {sectionIndex + 1}
            </h3>
          </div>
          {!isPreviewMode && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              variant="secondary"
              icon={<Trash2 size={16} />}
            >
              Elimina
            </Button>
          )}
        </div>

        {editMode && !isPreviewMode ? (
          <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titolo Sezione
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={section.title[selectedLanguage] || ""}
                onChange={(e) =>
                  onUpdate({
                    ...section,
                    title: {
                      ...section.title,
                      [selectedLanguage]: e.target.value,
                    },
                  })
                }
                placeholder={`Titolo della sezione in ${selectedLanguage.toUpperCase()}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrizione Sezione (opzionale)
              </label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                value={section.description?.[selectedLanguage] || ""}
                onChange={(e) =>
                  onUpdate({
                    ...section,
                    description: {
                      ...(section.description || {
                        it: "",
                        en: "",
                        es: "",
                        ar: "",
                      }),
                      [selectedLanguage]: e.target.value,
                    },
                  })
                }
                placeholder={`Descrizione della sezione in ${selectedLanguage.toUpperCase()}`}
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setEditMode(false)} variant="primary">
                Fatto
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <h4 className="font-medium">
              {section.title[selectedLanguage] || `Sezione ${sectionIndex + 1}`}
            </h4>
            {section.description?.[selectedLanguage] && (
              <p className="text-gray-600 mt-1">
                {section.description[selectedLanguage]}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="px-6 pb-6 space-y-4">
        {section.questions.map((question, index) => (
          <QuestionEditor
            key={question.questionId}
            question={question}
            questionIndex={startingQuestionNumber + index - 1} // Numerazione continua
            selectedLanguage={selectedLanguage}
            isPreviewMode={isPreviewMode}
            onUpdate={(updatedQuestion) =>
              handleUpdateQuestion(index, updatedQuestion)
            }
            onDelete={() => handleDeleteQuestion(index)}
            onMove={(direction) => handleMoveQuestion(index, direction)}
          />
        ))}

        {/* Add Question Button */}
        {!isPreviewMode && (
          <>
            {showQuestionTypeSelector ? (
              <QuestionTypeSelector
                onSelectType={handleAddQuestion}
                onCancel={() => setShowQuestionTypeSelector(false)}
              />
            ) : (
              <div className="text-center pt-4">
                <Button
                  onClick={() => setShowQuestionTypeSelector(true)}
                  variant="secondary"
                  icon={<Plus size={16} />}
                >
                  Aggiungi Domanda
                </Button>
              </div>
            )}
          </>
        )}
        <div ref={questionsEndRef} />
      </div>
    </div>
  );
};

export default SectionEditor;
