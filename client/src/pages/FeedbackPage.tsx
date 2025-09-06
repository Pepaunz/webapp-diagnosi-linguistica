// src/pages/FeedbackPage.tsx

import { AlertCircle, Search as SearchIcon, CheckCircle } from "lucide-react";
import AppLayout from "../layout/AppLayout";
import { useState, useEffect } from "react";
import { useError } from "../context";
import { LoadingSpinner } from "../../../family-client/src/components/ui";
import { Loader2 } from "lucide-react";
import { feedbackApi } from "../services/feedbackApi"

import {
  SearchBar,
  SelectFilter,
  Pagination,
  StatsCard,
  Button,
} from "../components/shared/Filters";

import {FeedbackDTO as Feedback} from "@bilinguismo/shared";
import { listFeedbackQuerySchema,updateFeedbackBodySchema } from "../../../shared/src/schemas";
import { z } from "zod";

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
  isUpdating = false, 
}: {
  feedback: Feedback;
  onUpdateStatus: (id: number, uuid:string, status: Feedback["status"]) => void;
  onViewFullFeedback: (feedback: Feedback) => void;
  isUpdating?: boolean; 
}) => (
  <tr className="hover:bg-gray-50">
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
      #{feedback.id}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
      {feedback.template_name}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
      {feedback.question_identifier || "Generale"}
    </td>
    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
      <div className="truncate">
        {feedback.feedback_text.length > 50
          ? `${feedback.feedback_text.substring(0, 50)}...`
          : feedback.feedback_text}
      </div>
      <button
        onClick={() => onViewFullFeedback(feedback)}
        className="text-blue-600 hover:text-blue-800 text-xs mt-1"
      >
        Visualizza completo
      </button>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm">
      <StatusBadge status={feedback.status} />
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
      {new Date(feedback.submitted_at).toLocaleString()}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
      <div className="flex items-center justify-center gap-2">
        <select
          className={`border border-gray-300 rounded px-2 py-1 text-sm cursor-pointer ${
            isUpdating ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          value={feedback.status}
          onChange={(e) =>
            onUpdateStatus(feedback.id,feedback.uuid, e.target.value as Feedback["status"])
          }
          disabled={isUpdating}
        >
          <option value="New">Nuovo</option>
          <option value="Investigating">In esame</option>
          <option value="Resolved">Risolto</option>
        </select>
        {isUpdating && (
          <Loader2 size={14} className="animate-spin text-gray-400" />
        )}
      </div>
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
  updatingFeedbackId, 
}: {
  feedbacks: Feedback[];
  onUpdateStatus: (id: number, uuid:string, status: Feedback["status"]) => void;
  onViewFullFeedback: (feedback: Feedback) => void;
  updatingFeedbackId?: number | null; 
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
                isUpdating={updatingFeedbackId === feedback.id} 
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
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  // Filter states in a single object
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "All",
    template: "All Templates",
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null); // feedback id being updated
  const { showError, showSuccess } = useError();

  useEffect(() => {
    loadFeedbacks();
  }, []); 
  
  const loadFeedbacks = async () => {
    setLoading(true);
    
    try {
      // Valida parametri query usando schema Zod
      const queryParams = {
        status: filters.status !== "All" ? filters.status : undefined,
        limit: 50,
        offset: 0,
        sort_by: "submitted_at",
        sort_order: "desc" as const
      };
      
      // Validazione parametri
      const validatedParams = listFeedbackQuerySchema.parse(queryParams);
      console.log("Loading feedbacks with params:", validatedParams);
      
      const response = await feedbackApi.getFeedbacks(validatedParams);
      setFeedbacks(response.feedbacks);
    
      
    } catch (error) {
      console.error("Error loading feedbacks:", error);
      showError("Errore nel caricamento delle segnalazioni", 'server');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    // Validazione solo per status, NON per search
    if (key === 'status' && value !== 'All') {
      const validStatuses = ['New', 'Investigating', 'Resolved'];
      if (!validStatuses.includes(value)) {
        showError("Stato filtro non valido", 'validation');
        return;
      }
    }
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
      feedback.template_name === filters.template;

    return matchesSearch && matchesStatus && matchesTemplate;
  });

  // Handler for updating a feedback status
  const handleUpdateStatus = async (feedbackId: number,feedbackUuid: string, newStatus: Feedback["status"]) => {
    // Trova il feedback corrente
    const currentFeedback = feedbacks.find(f => f.id === feedbackId);
    if (!currentFeedback) {
      showError("Feedback non trovato", 'validation');
      return;
    }
  
    // Evita update inutili
    if (currentFeedback.status === newStatus) {
      return;
    }
  
    // Validazione usando schema Zod
    try {
      updateFeedbackBodySchema.parse({ status: newStatus });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.issues[0].message;
        showError(`Stato non valido: ${errorMessage}`, 'validation');
        return;
      }
    }
    const validTransitions: Record<string, string[]> = {
      "New": ["Investigating", "Resolved"],
      "Investigating": ["Resolved", "New"],
      "Resolved": ["Investigating"] // Può riaprire se necessario
    };
  
    const currentStatus = currentFeedback.status;
    const allowedTransitions = validTransitions[currentStatus] || [];
    
    if (!allowedTransitions.includes(newStatus)) {
      showError(`Non è possibile cambiare da "${currentStatus}" a "${newStatus}"`, 'validation');
      return;
    }
  
    setUpdating(feedbackId);
    
    try {
      console.log("Updating feedback status:", feedbackUuid, newStatus);
      
      // TODO: Sostituire con vera chiamata API
       await feedbackApi.updateStatus(feedbackUuid, { status: newStatus });
     
      
      // Aggiorna stato locale
      setFeedbacks(feedbacks.map(feedback =>
        feedback.id === feedbackId 
          ? { ...feedback, status: newStatus }
          : feedback
      ));
      
      showSuccess(`Stato aggiornato a "${newStatus}"`);
      
    } catch (error) {
      console.error("Error updating feedback status:", error);
      showError("Errore nell'aggiornamento dello stato", 'server');
    } finally {
      setUpdating(null);
    }
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

  const handleRefreshFeedbacks = async () => {
    await loadFeedbacks();
    showSuccess("Segnalazioni aggiornate");
  };

  

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" text="Caricamento segnalazioni..." />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Segnalazioni sui questionari</h2>
        <button
          onClick={handleRefreshFeedbacks}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
          disabled={loading}
        >
          Aggiorna Dati
        </button>
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
        updatingFeedbackId={updating}
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
                    {selectedFeedback.template_name}
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
