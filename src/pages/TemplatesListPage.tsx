import AppLayout from "../layout/AppLayout";
import { TemplateCard } from "../components/TemplateCard";
import { Link } from "react-router-dom";

export default function TemplatesListPage() {
  const templates = [
    { name: "Standard Bilinguismo", modified: "2025-04-24", isDefault: true },
    { name: "Follow-up", modified: "2025-04-23" },
    { name: "Terzo Form", modified: "2025-04-22" },
  ];

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Template questionari</h2>
        <Link to="/editor">
          <button className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition">
            Crea nuovo questionario
          </button>
        </Link>
      </div>
      <div className="flex items-center gap-4 mb-6">
        <input
          className="border px-3 py-2 rounded"
          placeholder="Cerca template..."
        />
        <select className="border px-3 py-2 rounded">
          <option>Ordina: Ultima Modifica</option>
          <option>Nome</option>
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {templates.map((tpl, idx) => (
          <TemplateCard key={idx} {...tpl} />
        ))}
      </div>
    </AppLayout>
  );
}
