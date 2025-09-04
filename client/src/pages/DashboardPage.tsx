// src/pages/QuestionnaireDashboard.tsx

import { Filter, Trash2 } from "lucide-react";
import AppLayout from "../layout/AppLayout";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  SearchBar,
  SelectFilter,
  EmptyState,
  Pagination,
  Button,
} from "../components/shared/Filters";
import { SubmissionDTO } from "@bilinguismo/shared";

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

      <Button variant="primary">Esporta Dati</Button>
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

const SubmissionRow = ({
  submission,
  onDelete,
}: {
  submission: SubmissionDTO;
  onDelete: (id: number) => void;
}) => (
  <tr key={submission.id} className="hover:bg-gray-50">
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
      <Link
        to={`/submissions/${submission.uuid}`}
        className="text-blue-600 hover:text-blue-800"
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
      {new Date(submission.lastUpdated).toLocaleString()}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
      {submission.language}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
      <button
        className="text-red-600 hover:text-red-800"
        onClick={() => onDelete(submission.id)}
      >
        <Trash2 size={18} />
      </button>
    </td>
  </tr>
);

const SubmissionsTable = ({
  submissions,
  onDelete,
}: {
  submissions: SubmissionDTO[];
  onDelete: (id: number) => void;
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

  // Handler for deleting a submission
  const handleDelete = (id: number) => {
    if (confirm("Sei sicuro di volere eliminare queste risposte?")) {
      setSubmissions(submissions.filter((sub) => sub.id !== id));
    }
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Risposte questionari</h2>
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
      />

      {/* Pagination component */}
      <Pagination total={filteredSubmissions.length} />
    </AppLayout>
  );
}

export default QuestionnaireDashboard;
