// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import CFLoginPage from './pages/CFLoginPage';
import TestPage from './pages/TestPage';
import QuestionnairePage from './pages/QuestionnairePage';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>

        {/* 🆕 Pagina di test componenti */}
        <Route path="/test" element={<TestPage />} />
        {/* Pagina di accesso con CF */}
        <Route path="/questionnaire/:templateId" element={<CFLoginPage />} />
        
        {/* Pagina questionario attivo - TODO */}
        <Route path="/questionnaire/:templateId/:submissionId" element={<QuestionnairePage />} />
        
        {/* Pagina completamento - TODO */}
        <Route 
          path="/complete/:submissionId" 
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-green-600 mb-4">
                  Questionario Completato!
                </h1>
                <p className="text-gray-600">
                  Grazie per la partecipazione
                </p>
              </div>
            </div>
          } 
        />
        
        {/* Redirect default */}
        <Route path="/" element={<Navigate to="/questionnaire/default" replace />} />
        
        {/* 404 */}
        <Route 
          path="*" 
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Pagina non trovata
                </h1>
                <p className="text-gray-600">
                  Il link potrebbe essere errato
                </p>
              </div>
            </div>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;