import AppLayout from "../layout/AppLayout";
import { TemplateCard } from "../components/ui/TemplateCard";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useError } from "../context/ErrorContext";
import {LoadingSpinner} from "../../../family-client/src/components/ui"
import { listTemplatesQuerySchema, Template} from "../../../shared/src/schemas";
import { templateApi } from "../services/templateApi";


export default function TemplatesListPage() {
  // Stati per gestire lista template
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  
  // Filtri
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("updated_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  const { showError,showSuccess } = useError();

  // Carica template all'avvio
  useEffect(() => {
    loadTemplates();
  }, [sortBy, sortOrder]);


  const loadTemplates = async () => {
    setLoading(true);
    
    try {
      // Valida i parametri di query usando schema Zod
      const queryParams = {
        active_only: true,
        sort_by: sortBy,
        sort_order: sortOrder,
        limit: 50,
        offset: 0
      };
      
      // Validazione parametri
      const validatedParams = listTemplatesQuerySchema.parse(queryParams);
      console.log("Loading templates with params:", validatedParams);
      
     
      const response = await templateApi.getTemplates(validatedParams);
      setTemplates(response.templates);
      
      
    } catch (error) {
      console.error("Error loading templates:", error);
      showError("Errore nel caricamento dei template", 'server');
    } finally {
      setLoading(false);
    }
  };

  
  const handleDeleteTemplate = async (templateId: string, templateName: string) => {
    if (!confirm(`Sei sicuro di voler eliminare il template "${templateName}"?\n\nQuesta azione non può essere annullata.`)) {
      return;
    }
    
    setDeleting(templateId);
    
    try {
  
      console.log("Deleting template:", templateId);
      
      await templateApi.deactivateTemplate(templateId,{is_active:false});
      
      // Rimuovi dalla lista locale
      setTemplates(prev => prev.filter(t => t.template_id !== templateId));
      showSuccess(`Template "${templateName}" eliminato con successo`);
      
    } catch (error) {
      console.error("Error deleting template:", error);
      showError(`Errore nell'eliminazione del template "${templateName}"`, 'server');
    } finally {
      setDeleting(null);
    }
  };

 //filtro locale
  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (template.description?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

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
        <Link to="/templates/editor">
          <button className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition">
            Crea nuovo questionario
          </button>
        </Link>
      </div>

      {/* Filtri funzionali */}
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
          <option value="updated_desc">Ordina: Ultima Modifica</option>
          <option value="updated_asc">Ordina: Prima Modifica</option>
          <option value="name_asc">Nome (A-Z)</option>
          <option value="name_desc">Nome (Z-A)</option>
          <option value="created_desc">Data Creazione (Recente)</option>
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
              onDelete={handleDeleteTemplate}
              isDeleting={deleting === template.template_id}
            />
          ))}
        </div>
      )}
    </AppLayout>
  );
}