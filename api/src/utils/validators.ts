import { AppError } from "./AppError";

export function isValidDate(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "" && !isNaN(Date.parse(value));
}

// Texto obrigatório: precisa ser string não vazia
export function requiredText(value: unknown, message: string, max = 200): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new AppError(message);
  }

  const text = value.trim();

  if (text.length > max) {
    throw new AppError(`O texto deve ter no máximo ${max} caracteres.`);
  }

  return text;
}

// Texto opcional: undefined = não enviado, null/"" = limpar o campo
export function optionalText(
  value: unknown,
  label: string,
  max = 1000
): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;

  if (typeof value !== "string") {
    throw new AppError(`${label} deve ser um texto.`);
  }

  const text = value.trim();

  if (text.length > max) {
    throw new AppError(`${label} deve ter no máximo ${max} caracteres.`);
  }

  return text === "" ? null : text;
}
