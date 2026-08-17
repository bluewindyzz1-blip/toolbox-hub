import { trpc } from "@/lib/trpc";
import { COOKIE_NAME, UNAUTHED_ERR_MSG } from "@shared/const";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { hydrateRoot } from "react-dom/client";
import superjson from "superjson";
import { Router } from "wouter";
import App from "./App";
import { startLogin } from "./const";
import "./index.css";

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } });
const redirectToLoginIfUnauthorized = (error: unknown) => { if (error instanceof TRPCClientError && error.message === UNAUTHED_ERR_MSG) startLogin(); };
queryClient.getQueryCache().subscribe((event) => { if (event.type === "updated" && event.action.type === "error") redirectToLoginIfUnauthorized(event.query.state.error); });
queryClient.getMutationCache().subscribe((event) => { if (event.type === "updated" && event.action.type === "error") redirectToLoginIfUnauthorized(event.mutation.state.error); });
const trpcClient = trpc.createClient({ links: [httpBatchLink({ url: "/api/trpc", transformer: superjson, headers() { try { const raw = sessionStorage.getItem("manus-cookie"); const pair = raw?.split(";").find((item) => item.trim().startsWith(`${COOKIE_NAME}=`)); const token = pair?.trim().slice(`${COOKIE_NAME}=`.length); return token ? { Authorization: `Bearer ${token}` } : {}; } catch { return {}; } }, fetch(input, init) { return globalThis.fetch(input, { ...(init ?? {}), credentials: "include" }); } })] });
hydrateRoot(document.getElementById("root")!, <trpc.Provider client={trpcClient} queryClient={queryClient}><QueryClientProvider client={queryClient}><Router><App /></Router></QueryClientProvider></trpc.Provider>);
