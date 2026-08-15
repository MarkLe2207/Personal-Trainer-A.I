"use client";

import { useEffect, useState } from "react";
import { api, HealthCheck } from "../lib/api";

export default function HealthBadge() {
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [health, setHealth] = useState<HealthCheck | null>(null);

  useEffect(() => {
    let active = true;
    api
      .health()
      .then((h) => {
        if (!active) return;
        setHealth(h);
        setState("ok");
      })
      .catch(() => {
        if (!active) return;
        setHealth(null);
        setState("error");
      });
    return () => {
      active = false;
    };
  }, []);

  const label =
    state === "loading"
      ? "Checking backend…"
      : state === "ok"
        ? `${health?.service} v${health?.version}`
        : "Backend offline";

  return (
    <div className={`health ${state}`} title="Backend health check">
      <span className="dot" />
      <span>{label}</span>
    </div>
  );
}
