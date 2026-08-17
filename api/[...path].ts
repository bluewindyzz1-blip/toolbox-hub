import { createApp } from "../server/_core/app";

// Vercel imports this default export as a serverless Express handler.
// Requests under /api/* retain their paths, including /api/trpc and OAuth callbacks.
export default createApp();
