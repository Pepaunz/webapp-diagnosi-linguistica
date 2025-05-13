// src/components/questionnaire/SubmissionQuestionView.tsx

import React, { useState } from "react";
import { MessageSquare, Plus } from "lucide-react";
import { Question, Answer, Language } from "../../types/questionnaire";

interface Note {
  note_id: string;
  question_identifier?: string;
  note_text: string;
  created_at: string;
  operator: {
    full_name: string;
  };
}

interface SubmissionQuestionViewProps {
  question: Question;
  questionIndex: number;
  selectedLanguage: Language;
  answer?: Answer;
  notes: Note[];
  onAddNote: (noteText: string) => void;
}

const SubmissionQuestionView: React.FC<SubmissionQuestionViewProps> = ({
  question,
  questionIndex,
  selectedLanguage,
  answer,
  notes,
  onAddNote,
}) => {
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteText, setNoteText] = useState("");

  const handleAddNote = () => {
    if (noteText.trim()) {
      onAddNote(noteText);
      setNoteText("");
      setShowAddNote(false);
    }
  };

  const renderAnswer = () => {
    if (!answer) {
      return <p className="text-gray-500 italic">Nessuna risposta fornita</p>;
    }

    if (question.type === "multiple-choice" && question.options) {
      const selectedOption = question.options.find(
        (opt) => opt.value === answer.answer_value.value
      );
      return (
        <div className="ml-4">
          <div className="flex items-center gap-2">
            <input type="radio" checked={true} readOnly className="w-4 h-4" />
            <span className="text-gray-700">
              {selectedOption?.text[selectedLanguage] ||
                answer.answer_value.value}
            </span>
          </div>
        </div>
      );
    } else if (question.type === "text") {
      return (
        <div className="ml-4">
          <p className="text-gray-700 bg-gray-50 p-3 rounded">
            {answer.answer_value.value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
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
                    {note.operator.full_name} -{" "}
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
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Aggiungi una nota..."
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => {
                  setShowAddNote(false);
                  setNoteText("");
                }}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Annulla
              </button>
              <button
                onClick={handleAddNote}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Salva Nota
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddNote(true)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
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
