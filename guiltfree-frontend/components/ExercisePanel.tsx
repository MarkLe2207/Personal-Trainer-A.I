"use client";

import { useState } from "react";
import { api, ApiError, RecipeResult } from "../lib/api";
import { useStorage } from "../lib/StorageContext";

type Status = "planned" | "in_progress" | "completed";

interface WorkoutRow {
  id: string;
  day: string;
  routine: string;
  duration: string;
  status: Status;
}

interface RoutineDay {
  day: string;
  routine: string;
  duration: string;
}

const ROUTINES: Record<string, RoutineDay[]> = {
  chest: [
    { day: "Day 1", routine: "Bench Press", duration: "45 min" },
    { day: "Day 2", routine: "Incline Dumbbell Press", duration: "40 min" },
    { day: "Day 3", routine: "Push-Ups", duration: "30 min" },
    { day: "Day 4", routine: "Cable Fly", duration: "35 min" },
    { day: "Day 5", routine: "Chest Dips", duration: "30 min" },
  ],
  back: [
    { day: "Day 1", routine: "Deadlift", duration: "50 min" },
    { day: "Day 2", routine: "Pull-Ups", duration: "35 min" },
    { day: "Day 3", routine: "Barbell Row", duration: "40 min" },
    { day: "Day 4", routine: "Lat Pulldown", duration: "35 min" },
    { day: "Day 5", routine: "Seated Cable Row", duration: "35 min" },
  ],
  legs: [
    { day: "Day 1", routine: "Back Squat", duration: "50 min" },
    { day: "Day 2", routine: "Romanian Deadlift", duration: "45 min" },
    { day: "Day 3", routine: "Leg Press", duration: "40 min" },
    { day: "Day 4", routine: "Lunges", duration: "35 min" },
    { day: "Day 5", routine: "Calf Raises", duration: "25 min" },
  ],
  abs: [
    { day: "Day 1", routine: "Plank", duration: "20 min" },
    { day: "Day 2", routine: "Crunches", duration: "20 min" },
    { day: "Day 3", routine: "Leg Raises", duration: "20 min" },
    { day: "Day 4", routine: "Russian Twists", duration: "20 min" },
    { day: "Day 5", routine: "Mountain Climbers", duration: "25 min" },
  ],
  shoulders: [
    { day: "Day 1", routine: "Overhead Press", duration: "45 min" },
    { day: "Day 2", routine: "Lateral Raises", duration: "30 min" },
    { day: "Day 3", routine: "Front Raises", duration: "30 min" },
    { day: "Day 4", routine: "Rear Delt Fly", duration: "30 min" },
    { day: "Day 5", routine: "Arnold Press", duration: "40 min" },
  ],
  arms: [
    { day: "Day 1", routine: "Barbell Curl", duration: "35 min" },
    { day: "Day 2", routine: "Tricep Pushdown", duration: "30 min" },
    { day: "Day 3", routine: "Hammer Curl", duration: "30 min" },
    { day: "Day 4", routine: "Skull Crushers", duration: "30 min" },
    { day: "Day 5", routine: "Dips", duration: "30 min" },
  ],
  glutes: [
    { day: "Day 1", routine: "Hip Thrust", duration: "45 min" },
    { day: "Day 2", routine: "Glute Bridge", duration: "30 min" },
    { day: "Day 3", routine: "Kickbacks", duration: "30 min" },
    { day: "Day 4", routine: "Step-Ups", duration: "35 min" },
    { day: "Day 5", routine: "Sumo Squat", duration: "40 min" },
  ],
};

const FALLBACK_ROUTINE: RoutineDay[] = [
  { day: "Day 1", routine: "Full Body A", duration: "45 min" },
  { day: "Day 2", routine: "Full Body B", duration: "45 min" },
  { day: "Day 3", routine: "Cardio + Core", duration: "35 min" },
  { day: "Day 4", routine: "Full Body C", duration: "45 min" },
  { day: "Day 5", routine: "Active Recovery", duration: "30 min" },
];

const STATUS_LABEL: Record<Status, string> = {
  planned: "Planned",
  in_progress: "In Progress",
  completed: "Completed",
};

interface AdviceResult {
  row: WorkoutRow;
  recipe: RecipeResult;
  aiAdvice: string;
}

function canonicalMuscle(input: string): string {
  const map: Record<string, string> = {
    chest: "chest",
    pecs: "chest",
    back: "back",
    lats: "back",
    legs: "legs",
    leg: "legs",
    quads: "legs",
    abs: "abs",
    core: "abs",
    ab: "abs",
    shoulders: "shoulders",
    shoulder: "shoulders",
    delts: "shoulders",
    arms: "arms",
    arm: "arms",
    biceps: "arms",
    triceps: "arms",
    glutes: "glutes",
    glute: "glutes",
  };
  return map[input.toLowerCase().trim()] ?? "";
}

