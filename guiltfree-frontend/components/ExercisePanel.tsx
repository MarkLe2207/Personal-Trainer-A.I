"use client";

<<<<<<< HEAD
import { useMemo, useState } from "react";
import { useApp, CompletedWorkout } from "../lib/app-context";

type RowStatus = "planned" | "in_progress" | "completed";

export interface ExerciseRow {
  day: string;
  date: string;
  muscle: string;
  routine: string;
  duration: number;
  status: RowStatus;
}

interface RoutineDef {
  routine: string;
  duration: number;
}

interface PlanDef {
  name: string;
  routines: RoutineDef[];
  support: string[];
}

const MUSCLE_PLAN: Record<string, PlanDef> = {
  chest: {
    name: "Chest",
    routines: [
      { routine: "Barbell Bench Press", duration: 50 },
      { routine: "Incline Dumbbell Press", duration: 45 },
      { routine: "Cable Fly", duration: 35 },
      { routine: "Push-Up Superset", duration: 30 },
      { routine: "Chest Dip", duration: 40 },
    ],
    support: ["Shoulders", "Triceps"],
  },
  legs: {
    name: "Legs",
    routines: [
      { routine: "Back Squat", duration: 55 },
      { routine: "Romanian Deadlift", duration: 50 },
      { routine: "Leg Press", duration: 40 },
      { routine: "Walking Lunge", duration: 35 },
      { routine: "Calf Raise", duration: 30 },
    ],
    support: ["Core", "Glutes"],
  },
  back: {
    name: "Back",
    routines: [
      { routine: "Pull-Up / Lat Pulldown", duration: 50 },
      { routine: "Barbell Row", duration: 45 },
      { routine: "Seated Cable Row", duration: 40 },
      { routine: "Face Pull", duration: 30 },
      { routine: "Back Extension", duration: 30 },
    ],
    support: ["Biceps", "Rear Delts"],
  },
  abs: {
    name: "Abs / Core",
    routines: [
      { routine: "Plank Hold", duration: 20 },
      { routine: "Hanging Leg Raise", duration: 25 },
      { routine: "Cable Crunch", duration: 30 },
      { routine: "Russian Twist", duration: 25 },
      { routine: "Dead Bug", duration: 20 },
    ],
    support: ["Cardio", "Lower Back"],
  },
  shoulder: {
    name: "Shoulders",
    routines: [
      { routine: "Overhead Press", duration: 50 },
      { routine: "Lateral Raise", duration: 35 },
      { routine: "Rear Delt Fly", duration: 30 },
      { routine: "Front Raise", duration: 30 },
      { routine: "Arnold Press", duration: 45 },
    ],
    support: ["Traps", "Triceps"],
  },
  shoulders: {
    name: "Shoulders",
    routines: [
      { routine: "Overhead Press", duration: 50 },
      { routine: "Lateral Raise", duration: 35 },
      { routine: "Rear Delt Fly", duration: 30 },
      { routine: "Front Raise", duration: 30 },
      { routine: "Arnold Press", duration: 45 },
    ],
    support: ["Traps", "Triceps"],
  },
  arms: {
    name: "Arms",
    routines: [
      { routine: "Barbell Curl", duration: 40 },
      { routine: "Triceps Pushdown", duration: 35 },
      { routine: "Hammer Curl", duration: 35 },
      { routine: "Skull Crusher", duration: 30 },
      { routine: "Concentration Curl", duration: 30 },
    ],
    support: ["Forearms", "Shoulders"],
  },
  full: {
    name: "Full Body",
    routines: [
      { routine: "Squat + Press Combo", duration: 55 },
      { routine: "Deadlift + Row Combo", duration: 55 },
      { routine: "Push + Pull Circuit", duration: 45 },
      { routine: "Lunge + Curl Superset", duration: 40 },
      { routine: "Total Body Finisher", duration: 35 },
    ],
    support: ["Core", "Cardio"],
  },
};

const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function currentWeekDays(): { day: string; date: string }[] {
  const now = new Date();
  const mondayOffset = (now.getDay() + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - mondayOffset);
  return DAY_NAMES.map((name, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { day: name, date: d.toISOString().slice(0, 10) };
  });
}

function resolvePlan(input: string): PlanDef {
  const key = input.trim().toLowerCase().replace(/\s+/g, "");
  const aliases: Record<string, string> = {
    chest: "chest",
    pec: "chest",
    pecs: "chest",
    legs: "legs",
    leg: "legs",
    back: "back",
    abs: "abs",
    core: "abs",
    abdominals: "abs",
    shoulder: "shoulder",
    shoulders: "shoulder",
    delts: "shoulder",
    arms: "arms",
    arm: "arms",
    biceps: "arms",
    triceps: "arms",
    fullbody: "full",
    full: "full",
    total: "full",
  };
  const resolved = aliases[key];
  return MUSCLE_PLAN[resolved] ?? MUSCLE_PLAN.full;
}

