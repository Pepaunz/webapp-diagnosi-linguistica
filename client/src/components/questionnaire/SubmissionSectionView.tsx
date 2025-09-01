// src/components/questionnaire/SubmissionSectionView.tsx

import React from "react";
import { Section,Language, AnswerDTO as Answer, OperatorNoteDTO as Note } from "@bilinguismo/shared";
import SubmissionQuestionView from "./SubmissionQuestionView";

interface SubmissionSectionViewProps {
  section: Section;
  sectionIndex: number;
  selectedLanguage: Language;
  startingQuestionNumber: number; // Nuovo prop
  answers: Answer[];
  notes: Note[];
  onAddNote: (questionId: string, noteText: string) => void;
}

const SubmissionSectionView: React.FC<SubmissionSectionViewProps> = ({
  section,
  sectionIndex,
  selectedLanguage,
  startingQuestionNumber,
  answers,
  notes,
  onAddNote,
}) => {
  const getAnswer = (questionId: string) => {
    return answers.find((a) => a.question_identifier === questionId);
  };

  const getNotes = (questionId: string) => {
    return notes.filter((n) => n.question_identifier === questionId);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold mb-2">
          Sezione {sectionIndex + 1}: {section.title[selectedLanguage]}
        </h3>
        {section.description?.[selectedLanguage] && (
          <p className="text-gray-600">
            {section.description[selectedLanguage]}
          </p>
        )}
      </div>

      <div className="px-6 pb-6 space-y-6">
        {section.questions.map((question, index) => (
          <SubmissionQuestionView
            key={question.questionId}
            question={question}
            questionIndex={startingQuestionNumber + index - 1} // Numerazione continua
            selectedLanguage={selectedLanguage}
            answer={getAnswer(question.questionId)}
            notes={getNotes(question.questionId)}
            onAddNote={(noteText) => onAddNote(question.questionId, noteText)}
          />
        ))}
      </div>
    </div>
  );
};

export default SubmissionSectionView;
