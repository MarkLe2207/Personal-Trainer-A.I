"use client";

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
  planned: "Planned",
  in_progress: "In Progress",
  completed: "Completed",
};

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
    }
  }

  return (
    <div className="card">
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
      </div>

      {error && <div className="error">{error}</div>}

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
      )}
    </div>
  );
}
