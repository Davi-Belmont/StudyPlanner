import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ActivityModal from "../components/ActivityModal";
import ConfirmDialog from "../components/ConfirmDialog";
import DisciplineModal from "../components/DisciplineModal";
import DueBadge from "../components/DueBadge";
import GradeModal from "../components/GradeModal";
import StateMessage from "../components/StateMessage";
import TypeLabel from "../components/TypeLabel";
import { useLoad } from "../hooks/useLoad";
import { activityService } from "../services/activityService";
import { disciplineService } from "../services/disciplineService";
import { gradeService } from "../services/gradeService";
import { getErrorMessage } from "../services/http";
import type { Activity, Grade } from "../types/api";
import { disciplineColor } from "../utils/colors";
import { averageOf, formatFullDate, formatGrade, gradeTone } from "../utils/format";

type ModalState =
  | { kind: "grade"; grade?: Grade }
  | { kind: "activity"; activity?: Activity }
  | { kind: "edit-discipline" }
  | { kind: "delete-discipline" }
  | { kind: "delete-grade"; grade: Grade }
  | { kind: "delete-activity"; activity: Activity }
  | null;

export default function DisciplineDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [modal, setModal] = useState<ModalState>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: discipline, error, loading, reload } = useLoad(
    () => disciplineService.get(id),
    id
  );

  const grades = useMemo(
    () =>
      [...(discipline?.grades ?? [])].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [discipline]
  );

  // Pendentes primeiro (por prazo), concluídas no fim
  const activities = useMemo(
    () =>
      [...(discipline?.activities ?? [])].sort((a, b) => {
        if (a.status !== b.status) return a.status === "PENDING" ? -1 : 1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }),
    [discipline]
  );

  const average = averageOf(grades);

  async function toggleActivity(activity: Activity) {
    setActionError(null);

    try {
      await activityService.update(activity.id, {
        status: activity.status === "COMPLETED" ? "PENDING" : "COMPLETED"
      });
      await reload();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }

  const closeModal = () => setModal(null);

  return (
    <>
      <header className="page-header">
        <h1>{discipline?.name ?? "Disciplina"}</h1>
        <p>Detalhes da disciplina</p>
        <nav className="breadcrumb">
          <Link to="/disciplinas">Disciplinas</Link>
          {discipline && (
            <>
              {" / "}
              <strong>{discipline.name}</strong>
            </>
          )}
        </nav>
      </header>

      {loading && <StateMessage kind="loading" />}
      {error && !discipline && <StateMessage kind="error" message={error} onRetry={reload} />}
      {actionError && <p className="form-error">{actionError}</p>}

      {discipline && (
        <>
          <section className="card detail-header">
            <i className="dot" style={{ background: disciplineColor(discipline.id) }} />
            <div className="detail-header__text">
              <h2>{discipline.name}</h2>
              <p>{discipline.description || "Sem descrição"}</p>
            </div>
            <div className="detail-header__average">
              <span>Média</span>
              <strong className={`tone tone--${gradeTone(average)}`}>{formatGrade(average)}</strong>
            </div>
            <button type="button" className="btn" onClick={() => setModal({ kind: "edit-discipline" })}>
              <Pencil size={14} />
              Editar
            </button>
            <button
              type="button"
              className="btn btn--danger-outline"
              onClick={() => setModal({ kind: "delete-discipline" })}
            >
              <Trash2 size={14} />
              Excluir
            </button>
          </section>

          <div className="detail-grid">
            <section className="card">
              <div className="card__header">
                <h2>Notas</h2>
                <button type="button" className="btn" onClick={() => setModal({ kind: "grade" })}>
                  <Plus size={16} />
                  Lançar nota
                </button>
              </div>

              {grades.length === 0 ? (
                <StateMessage kind="empty" message="Nenhuma nota lançada." />
              ) : (
                <ul className="list">
                  {grades.map((grade) => (
                    <li key={grade.id} className="grade-row">
                      <strong className={`grade-row__value tone tone--${gradeTone(grade.value)}`}>
                        {formatGrade(grade.value)}
                      </strong>
                      <div className="grade-row__text">
                        <strong>{grade.description || "Avaliação"}</strong>
                        <span>{formatFullDate(grade.date)}</span>
                      </div>
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label="Editar nota"
                        onClick={() => setModal({ kind: "grade", grade })}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label="Excluir nota"
                        onClick={() => setModal({ kind: "delete-grade", grade })}
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="card">
              <div className="card__header">
                <h2>Atividades</h2>
                <button type="button" className="btn" onClick={() => setModal({ kind: "activity" })}>
                  <Plus size={16} />
                  Nova atividade
                </button>
              </div>

              {activities.length === 0 ? (
                <StateMessage kind="empty" message="Nenhuma atividade cadastrada." />
              ) : (
                <ul className="list">
                  {activities.map((activity) => {
                    const done = activity.status === "COMPLETED";

                    return (
                      <li key={activity.id} className={`activity-row ${done ? "is-done" : ""}`}>
                        <button
                          type="button"
                          className={`check ${done ? "is-checked" : ""}`}
                          aria-label={done ? "Marcar como pendente" : "Marcar como concluída"}
                          onClick={() => toggleActivity(activity)}
                        >
                          {done && <Check size={14} />}
                        </button>
                        <div className="activity-row__type">
                          <TypeLabel type={activity.type} />
                        </div>
                        <div className="activity-row__text">
                          <strong>{activity.title}</strong>
                          {activity.description && <span>{activity.description}</span>}
                        </div>
                        {done ? (
                          <span className="badge badge--gray">Concluída</span>
                        ) : (
                          <DueBadge dueDate={activity.dueDate} />
                        )}
                        <button
                          type="button"
                          className="icon-btn"
                          aria-label="Editar atividade"
                          onClick={() => setModal({ kind: "activity", activity })}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn"
                          aria-label="Excluir atividade"
                          onClick={() => setModal({ kind: "delete-activity", activity })}
                        >
                          <Trash2 size={16} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>

          {modal?.kind === "grade" && (
            <GradeModal
              grade={modal.grade}
              disciplines={[{ id: discipline.id, name: discipline.name }]}
              fixedDisciplineId={discipline.id}
              onClose={closeModal}
              onSaved={reload}
            />
          )}

          {modal?.kind === "activity" && (
            <ActivityModal
              activity={modal.activity}
              disciplines={[{ id: discipline.id, name: discipline.name }]}
              fixedDisciplineId={discipline.id}
              onClose={closeModal}
              onSaved={reload}
            />
          )}

          {modal?.kind === "edit-discipline" && (
            <DisciplineModal discipline={discipline} onClose={closeModal} onSaved={reload} />
          )}

          {modal?.kind === "delete-discipline" && (
            <ConfirmDialog
              title="Excluir disciplina"
              message={`Excluir "${discipline.name}"? As atividades e notas dessa disciplina também serão excluídas.`}
              onCancel={closeModal}
              onConfirm={async () => {
                await disciplineService.remove(discipline.id);
                navigate("/disciplinas");
              }}
            />
          )}

          {modal?.kind === "delete-grade" && (
            <ConfirmDialog
              title="Excluir nota"
              message="Tem certeza que deseja excluir esta nota? A média será recalculada."
              onCancel={closeModal}
              onConfirm={async () => {
                await gradeService.remove(modal.grade.id);
                closeModal();
                await reload();
              }}
            />
          )}

          {modal?.kind === "delete-activity" && (
            <ConfirmDialog
              title="Excluir atividade"
              message={`Excluir "${modal.activity.title}"?`}
              onCancel={closeModal}
              onConfirm={async () => {
                await activityService.remove(modal.activity.id);
                closeModal();
                await reload();
              }}
            />
          )}
        </>
      )}
    </>
  );
}
