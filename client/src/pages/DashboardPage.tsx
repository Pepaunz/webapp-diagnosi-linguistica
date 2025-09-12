import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { ConfirmationModal } from "../components/shared/ConfirmationModal"
import { 
  Loader2, 
  Trash2, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertTriangle 
} from "lucide-react";

import AppLayout from "../layout/AppLayout";
import { useError } from "../context/ErrorContext";
import { LoadingSpinner } from "../../../family-client/src/components/ui";
import { submissionApi } from "../services/submissionApi";
import {
  SearchBar,
  SelectFilter,
  EmptyState,
  Pagination,
  Button,
} from "../components/shared/Filters";
import { StatsCard } from "../components/ui/StatsCard";
import { SubmissionDTO } from "@bilinguismo/shared";
import { listSubmissionsQuerySchema } from "../../../shared/src/schemas";

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

interface FilterState {
  search: string;
  status: string;
  template: string;
  language: string;
  date_from: string; 
  date_to: string;
}

const INITIAL_FILTERS: FilterState = {
  search: "",
  status: "All",
  template: "All Templates",
  language: "All Languages",
  date_from: "",
  date_to: ""
};

const STATUS_OPTIONS = [
  { value: "All", label: "All Status" },
  { value: "Completed", label: "Completato" },
  { value: "InProgress", label: "In Progress" },
  { value: "Abandoned", label: "Abbandonato" },
];

const TEMPLATE_OPTIONS = [
  { value: "All Templates", label: "All Templates" },
  { value: "Standard Bilinguismo", label: "Standard Bilinguismo" },
  { value: "Follow-up", label: "Follow-up" },
];

const LANGUAGE_OPTIONS = [
  { value: "All Languages", label: "All Languages" },
  { value: "it", label: "Italiano" },
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "ar", label: "العربية" },
];

const ITEMS_PER_PAGE = 20;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const calculateStats = (submissions: SubmissionDTO[]) => {
  return submissions.reduce(
    (acc, submission) => {
      acc.total++;
      if (submission.status === "Completed") acc.completed++;
      else if (submission.status === "InProgress") acc.inProgress++;
      else if (submission.status === "Abandoned") acc.abandoned++;
      return acc;
    },
    { total: 0, completed: 0, inProgress: 0, abandoned: 0 }
  );
};

const filterSubmissions = (submissions: SubmissionDTO[], filters: FilterState) => {
  return submissions.filter((sub) => {
    const matchesSearch = sub.fiscalCode
      .toLowerCase()
      .includes(filters.search.toLowerCase());
    const matchesStatus = filters.status === "All" || sub.status === filters.status;
    const matchesTemplate = filters.template === "All Templates" || sub.template === filters.template;
    const matchesLanguage = filters.language === "All Languages" || sub.language === filters.language;


    const submissionDate = new Date(sub.lastUpdated).getTime();
    const matchesDateFrom = !filters.date_from || submissionDate >= new Date(filters.date_from).getTime();
    const matchesDateTo = !filters.date_to || submissionDate < new Date(filters.date_to).getTime() + (24 * 60 * 60 * 1000);
   
    return matchesSearch && matchesStatus && matchesTemplate && matchesLanguage && matchesDateFrom && matchesDateTo;  });
};

const getLanguageFlag = (langCode: string): string => {
  const flags: Record<string, string> = {
    'it': '🇮🇹',
    'en': '🇬🇧', 
    'es': '🇪🇸',
    'ar': '🇸🇦'
  };
  return flags[langCode] || '🌐';
};

