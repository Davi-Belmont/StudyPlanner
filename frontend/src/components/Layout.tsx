import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { initials } from "../utils/format";
import { Book, Calendar, GraduationCap, Home, ListChecks, User, LogOut } from "lucide-react";

const links = [
  { to: "/", label: "Início", icon: Home, end: true },
  { to: "/disciplinas", label: "Disciplinas", icon: Book, end: false },
  { to: "/calendario", label: "Calendário", icon: Calendar, end: false },
  { to: "/tarefas", label: "Tarefas", icon: ListChecks, end: false },
  { to: "/perfil", label: "Perfil e notas", icon: User, end: false }
];

export default function Layout() {
  const { user, logout } = useAuth();
  const name = user?.nome ?? "Estudante";

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand__logo">
            <GraduationCap size={20} />
          </span>
          <span className="brand__name">StudyPlanner</span>
        </div>

        <nav className="nav">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav__link ${isActive ? "is-active" : ""}`}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

      <div className="sidebar__user">
  <span className="avatar">{initials(name)}</span>

  <div className="sidebar__user-text">
    <strong>{name}</strong>
    <span>Estudante</span>
  </div>

  <button
    type="button"
    onClick={logout}
    title="Sair da conta"
    className="logout-button"
  >
    <LogOut size={18} />
  </button>
</div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
