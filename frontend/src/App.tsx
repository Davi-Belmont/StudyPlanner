import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { AuthProvider } from "./context/AuthContext";
import ComingSoonPage from "./pages/ComingSoonPage";
import HomePage from "./pages/HomePage";
import DisciplinesPage from "./pages/DisciplinesPage";
import DisciplineDetailPage from "./pages/DisciplineDetailPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="disciplinas" element={<DisciplinesPage />} />
            <Route path="disciplinas/:id" element={<DisciplineDetailPage />} />
            <Route path="*" element={<ComingSoonPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}