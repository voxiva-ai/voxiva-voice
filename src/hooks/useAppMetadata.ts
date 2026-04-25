import { useEffect, useState } from "react";
import { getAppMetadata } from "@/lib/commands";
import type { AppMetadata } from "@/types/app";

export function useAppMetadata() {
  const [meta, setMeta] = useState<AppMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const m = await getAppMetadata();
        if (!cancelled) setMeta(m);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { meta, error };
}
