"use client";

import { useState } from "react";
import { AppProvider } from "../lib/app-context";
import HealthBadge from "../components/HealthBadge";
import SchedulerPanel from "../components/SchedulerPanel";
import ExercisePanel from "../components/ExercisePanel";
import StoragePanel from "../components/StoragePanel";
import NutritionPanel from "../components/NutritionPanel";

type TabKey = "scheduler" | "exercise" | "storage" | "nutrition";

const TABS: { key: TabKey; label: string }[] = [
  { key: "scheduler", label: "Scheduler" },
  { key: "exercise", label: "Exercise" },
  { key: "storage", label: "Storage" },
  { key: "nutrition", label: "AI Coach & Nutrition" },
];

function FlexiFitApp() {
  const [active, setActive] = useState<TabKey>("exercise");

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>FlexiFit AI</h1>
          <p>
            Adaptive workout tables, pantry storage, and AI recipes &amp;
            nutrition advice — built on your ingredients.
          </p>
        </div>
        <HealthBadge />
      </header>

      <nav className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn ${active === tab.key ? "active" : ""}`}
            onClick={() => setActive(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {active === "scheduler" && <SchedulerPanel />}
      {active === "exercise" && <ExercisePanel />}
      {active === "storage" && <StoragePanel />}
      {active === "nutrition" && <NutritionPanel />}
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <FlexiFitApp />
    </AppProvider>
  );
}
