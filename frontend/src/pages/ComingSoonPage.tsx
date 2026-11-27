import { useLocation } from "react-router-dom";

// Só telas que ainda NÃO existem entram aqui (tarefas e perfil já foram implementadas)
const titles: Record<string, string> = {
  "/calendario": "Calendário"
};

// Espaço reservado para as telas que ainda serão implementadas
export default function ComingSoonPage() {
  const { pathname } = useLocation();
  const title = titles[pathname];

  return (
    <header className="page-header">
      <h1>{title ?? "Página não encontrada"}</h1>
      <p>{title ? "Esta tela ainda será implementada." : "O endereço informado não existe."}</p>
    </header>
  );
}
