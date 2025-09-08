// src/pages/FeedbackPage.tsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { AlertCircle, Search as SearchIcon, CheckCircle, Loader2 } from "lucide-react";
import { z } from "zod";

import AppLayout from "../layout/AppLayout";
import { useError } from "../context";
import { LoadingSpinner } from "../../../family-client/src/components/ui";
import { feedbackApi } from "../services/feedbackApi";
import {
  SearchBar,
  SelectFilter,
  Pagination,
  StatsCard,
  Button,
} from "../components/shared/Filters";
import { FeedbackDTO as Feedback } from "@bilinguismo/shared";
import { listFeedbackQuerySchema, updateFeedbackBodySchema } from "../../../shared/src/schemas";

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

interface FilterState {
  search: string;
  status: string;
  template: string;
}

const INITIAL_FILTERS: FilterState = {
  search: "",
  status: "All",
  template: "All Templates",
};

const STATUS_OPTIONS = [
  { value: "All", label: "All Status" },
  { value: "New", label: "Nuovi" },
  { value: "Investigating", label: "In esame" },
  { value: "Resolved", label: "Risolti" },
];

const TEMPLATE_OPTIONS = [
  { value: "All Templates", label: "All Templates" },
  { value: "Standard Bilinguismo", label: "Standard Bilinguismo" },
  { value: "Follow-up", label: "Follow-up" },
];

