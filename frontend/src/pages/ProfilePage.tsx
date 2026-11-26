import { useMemo, useState } from "react";
import { Award, BookOpen, ClipboardList, Plus, Pencil, Trash2, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLoad } from "../hooks/useLoad";
import { activityService } from "../services/activityService";
import { disciplineService } from "../services/disciplineService";
import { gradeService } from "../services/gradeService";
import GradeModal from "../components/GradeModal";
import ConfirmDialog from "../components/ConfirmDialog";
import StateMessage from "../components/StateMessage";
import type { ActivityWithDiscipline, DisciplineSummary, Grade } from "../types/api";
import { averageOf, firstName, formatFullDate, formatGrade, gradeTone, initials } from "../utils/format";

type GradeWithDiscipline = Grade & { discipline?: { id: string; name: string } };

export default function ProfilePage() {
  const { user } = useAuth();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<GradeWithDiscipline | undefined>();
  const [deleting, setDeleting] = useState<GradeWithDiscipline | null>(null);
  const disciplines = useLoad(() => disciplineService.list(), "profile-disciplines");
  const grades = useLoad(() => gradeService.list(), "profile-grades");
  const activities = useLoad(() => activityService.list(), "profile-activities");

  async function reloadGrades() { await grades.reload(); }
  const allGrades = grades.data ?? [];
  const overallAverage = averageOf(allGrades);
  const averages = useMemo(() => (disciplines.data ?? []).map((discipline) => {
    const values = allGrades.filter((grade) => grade.disciplineId === discipline.id);
    return { ...discipline, average: averageOf(values) };
  }), [disciplines.data, allGrades]);
  const pending = (activities.data ?? []).filter((item: ActivityWithDiscipline) => item.status === "PENDING").length;

  async function removeGrade() {
    if (!deleting) return;
    await gradeService.remove(deleting.id);
    setDeleting(null);
    await reloadGrades();
  }

  const busy = disciplines.loading || grades.loading || activities.loading;
  const error = disciplines.error || grades.error || activities.error;

  return (
    <>
      <header className="page-header">
        <h1>Perfil e notas</h1>
        <p>Acompanhe seu desempenho acadêmico em um só lugar.</p>
      </header>

      <section className="profile-hero card">
        <span className="profile-avatar">{initials(user?.nome ?? "Estudante")}</span>
        <div><h2>{user?.nome ?? "Estudante"}</h2><p>{user?.email ?? "Seu perfil acadêmico"}</p></div>
        <UserRound className="profile-hero__icon" size={34} />
      </section>

      {busy ? <StateMessage kind="loading" message="Carregando seu desempenho..." /> :
        error ? <StateMessage kind="error" message={error} onRetry={() => { void disciplines.reload(); void grades.reload(); void activities.reload(); }} /> :
        <>
          <section className="profile-stats">
            <article className="card profile-stat"><Award /><span>Média geral</span><strong>{formatGrade(overallAverage)}</strong></article>
            <article className="card profile-stat"><BookOpen /><span>Disciplinas</span><strong>{disciplines.data?.length ?? 0}</strong></article>
            <article className="card profile-stat"><ClipboardList /><span>Notas lançadas</span><strong>{allGrades.length}</strong></article>
            <article className="card profile-stat"><ClipboardList /><span>Atividades pendentes</span><strong>{pending}</strong></article>
          </section>

          <div className="profile-section-heading">
            <div><h2>Boletim por disciplina</h2><p className="muted">Médias calculadas a partir das notas cadastradas.</p></div>
            <button className="btn btn--primary" onClick={() => setCreating(true)}><Plus size={16} /> Lançar nota</button>
          </div>

          {averages.length === 0 ? <StateMessage kind="empty" message="Você ainda não cadastrou disciplinas." /> :
            <section className="profile-disciplines">
              {averages.map((discipline) => {
                const items = allGrades.filter((grade) => grade.disciplineId === discipline.id);
                return <article className="card profile-discipline" key={discipline.id}>
                  <div className="profile-discipline__top"><div><h3>{discipline.name}</h3><span className="muted">{items.length} {items.length === 1 ? "nota lançada" : "notas lançadas"}</span></div><strong className={`profile-average tone--${gradeTone(discipline.average)}`}>{formatGrade(discipline.average)}</strong></div>
                  <div className="profile-grade-list">
                    {items.length === 0 ? <p className="muted">Nenhuma nota cadastrada.</p> : items.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((grade) => (
                      <div className="profile-grade-row" key={grade.id}>
                        <div><strong>{grade.description || "Avaliação"}</strong><span>{formatFullDate(grade.date)}</span></div>
                        <strong className={`tone--${gradeTone(grade.value)}`}>{formatGrade(grade.value)}</strong>
                        <button className="icon-btn" title="Editar nota" onClick={() => setEditing(grade)}><Pencil size={15} /></button>
                        <button className="icon-btn" title="Excluir nota" onClick={() => setDeleting(grade)}><Trash2 size={15} /></button>
                      </div>
                    ))}
                  </div>
                </article>;
              })}
            </section>
          }
        </>
      }

      {creating && <GradeModal disciplines={disciplines.data ?? []} onClose={() => setCreating(false)} onSaved={reloadGrades} />}
      {editing && <GradeModal grade={editing} disciplines={disciplines.data ?? []} onClose={() => setEditing(undefined)} onSaved={reloadGrades} />}
      {deleting && <ConfirmDialog title="Excluir nota?" message="Deseja realmente excluir esta nota?" onCancel={() => setDeleting(null)} onConfirm={removeGrade} />}
    </>
  );
}
