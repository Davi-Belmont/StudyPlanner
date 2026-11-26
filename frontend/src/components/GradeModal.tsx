import { useState, type FormEvent } from "react";
import { gradeService } from "../services/gradeService";
import { getErrorMessage } from "../services/http";
import type { DisciplineOption, Grade } from "../types/api";
import { dateInputToIso, formatGrade, toDateInput } from "../utils/format";
import Modal from "./Modal";

interface GradeModalProps {
  grade?: Grade; // se informado, modo edição
  disciplines: DisciplineOption[];
  fixedDisciplineId?: string; // esconde o seletor de disciplina
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}

export default function GradeModal({
  grade,
  disciplines,
  fixedDisciplineId,
  onClose,
  onSaved
}: GradeModalProps) {
  const [disciplineId, setDisciplineId] = useState(
    grade?.disciplineId ?? fixedDisciplineId ?? disciplines[0]?.id ?? ""
  );
  const [value, setValue] = useState(grade ? formatGrade(grade.value) : "");
  const [description, setDescription] = useState(grade?.description ?? "");
  const [date, setDate] = useState(toDateInput(grade ? new Date(grade.date) : new Date()));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    // Aceita vírgula ou ponto como separador decimal
    const numeric = Number(value.trim().replace(",", "."));

    if (!value.trim() || !Number.isFinite(numeric) || numeric < 0 || numeric > 10) {
      return setError("A nota deve estar entre 0 e 10.");
    }

    if (!disciplineId) return setError("Selecione uma disciplina.");
    if (!date) return setError("Informe a data da avaliação.");

    setSaving(true);
    setError(null);

    const text = description.trim();
    const payload = { value: numeric, date: dateInputToIso(date), disciplineId };

    try {
      if (grade) {
        await gradeService.update(grade.id, { ...payload, description: text || null });
      } else {
        await gradeService.create({ ...payload, description: text || undefined });
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
      title={grade ? "Editar nota" : "Lançar nota"}
      subtitle="A média da disciplina é recalculada automaticamente."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
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

        <div className="field-row field-row--grade">
          <label className="field">
            <span className="field__label">Nota (0 a 10)</span>
            <input
              className="input"
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="8,5"
              autoFocus
            />
          </label>
          <label className="field">
            <span className="field__label">Descrição</span>
            <input
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex.: Prova 2"
            />
          </label>
        </div>

        <label className="field">
          <span className="field__label">Data da avaliação</span>
          <input
            type="date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="modal__actions">
          <button type="button" className="btn" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--primary" disabled={saving || !disciplineId}>
            {saving ? "Salvando..." : grade ? "Salvar alterações" : "Lançar nota"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
