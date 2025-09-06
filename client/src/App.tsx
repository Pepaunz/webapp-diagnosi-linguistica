import { Routes, Route, Navigate } from "react-router-dom";
import { ErrorProvider, ErrorBoundary } from "./context/ErrorContext";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";


import LoginPage from "./pages/LoginPage";
import QuestionnaireDashboard from "./pages/DashboardPage";
import TemplatesListPage from "./pages/TemplatesListPage";
import FeedbackPage from "./pages/FeedbackPage";
import QuestionnaireEditorPage from "./pages/QuestionnaireEditorPage";
import SubmissionViewPage from "./pages/SubmissionViewPage";


function App() {
  return (
    <ErrorBoundary>
      <ErrorProvider>
        <AuthProvider>
          <Routes>
            {/* Rotta pubblica per il login */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Rotte protette */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <QuestionnaireDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/templates" 
              element={
                <ProtectedRoute>
                  <TemplatesListPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/templates/editor" 
              element={
                <ProtectedRoute>
                  <QuestionnaireEditorPage />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/templates/editor/:id"
              element={
                <ProtectedRoute>
                  <QuestionnaireEditorPage />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/submissions/:id" 
              element={
                <ProtectedRoute>
                  <SubmissionViewPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/feedback" 
              element={
                <ProtectedRoute>
                  <FeedbackPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ErrorProvider>
    </ErrorBoundary>
  );
}

export default App;