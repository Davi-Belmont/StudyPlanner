import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "../services/http";

interface LoadState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

// Carrega dados ao montar (ou quando `key` muda). `reload` refaz a busca sem piscar a tela.
export function useLoad<T>(loader: () => Promise<T>, key = "") {
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const sequence = useRef(0);
  const [state, setState] = useState<LoadState<T>>({
    data: null,
    error: null,
    loading: true
  });

  const run = useCallback(async () => {
    const current = ++sequence.current;

    try {
      const data = await loaderRef.current();
      if (current === sequence.current) setState({ data, error: null, loading: false });
    } catch (err) {
      if (current === sequence.current) {
        setState((prev) => ({ ...prev, error: getErrorMessage(err), loading: false }));
      }
    }
  }, []);

  useEffect(() => {
    setState({ data: null, error: null, loading: true });
    void run();
  }, [key, run]);

  return { ...state, reload: run };
}
