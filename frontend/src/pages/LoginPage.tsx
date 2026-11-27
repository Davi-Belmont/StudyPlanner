
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { getErrorMessage } from "../Services/http";
import "./LoginPage.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const { login, user, loading } = useAuth();
const navigate = useNavigate();
if (loading) {
  return <p>Verificando autenticação...</p>;
}

if (user) {
  navigate("/");
  return null;
}
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      await login(email, senha);
      navigate("/");
    } catch (error) {
      setErro(getErrorMessage(error));
    } finally {
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
          <h2>Bem-vindo de volta</h2>
          <p>
            Entre para acessar suas disciplinas, tarefas e notas.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
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
            placeholder="Digite sua senha"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            required
          />

          {erro && <p className="login-error">{erro}</p>}

          <button type="submit" className="login-button" disabled={carregando}>
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <button type="button" className="register-button">
          Criar conta
        </button>

        <footer className="login-footer">
          <span className="status-indicator"></span>
          Servidor online
        </footer>
      </section>
    </main>
  );
}
