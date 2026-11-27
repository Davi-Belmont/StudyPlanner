import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Circle, Pencil, Plus, Trash2 } from "lucide-react";
import ActivityModal from "../components/ActivityModal";
import ConfirmDialog from "../components/ConfirmDialog";
import DueBadge from "../components/DueBadge";
import StateMessage from "../components/StateMessage";
import TypeLabel from "../components/TypeLabel";
import { useLoad } from "../hooks/useLoad";
import { activityService } from "../services/activityService";
import { disciplineService } from "../services/disciplineService";
import { getErrorMessage } from "../services/http";
import type { Activity, ActivityStatus, ActivityWithDiscipline } from "../types/api";
import { disciplineColor } from "../utils/colors";
import { toDateInput } from "../utils/format";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MAX_CHIPS = 3;

const monthFormat = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });
const dayFormat = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long"
});

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// "2026-11-27" -> Date local (sem deslocamento de fuso)
function parseKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// 6 semanas (42 dias) começando no domingo da semana do dia 1, para a altura não variar
function buildGrid(month: Date): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const startDay = 1 - first.getDay();

  return Array.from(
    { length: 42 },
    (_, index) => new Date(first.getFullYear(), first.getMonth(), startDay + index)
  );
}

export default function CalendarPage() {
  const today = new Date();
  const todayKey = toDateInput(today);

  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(todayKey);
  const [disciplineId, setDisciplineId] = useState("ALL");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Activity | undefined>();
  const [deleting, setDeleting] = useState<ActivityWithDiscipline | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const activities = useLoad(() => activityService.list(), "calendar-activities");
  const disciplines = useLoad(() => disciplineService.list(), "calendar-disciplines");

  async function reload() {
    await activities.reload();
  }

  // Atividades agrupadas por dia (chave AAAA-MM-DD no horário local)
  const byDay = useMemo(() => {
    const map = new Map<string, ActivityWithDiscipline[]>();

    (activities.data ?? [])
      .filter((item) => disciplineId === "ALL" || item.disciplineId === disciplineId)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .forEach((item) => {
        const key = toDateInput(new Date(item.dueDate));
        map.set(key, [...(map.get(key) ?? []), item]);
      });

    return map;
  }, [activities.data, disciplineId]);

  const grid = useMemo(() => buildGrid(month), [month]);
  const selectedItems = byDay.get(selected) ?? [];

  function goToMonth(offset: number) {
    setMonth(new Date(month.getFullYear(), month.getMonth() + offset, 1));
  }

  function goToToday() {
    setMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelected(todayKey);
  }

  function selectDay(day: Date) {
    setSelected(toDateInput(day));

    // Clicar num dia de outro mês leva o calendário para esse mês
    if (day.getMonth() !== month.getMonth()) {
      setMonth(new Date(day.getFullYear(), day.getMonth(), 1));
    }
  }

  async function toggleStatus(activity: ActivityWithDiscipline) {
    const status: ActivityStatus = activity.status === "COMPLETED" ? "PENDING" : "COMPLETED";

    setActionError(null);

    try {
      await activityService.update(activity.id, { status });
      await reload();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
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
        <h1>Calendário</h1>
        <p>Veja os prazos de tarefas, provas e trabalhos mês a mês.</p>
      </header>

      <div className="cal-toolbar">
        <div className="cal-nav">
          <button className="icon-btn" title="Mês anterior" onClick={() => goToMonth(-1)}>
            <ChevronLeft size={18} />
          </button>
          <h2>{capitalize(monthFormat.format(month))}</h2>
          <button className="icon-btn" title="Próximo mês" onClick={() => goToMonth(1)}>
            <ChevronRight size={18} />
          </button>
          <button className="btn" onClick={goToToday}>
            Hoje
          </button>
        </div>

        <div className="cal-toolbar__right">
          <select
            className="input"
            value={disciplineId}
            onChange={(e) => setDisciplineId(e.target.value)}
          >
            <option value="ALL">Todas as disciplinas</option>
            {(disciplines.data ?? []).map((discipline) => (
              <option key={discipline.id} value={discipline.id}>
                {discipline.name}
              </option>
            ))}
          </select>
          <button className="btn btn--primary" onClick={() => setCreating(true)}>
            <Plus size={16} /> Nova atividade
          </button>
        </div>
      </div>

      {activities.loading ? (
        <StateMessage kind="loading" message="Carregando calendário..." />
      ) : activities.error ? (
        <StateMessage kind="error" message={activities.error} onRetry={reload} />
      ) : (
        <div className="cal-layout">
          <section className="card cal-grid-wrap">
            <div className="cal-weekdays">
              {WEEKDAYS.map((weekday) => (
                <span key={weekday}>{weekday}</span>
              ))}
            </div>

            <div className="cal-grid">
              {grid.map((day) => {
                const key = toDateInput(day);
                const items = byDay.get(key) ?? [];
                const className = [
                  "cal-cell",
                  day.getMonth() !== month.getMonth() && "is-outside",
                  key === todayKey && "is-today",
                  key === selected && "is-selected"
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <button
                    type="button"
                    key={key}
                    className={className}
                    onClick={() => selectDay(day)}
                    aria-label={`${capitalize(dayFormat.format(day))}: ${items.length} atividade(s)`}
                  >
                    <span className="cal-cell__number">{day.getDate()}</span>

                    <span className="cal-cell__events">
                      {items.slice(0, MAX_CHIPS).map((item) => (
                        <span
                          key={item.id}
                          className={`cal-chip ${item.status === "COMPLETED" ? "is-done" : ""}`}
                          style={{ borderLeftColor: disciplineColor(item.disciplineId) }}
                          title={`${item.title} · ${item.discipline.name}`}
                        >
                          {item.title}
                        </span>
                      ))}
                      {items.length > MAX_CHIPS && (
                        <span className="cal-more">+{items.length - MAX_CHIPS} mais</span>
                      )}
                    </span>

                    {/* Só aparece no celular, no lugar dos títulos */}
                    <span className="cal-dots">
                      {items.slice(0, 4).map((item) => (
                        <i key={item.id} style={{ background: disciplineColor(item.disciplineId) }} />
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <aside className="card cal-panel">
            <div className="cal-panel__header">
              <div>
                <h2>{capitalize(dayFormat.format(parseKey(selected)))}</h2>
                <p className="muted">
                  {selectedItems.length === 0
                    ? "Nenhuma atividade neste dia."
                    : `${selectedItems.length} ${
                        selectedItems.length === 1 ? "atividade" : "atividades"
                      }`}
                </p>
              </div>
              <button
                className="icon-btn"
                title="Nova atividade neste dia"
                onClick={() => setCreating(true)}
              >
                <Plus size={18} />
              </button>
            </div>

            {actionError && <p className="form-error">{actionError}</p>}

            {selectedItems.length > 0 && (
              <ul className="tasks-list">
                {selectedItems.map((item) => (
                  <li
                    className={`tasks-item ${item.status === "COMPLETED" ? "is-done" : ""}`}
                    key={item.id}
                  >
                    <button
                      className={`check ${item.status === "COMPLETED" ? "is-checked" : ""}`}
                      aria-label="Alterar conclusão"
                      onClick={() => void toggleStatus(item)}
                    >
                      {item.status === "COMPLETED" ? <Check size={13} /> : <Circle size={13} />}
                    </button>

                    <div className="tasks-item__main">
                      <strong>{item.title}</strong>
                      <span>
                        <TypeLabel type={item.type} />
                        <span className="muted">· {item.discipline.name}</span>
                      </span>
                      {item.description && <small>{item.description}</small>}
                    </div>

                    <DueBadge dueDate={item.dueDate} />

                    <div className="tasks-item__actions">
                      <button className="icon-btn" title="Editar" onClick={() => setEditing(item)}>
                        <Pencil size={16} />
                      </button>
                      <button className="icon-btn" title="Excluir" onClick={() => setDeleting(item)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      )}

      {creating && (
        <ActivityModal
          disciplines={disciplines.data ?? []}
          defaultDate={parseKey(selected)}
          onClose={() => setCreating(false)}
          onSaved={reload}
        />
      )}
      {editing && (
        <ActivityModal
          activity={editing}
          disciplines={disciplines.data ?? []}
          onClose={() => setEditing(undefined)}
          onSaved={reload}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title="Excluir atividade?"
          message={`Deseja excluir "${deleting.title}"?`}
          onCancel={() => setDeleting(null)}
          onConfirm={removeActivity}
        />
      )}
    </>
  );
}