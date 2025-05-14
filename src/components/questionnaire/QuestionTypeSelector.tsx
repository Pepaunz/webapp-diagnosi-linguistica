// src/components/questionnaire/QuestionTypeSelector.tsx

import React from "react";
import { Type, List, Star, Calendar } from "lucide-react";
import { QuestionType } from "../../types/questionnaire";

interface QuestionTypeSelectorProps {
  onSelectType: (type: QuestionType) => void;
  onCancel: () => void;
}

const questionTypes = [
  {
    type: "text" as QuestionType,
    title: "Risposta di testo",
    description: "Risposta breve o lunga",
    icon: Type,
    available: true,
  },
  {
    type: "multiple-choice" as QuestionType,
    title: "Scelta multipla",
    description: "Una sola risposta tra più opzioni",
    icon: List,
    available: true,
  },
  {
    type: "rating" as QuestionType,
    title: "Valutazione",
    description: "Scala di valutazione con stelle",
    icon: Star,
    available: true,
  },
  {
    type: "date" as QuestionType,
    title: "Data",
    description: "Seleziona una data",
    icon: Calendar,
    available: true,
  },
];

const QuestionTypeSelector: React.FC<QuestionTypeSelectorProps> = ({
  onSelectType,
  onCancel,
}) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-sm font-medium text-gray-700 mb-3">
        Seleziona il tipo di domanda
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {questionTypes.map((qType) => (
          <button
            key={qType.type}
            onClick={() => qType.available && onSelectType(qType.type)}
            disabled={!qType.available}
            className={`p-4 rounded-lg border-2 transition ${
              qType.available
                ? "border-gray-300 hover:border-blue-500 hover:bg-white cursor-pointer"
                : "border-gray-200 bg-gray-100 cursor-not-allowed opacity-50"
            }`}
          >
            <qType.icon className="mx-auto mb-2" size={24} />
            <p className="font-medium text-sm">{qType.title}</p>
            <p className="text-xs text-gray-600 mt-1">{qType.description}</p>
          </button>
        ))}
      </div>
      <div className="flex justify-end mt-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Annulla
        </button>
      </div>
    </div>
  );
};

export default QuestionTypeSelector;
