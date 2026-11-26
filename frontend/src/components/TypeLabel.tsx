import { CircleCheck, CircleHelp, FileText } from "lucide-react";
import type { ActivityType } from "../types/api";
import { activityTypeLabel } from "../utils/format";

const icons = {
  TASK: CircleCheck,
  EXAM: CircleHelp,
  ASSIGNMENT: FileText
};

export function TypeIcon({ type, size = 16 }: { type: ActivityType; size?: number }) {
  const Icon = icons[type];
  return <Icon size={size} />;
}

export default function TypeLabel({ type }: { type: ActivityType }) {
  return (
    <span className={`type-label type-label--${type.toLowerCase()}`}>
      <TypeIcon type={type} />
      {activityTypeLabel[type]}
    </span>
  );
}
