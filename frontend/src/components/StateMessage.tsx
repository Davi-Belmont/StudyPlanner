interface StateMessageProps {
  kind: "loading" | "error" | "empty";
  message?: string;
  onRetry?: () => void;
}

export default function StateMessage({ kind, message, onRetry }: StateMessageProps) {
  const text =
    message ?? (kind === "loading" ? "Carregando..." : kind === "error" ? "Algo deu errado." : "");

  return (
    <div className={`state state--${kind}`}>
      <p>{text}</p>
      {kind === "error" && onRetry && (
        <button type="button" className="btn" onClick={onRetry}>
          Tentar novamente
        </button>
      )}
    </div>
  );
}
