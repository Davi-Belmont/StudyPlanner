import { useState, type FormEvent } from "react";
import { disciplineService } from "../services/disciplineService";
import { getErrorMessage } from "../services/http";
import type { Discipline } from "../types/api";
import Modal from "./Modal";

interface DisciplineModalProps {
  discipline?: Pick<Discipline, "id" | "name" | "description">; // modo edição
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}

export default function DisciplineModal({ discipline, onClose, onSaved }: DisciplineModalProps) {
  const [name, setName] = useState(discipline?.name ?? "");
  const [description, setDescription] = useState(discipline?.description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!name.trim()) return setError("O nome da disciplina é obrigatório.");

    setSaving(true);
    setError(null);

    const text = description.trim();

    try {
      if (discipline) {
        await disciplineService.update(discipline.id, {
          name: name.trim(),
          description: text || null
        });
      } else {
        await disciplineService.create({ name: name.trim(), description: text || undefined });
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
      title={discipline ? "Editar disciplina" : "Nova disciplina"}
      subtitle="Informe o nome e, se quiser, uma breve descrição."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <label className="field">
          <span className="field__label">Nome</span>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Banco de Dados"
            autoFocus
          />
        </label>

        <label className="field">
          <span className="field__label">Descrição (opcional)</span>
          <textarea
            className="input input--textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex.: Modelagem, SQL e normalização"
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="modal__actions">
          <button type="button" className="btn" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? "Salvando..." : discipline ? "Salvar alterações" : "Criar disciplina"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