export default function ExercisePanel() {
  const { items: storageItems } = useStorage();
  const [muscle, setMuscle] = useState<string>("Chest");
  const [rows, setRows] = useState<WorkoutRow[]>([]);
  const [tableCreated, setTableCreated] = useState(false);
  const [tableTitle, setTableTitle] = useState<string>("");
  const [loadingRow, setLoadingRow] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [advice, setAdvice] = useState<AdviceResult | null>(null);

  function createTable() {
    const key = canonicalMuscle(muscle);
    const routine =
      (key && ROUTINES[key]) || FALLBACK_ROUTINE;
    const title =
      (key && ROUTINES[key] && muscle.trim()) ||
      "Full Body";
    setRows(
      routine.map((r, i) => ({
        id: `w${Date.now()}-${i}`,
        day: r.day,
        routine: r.routine,
        duration: r.duration,
        status: "planned" as Status,
      })),
    );
    setTableTitle(title);
    setTableCreated(true);
    setAdvice(null);
    setError(null);
  }

  function setStatus(id: string, status: Status) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  async function complete(row: WorkoutRow) {
    if (storageItems.length === 0) {
      setError(
        "Your Storage is empty. Add ingredients or scan a receipt/fridge photo before completing a workout so the AI can build a recipe from what you have.",
      );
      return;
    }
    setLoadingRow(row.id);
    setError(null);
    setAdvice(null);
    try {
      const [recipeRes, coachRes] = await Promise.all([
        api.searchRecipes({
          pantry_items: storageItems,
          top_k: 1,
          min_protein_g: null,
        }),
        api.coach({
          user_query: `I just finished a ${row.routine} workout targeting recovery. Give me a nutrition tip and next action.`,
          context: {
            pantry_items: storageItems,
            workout_goal: "recovery",
          },
        }),
      ]);
      const recipe = recipeRes.results[0];
      if (!recipe) {
        setError(
          "No recipe could be built from your current Storage ingredients. Add more items, then try again.",
        );
        return;
      }
      setStatus(row.id, "completed");
      setAdvice({ row: { ...row, status: "completed" }, recipe, aiAdvice: coachRes.response });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e));
    } finally {
      setLoadingRow(null);
    }
  }

  function handleStart(row: WorkoutRow) {
    setAdvice(null);
    setError(null);
    if (row.status === "planned") {
      setStatus(row.id, "in_progress");
    } else if (row.status === "in_progress") {
      complete(row);
    }
  }

  return (
    <div className="card">
      <h2>Exercise</h2>
      <p className="subtitle">
        Type the body part you want to train (e.g. Chest, Legs, Back, Abs,
        Shoulder) and press <strong>Create a table</strong> to build your
        workout schedule. Complete a session to get AI recovery advice built
        only from your Storage ingredients.
      </p>

      <div className="form-row">
        <div className="field" style={{ flexBasis: "100%" }}>
          <label htmlFor="ex-muscle">Target body part</label>
          <div className="inline-add">
            <input
              id="ex-muscle"
              value={muscle}
              onChange={(e) => setMuscle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") createTable();
              }}
              placeholder="e.g. Chest, Legs, Back, Abs, Shoulders"
            />
            <button className="btn" onClick={createTable} disabled={!muscle.trim()}>
              Create a table
            </button>
          </div>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {tableCreated && (
        <>
          <h3 style={{ marginTop: 8 }}>
            Checkerboard Table — {tableTitle}
          </h3>
          <div className="workout-table-wrap">
            <table className="workout-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Target Muscle / Routine</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className={r.status === "completed" ? "done" : ""}>
                    <td>{r.day}</td>
                    <td>{r.routine}</td>
                    <td>{r.duration}</td>
                    <td>
                      <span className={`badge ${r.status}`}>
                        {STATUS_LABEL[r.status]}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleStart(r)}
                        disabled={r.status === "completed" || loadingRow === r.id}
                      >
                        {loadingRow === r.id ? (
                          <span className="spinner" />
                        ) : r.status === "planned" ? (
                          "Start"
                        ) : r.status === "in_progress" ? (
                          "Complete"
                        ) : (
                          "Done"
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {advice && (
            <div className="chat">
              <div className="chat-bubble user">
                Finished {advice.row.routine} — any recovery advice?
              </div>
              <div className="advice-card">
                <div className="advice-head">
                  <h3>Post-workout Advice</h3>
                  <span className="badge completed">Recovery</span>
                </div>
                <p className="advice-note">
                  Built only from your Storage ingredients:
                </p>
                <div className="result-card" style={{ marginTop: 10 }}>
                  <div className="result-head">
                    <h3>{advice.recipe.name}</h3>
                    <span className="score">
                      {(advice.recipe.similarity_score * 100).toFixed(1)}% match
                    </span>
                  </div>
                  <p>{advice.recipe.description}</p>
                  <div className="meta">
                    <span className="badge planned">
                      {advice.recipe.protein_g}g protein
                    </span>
                    <span className="badge rest">
                      {advice.recipe.calories} kcal
                    </span>
                    <span className="badge completed">
                      Ingredients: {advice.recipe.ingredients}
                    </span>
                  </div>
                </div>
              </div>
              <div className="chat-bubble coach">
                {advice.aiAdvice}
                <span className="model">via AI Coach (storage-constrained)</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