const STATUS_CONFIG = {
  New: {
    label: "Nuovo",
    className: "bg-blue-100 text-blue-800",
    icon: AlertCircle,
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  Investigating: {
    label: "In esame",
    className: "bg-yellow-100 text-yellow-800",
    icon: SearchIcon,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50"
  },
  Resolved: {
    label: "Risolto",
    className: "bg-green-100 text-green-800",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50"
  }
} as const;

const STATUS_TRANSITIONS: Record<string, string[]> = {
  New: ["Investigating", "Resolved"],
  Investigating: ["Resolved", "New"],
  Resolved: []
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const calculateStats = (feedbacks: Feedback[]) => {
  return feedbacks.reduce(
    (acc, feedback) => {
      if (feedback.status === "New") acc.newCount++;
      else if (feedback.status === "Investigating") acc.investigatingCount++;
      else if (feedback.status === "Resolved") acc.resolvedCount++;
      return acc;
    },
    { newCount: 0, investigatingCount: 0, resolvedCount: 0 }
  );
};

const filterFeedbacks = (feedbacks: Feedback[], filters: FilterState) => {
  return feedbacks.filter((feedback) => {
    const matchesSearch = filters.search === "" || 
      (feedback.question_identifier?.toLowerCase().includes(filters.search.toLowerCase()) ?? false);
    
    const matchesStatus = filters.status === "All" || feedback.status === filters.status;
    
    const matchesTemplate = filters.template === "All Templates" || 
      feedback.template_name === filters.template;

    return matchesSearch && matchesStatus && matchesTemplate;
  });
};

const isValidStatusTransition = (currentStatus: string, newStatus: string): boolean => {
  return STATUS_TRANSITIONS[currentStatus]?.includes(newStatus) ?? false;
};

const truncateText = (text: string, maxLength: number = 50): string => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const StatusBadge: React.FC<{ status: Feedback["status"] }> = ({ status }) => {
  const config = STATUS_CONFIG[status];
  if (!config) {
    return (
      <span className="px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
        Sconosciuto
      </span>
    );
  }

  const Icon = config.icon;
  return (
    <span className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${config.className}`}>
      <Icon size={14} className="mr-1" />
      {config.label}
    </span>
  );
};

const FilterBar: React.FC<{
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onClearFilters: () => void;
}> = ({ filters, onFilterChange, onClearFilters }) => (
  <div className="bg-white p-4 shadow-sm rounded-lg mb-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <SearchBar
        value={filters.search}
        onChange={(value) => onFilterChange("search", value)}
        placeholder="Cerca per ID domanda..."
      />

      <div className="flex gap-2">
        <SelectFilter
          value={filters.status}
          onChange={(value) => onFilterChange("status", value)}
          options={STATUS_OPTIONS}
          placeholder="Stato: tutti"
        />

        <SelectFilter
          value={filters.template}
          onChange={(value) => onFilterChange("template", value)}
          options={TEMPLATE_OPTIONS}
          placeholder="Template: tutti"
        />
      </div>

      <div className="flex justify-end">
        <Button variant="primary">Esporta Feedback</Button>
      </div>
    </div>

    <div className="flex justify-between">
      <Button onClick={onClearFilters} variant="secondary">
        Cancella Filtri
      </Button>
    </div>
  </div>
);

const StatsSection: React.FC<{ stats: ReturnType<typeof calculateStats> }> = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    {[
      { key: 'newCount', title: "Nuovi Feedback", status: 'New' },
      { key: 'investigatingCount', title: "In esame", status: 'Investigating' },
      { key: 'resolvedCount', title: "Risolti", status: 'Resolved' }
    ].map(({ key, title, status }) => {
      const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
      const Icon = config.icon;
      return (
        <StatsCard
          key={key}
          title={title}
          count={stats[key as keyof typeof stats]}
          icon={<Icon size={24} className={config.color} />}
          color={config.bgColor}
        />
      );
    })}
  </div>
);

const FeedbackRow: React.FC<{
  feedback: Feedback;
  onUpdateStatus: (id: number, uuid: string, status: Feedback["status"]) => void;
  onViewFull: (feedback: Feedback) => void;
  isUpdating: boolean;
}> = ({ feedback, onUpdateStatus, onViewFull, isUpdating }) => (
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
        {truncateText(feedback.feedback_text)}
      </div>
      <button
        onClick={() => onViewFull(feedback)}
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
          onChange={(e) => onUpdateStatus(feedback.id, feedback.uuid, e.target.value as Feedback["status"])}
          disabled={isUpdating}
        >
          <option value="New">Nuovo</option>
          <option value="Investigating">In esame</option>
          <option value="Resolved">Risolto</option>
        </select>
        {isUpdating && <Loader2 size={14} className="animate-spin text-gray-400" />}
      </div>
    </td>
  </tr>
);

const FeedbackTable: React.FC<{
  feedbacks: Feedback[];
  onUpdateStatus: (id: number, uuid: string, status: Feedback["status"]) => void;
  onViewFull: (feedback: Feedback) => void;
  updatingId: number | null;
}> = ({ feedbacks, onUpdateStatus, onViewFull, updatingId }) => (
  <div className="bg-white shadow-sm rounded-lg overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {["ID", "Template", "ID Domanda", "Feedback", "Stato", "Inviato", "Azioni"].map((header) => (
              <th
                key={header}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  header === "Azioni" ? "text-center" : ""
                }`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {feedbacks.length > 0 ? (
            feedbacks.map((feedback) => (
              <FeedbackRow
                key={feedback.id}
                feedback={feedback}
                onUpdateStatus={onUpdateStatus}
                onViewFull={onViewFull}
                isUpdating={updatingId === feedback.id}
              />
            ))
          ) : (
            <tr>
              <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                Nessuna segnalazione trovata
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const FeedbackModal: React.FC<{
  feedback: Feedback | null;
  onClose: () => void;
}> = ({ feedback, onClose }) => {
  if (!feedback) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium">Dettagli Feedback</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <dl className="grid grid-cols-1 gap-y-4">
            {[
              { label: "Template", value: feedback.template_name },
              { label: "ID domanda", value: feedback.question_identifier || "-" },
              { label: "Stato", value: <StatusBadge status={feedback.status} /> },
              { label: "Inviato il", value: new Date(feedback.submitted_at).toLocaleString() },
            ].map(({ label, value }) => (
              <div key={label}>
                <dt className="text-sm font-medium text-gray-500">{label}</dt>
                <dd className="mt-1 text-sm text-gray-900">{value}</dd>
              </div>
            ))}
            <div>
              <dt className="text-sm font-medium text-gray-500">Testo Feedback</dt>
              <dd className="mt-1 text-sm text-gray-900 p-3 bg-gray-50 rounded">
                {feedback.feedback_text}
              </dd>
            </div>
          </dl>
        </div>
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
          <Button onClick={onClose} variant="secondary">Chiudi</Button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const FeedbackPage: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  //pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  
  const { showError, showSuccess } = useError();

  ///calculations
  const filteredFeedbacks = useMemo(() => filterFeedbacks(feedbacks, filters), [feedbacks, filters]);
  const stats = useMemo(() => calculateStats(feedbacks), [feedbacks]);

  // Load feedbacks
  const loadFeedbacks = useCallback(async (page: number=1) => {
    const offset = (page-1) *itemsPerPage;
    setLoading(true);
    try {
      const queryParams = {
        limit: itemsPerPage,
        offset: offset,
        sort_by: "submitted_at",
        sort_order: "desc" as const
      };
      
      const validatedParams = listFeedbackQuerySchema.parse(queryParams);
      const response = await feedbackApi.getFeedbacks(validatedParams);
      setFeedbacks(response.feedback);
      setTotalItems(response.total);
    } catch (error) {
      console.error("Error loading feedbacks:", error);
      showError("Errore nel caricamento delle segnalazioni", 'server');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  // Filter change handler
  const handleFilterChange = useCallback((key: keyof FilterState, value: string) => {
    if (key === 'status' && value !== 'All') {
      const validStatuses = ['New', 'Investigating', 'Resolved'];
      if (!validStatuses.includes(value)) {
        showError("Stato filtro non valido", 'validation');
        return;
      }
    }
    setFilters(prev => ({ ...prev, [key]: value }));
  }, [showError]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  // Update status handler
  const handleUpdateStatus = useCallback(async (
    feedbackId: number, 
    feedbackUuid: string, 
    newStatus: Feedback["status"]
  ) => {
    const currentFeedback = feedbacks.find(f => f.id === feedbackId);
    if (!currentFeedback) {
      showError("Feedback non trovato", 'validation');
      return;
    }

    if (currentFeedback.status === newStatus) return;

    // Validate with Zod schema
    try {
      updateFeedbackBodySchema.parse({ status: newStatus });
    } catch (error) {
      if (error instanceof z.ZodError) {
        showError(`Stato non valido: ${error.issues[0].message}`, 'validation');
        return;
      }
    }

    // Validate transitions
    if (!isValidStatusTransition(currentFeedback.status, newStatus)) {
      showError(`Non è possibile cambiare da "${currentFeedback.status}" a "${newStatus}"`, 'validation');
      return;
    }

    setUpdating(feedbackId);
    
    try {
      await feedbackApi.updateStatus(feedbackUuid, { status: newStatus });
      
      setFeedbacks(prev => 
        prev.map(feedback =>
          feedback.id === feedbackId 
            ? { ...feedback, status: newStatus }
            : feedback
        )
      );
      
      showSuccess(`Stato aggiornato a "${newStatus}"`);
    } catch (error) {
      console.error("Error updating feedback status:", error);
      showError("Errore nell'aggiornamento dello stato", 'server');
    } finally {
      setUpdating(null);
    }
  }, [feedbacks, showError, showSuccess]);

  // Modal handlers
  const handleViewFullFeedback = useCallback((feedback: Feedback) => {
    setSelectedFeedback(feedback);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedFeedback(null);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    loadFeedbacks(page);
  }, [loadFeedbacks]);


  // Refresh handler
  const handleRefreshFeedbacks = useCallback(async () => {
    await loadFeedbacks();
    showSuccess("Segnalazioni aggiornate");
  }, [loadFeedbacks, showSuccess]);

  // Load data on mount
  useEffect(() => {
    loadFeedbacks();
  }, [loadFeedbacks]);

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
      {/* Header */}
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

      {/* Stats */}
      <StatsSection stats={stats} />

      {/* Filters */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
      />

      {/* Table */}
      <FeedbackTable
        feedbacks={filteredFeedbacks}
        onUpdateStatus={handleUpdateStatus}
        onViewFull={handleViewFullFeedback}
        updatingId={updating}
      />

      {/* Pagination */}
      <Pagination total={totalItems} 
      currentPage={currentPage} 
      onPageChange={handlePageChange} />

      {/* Modal */}
      <FeedbackModal
        feedback={selectedFeedback}
        onClose={handleCloseModal}
      />
    </AppLayout>
  );
};

export default FeedbackPage;