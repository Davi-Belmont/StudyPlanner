import { formatDue, getUrgency } from "../utils/format";

const toneClass = { urgent: "badge--red", warning: "badge--amber", ok: "badge--gray" } as const;

export default function DueBadge({ dueDate }: { dueDate: string }) {
  return <span className={`badge ${toneClass[getUrgency(dueDate)]}`}>{formatDue(dueDate)}</span>;
}
