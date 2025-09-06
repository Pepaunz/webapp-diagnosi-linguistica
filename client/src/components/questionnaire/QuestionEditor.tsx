// src/components/questionnaire/QuestionEditor.tsx

import React, { useEffect, useState } from "react";
import {
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Plus,
  Star,
} from "lucide-react";
import { Question, Option } from "@bilinguismo/shared";
import { Language } from "@bilinguismo/shared";

import { Button } from "../shared/Filters";
interface QuestionEditorProps {
  question: Question;
  questionIndex: number;
  selectedLanguage: Language;
  isPreviewMode: boolean;
  validateQuestionComplete: (question: Question) => boolean;
  onUpdate: (question: Question) => void;
  onDelete: () => void;
  onMove: (direction: "up" | "down") => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  questionIndex,
  selectedLanguage,
  isPreviewMode,
  onUpdate,
  onDelete,
  onMove,
  validateQuestionComplete
}) => {
  const [editMode, setEditMode] = useState(true);

  useEffect(() => {
    if(isPreviewMode) {
     setEditMode(false);
    }
   },[isPreviewMode])
 

  const handleAddOption = () => {
    if (question.options) {
      const newOption: Option = {
        value: `option${question.options.length + 1}`,
        text: { it: "", en: "", es: "", ar: "" },
      };
      onUpdate({
        ...question,
        options: [...question.options, newOption],
      });
    }
  };

  const handleUpdateOption = (index: number, updatedOption: Option) => {
    if (question.options) {
      const updatedOptions = [...question.options];
      updatedOptions[index] = updatedOption;
      onUpdate({
        ...question,
        options: updatedOptions,
      });
    }
  };

  const handleDeleteOption = (index: number) => {
    if (question.options && question.options.length > 2) {
      const updatedOptions = question.options.filter((_, i) => i !== index);
      onUpdate({
        ...question,
        options: updatedOptions,
      });
    }
  };

  const renderQuestionContent = () => {
    if (question.type === "multiple-choice" && question.options) {
      return (
        <div className="space-y-2 mt-4">
          {question.options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="radio"
                disabled={true} // Sempre disabilitato nell'editor
                className="w-4 h-4"
              />
              {editMode && !isPreviewMode ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={option.text[selectedLanguage] || ""}
                    onChange={(e) =>
                      handleUpdateOption(index, {
                        ...option,
                        text: {
                          ...option.text,
                          [selectedLanguage]: e.target.value,
                        },
                      })
                    }
                    placeholder={`Opzione ${index + 1}`}
                  />
                  {(question.options ?? []).length > 2 && (
                    <button
                      onClick={() => handleDeleteOption(index)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ) : (
                <span className="text-gray-700">
                  {option.text[selectedLanguage] || `Opzione ${index + 1}`}
                </span>
              )}
            </div>
          ))}
          {editMode && !isPreviewMode && (
            <button
              onClick={handleAddOption}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm hover:bg-gray-200 rounded"
            >
              <Plus size={16} />
              Aggiungi opzione
            </button>
          )}
        </div>
      );
    } else if (question.type === "text") {
      return (
        <div className="mt-4">
          <input
            type="text"
            disabled={true} // Sempre disabilitato nell'editor
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Risposta breve"
          />
        </div>
      );
    } else if (question.type === "rating") {
      const maxValue = 10;
      const stars = Array.from({ length: maxValue }, (_, i) => i + 1);

      return (
        <div className="mt-4">
          <div className="flex gap-2 items-center">
            {stars.map((value) => (
              <button
                key={value}
                type="button"
                disabled={true} // Sempre disabilitato nell'editor
                className="transition-colors cursor-default"
              >
                <Star size={28} className="text-gray-300" fill="currentColor" />
              </button>
            ))}
          </div>
        </div>
      );
    } else if (question.type === "date") {
      return (
        <div className="mt-4">
          <input
            type="date"
            disabled={true} // Sempre disabilitato nell'editor
            className="px-3 py-2 border rounded-lg"
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`border rounded-lg p-4 ${
        !isPreviewMode && !editMode ? "cursor-pointer hover:bg-gray-50" : ""
      } ${editMode ? "border-blue-500" : "border-gray-200"}`}
      onClick={() => !isPreviewMode && setEditMode(true)}
    >
      <div className="flex items-start gap-3">
        {!isPreviewMode && (
          <div className="flex flex-col gap-1 mt-1">
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMove("up");
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <ChevronUp size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMove("down");
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <ChevronDown size={16} />
            </button>
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-start gap-2">
            <span className="font-medium text-gray-700">
              {questionIndex + 1}.
            </span>
            {editMode && !isPreviewMode ? (
              <input
                type="text"
                className="flex-1 px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={question.text[selectedLanguage] || ""}
                onChange={(e) =>
                  onUpdate({
                    ...question,
                    text: {
                      ...question.text,
                      [selectedLanguage]: e.target.value,
                    },
                  })
                }
                placeholder={`Testo della domanda in ${selectedLanguage.toUpperCase()}`}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="flex-1">
                {question.text[selectedLanguage] || `Domanda ${questionIndex + 1}`}
                {question.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </span>
            )}
          </div>

          {renderQuestionContent()}

          {editMode && !isPreviewMode && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={question.required || false}
                    onChange={(e) =>
                      onUpdate({
                        ...question,
                        required: e.target.checked,
                      })
                    }
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm">Obbligatoria</span>
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="text-gray-500 hover:text-red-500"
                >
                  <Trash2 size={20} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (validateQuestionComplete(question)) {
                      setEditMode(false);
                    }
                  }}
                  className="px-3 py-1 text-sm bg-gray-800 text-white rounded hover:bg-gray-700"
                  >
                    Fatto
                  </button>
              </div>
            </div>
          )}
        </div>

        {!editMode && !isPreviewMode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-gray-500 hover:text-red-500"
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionEditor;
