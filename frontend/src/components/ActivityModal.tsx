import { useState, type FormEvent } from "react";
import { activityService } from "../services/activityService";
import { getErrorMessage } from "../services/http";
import type { Activity, ActivityType, DisciplineOption } from "../types/api";
import { activityTypeLabel, inputsToIso, toDateInput, toTimeInput } from "../utils/format";
import Modal from "./Modal";
import { TypeIcon } from "./TypeLabel";

interface ActivityModalProps {
  activity?: Activity; // se informado, modo edição
  disciplines: DisciplineOption[];
  fixedDisciplineId?: string; // esconde o seletor de disciplina
  defaultDate?: Date; // data inicial ao criar (ex.: dia clicado no calendário)
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}

const types: ActivityType[] = ["TASK", "EXAM", "ASSIGNMENT"];

export default function ActivityModal({
  activity,
  disciplines,
  fixedDisciplineId,
  defaultDate,
  onClose,
  onSaved
}: ActivityModalProps) {
  const due = activity ? new Date(activity.dueDate) : null;

  const [type, setType] = useState<ActivityType>(activity?.type ?? "TASK");
  const [title, setTitle] = useState(activity?.title ?? "");
  const [description, setDescription] = useState(activity?.description ?? "");
  const [disciplineId, setDisciplineId] = useState(
    activity?.disciplineId ?? fixedDisciplineId ?? disciplines[0]?.id ?? ""
  );
   const [date, setDate] = useState(due ? toDateInput(due) : toDateInput(defaultDate ?? new Date()));
  const [time, setTime] = useState(due ? toTimeInput(due) : "23:59");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!title.trim()) return setError("Informe o título da atividade.");
    if (!disciplineId) return setError("Selecione uma disciplina.");
    if (!date || !time) return setError("Informe a data e o horário do prazo.");

    setSaving(true);
    setError(null);

    const text = description.trim();
    const payload = {
      title: title.trim(),
      type,
      dueDate: inputsToIso(date, time),
      disciplineId
    };

    try {
      if (activity) {
        // Na edição, descrição vazia limpa o campo (null)
        await activityService.update(activity.id, { ...payload, description: text || null });
      } else {
        await activityService.create({ ...payload, description: text || undefined });
      }

      await onSaved();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  }

  return (
    <Modal
      title={activity ? "Editar atividade" : "Nova atividade"}
      subtitle="Cadastre uma tarefa, prova ou trabalho com prazo."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <div className="field">
          <span className="field__label">Tipo</span>
          <div className="type-picker">
            {types.map((option) => (
              <button
                key={option}
                type="button"
                className={`type-picker__option ${type === option ? "is-selected" : ""}`}
                onClick={() => setType(option)}
              >
                <TypeIcon type={option} />
                {activityTypeLabel[option]}
              </button>
            ))}
          </div>
        </div>

        <label className="field">
          <span className="field__label">Título</span>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex.: Prova de Redes"
            autoFocus
          />
        </label>

        <label className="field">
          <span className="field__label">Descrição (opcional)</span>
          <textarea
            className="input input--textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        {!fixedDisciplineId && (
          <label className="field">
            <span className="field__label">Disciplina</span>
            <select
              className="input"
              value={disciplineId}
              onChange={(e) => setDisciplineId(e.target.value)}
            >
              {disciplines.length === 0 && <option value="">Nenhuma disciplina cadastrada</option>}
              {disciplines.map((discipline) => (
                <option key={discipline.id} value={discipline.id}>
                  {discipline.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="field-row">
          <label className="field">
            <span className="field__label">Data do prazo</span>
            <input
              type="date"
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label className="field">
            <span className="field__label">Horário</span>
            <input
              type="time"
              className="input"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </label>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="modal__actions">
          <button type="button" className="btn" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--primary" disabled={saving || !disciplineId}>
            {saving ? "Salvando..." : activity ? "Salvar alterações" : "Criar atividade"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
