// src/pages/QuestionnaireDashboard.tsx

import { Filter, Loader2, Trash2 } from "lucide-react";
import AppLayout from "../layout/AppLayout";
import { useState,useEffect } from "react";
import {useError} from "../context/ErrorContext"
import { LoadingSpinner} from "../../../family-client/src/components/ui";
import { listSubmissionsQuerySchema } from "../../../shared/src/schemas";
import { Link } from "react-router-dom";
import {
  SearchBar,
  SelectFilter,
  EmptyState,
  Pagination,
  Button,
} from "../components/shared/Filters";
import { SubmissionDTO } from "@bilinguismo/shared";
import { z } from "zod";
import { FileText, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { StatsCard } from "../components/ui/StatsCard";

interface FilterState {
  search: string;
  status: string;
  template: string;
  language: string;
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
        placeholder="Cerca per codice fiscale..."
      />

      {/* Filters */}
      <div className="flex gap-2">
        <SelectFilter
          value={filters.status}
          onChange={(value) => setFilters("status", value)}
          options={[
            { value: "All", label: "All Status" },
            { value: "Completed", label: "Completato" },
            { value: "InProgress", label: "In Progress" },
            { value: "Abandoned", label: "Abbandonato" },
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

      <div className="flex gap-2">
        <SelectFilter
          value={filters.language}
          onChange={(value) => setFilters("language", value)}
          options={[
            { value: "All Languages", label: "All Languages" },
            { value: "Italiano", label: "Italiano" },
            { value: "Español", label: "Español" },
            { value: "العربية", label: "العربية" },
          ]}
          placeholder="Lingue: tutte"
        />

        <Button icon={<Filter size={16} />} variant="primary">
          Avanzate
        </Button>
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

const StatusBadge = ({ status }: { status: SubmissionDTO["status"] }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "InProgress":
        return "bg-yellow-100 text-yellow-800";
      case "Abandoned":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
        status
      )}`}
    >
      {(() => {
        switch (status) {
          case "Completed":
            return "Completato";
          case "InProgress":
            return "In Progress";
          case "Abandoned":
            return "Abbandonato";
          default:
            return status;
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
        Codice Fiscale
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
        Stato
      </th>
      <th
        scope="col"
        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
      >
        Ultima modifica
      </th>
      <th
        scope="col"
        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
      >
        Lingua
      </th>
      <th
        scope="col"
        className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
      ></th>
    </tr>
  </thead>
);

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


const SubmissionRow = ({
  submission,
  onDelete,
  isDeleting = false, 
}: {
  submission: SubmissionDTO;
  onDelete: (id: number, uuid: string) => void; 
  isDeleting?: boolean; 
}) => (
  <tr key={submission.id} className="hover:bg-gray-50">
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
        <span>{new Date(submission.lastUpdated).toLocaleDateString()}</span>
        <span className="text-xs text-gray-500">
          {new Date(submission.lastUpdated).toLocaleTimeString()}
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
        onClick={() => onDelete(submission.id, submission.uuid)} 
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
const SubmissionsTable = ({
  submissions,
  onDelete,
  deletingSubmissionId, 
}: {
  submissions: SubmissionDTO[];
  onDelete: (id: number, uuid: string) => void; 
  deletingSubmissionId?: number | null; 
}) => (
  <div className="bg-white shadow-sm rounded-lg overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <TableHeader />
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


function QuestionnaireDashboard() {
  // Sample data
  const [submissions, setSubmissions] = useState<SubmissionDTO[]>([
    {
      id: 1,
      uuid: "24c8a554-b99e-4586-bcc4-be32dbecc125",
      fiscalCode: "ABCDEF12G34H567I",
      template: "Standard Bilinguismo",
      status: "Completed",
      progress: "4/5",
      lastUpdated: "2025-04-22T14:30:00",
      completedOn: "2025-04-22T14:30:00",
      language: "it",
    },
    {
      id: 2,
      uuid:"a35c4d6c-e535-4771-9f38-e28d155fd30d",
      fiscalCode: "LMNOPQ78R90S123T",
      template: "Follow-up",
      status: "InProgress",
      progress: "2/3",
      lastUpdated: "2025-04-23T09:15:00",
      completedOn: null,
      language: "en",
    },
    
  ]);

  // Filter states in a single object
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "All",
    template: "All Templates",
    language: "All Languages",
  });

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null); // submission id being deleted
  const [statistics, setStatistics] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    abandoned: 0
  });
  const { showError, showSuccess } = useError();

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    setLoading(true);
    
    try {
      // Valida parametri query usando schema Zod
      const queryParams = {
        limit: 100,
        offset: 0,
        sort_by: "last_updated_at",
        sort_order: "desc" as const
      };
      
      // Validazione parametri
      const validatedParams = listSubmissionsQuerySchema.parse(queryParams);
      console.log("Loading submissions with params:", validatedParams);
      
      // TODO: Sostituire con vera chiamata API
      // const response = await submissionApi.getSubmissions(validatedParams);
      // setSubmissions(response.submissions);
      
      // MOCK: Simula caricamento con possibili errori
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data già esistente nel componente rimane uguale per ora
      // setSubmissions rimane uguale per ora
      
      // Calcola statistiche dai dati caricati
      updateStatistics(submissions); // submissions deve essere accessibile
      
    } catch (error) {
      console.error("Error loading submissions:", error);
      showError("Errore nel caricamento delle compilazioni", 'server');
    } finally {
      setLoading(false);
    }
  };

  const updateStatistics = (submissionList: SubmissionDTO[]) => {
    const stats = {
      total: submissionList.length,
      completed: submissionList.filter(s => s.status === "Completed").length,
      inProgress: submissionList.filter(s => s.status === "InProgress").length,
      abandoned: submissionList.filter(s => s.status === "Abandoned").length
    };
    setStatistics(stats);
  };
  
  // Aggiorna statistiche quando cambiano le submissions
  useEffect(() => {
    updateStatistics(submissions);
  }, [submissions]);

  const handleDelete = async (submissionId: number, submissionUuid: string) => {
    // Trova la submission corrente
    const submission = submissions.find(s => s.id === submissionId);
    if (!submission) {
      showError("Compilazione non trovata", 'validation');
      return;
    }
  
    // Validazione business logic
    if (submission.status === "Completed") {
      const confirmed = confirm(
        `Attenzione: Stai eliminando una compilazione completata.\n\nFamiglia: ${submission.fiscalCode}\nTemplate: ${submission.template}\n\nSei sicuro di voler procedere?`
      );
      if (!confirmed) return;
    } else {
      const confirmed = confirm(
        `Sei sicuro di voler eliminare questa compilazione?\n\nFamiglia: ${submission.fiscalCode}\nTemplate: ${submission.template}`
      );
      if (!confirmed) return;
    }
  
    setDeleting(submissionId);
    
    try {
      console.log("Deleting submission:", submissionUuid);
      
      // TODO: Sostituire con vera chiamata API usando UUID
      // await submissionApi.deleteSubmission(submissionUuid);
      
      // MOCK: Simula eliminazione
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Rimuovi dalla lista locale
      setSubmissions(prev => prev.filter(s => s.id !== submissionId));
      showSuccess("Compilazione eliminata con successo");
      
    } catch (error) {
      console.error("Error deleting submission:", error);
      showError("Errore nell'eliminazione della compilazione", 'server');
    } finally {
      setDeleting(null);
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    // Validazione rapida per status
    if (key === 'status' && value !== 'All') {
      const validStatuses = ['Completed', 'InProgress', 'Abandoned'];
      if (!validStatuses.includes(value)) {
        showError("Stato filtro non valido", 'validation');
        return;
      }
    }
  
    // Validazione per codice fiscale (pattern basilare)
    if (key === 'search' && value.length > 0) {
      // Permetti solo caratteri alfanumerici per codice fiscale
      const cfPattern = /^[A-Za-z0-9]*$/;
      if (!cfPattern.test(value)) {
        showError("Il codice fiscale può contenere solo lettere e numeri", 'validation');
        return;
      }
      
      // Se lunghezza > 16 (lunghezza massima CF)
      if (value.length > 16) {
        showError("Il codice fiscale è troppo lungo", 'validation');
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
      language: "All Languages",
    });
  };

  // Filter submissions based on filter state
  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch = sub.fiscalCode
      .toLowerCase()
      .includes(filters.search.toLowerCase());
    const matchesStatus =
      filters.status === "All" || sub.status === filters.status;
    const matchesTemplate =
      filters.template === "All Templates" || sub.template === filters.template;
    const matchesLanguage =
      filters.language === "All Languages" || sub.language === filters.language;

    return matchesSearch && matchesStatus && matchesTemplate && matchesLanguage;
  });


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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Risposte questionari</h2>
        <div className="flex gap-2">
        <button
          onClick={loadSubmissions}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
          disabled={loading}
        >
          Aggiorna Dati
        </button>
        <button
          onClick={() => {
            // TODO: Implementare export
            showError("Funzione export in arrivo", 'generic');
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Esporta CSV
        </button>
      </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <StatsCard
        title="Totale Compilazioni"
        count={statistics.total}
        icon={<FileText size={24} className="text-blue-600" />}
        color="bg-blue-50"
      />
      <StatsCard
        title="Completate"
        count={statistics.completed}
        icon={<CheckCircle2 size={24} className="text-green-600" />}
        color="bg-green-50"
      />
      <StatsCard
        title="In Corso"
        count={statistics.inProgress}
        icon={<Clock size={24} className="text-yellow-600" />}
        color="bg-yellow-50"
      />
      <StatsCard
        title="Abbandonate"
        count={statistics.abandoned}
        icon={<AlertTriangle size={24} className="text-red-600" />}
        color="bg-red-50"
      />
    </div>

      {/* Filter component */}
      <FilterBar
        filters={filters}
        setFilters={handleFilterChange}
        clearFilters={clearFilters}
      />

      {/* Table component */}
      <SubmissionsTable
        submissions={filteredSubmissions}
        onDelete={handleDelete}
        deletingSubmissionId={deleting}
      />

      {/* Pagination component */}
      <Pagination total={filteredSubmissions.length} />
    </AppLayout>
  );
}

export default QuestionnaireDashboard;
