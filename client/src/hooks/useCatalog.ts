import { defaultCatalog } from "@shared/catalog";
import { trpc } from "@/lib/trpc";

/** Ensures the public interface remains usable while the editable server catalog refreshes. */
export function useCatalog() {
  return trpc.catalog.snapshot.useQuery(undefined, { initialData: defaultCatalog, staleTime: 30_000 });
}
