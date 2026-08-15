"use client";

import { useState } from "react";
import HealthBadge from "../components/HealthBadge";
import SchedulerPanel from "../components/SchedulerPanel";
import CoachPanel from "../components/CoachPanel";
import RecipePanel from "../components/RecipePanel";
import ExercisePanel from "../components/ExercisePanel";
import ReceiptPanel from "../components/ReceiptPanel";

type TabKey =
  | "scheduler"
  | "coach"
  | "recipes"
  | "exercises"
  | "receipt";

const TABS: { key: TabKey; label: string }[] = [
  { key: "scheduler", label: "Scheduler" },
  { key: "coach", label: "AI Coach" },
  { key: "recipes", label: "Recipes" },
  { key: "exercises", label: "Exercises" },
  { key: "receipt", label: "Receipt Scanner" },
];

export default function Home() {
  const [active, setActive] = useState<TabKey>("scheduler");

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Guilt-Free Trainer &amp; Pantry Companion</h1>
          <p>
            Adaptive scheduling, an AI coach, recipe/exercise search, and
            receipt OCR — powered by the FastAPI backend.
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
      {active === "coach" && <CoachPanel />}
      {active === "recipes" && <RecipePanel />}
      {active === "exercises" && <ExercisePanel />}
      {active === "receipt" && <ReceiptPanel />}
    </div>
  );
}
