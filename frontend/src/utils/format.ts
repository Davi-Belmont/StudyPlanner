import type { ActivityType, Grade } from "../types/api";

export const activityTypeLabel: Record<ActivityType, string> = {
  TASK: "Tarefa",
  EXAM: "Prova",
  ASSIGNMENT: "Trabalho"
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Diferença em dias de calendário (0 = hoje, 1 = amanhã, negativo = passado)
function calendarDiff(target: Date, now: Date) {
  return Math.round((startOfDay(target).getTime() - startOfDay(now).getTime()) / MS_PER_DAY);
}

const pad = (n: number) => String(n).padStart(2, "0");

export function formatTime(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatShortDate(date: Date) {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;
}

export function formatFullDate(iso: string) {
  const date = new Date(iso);
  return `${formatShortDate(date)}/${date.getFullYear()}`;
}

// "Quarta-feira, 25 de novembro"
export function formatToday(now = new Date()) {
  const text = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(now);

  return text.charAt(0).toUpperCase() + text.slice(1);
}

export type Urgency = "urgent" | "warning" | "ok";

export function getUrgency(dueDate: string, now = new Date()): Urgency {
  const due = new Date(dueDate);
  const diff = calendarDiff(due, now);

  if (due.getTime() < now.getTime() || diff <= 1) return "urgent";
  if (diff <= 7) return "warning";
  return "ok";
}

// "Atrasada" | "Hoje, 23:59" | "Amanhã, 08:00" | "30/11 · 19:00"
export function formatDue(dueDate: string, now = new Date()) {
  const due = new Date(dueDate);

  if (due.getTime() < now.getTime()) return "Atrasada";

  const diff = calendarDiff(due, now);
  const time = formatTime(due);

  if (diff === 0) return `Hoje, ${time}`;
  if (diff === 1) return `Amanhã, ${time}`;
  return `${formatShortDate(due)} · ${time}`;
}

// Valores para <input type="date"> / <input type="time"> (horário local)
export function toDateInput(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function toTimeInput(date: Date) {
  return formatTime(date);
}

export function inputsToIso(date: string, time: string) {
  return new Date(`${date}T${time}`).toISOString();
}

// Notas só têm data; usa meio-dia para não "voltar" um dia por causa do fuso
export function dateInputToIso(date: string) {
  return new Date(`${date}T12:00:00`).toISOString();
}

export function formatGrade(value: number | null) {
  return value === null ? "—" : value.toFixed(1).replace(".", ",");
}

export type GradeTone = "good" | "warn" | "bad" | "none";

export function gradeTone(value: number | null): GradeTone {
  if (value === null) return "none";
  if (value >= 7) return "good";
  if (value >= 5) return "warn";
  return "bad";
}

// Mesma regra da API: média aritmética simples
export function averageOf(grades: Grade[]): number | null {
  if (grades.length === 0) return null;
  return grades.reduce((sum, grade) => sum + grade.value, 0) / grades.length;
}

export function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

export function initials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0].charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
  return (first + last).toUpperCase();
}
