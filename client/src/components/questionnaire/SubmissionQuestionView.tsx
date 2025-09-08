// src/components/questionnaire/SubmissionQuestionView.tsx

import React, { useState } from "react";
import { MessageSquare, Plus, Star, Loader2 } from "lucide-react";
import { Question, Language } from "@bilinguismo/shared";
import { AnswerDTO as Answer, OperatorNoteDTO as Note } from "@bilinguismo/shared";
import { z } from "zod";

interface SubmissionQuestionViewProps {
  question: Question;
  questionIndex: number;
  selectedLanguage: Language;
  answer?: Answer;
  notes: Note[];
  onAddNote: (noteText: string) => void;
  isAddingNote?: boolean;
}

const SubmissionQuestionView: React.FC<SubmissionQuestionViewProps> = ({
  question,
  questionIndex,
  selectedLanguage,
  answer,
  notes,
  onAddNote,
  isAddingNote = false,
}) => {
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteError, setNoteError] = useState("");

  const noteValidator = z.string()
  .min(1, "La nota non può essere vuota")
  .max(2000, "La nota è troppo lunga (max 2000 caratteri)");

  const hasAnswer = answer && answer.answer_value !== null && answer.answer_value !== undefined;

  const handleAddNote = () => {
    // Reset errore precedente
    setNoteError("");
    
    // Validazione locale
    try {
      noteValidator.parse(noteText.trim());
    } catch (error) {
      if (error instanceof z.ZodError) {
        setNoteError(error.issues[0].message);
        return;
      }
    }
    
    // Se validazione passa, invia nota
    onAddNote(noteText.trim());
    setNoteText("");
    setShowAddNote(false);
    setNoteError("");
  };

  const renderAnswer = () => {
  
    const value = answer?.answer_value;

    if (question.type === "multiple-choice" && question.options) {
      return (
        <div className="ml-4 space-y-2">
          {question.options.map((option) => {
            const isSelected = option.value === value;
            return (
              <div
                key={option.value}
                className={`flex items-center gap-2 p-2 rounded transition-colors ${
                  isSelected
                    ? "bg-blue-50 border border-blue-200"
                    :  hasAnswer ? "opacity-50" : ""
                }`}
              >
                <input
                  type="radio"
                  checked={isSelected}
                  readOnly
                  className={`w-4 h-4 ${isSelected ? "text-blue-600" : ""}`}
                />
                <span
                  className={`${
                    isSelected ? "text-gray-900 font-medium" : "text-gray-500"
                  }`}
                >
                  {option.text[selectedLanguage] || option.value}
                </span>
              </div>
            );
          })}
        </div>
      );
    } 

    if (question.type === "rating") {
      const maxValue =  question.maxValue || 10;
      const selectedValue = hasAnswer && typeof value === 'string' ? parseInt(value, 10) : 0;
      const stars = Array.from({ length: maxValue }, (_, i) => i + 1);

      return (
        <div className="ml-4">
          <div className={`flex gap-1 items-center ${!hasAnswer ? 'opacity-50' : ''}`}>
            {stars.map((starValue) => (
              <Star
                key={starValue}
                size={24}
                className={
                  starValue <= selectedValue ? "text-yellow-500" : "text-gray-300"
                }
                fill={starValue <= selectedValue ? "currentColor" : "none"}
              />
            ))}
          {hasAnswer && (
              <span className="ml-2 text-gray-600">
                ({selectedValue}/{maxValue})
              </span>
            )}
          </div>
        </div>
      );
    } 
    if (!hasAnswer) {
      return <p className="text-gray-500 italic ml-4">Nessuna risposta fornita</p>;
    }

    if (question.type === "text") {
      return (
        <div className="ml-4">
          <p className="text-gray-700 bg-gray-50 p-3 rounded">{String(value)}</p>
        </div>
      );
    }
    
    if (question.type === "date") {
      return (
        <div className="ml-4">
          <p className="text-gray-700 bg-gray-50 p-3 rounded">
            {new Date(String(value)).toLocaleDateString("it-IT", {
              year: "numeric", month: "long", day: "numeric", timeZone: 'UTC'
            })}
          </p>
        </div>
      );
    }
     
    return null;
  };

  return (
    <div className={`border rounded-lg p-4 mt-4 transition-colors ${
      hasAnswer ? 'bg-blue-50/50 border-blue-200/50' : 'bg-orange-100/50'
    }`}>
      <div className="mb-3">
        <p className="font-medium text-gray-800">
          {questionIndex + 1}. {question.text[selectedLanguage]}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </p>
      </div>
      {renderAnswer()}

      {/* Notes Section */}
      {notes.length > 0 && (
        <div className="mt-4 space-y-2">
          {notes.map((note) => (
            <div
              key={note.note_id}
              className="bg-yellow-50 p-3 rounded-lg border border-yellow-200"
            >
              <div className="flex items-start gap-2">
                <MessageSquare size={16} className="text-yellow-600 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{note.note_text}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {note.operator_full_name} -{" "}
                    {new Date(note.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Note Button/Form */}
      <div className="mt-4">
      {showAddNote ? (
  <div className="bg-white p-3 rounded-lg border border-gray-200">
    <textarea
      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        noteError ? 'border-red-500 focus:ring-red-500' : ''
      }`}
      rows={3}
      value={noteText}
      onChange={(e) => {
        setNoteText(e.target.value);
        // Clear error when user types
        if (noteError && e.target.value.trim()) {
          setNoteError("");
        }
      }}
      placeholder="Aggiungi una nota..."
      autoFocus
      disabled={isAddingNote}
      maxLength={2000}
    />
    
    {/* Character counter */}
    <div className="flex justify-between items-center mt-1">
      <span className={`text-xs ${noteText.length > 1900 ? 'text-red-500' : 'text-gray-400'}`}>
        {noteText.length}/2000
      </span>
    </div>
    
    {/* Error message */}
    {noteError && (
      <p className="mt-1 text-sm text-red-600">{noteError}</p>
    )}
    
    <div className="flex justify-end gap-2 mt-2">
      <button
        onClick={() => {
          setShowAddNote(false);
          setNoteText("");
          setNoteError("");
        }}
        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
        disabled={isAddingNote}
      >
        Annulla
      </button>
      <button
        onClick={handleAddNote}
        disabled={isAddingNote || !noteText.trim()}
        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
      >
        {isAddingNote && <Loader2 size={14} className="animate-spin" />}
        Salva Nota
      </button>
    </div>
  </div>
) : (
  <button
    onClick={() => setShowAddNote(true)}
    disabled={isAddingNote}
    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50"
  >
    <Plus size={16} />
    Aggiungi nota
  </button>
)}
      </div>
    </div>
  );
};

export default SubmissionQuestionView;
