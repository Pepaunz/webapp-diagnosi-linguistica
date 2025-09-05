// src/App.tsx - con ErrorProvider integrato
import { Routes, Route, Navigate } from 'react-router-dom';
import CFLoginPage from './pages/CFLoginPage';
import TestPage from './pages/TestPage';
import QuestionnairePage from './pages/QuestionnairePage';
import { AnnouncementProvider } from './components/accessibility/ScreenReaderAnnouncements';
import { ErrorProvider, ErrorBoundary } from './context/ErrorContext';

function App() {
  return (
    <ErrorBoundary>
      <ErrorProvider>
        <AnnouncementProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* 🆕 Pagina di test componenti */}
              <Route path="/test" element={<TestPage />} />
              
              {/* Pagina di accesso con CF */}
              <Route path="/questionnaire/:templateId" element={<CFLoginPage />} />
              
              {/* Pagina questionario attivo */}
              <Route path="/questionnaire/:templateId/:submissionId" element={<QuestionnairePage />} />
              
              {/* Pagina completamento */}
              <Route 
                path="/complete/:submissionId" 
                element={
                  <div className="min-h-screen flex items-center justify-center px-mobile-md">
                    <div className="text-center max-w-sm w-full bg-white rounded-mobile-lg shadow-lg p-mobile-xl">
                      {/* Success Icon */}
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-mobile-lg">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      
                      {/* Content */}
                      <h1 className="text-mobile-xl font-bold text-family-text-primary mb-mobile-md">
                        Questionario Completato!
                      </h1>
                      <p className="text-mobile-md text-family-text-body leading-relaxed mb-mobile-lg">
                        Grazie per aver completato il questionario. Le tue risposte sono state salvate con successo.
                      </p>
                      
                      {/* Button to close or go home */}
                      <button
                        onClick={() => window.close()}
                        className="w-full bg-family-primary text-white py-mobile-sm px-mobile-md rounded-mobile-sm font-medium hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-family-primary focus:ring-offset-2 transition-colors min-h-touch-md"
                      >
                        Chiudi
                      </button>
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
                  <div className="min-h-screen flex items-center justify-center px-mobile-md">
                    <div className="text-center max-w-sm w-full bg-white rounded-mobile-lg shadow-lg p-mobile-xl">
                      {/* 404 Icon */}
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-mobile-lg">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      
                      {/* Content */}
                      <h1 className="text-mobile-xl font-bold text-family-text-primary mb-mobile-md">
                        Pagina non trovata
                      </h1>
                      <p className="text-mobile-md text-family-text-body leading-relaxed mb-mobile-lg">
                        Il link potrebbe essere errato o la pagina non è più disponibile.
                      </p>
                      
                      {/* Back button */}
                      <button
                        onClick={() => window.history.back()}
                        className="w-full bg-family-primary text-white py-mobile-sm px-mobile-md rounded-mobile-sm font-medium hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-family-primary focus:ring-offset-2 transition-colors min-h-touch-md"
                      >
                        Torna Indietro
                      </button>
                    </div>
                  </div>
                } 
              />
            </Routes>
          </div>
        </AnnouncementProvider>
      </ErrorProvider>
    </ErrorBoundary>
  );
}

export default App;