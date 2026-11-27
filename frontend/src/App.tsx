import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import ComingSoonPage from "./pages/ComingSoonPage";
import DisciplineDetailPage from "./pages/DisciplineDetailPage";
import DisciplinesPage from "./pages/DisciplinesPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import TasksPage from "./pages/TasksPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="disciplinas" element={<DisciplinesPage />} />
            <Route path="disciplinas/:id" element={<DisciplineDetailPage />} />
            <Route path="tarefas" element={<TasksPage />} />
            <Route path="perfil" element={<ProfilePage />} />
            <Route path="*" element={<ComingSoonPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
