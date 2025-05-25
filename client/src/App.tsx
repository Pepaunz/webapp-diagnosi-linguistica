import { Routes, Route, Navigate } from "react-router-dom";
import QuestionnaireDashboard from "./pages/DashboardPage";
import TemplatesListPage from "./pages/TemplatesListPage";
import FeedbackPage from "./pages/FeedbackPage";
import QuestionnaireEditorPage from "./pages/QuestionnaireEditorPage";
import SubmissionViewPage from "./pages/SubmissionViewPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<QuestionnaireDashboard />} />
        <Route path="/templates" element={<TemplatesListPage />} />
        <Route path="/templates/editor" element={<QuestionnaireEditorPage />} />
        <Route
          path="/templates/editor/:id"
          element={<QuestionnaireEditorPage />}
        />
        <Route path="/submissions/:id" element={<SubmissionViewPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
