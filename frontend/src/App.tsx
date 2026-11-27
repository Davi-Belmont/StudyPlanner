import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { AuthProvider } from "./context/AuthContext";
import ComingSoonPage from "./pages/ComingSoonPage";
import HomePage from "./pages/HomePage";
import DisciplinesPage from "./pages/DisciplinesPage";
import DisciplineDetailPage from "./pages/DisciplineDetailPage";
import TasksPage from "./pages/TasksPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./Pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

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