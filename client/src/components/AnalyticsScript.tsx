import { useEffect } from "react";

function safeAnalyticsUrl(value?: string) {
  if (!value) return "";
  try { const url = new URL(value); return url.protocol === "https:" ? url.toString().replace(/\/$/, "") : ""; } catch { return ""; }
}

export default function AnalyticsScript() {
  const endpoint = safeAnalyticsUrl(import.meta.env.VITE_ANALYTICS_ENDPOINT);
  const websiteId = import.meta.env.VITE_ANALYTICS_WEBSITE_ID?.trim();
  useEffect(() => {
    if (!endpoint || !websiteId) return;
    const scriptId = "toolbox-analytics-script";
    if (document.getElementById(scriptId)) return;
    const script = document.createElement("script"); script.id = scriptId; script.defer = true; script.src = `${endpoint}/umami`; script.dataset.websiteId = websiteId; document.head.appendChild(script);
  }, [endpoint, websiteId]);
  return null;
}
