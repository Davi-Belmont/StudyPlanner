// A API não guarda cor por disciplina. Para manter a identidade visual do protótipo,
// derivamos uma cor estável a partir do id (a mesma disciplina tem sempre a mesma cor).
const PALETTE = [
  "#6D45F0",
  "#10B981",
  "#F59E0B",
  "#EC4899",
  "#3B82F6",
  "#EF4444",
  "#14B8A6",
  "#8B5CF6"
];

export function disciplineColor(id: string) {
  let hash = 0;

  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }

  return PALETTE[hash % PALETTE.length];
}
