// src/pages/FeedbackPage.tsx

import { AlertCircle, Search as SearchIcon, CheckCircle } from "lucide-react";
import AppLayout from "../layout/AppLayout";
import { useState } from "react";
import {
  SearchBar,
  SelectFilter,
  Pagination,
  EmptyState,
  StatsCard,
  Button,
} from "../components/shared/Filters";

// Define TypeScript interfaces
interface Feedback {
  id: number;
  template: string;
  question_identifier?: string;
  feedback_text: string;
  status: "New" | "Investigating" | "Resolved";
  submitted_at: string;
}

interface FilterState {
  search: string;
  status: string;
  template: string;
}

const FilterBar = ({
  filters,
  setFilters,
  clearFilters,
}: {
  filters: FilterState;
  setFilters: (key: keyof FilterState, value: string) => void;
  clearFilters: () => void;
}) => (
  <div className="bg-white p-4 shadow-sm rounded-lg mb-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      {/* Search */}
      <SearchBar
        value={filters.search}
        onChange={(value) => setFilters("search", value)}
        placeholder="Cerca per ID domanda..."
      />

      {/* Filters */}
      <div className="flex gap-2">
        <SelectFilter
          value={filters.status}
          onChange={(value) => setFilters("status", value)}
          options={[
            { value: "All", label: "All Status" },
            { value: "New", label: "Nuovi" },
            { value: "Investigating", label: "In esame" },
            { value: "Resolved", label: "Risolti" },
          ]}
          placeholder="Stato: tutti"
        />

        <SelectFilter
          value={filters.template}
          onChange={(value) => setFilters("template", value)}
          options={[
            { value: "All Templates", label: "All Templates" },
            { value: "Standard Bilinguismo", label: "Standard Bilinguismo" },
            { value: "Follow-up", label: "Follow-up" },
          ]}
          placeholder="Template: tutti"
        />
      </div>

      <div className="flex justify-end">
        <Button variant="primary">Esporta Feedback</Button>
      </div>
    </div>

    <div className="flex justify-between">
      <div>
        <Button onClick={clearFilters} variant="secondary">
          Cancella Filtri
        </Button>
      </div>
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: Feedback["status"] }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800";
      case "Investigating":
        return "bg-yellow-100 text-yellow-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "New":
        return <AlertCircle size={14} className="mr-1" />;
      case "Investigating":
        return <SearchIcon size={14} className="mr-1" />;
      case "Resolved":
        return <CheckCircle size={14} className="mr-1" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
        status
      )}`}
    >
      {getStatusIcon(status)}
      {(() => {
        switch (status) {
          case "New":
            return "Nuovo";
          case "Investigating":
            return "In esame";
          case "Resolved":
            return "Risolto";
          default:
            return "Sconosciuto";
        }
      })()}
    </span>
  );
};

const TableHeader = () => (
  <thead className="bg-gray-50">
    <tr>
      <th
        scope="col"
        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
      >
        ID
      </th>
      <th
        scope="col"
        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
      >
        Template
      </th>
      <th
        scope="col"
        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
      >
        ID Domanda
      </th>
      <th
        scope="col"
        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
      >
        Feedback
      </th>
      <th
        scope="col"
        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
      >
        Stato
      </th>
      <th
        scope="col"
        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
      >
        Inviato
      </th>
      <th
        scope="col"
        className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
      >
        Azioni
      </th>
    </tr>
  </thead>
);

const FeedbackRow = ({
  feedback,
  onUpdateStatus,
  onViewFullFeedback,
}: {
  feedback: Feedback;
  onUpdateStatus: (id: number, status: Feedback["status"]) => void;
  onViewFullFeedback: (feedback: Feedback) => void;
}) => (
  <tr key={feedback.id} className="hover:bg-gray-50 ">
    <td
      onClick={() => onViewFullFeedback(feedback)}
      className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 cursor-pointer"
    >
      #{feedback.id}
    </td>
    <td
      onClick={() => onViewFullFeedback(feedback)}
      className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 cursor-pointer"
    >
      {feedback.template}
    </td>
    <td
      onClick={() => onViewFullFeedback(feedback)}
      className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 cursor-pointer"
    >
      {feedback.question_identifier || "-"}
    </td>
    <td
      onClick={() => onViewFullFeedback(feedback)}
      className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 cursor-pointer cursor-pointer"
    >
      {feedback.feedback_text.length > 50
        ? `${feedback.feedback_text.substring(0, 50)}...`
        : feedback.feedback_text}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm">
      <StatusBadge status={feedback.status} />
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
      {new Date(feedback.submitted_at).toLocaleString()}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
      <select
        className="border border-gray-300 rounded px-2 py-1 text-sm cursor-pointer"
        value={feedback.status}
        onChange={(e) =>
          onUpdateStatus(feedback.id, e.target.value as Feedback["status"])
        }
      >
        <option value="New">Nuovo</option>
        <option value="Investigating">In esame</option>
        <option value="Resolved">Risolto</option>
      </select>
    </td>
  </tr>
);

const EmptyFeedbackState = () => (
  <tr>
    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
      Nessuna segnalazione trovata
    </td>
  </tr>
);

const FeedbackTable = ({
  feedbacks,
  onUpdateStatus,
  onViewFullFeedback,
}: {
  feedbacks: Feedback[];
  onUpdateStatus: (id: number, status: Feedback["status"]) => void;
  onViewFullFeedback: (feedback: Feedback) => void;
}) => (
  <div className="bg-white shadow-sm rounded-lg overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <TableHeader />
        <tbody className="bg-white divide-y divide-gray-200">
          {feedbacks.length > 0 ? (
            feedbacks.map((feedback) => (
              <FeedbackRow
                key={feedback.id}
                feedback={feedback}
                onUpdateStatus={onUpdateStatus}
                onViewFullFeedback={onViewFullFeedback}
              />
            ))
          ) : (
            <EmptyFeedbackState />
          )}
        </tbody>
      </table>
    </div>
  </div>
);

function FeedbackPage() {
  // Sample data
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([
    {
      id: 1,
      template: "Standard Bilinguismo",
      question_identifier: "s1_q1",
      feedback_text:
        "The options for language preference should include more regional dialects. It would be beneficial to add options for variations like Sicilian, Venetian, Calabrian, etc. Many users have expressed interest in more granular language options rather than just standard Italian. This would help us collect more specific data about language preferences across different regions of Italy.",
      status: "New",
      submitted_at: "2025-04-22T14:30:00",
    },
    {
      id: 2,
      template: "Follow-up",
      question_identifier: "s1_q3",
      feedback_text:
        "The satisfaction scale is confusing. Is 1 the best or 5 the best?",
      status: "Investigating",
      submitted_at: "2025-04-23T09:15:00",
    },
    {
      id: 3,
      template: "Standard Bilinguismo",
      feedback_text: "Overall, the questionnaire is too long and repetitive.",
      status: "Resolved",
      submitted_at: "2025-04-21T11:20:00",
    },
    {
      id: 4,
      template: "Follow-up",
      question_identifier: "s2_q10",
      feedback_text:
        "The text field for additional comments is too small and doesn't allow enough characters. When trying to give detailed feedback about multiple aspects of the service, I hit the character limit very quickly. Please consider expanding this to at least 500 characters to allow for more comprehensive responses.",
      status: "New",
      submitted_at: "2025-04-24T16:45:00",
    },
    {
      id: 5,
      template: "Standard Bilinguismo",
      question_identifier: "s4_q2",
      feedback_text:
        "There should be an option for vocational training in the education level question.",
      status: "New",
      submitted_at: "2025-04-25T10:30:00",
    },
    {
      id: 6,
      template: "Standard Bilinguismo",
      question_identifier: "s4_q2",
      feedback_text:
        "There should be an option for vocational training in the education level question.",
      status: "New",
      submitted_at: "2025-04-25T10:30:00",
    },
  ]);

  // Filter states in a single object
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "All",
    template: "All Templates",
  });

  // Handler to update individual filter
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Handler to clear all filters
  const clearFilters = () => {
    setFilters({
      search: "",
      status: "All",
      template: "All Templates",
    });
  };

  // Filter feedbacks based on filter state
  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const matchesSearch = feedback.question_identifier
      ? feedback.question_identifier
          .toLowerCase()
          .includes(filters.search.toLowerCase())
      : filters.search === ""; // Only match null question_ids when search is empty
    const matchesStatus =
      filters.status === "All" || feedback.status === filters.status;
    const matchesTemplate =
      filters.template === "All Templates" ||
      feedback.template === filters.template;

    return matchesSearch && matchesStatus && matchesTemplate;
  });

  // Handler for updating a feedback status
  const handleUpdateStatus = (id: number, status: Feedback["status"]) => {
    setFeedbacks(
      feedbacks.map((feedback) =>
        feedback.id === id ? { ...feedback, status } : feedback
      )
    );
  };

  // Calculate stats
  const newCount = feedbacks.filter((f) => f.status === "New").length;
  const investigatingCount = feedbacks.filter(
    (f) => f.status === "Investigating"
  ).length;
  const resolvedCount = feedbacks.filter((f) => f.status === "Resolved").length;

  // State for feedback detail modal
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null
  );

  // Handler for viewing full feedback
  const handleViewFullFeedback = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
  };

  // Handler for closing modal
  const handleCloseModal = () => {
    setSelectedFeedback(null);
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Segnalazioni sui questionari</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatsCard
          title="Nuovi Feedback"
          count={newCount}
          icon={<AlertCircle size={24} className="text-blue-600" />}
          color="bg-blue-50"
        />
        <StatsCard
          title="In esame"
          count={investigatingCount}
          icon={<SearchIcon size={24} className="text-yellow-600" />}
          color="bg-yellow-50"
        />
        <StatsCard
          title="Risolti"
          count={resolvedCount}
          icon={<CheckCircle size={24} className="text-green-600" />}
          color="bg-green-50"
        />
      </div>

      {/* Filter component */}
      <FilterBar
        filters={filters}
        setFilters={handleFilterChange}
        clearFilters={clearFilters}
      />

      {/* Table component */}
      <FeedbackTable
        feedbacks={filteredFeedbacks}
        onUpdateStatus={handleUpdateStatus}
        onViewFullFeedback={handleViewFullFeedback}
      />

      {/* Pagination component */}
      <Pagination total={filteredFeedbacks.length} />

      {/* Feedback Detail Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium">Dettagli Feedback</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <dl className="grid grid-cols-1 gap-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Template
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {selectedFeedback.template}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    ID domanda
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {selectedFeedback.question_identifier || "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Stato</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <StatusBadge status={selectedFeedback.status} />
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Inviao il
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(selectedFeedback.submitted_at).toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Testo Feedback
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 p-3 bg-gray-50 rounded">
                    {selectedFeedback.feedback_text}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <Button onClick={handleCloseModal} variant="secondary">
                Chiudi
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default FeedbackPage;
