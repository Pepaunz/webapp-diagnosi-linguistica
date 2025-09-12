import AppLayout from "../layout/AppLayout";
import { TemplateCard } from "../components/ui/TemplateCard";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useError } from "../context/ErrorContext";
import { LoadingSpinner } from "../../../family-client/src/components/ui";
import { listTemplatesQuerySchema, Template } from "../../../shared/src/schemas";
import { templateApi } from "../services/templateApi";
import { ConfirmationModal } from "../components/shared/ConfirmationModal";

export default function TemplatesListPage() {
  // Stati per gestire lista template
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<{ id: string; name: string } | null>(null);
  
  // Filtri - tutti locali ora
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("updated_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  const { showError, showSuccess } = useError();


  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    
    try {
     
      const queryParams = {
        active_only: true,
        limit: 100, // Limite alto per prendere tutti i template
        offset: 0
      };
      
      // Validazione parametri
      const validatedParams = listTemplatesQuerySchema.parse(queryParams);
      console.log("Loading all templates with params:", validatedParams);
      
      const response = await templateApi.getTemplates(validatedParams);
      setTemplates(response.templates);
      
    } catch (error) {
      console.error("Error loading templates:", error);
      showError("Errore nel caricamento dei template", 'server');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDeleteTemplate = async () => {
    if (!templateToDelete) return;

    setDeleting(templateToDelete.id);
    setTemplateToDelete(null); 
 
    try {
      await templateApi.deactivateTemplate(templateToDelete.id, { is_active: false });
      setTemplates(prev => prev.filter(t => t.template_id !== templateToDelete.id));
      showSuccess(`Template "${templateToDelete.name}" eliminato con successo`);
    } catch (error) {
      showError(`Errore nell'eliminazione del template "${templateToDelete.name}"`, 'server');
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteClick = (templateId: string, templateName: string) => {
    setTemplateToDelete({ id: templateId, name: templateName });
  };

  
  const filteredTemplates = templates
    .filter(template => {
     
      const matchesSearch = searchTerm === "" || 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (template.description?.toLowerCase() || "").includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    })
    .sort((a, b) => {
      // Ordinamento locale
      let valueA: any;
      let valueB: any;
      
      switch (sortBy) {
        case "name":
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case "created_at":
          valueA = new Date(a.created_at);
          valueB = new Date(b.created_at);
          break;
        case "updated_at":
        default:
          valueA = new Date(a.updated_at);
          valueB = new Date(b.updated_at);
          break;
      }
      
      if (sortOrder === "asc") {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    });

  // Handler per aggiornare dati
  const handleRefreshTemplates = async () => {
    await loadTemplates();
    showSuccess("Template aggiornati");
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" text="Caricamento template..." />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Template questionari</h2>
        <div className="flex gap-2">
          <button
            onClick={handleRefreshTemplates}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
            disabled={loading}
          >
            Aggiorna Dati
          </button>
          <Link to="/templates/editor">
            <button className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition">
              Crea nuovo questionario
            </button>
          </Link>
        </div>
      </div>

      {/* Filtri - ora tutti locali con UX istantanea */}
      <div className="flex items-center gap-4 mb-6">
        <input
          className="border px-3 py-2 rounded flex-1"
          placeholder="Cerca template..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="border px-3 py-2 rounded"
          value={`${sortBy}_${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split('_');
            setSortBy(field);
            setSortOrder(order as "asc" | "desc");
          }}
        >
          <option value="updated_at_desc">Ordina: Ultima Modifica</option>
          <option value="updated_at_asc">Ordina: Prima Modifica</option>
          <option value="name_asc">Nome (A-Z)</option>
          <option value="name_desc">Nome (Z-A)</option>
          <option value="created_at_desc">Data Creazione (Recente)</option>
          <option value="created_at_asc">Data Creazione (Meno Recente)</option>
        </select>
      </div>

      {/* Lista template */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm ? "Nessun template trovato per la ricerca" : "Nessun template disponibile"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <TemplateCard 
              key={template.template_id} 
              template={template}
              onDelete={handleDeleteClick}
              isDeleting={deleting === template.template_id}
            />
          ))}
        </div>
      )}

    <ConfirmationModal
        isOpen={!!templateToDelete}
        onClose={() => setTemplateToDelete(null)}
        onConfirm={handleConfirmDeleteTemplate}
        title="Conferma Eliminazione Template"
        message={`Sei sicuro di voler eliminare il template "${templateToDelete?.name}"?\n\nQuesta azione non può essere annullata.`}
        confirmText="Elimina"
        isDestructive={true}
      />
    </AppLayout>
  );
}