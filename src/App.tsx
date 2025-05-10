import { Routes, Route, Navigate } from "react-router-dom";
import QuestionnaireDashboard from "./pages/DashboardPage";
import TemplatesListPage from "./pages/TemplatesListPage";
import FeedbackPage from "./pages/FeedbackPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<QuestionnaireDashboard />} />
        <Route path="/templates" element={<TemplatesListPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