const getLanguageName = (langCode: string): string => {
  const names: Record<string, string> = {
    'it': 'Italiano',
    'en': 'English',
    'es': 'Español', 
    'ar': 'العربية'
  };
  return names[langCode] || langCode.toUpperCase();
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const StatusBadge: React.FC<{ status: SubmissionDTO["status"] }> = ({ status }) => {
  const statusConfig = {
    Completed: { className: "bg-green-100 text-green-800", label: "Completato" },
    InProgress: { className: "bg-yellow-100 text-yellow-800", label: "In Progress" },
    Abandoned: { className: "bg-red-100 text-red-800", label: "Abbandonato" },
  };

  const config = statusConfig[status] || { className: "bg-gray-100 text-gray-800", label: status };

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.className}`}>
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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
      <SearchBar
        value={filters.search}
        onChange={(value) => onFilterChange("search", value)}
        placeholder="Cerca per codice fiscale..."
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

      <div className="flex gap-2">
        <SelectFilter
          value={filters.language}
          onChange={(value) => onFilterChange("language", value)}
          options={LANGUAGE_OPTIONS}
          placeholder="Lingue: tutte"
        />
     
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label htmlFor="date_from" className="sr-only">Data Da</label>
          <input
            type="date"
            id="date_from"
            value={filters.date_from}
            onChange={(e) => onFilterChange("date_from", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            aria-label="Data inizio"
          />
        </div>
        <span className="text-gray-500">-</span>
        <div className="flex-1">
          <label htmlFor="date_to" className="sr-only">Data A</label>
          <input
            type="date"
            id="date_to"
            value={filters.date_to}
            onChange={(e) => onFilterChange("date_to", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            aria-label="Data fine"
          />
        </div>
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
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
    <StatsCard
      title="Totale Compilazioni"
      count={stats.total}
      icon={<FileText size={24} className="text-blue-600" />}
      color="bg-blue-50"
    />
    <StatsCard
      title="Completate"
      count={stats.completed}
      icon={<CheckCircle2 size={24} className="text-green-600" />}
      color="bg-green-50"
    />
    <StatsCard
      title="In Corso"
      count={stats.inProgress}
      icon={<Clock size={24} className="text-yellow-600" />}
      color="bg-yellow-50"
    />
    <StatsCard
      title="Abbandonate"
      count={stats.abandoned}
      icon={<AlertTriangle size={24} className="text-red-600" />}
      color="bg-red-50"
    />
  </div>
);

const SubmissionRow: React.FC<{
  submission: SubmissionDTO;
  onDelete: (submission: SubmissionDTO) => void;
  isDeleting: boolean;
}> = ({ submission, onDelete, isDeleting }) => (
  <tr className="hover:bg-gray-50">
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
      <Link
        to={`/submissions/${submission.uuid}`}
        className="text-blue-600 hover:text-blue-800 font-mono"
      >
        {submission.fiscalCode}
      </Link>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
      {submission.template}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm">
      <StatusBadge status={submission.status} />
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
      <div className="flex flex-col">
        <span>{new Date(String(submission.lastUpdated)).toLocaleString("it-IT", {
              year: "numeric", month: "long", day: "numeric"
              })}</span>
        <span className="text-xs text-gray-500">
          {new Date(submission.lastUpdated).toLocaleTimeString("it-IT")}
        </span>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
      <div className="flex items-center gap-2">
        <span className="text-lg">{getLanguageFlag(submission.language)}</span>
        <span>{getLanguageName(submission.language)}</span>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
      <button
        className={`${isDeleting 
          ? 'text-gray-400 cursor-not-allowed' 
          : 'text-red-600 hover:text-red-800'
        } transition-colors flex items-center justify-center`}
        onClick={() => onDelete(submission)}
        disabled={isDeleting}
        title="Elimina compilazione"
      >
        {isDeleting ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Trash2 size={18} />
        )}
      </button>
    </td>
  </tr>
);

const SubmissionsTable: React.FC<{
  submissions: SubmissionDTO[];
  onDelete: (submission: SubmissionDTO) => void;
  deletingSubmissionId: number | null;
}> = ({ submissions, onDelete, deletingSubmissionId }) => (
  <div className="bg-white shadow-sm rounded-lg overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {["Codice Fiscale", "Template", "Stato", "Ultima modifica", "Lingua", ""].map((header) => (
              <th
                key={header}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  header === "" ? "text-center" : ""
                }`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {submissions.length > 0 ? (
            submissions.map((submission) => (
              <SubmissionRow
                key={submission.id}
                submission={submission}
                onDelete={onDelete}
                isDeleting={deletingSubmissionId === submission.id}
              />
            ))
          ) : (
            <EmptyState message="Nessuna compilazione trovata" colSpan={6} />
          )}
        </tbody>
      </table>
    </div>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const QuestionnaireDashboard: React.FC = () => {
  const [submissions, setSubmissions] = useState<SubmissionDTO[]>([]);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [submissionToDelete, setSubmissionToDelete] = useState<{ id: number; uuid: string; fiscalCode: string; template: string; status: string; } | null>(null);
  const { showError, showSuccess } = useError();

  // Memoized calculations
  const filteredSubmissions = useMemo(() => filterSubmissions(submissions, filters), [submissions, filters]);
  const stats = useMemo(() => calculateStats(submissions), [submissions]);

  // Load submissions with pagination
  const loadSubmissions = useCallback(async (page: number = 1) => {
    setLoading(true);
    
    try {
      const offset = (page - 1) * ITEMS_PER_PAGE;
      const queryParams = {
        limit: ITEMS_PER_PAGE,
        offset: offset,
        sort_by: "last_updated_at",
        sort_order: "desc" as const
      };
      
      const validatedParams = listSubmissionsQuerySchema.parse(queryParams);
      console.log("Loading submissions with params:", validatedParams);
      
      const response = await submissionApi.getSubmissions(validatedParams);
      setSubmissions(response.submissions);
      setTotalItems(response.total);
      
    } catch (error) {
      console.error("Error loading submissions:", error);
      showError("Errore nel caricamento delle compilazioni", 'server');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  // Filter change handler
  const handleFilterChange = useCallback((key: keyof FilterState, value: string) => {
    if (key === 'status' && value !== 'All') {
      const validStatuses = ['Completed', 'InProgress', 'Abandoned'];
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

  const handleDeleteClick = (submission: SubmissionDTO) => {
    setSubmissionToDelete({
      id: submission.id,
      uuid: submission.uuid,
      fiscalCode: submission.fiscalCode,
      template: submission.template,
      status: submission.status,
    });
  };

  // Delete submission handler
  const handleConfirmDelete = async () => {
    if (!submissionToDelete) return;

    setDeleting(submissionToDelete.id);
    setSubmissionToDelete(null)
  
    try {
      await submissionApi.deleteSubmission(submissionToDelete.uuid);
      
      // Remove from local list and reload if needed
      setSubmissions(prev => prev.filter(s => s.id !== submissionToDelete.id));
      showSuccess("Compilazione eliminata con successo");
      
      // If this was the last item on the page and we're not on page 1, go to previous page
      if (submissions.length === 1 && currentPage > 1) {
        const newPage = currentPage - 1;
        setCurrentPage(newPage);
        loadSubmissions(newPage);
      }
      
    } catch (error) {
      console.error("Error deleting submission:", error);
      showError("Errore nell'eliminazione della compilazione", 'server');
    } finally {
      setDeleting(null);
    }
  };

  // Page change handler
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    loadSubmissions(page);
  }, [loadSubmissions]);

  // Refresh handler
  const handleRefreshSubmissions = useCallback(async () => {
    await loadSubmissions(currentPage);
    showSuccess("Compilazioni aggiornate");
  }, [loadSubmissions, currentPage, showSuccess]);


  // Load data on mount
  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" text="Caricamento dashboard..." />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Risposte questionari</h2>
        <div className="flex gap-2">
          <button
            onClick={handleRefreshSubmissions}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
            disabled={loading}
          >
            Aggiorna Dati
          </button>
          
        </div>
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
      <SubmissionsTable
        submissions={filteredSubmissions}
        onDelete={handleDeleteClick}
        deletingSubmissionId={deleting}
      />

      {/* Pagination */}
      <Pagination 
        total={totalItems}
        currentPage={currentPage}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={handlePageChange}
      />

  <ConfirmationModal
  isOpen={!!submissionToDelete}
    onClose={() => setSubmissionToDelete(null)}
    onConfirm={handleConfirmDelete}
    title="Conferma Eliminazione"
    message={
      submissionToDelete?.status === 'Completed'
        ? `Attenzione: Stai eliminando una compilazione completata.\n\nFamiglia: ${submissionToDelete?.fiscalCode}\nTemplate: ${submissionToDelete?.template}\n\nSei sicuro di voler procedere?`
        : `Sei sicuro di voler eliminare questa compilazione?\n\nFamiglia: ${submissionToDelete?.fiscalCode}\nTemplate: ${submissionToDelete?.template}`
    }
    confirmText="Elimina"
    isDestructive={true}
  />
    </AppLayout>

    
  );
};

export default QuestionnaireDashboard;