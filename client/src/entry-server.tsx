import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { renderToString } from "react-dom/server";
import superjson from "superjson";
import { Router } from "wouter";
import App from "./App";
import { trpc } from "./lib/trpc";

export function render(url: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const client = trpc.createClient({ links: [httpBatchLink({ url: "/api/trpc", transformer: superjson })] });
  const path = url.split("?")[0] || "/";
  const html = renderToString(<trpc.Provider client={client} queryClient={queryClient}><QueryClientProvider client={queryClient}><Router ssrPath={path}><App /></Router></QueryClientProvider></trpc.Provider>);
  return html;
}