function buildSchedule(plan: PlanDef): ExerciseRow[] {
  const days = currentWeekDays();
  const rows: ExerciseRow[] = [];
  const target = plan.routines;
  const support = plan.support;

  const layout: { muscle: string; routineIndex: number }[] = [
    { muscle: plan.name, routineIndex: 0 },
    { muscle: support[0], routineIndex: 0 },
    { muscle: plan.name, routineIndex: 1 },
    { muscle: support[1] ?? "Core & Cardio", routineIndex: 0 },
    { muscle: plan.name, routineIndex: 2 },
    { muscle: "Rest / Recovery", routineIndex: -1 },
    { muscle: plan.name, routineIndex: 3 },
  ];

  days.forEach((d, i) => {
    const slot = layout[i];
    if (!slot) return;
    const isRest = slot.muscle === "Rest / Recovery";
    const duration = isRest ? 0 : target[slot.routineIndex]?.duration ?? 30;
    const routine = isRest
      ? "Active Recovery & Mobility"
      : slot.routineIndex >= 0
        ? target[slot.routineIndex]?.routine ?? "Structured Session"
        : "Structured Session";
    rows.push({
      day: d.day,
      date: d.date,
      muscle: slot.muscle,
      routine,
      duration,
      status: "planned",
    });
  });

  return rows;
}

const statusLabel: Record<RowStatus, string> = {
=======
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
>>>>>>> upstream/main
  planned: "Planned",
  in_progress: "In Progress",
  completed: "Completed",
};
<<<<<<< HEAD

export default function ExercisePanel() {
  const { addCompletedWorkout } = useApp();
  const [bodyPart, setBodyPart] = useState<string>("Chest");
  const [rows, setRows] = useState<ExerciseRow[]>([]);
  const [generatedFor, setGeneratedFor] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const plan = useMemo(() => resolvePlan(bodyPart), [bodyPart]);

  function createTable() {
    if (!bodyPart.trim()) {
      setError("Please enter a body part first, e.g. Chest, Legs, Back, Abs, Shoulder.");
      return;
    }
    setError(null);
    const schedule = buildSchedule(plan);
    setRows(schedule);
    setGeneratedFor(plan.name);
  }

  function handleAction(row: ExerciseRow) {
    if (row.status === "planned") {
      setRows((prev) =>
        prev.map((r) =>
          r.day === row.day ? { ...r, status: "in_progress" } : r,
        ),
      );
    } else if (row.status === "in_progress") {
      const completed: CompletedWorkout = {
        day: row.day,
        muscle: row.muscle,
        routine: row.routine,
        duration: row.duration,
        completedAt: new Date().toISOString(),
      };
      addCompletedWorkout(completed);
      setRows((prev) =>
        prev.map((r) =>
          r.day === row.day ? { ...r, status: "completed" } : r,
        ),
      );
=======

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
>>>>>>> upstream/main
    }
  }

  return (
    <div className="card">
<<<<<<< HEAD
      <h2>Exercise — Create Your Workout Table</h2>
      <p className="subtitle">
        Enter a body part to generate a weekly checkerboard routine table, then
        Start / Complete each session.
      </p>

      <div className="chat-input">
        <input
          value={bodyPart}
          onChange={(e) => setBodyPart(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") createTable();
          }}
          placeholder="Enter body part: Chest, Legs, Back, Abs, Shoulder…"
          aria-label="Body part"
        />
        <button className="btn" onClick={createTable}>
          Create a table
        </button>
=======
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
>>>>>>> upstream/main
      </div>

      {error && <div className="error">{error}</div>}

<<<<<<< HEAD
      {rows.length > 0 && (
        <div className="info" style={{ marginTop: 14 }}>
          Weekly plan for <strong>{generatedFor}</strong> — tap Start to begin a
          session, then Complete when finished.
        </div>
      )}

      {rows.length > 0 && (
        <table className="exercise-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Target Muscle / Routine</th>
              <th>Duration</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.day}>
                <td>
                  <div className="cell-day">{row.day}</div>
                  <div className="cell-date">{row.date}</div>
                </td>
                <td>
                  <div className="cell-muscle">{row.muscle}</div>
                  <div className="cell-routine">{row.routine}</div>
                </td>
                <td className="cell-duration">
                  {row.status === "completed"
                    ? "Done"
                    : row.duration === 0
                      ? "—"
                      : `${row.duration} min`}
                </td>
                <td>
                  <span className={`badge ${row.status}`}>
                    {statusLabel[row.status]}
                  </span>
                </td>
                <td>
                  {row.status === "planned" && (
                    <button
                      className="btn btn-small btn-secondary"
                      onClick={() => handleAction(row)}
                    >
                      Start
                    </button>
                  )}
                  {row.status === "in_progress" && (
                    <button
                      className="btn btn-small btn-success"
                      onClick={() => handleAction(row)}
                    >
                      Complete
                    </button>
                  )}
                  {row.status === "completed" && (
                    <span className="done-mark">✓</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
=======
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
>>>>>>> upstream/main
      )}
    </div>
  );
}
