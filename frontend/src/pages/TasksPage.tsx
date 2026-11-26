import { useMemo, useState } from "react";
import { Check, Circle, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { activityService } from "../services/activityService";
import { disciplineService } from "../services/disciplineService";
import { useLoad } from "../hooks/useLoad";
import ActivityModal from "../components/ActivityModal";
import ConfirmDialog from "../components/ConfirmDialog";
import DueBadge from "../components/DueBadge";
import StateMessage from "../components/StateMessage";
import TypeLabel from "../components/TypeLabel";
import type { Activity, ActivityStatus, ActivityType, ActivityWithDiscipline, DisciplineSummary } from "../types/api";
import { formatFullDate } from "../utils/format";

type Tab = "PENDING" | "COMPLETED" | "ALL";

export default function TasksPage() {
  const [tab, setTab] = useState<Tab>("PENDING");
  const [type, setType] = useState<ActivityType | "ALL">("ALL");
  const [disciplineId, setDisciplineId] = useState("ALL");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Activity | undefined>();
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<ActivityWithDiscipline | null>(null);

  const activities = useLoad(() => activityService.list(), "activities");
  const disciplines = useLoad(() => disciplineService.list(), "disciplines");

  async function reload() { await activities.reload(); }

  const filtered = useMemo(() => (activities.data ?? []).filter((item) => {
    if (tab !== "ALL" && item.status !== tab) return false;
    if (type !== "ALL" && item.type !== type) return false;
    if (disciplineId !== "ALL" && item.disciplineId !== disciplineId) return false;
    const query = search.trim().toLocaleLowerCase("pt-BR");
    return !query || item.title.toLocaleLowerCase("pt-BR").includes(query) ||
      item.discipline.name.toLocaleLowerCase("pt-BR").includes(query);
  }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()), [activities.data, tab, type, disciplineId, search]);

  const groups = useMemo(() => {
    const map = new Map<string, ActivityWithDiscipline[]>();
    filtered.forEach((item) => {
      const key = new Date(item.dueDate).toLocaleDateString("pt-BR");
      map.set(key, [...(map.get(key) ?? []), item]);
    });
    return Array.from(map.entries());
  }, [filtered]);

  async function toggleStatus(activity: ActivityWithDiscipline) {
    const status: ActivityStatus = activity.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    await activityService.update(activity.id, { status });
    await reload();
  }

  async function removeActivity() {
    if (!deleting) return;
    await activityService.remove(deleting.id);
    setDeleting(null);
    await reload();
  }

  return (
    <>
      <header className="page-header">
        <h1>Tarefas</h1>
        <p>Organize suas tarefas, provas e trabalhos.</p>
      </header>

      <div className="tasks-toolbar">
        <div className="tasks-tabs" role="tablist" aria-label="Status das atividades">
          <button className={tab === "PENDING" ? "is-active" : ""} onClick={() => setTab("PENDING")}>Pendentes</button>
          <button className={tab === "COMPLETED" ? "is-active" : ""} onClick={() => setTab("COMPLETED")}>Concluídas</button>
          <button className={tab === "ALL" ? "is-active" : ""} onClick={() => setTab("ALL")}>Todas</button>
        </div>
        <button className="btn btn--primary" onClick={() => setCreating(true)}><Plus size={16} /> Nova atividade</button>
      </div>

      <div className="tasks-filters">
        <label className="search"><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar atividade ou disciplina..." /></label>
        <select className="input" value={type} onChange={(e) => setType(e.target.value as ActivityType | "ALL")}>
          <option value="ALL">Todos os tipos</option><option value="TASK">Tarefa</option><option value="EXAM">Prova</option><option value="ASSIGNMENT">Trabalho</option>
        </select>
        <select className="input" value={disciplineId} onChange={(e) => setDisciplineId(e.target.value)}>
          <option value="ALL">Todas as disciplinas</option>
          {(disciplines.data ?? []).map((d: DisciplineSummary) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      {activities.loading ? <StateMessage kind="loading" message="Carregando atividades..." /> :
        activities.error ? <StateMessage kind="error" message={activities.error} onRetry={reload} /> :
        groups.length === 0 ? <StateMessage kind="empty" message="Nenhuma atividade encontrada para esses filtros." /> :
        groups.map(([date, items]) => (
          <section className="tasks-group" key={date}>
            <h2>{date}</h2>
            <ul className="tasks-list">
              {items.map((item) => (
                <li className={`tasks-item ${item.status === "COMPLETED" ? "is-done" : ""}`} key={item.id}>
                  <button className={`check ${item.status === "COMPLETED" ? "is-checked" : ""}`} aria-label="Alterar conclusão" onClick={() => void toggleStatus(item)}>
                    {item.status === "COMPLETED" ? <Check size={13} /> : <Circle size={13} />}
                  </button>
                  <div className="tasks-item__main">
                    <strong>{item.title}</strong>
                    <span><TypeLabel type={item.type} /> <span className="muted">· {item.discipline.name}</span></span>
                    {item.description && <small>{item.description}</small>}
                  </div>
                  <DueBadge dueDate={item.dueDate} />
                  <div className="tasks-item__actions">
                    <button className="icon-btn" title="Editar" onClick={() => setEditing(item)}><Pencil size={16} /></button>
                    <button className="icon-btn" title="Excluir" onClick={() => setDeleting(item)}><Trash2 size={16} /></button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))
      }

      {creating && <ActivityModal disciplines={disciplines.data ?? []} onClose={() => setCreating(false)} onSaved={reload} />}
      {editing && <ActivityModal activity={editing} disciplines={disciplines.data ?? []} onClose={() => setEditing(undefined)} onSaved={reload} />}
      {deleting && <ConfirmDialog title="Excluir atividade?" message={`Deseja excluir "${deleting.title}"?`} onCancel={() => setDeleting(null)} onConfirm={removeActivity} />}
    </>
  );
}
