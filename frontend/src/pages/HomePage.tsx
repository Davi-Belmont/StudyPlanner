import { Book, Calendar, ListChecks, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import ActivityModal from "../components/ActivityModal";
import DueBadge from "../components/DueBadge";
import StateMessage from "../components/StateMessage";
import TypeLabel from "../components/TypeLabel";
import { useAuth } from "../context/AuthContext";
import { useLoad } from "../hooks/useLoad";
import { activityService } from "../services/activityService";
import { dashboardService } from "../services/dashboardService";
import { disciplineColor } from "../utils/colors";
import { firstName, formatGrade, formatToday, getUrgency, gradeTone } from "../utils/format";

export default function HomePage() {
  const { user } = useAuth();
  const [creating, setCreating] = useState(false);

  const { data, error, loading, reload } = useLoad(async () => {
    // /dashboard devolve contagem e próximas (incluindo atrasadas); o semáforo usa todas as pendentes de /activities
    const [dashboard, pending] = await Promise.all([
      dashboardService.get(),
      activityService.list({ status: "PENDING" })
    ]);

    return { dashboard, pending };
  });

  const semaphore = { urgent: 0, warning: 0, ok: 0 };
  data?.pending.forEach((activity) => {
    semaphore[getUrgency(activity.dueDate)] += 1;
  });

  const disciplineOptions =
    data?.dashboard.averages.map((item) => ({ id: item.disciplineId, name: item.disciplineName })) ??
    [];

  return (
    <>
      <header className="page-header">
        <h1>{user ? `Olá, ${firstName(user.nome)}` : "Olá!"}</h1>
        <p>{formatToday()}</p>
      </header>

      {loading && <StateMessage kind="loading" />}
      {error && !data && <StateMessage kind="error" message={error} onRetry={reload} />}

      {data && (
        <div className="home-grid">
          <div className="home-main">
            <div className="quick-actions">
              <button type="button" className="btn" onClick={() => setCreating(true)}>
                <Plus size={16} />
                Nova atividade
              </button>
              <Link to="/calendario" className="btn">
                <Calendar size={16} />
                Calendário
              </Link>
              <Link to="/disciplinas" className="btn">
                <Book size={16} />
                Disciplinas
              </Link>
              <Link to="/perfil" className="btn">
                <ListChecks size={16} />
                Notas
              </Link>
            </div>

            <section className="card">
              <div className="card__header">
                <h2>Próximas atividades</h2>
                <Link to="/tarefas" className="link">
                  Ver todas
                </Link>
              </div>

              {data.dashboard.upcomingActivities.length === 0 ? (
                <StateMessage kind="empty" message="Nenhuma atividade pendente. Bom trabalho!" />
              ) : (
                <ul className="list">
                  {data.dashboard.upcomingActivities.map((activity) => (
                    <li key={activity.id} className="activity-row">
                      <div className="activity-row__type">
                        <TypeLabel type={activity.type} />
                      </div>
                      <div className="activity-row__text">
                        <strong>{activity.title}</strong>
                        {activity.description && <span>{activity.description}</span>}
                      </div>
                      <Link
                        to={`/disciplinas/${activity.disciplineId}`}
                        className="discipline-tag"
                      >
                        <i style={{ background: disciplineColor(activity.disciplineId) }} />
                        {activity.discipline.name}
                      </Link>
                      <DueBadge dueDate={activity.dueDate} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <div className="home-side">
            <div className="stat-row">
              <div className="card stat">
                <span>Disciplinas</span>
                <strong>{data.dashboard.disciplineCount}</strong>
              </div>
              <div className="card stat">
                <span>Pendentes</span>
                <strong>{data.dashboard.pendingActivities}</strong>
              </div>
            </div>

            <section className="card">
              <h2>Semáforo da semana</h2>
              <p className="muted">
                {semaphore.urgent === 0
                  ? "Nenhuma entrega urgente."
                  : `Você tem ${semaphore.urgent} ${
                      semaphore.urgent === 1 ? "entrega urgente" : "entregas urgentes"
                    }.`}
              </p>
              <div className="semaphore">
                <div className="semaphore__item semaphore__item--red">
                  <strong>{semaphore.urgent}</strong>
                  <span>Urgentes</span>
                </div>
                <div className="semaphore__item semaphore__item--amber">
                  <strong>{semaphore.warning}</strong>
                  <span>Atenção</span>
                </div>
                <div className="semaphore__item semaphore__item--green">
                  <strong>{semaphore.ok}</strong>
                  <span>No prazo</span>
                </div>
              </div>
            </section>

            <section className="card">
              <h2>Médias por disciplina</h2>
              {data.dashboard.averages.length === 0 ? (
                <StateMessage kind="empty" message="Nenhuma disciplina cadastrada." />
              ) : (
                <ul className="averages">
                  {data.dashboard.averages.map((item) => (
                    <li key={item.disciplineId}>
                      <div className="averages__top">
                        <Link to={`/disciplinas/${item.disciplineId}`} className="discipline-tag">
                          <i style={{ background: disciplineColor(item.disciplineId) }} />
                          {item.disciplineName}
                        </Link>
                        <strong className={`tone tone--${gradeTone(item.average)}`}>
                          {formatGrade(item.average)}
                        </strong>
                      </div>
                      <div className="bar">
                        <div
                          className="bar__fill"
                          style={{
                            width: `${((item.average ?? 0) / 10) * 100}%`,
                            background: disciplineColor(item.disciplineId)
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      )}

      {creating && data && (
        <ActivityModal
          disciplines={disciplineOptions}
          onClose={() => setCreating(false)}
          onSaved={reload}
        />
      )}
    </>
  );
}
