"use client";

import { useState } from "react";
import { AppProvider } from "../lib/app-context";
import HealthBadge from "../components/HealthBadge";
import SchedulerPanel from "../components/SchedulerPanel";
import ExercisePanel from "../components/ExercisePanel";
<<<<<<< HEAD
import StoragePanel from "../components/StoragePanel";
import NutritionPanel from "../components/NutritionPanel";

type TabKey = "scheduler" | "exercise" | "storage" | "nutrition";

const TABS: { key: TabKey; label: string }[] = [
  { key: "scheduler", label: "Scheduler" },
  { key: "exercise", label: "Exercise" },
  { key: "storage", label: "Storage" },
  { key: "nutrition", label: "AI Coach & Nutrition" },
=======
import ReceiptPanel from "../components/ReceiptPanel";
import StoragePanel from "../components/StoragePanel";
import { StorageProvider } from "../lib/StorageContext";

type TabKey =
  | "scheduler"
  | "coach"
  | "recipes"
  | "exercises"
  | "storage"
  | "receipt";

const TABS: { key: TabKey; label: string }[] = [
  { key: "scheduler", label: "Scheduler" },
  { key: "coach", label: "AI Coach" },
  { key: "recipes", label: "Recipes" },
  { key: "exercises", label: "Exercises" },
  { key: "storage", label: "Storage" },
  { key: "receipt", label: "Receipt Scanner" },
>>>>>>> upstream/main
];

function FlexiFitApp() {
  const [active, setActive] = useState<TabKey>("exercise");

  return (
<<<<<<< HEAD
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
=======
    <StorageProvider>
      <div className="app">
        <header className="app-header">
          <div>
            <h1>FlexiFit AI</h1>
            <p>
              Adaptive scheduling, an AI coach, recipe/exercise search, and
              receipt OCR — powered by the FastAPI backend.
            </p>
          </div>
          <HealthBadge />
        </header>
>>>>>>> upstream/main

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

<<<<<<< HEAD
      {active === "scheduler" && <SchedulerPanel />}
      {active === "exercise" && <ExercisePanel />}
      {active === "storage" && <StoragePanel />}
      {active === "nutrition" && <NutritionPanel />}
    </div>
=======
        {active === "scheduler" && <SchedulerPanel />}
        {active === "coach" && <CoachPanel />}
        {active === "recipes" && <RecipePanel />}
        {active === "exercises" && <ExercisePanel />}
        {active === "storage" && <StoragePanel />}
        {active === "receipt" && <ReceiptPanel />}
      </div>
    </StorageProvider>
>>>>>>> upstream/main
  );
}

export default function Home() {
  return (
    <AppProvider>
      <FlexiFitApp />
    </AppProvider>
  );
}
