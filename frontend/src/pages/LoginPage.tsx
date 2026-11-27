import { useEffect, useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage, http } from "../services/http";
import "./LoginPage.css";

type Mode = "login" | "register";
type ServerStatus = "checking" | "online" | "offline";

const statusLabel: Record<ServerStatus, string> = {
  checking: "Verificando servidor...",
  online: "Servidor online",
  offline: "Servidor offline"
};

const statusColor: Record<ServerStatus, string> = {
  checking: "#d97706",
  online: "#22a06b",
  offline: "#dc2626"
};

export default function LoginPage() {
  const { login, register, user, loading } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [server, setServer] = useState<ServerStatus>("checking");

  // Estado real do servidor (antes o texto "Servidor online" era fixo)
  useEffect(() => {
    let active = true;

    http
      .get<{ status: string }>("/health")
      .then(() => active && setServer("online"))
      .catch(() => active && setServer("offline"));

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <p>Verificando autenticação...</p>;
  }

  // Redireciona sem chamar navigate() durante o render
  if (user) {
    return <Navigate to="/" replace />;
  }

  const isRegister = mode === "register";

  function toggleMode() {
    setMode(isRegister ? "login" : "register");
    setErro("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      if (isRegister) {
        await register(nome, email, senha);
      } else {
        await login(email, senha);
      }
      // Ao definir o usuário no contexto, o <Navigate> acima leva para "/"
    } catch (error) {
      setErro(getErrorMessage(error));
      setCarregando(false);
    }
  }

  return (
    <main className="login-container">
      <section className="login-card">
        <header className="login-header">
          <div className="login-logo">SP</div>
          <h1>StudyPlanner</h1>
          <p>Organizador acadêmico</p>
        </header>

        <div className="login-welcome">
          <h2>{isRegister ? "Crie sua conta" : "Bem-vindo de volta"}</h2>
          <p>
            {isRegister
              ? "Cadastre-se para organizar suas disciplinas, tarefas e notas."
              : "Entre para acessar suas disciplinas, tarefas e notas."}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <label htmlFor="nome">Nome</label>
              <input
                id="nome"
                type="text"
                placeholder="Seu nome completo"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                required
              />
            </>
          )}

          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="senha">Senha</label>
          <input
            id="senha"
            type="password"
            placeholder={isRegister ? "Mínimo de 6 caracteres" : "Digite sua senha"}
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            minLength={isRegister ? 6 : undefined}
            required
          />

          {erro && <p className="login-error">{erro}</p>}

          <button type="submit" className="login-button" disabled={carregando}>
            {carregando ? "Aguarde..." : isRegister ? "Criar conta" : "Entrar"}
          </button>
        </form>

        <button type="button" className="register-button" onClick={toggleMode}>
          {isRegister ? "Já tenho conta" : "Criar conta"}
        </button>

        <footer className="login-footer">
          <span className="status-indicator" style={{ background: statusColor[server] }}></span>
          {statusLabel[server]}
        </footer>
      </section>
    </main>
  );
}
