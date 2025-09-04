import AppLayout from "../layout/AppLayout";
import { TemplateCard } from "../components/ui/TemplateCard";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useError } from "../context/ErrorContext";
import {LoadingSpinner} from "../../../family-client/src/components/ui"
import { listTemplatesQuerySchema, Template} from "../../../shared/src/schemas";


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

  // Mock API call - sostituire con vera API
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
      
      // TODO: Sostituire con vera chiamata API
      // const response = await fetch('/api/v1/templates?' + new URLSearchParams(validatedParams));
      // const data = await response.json();
      
      // MOCK: Simula caricamento da server
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data con struttura simile al backend
      const mockTemplates = [
        {
          template_id: "uuid-1",
          name: "Standard Bilinguismo", 
          description: "Template standard per valutazione bilinguismo",
          structure_definition: {}, // QuestionnaireData
          is_active: true,
          available_languages: ["it", "en"],
          created_at: new Date("2025-04-20"),
          updated_at: new Date("2025-04-24")
        },
        {
          template_id: "uuid-2",
          name: "Follow-up", 
          description: "Questionario di follow-up",
          structure_definition: {},
          is_active: true,
          available_languages: ["it"],
          created_at: new Date("2025-04-21"),
          updated_at: new Date("2025-04-23")
        },
        {
          template_id: "uuid-3",
          name: "Terzo Form", 
          description: null,
          structure_definition: {},
          is_active: false, // Template disattivato
          available_languages: ["it", "en", "es"],
          created_at: new Date("2025-04-19"),
          updated_at: new Date("2025-04-22")
        },
      ];
      
      setTemplates(mockTemplates as Template[]);
      
    } catch (error) {
      console.error("Error loading templates:", error);
      showError("Errore nel caricamento dei template", 'server');
    } finally {
      setLoading(false);
    }
  };

  // Elimina template con controlli business logic
  const handleDeleteTemplate = async (templateId: string, templateName: string) => {
    // Conferma eliminazione
    if (!confirm(`Sei sicuro di voler eliminare il template "${templateName}"?\n\nQuesta azione non può essere annullata.`)) {
      return;
    }
    
    setDeleting(templateId);
    
    try {
      // TODO: Prima controlla se ha submission associate
      // const submissionCheck = await fetch(`/api/v1/templates/${templateId}/submissions/count`);
      // const { count } = await submissionCheck.json();
      
      // MOCK: Simula controllo submission (alcuni template hanno submission associate)
      const hasSubmissions = templateName === "Standard Bilinguismo"; // Mock logic
      
      if (hasSubmissions) {
        showError(`Impossibile eliminare "${templateName}": ha delle compilazioni associate`, 'validation');
        return;
      }
      
      console.log("Deleting template:", templateId);
      
      // TODO: Vera chiamata API DELETE
      // await fetch(`/api/v1/templates/${templateId}`, { method: 'DELETE' });
      
      // MOCK: Simula eliminazione
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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

  // Filtra template localmente (in futuro si farà lato server)
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
          <option value="updated_at_desc">Ordina: Ultima Modifica</option>
          <option value="updated_at_asc">Ordina: Prima Modifica</option>
          <option value="name_asc">Nome (A-Z)</option>
          <option value="name_desc">Nome (Z-A)</option>
          <option value="created_at_desc">Data Creazione (Recente)</option>
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