import { MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import DisciplineModal from "../components/DisciplineModal";
import StateMessage from "../components/StateMessage";
import { useLoad } from "../hooks/useLoad";
import { activityService } from "../services/activityService";
import { disciplineService } from "../services/disciplineService";
import type { DisciplineSummary } from "../types/api";
import { disciplineColor } from "../utils/colors";
import { formatGrade, gradeTone } from "../utils/format";

function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default function DisciplinesPage() {
  const [search, setSearch] = useState("");
  const [menuId, setMenuId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<DisciplineSummary | null>(null);
  const [deleting, setDeleting] = useState<DisciplineSummary | null>(null);

  const { data, error, loading, reload } = useLoad(async () => {
    // GET /disciplines não traz pendências; contamos a partir de /activities?status=PENDING
    const [disciplines, pending] = await Promise.all([
      disciplineService.list(),
      activityService.list({ status: "PENDING" })
    ]);

    const pendingByDiscipline: Record<string, number> = {};
    pending.forEach((activity) => {
      pendingByDiscipline[activity.disciplineId] =
        (pendingByDiscipline[activity.disciplineId] ?? 0) + 1;
    });

    return { disciplines, pendingByDiscipline };
  });

  // Fecha o menu "..." ao clicar em qualquer outro lugar
  useEffect(() => {
    if (menuId === null) return;

    const close = () => setMenuId(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuId]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const term = normalize(search.trim());
    if (!term) return data.disciplines;

    return data.disciplines.filter(
      (item) =>
        normalize(item.name).includes(term) || normalize(item.description ?? "").includes(term)
    );
  }, [data, search]);

  const total = data?.disciplines.length ?? 0;

  return (
    <>
      <header className="page-header">
        <h1>Disciplinas</h1>
        <p>{data ? `${total} no semestre` : " "}</p>
      </header>

      <div className="toolbar">
        <label className="search">
          <Search size={16} />
          <input
            placeholder="Buscar disciplina"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <span className="muted toolbar__count">{total} no semestre</span>
        <button
          type="button"
          className="btn btn--primary toolbar__action"
          onClick={() => setCreating(true)}
        >
          <Plus size={16} />
          Nova disciplina
        </button>
      </div>

      {loading && <StateMessage kind="loading" />}
      {error && !data && <StateMessage kind="error" message={error} onRetry={reload} />}

      {data && total === 0 && (
        <StateMessage kind="empty" message="Você ainda não cadastrou nenhuma disciplina." />
      )}
      {data && total > 0 && filtered.length === 0 && (
        <StateMessage kind="empty" message="Nenhuma disciplina encontrada." />
      )}

      <div className="discipline-grid">
        {filtered.map((discipline) => (
          <article key={discipline.id} className="card discipline-card">
            <div className="discipline-card__top">
              <h2>
                <Link to={`/disciplinas/${discipline.id}`} className="stretched-link">
                  <i style={{ background: disciplineColor(discipline.id) }} />
                  {discipline.name}
                </Link>
              </h2>

              <div className="menu">
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`Opções de ${discipline.name}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    setMenuId(menuId === discipline.id ? null : discipline.id);
                  }}
                >
                  <MoreHorizontal size={18} />
                </button>

                {menuId === discipline.id && (
                  <div className="menu__list">
                    <button type="button" onClick={() => setEditing(discipline)}>
                      <Pencil size={14} />
                      Editar
                    </button>
                    <button
                      type="button"
                      className="is-danger"
                      onClick={() => setDeleting(discipline)}
                    >
                      <Trash2 size={14} />
                      Excluir
                    </button>
                  </div>
                )}
              </div>
            </div>

            <p className="discipline-card__description">
              {discipline.description || "Sem descrição"}
            </p>

            <div className="discipline-card__stats">
              <div>
                <span>Pendentes</span>
                <strong>{data?.pendingByDiscipline[discipline.id] ?? 0}</strong>
              </div>
              <div>
                <span>Média</span>
                <strong className={`tone tone--${gradeTone(discipline.average)}`}>
                  {formatGrade(discipline.average)}
                </strong>
              </div>
            </div>
          </article>
        ))}
      </div>

      {creating && <DisciplineModal onClose={() => setCreating(false)} onSaved={reload} />}

      {editing && (
        <DisciplineModal discipline={editing} onClose={() => setEditing(null)} onSaved={reload} />
      )}

      {deleting && (
        <ConfirmDialog
          title="Excluir disciplina"
          message={`Excluir "${deleting.name}"? As atividades e notas dessa disciplina também serão excluídas.`}
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            await disciplineService.remove(deleting.id);
            setDeleting(null);
            await reload();
          }}
        />
      )}
    </>
  );
}
