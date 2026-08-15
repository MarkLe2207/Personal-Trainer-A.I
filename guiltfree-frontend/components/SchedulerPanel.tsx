"use client";

import { useMemo, useState } from "react";
import {
  api,
  ApiError,
  DayStatus,
  RecalibrateResponse,
  ScheduleDay,
} from "../lib/api";

const DEFAULT_USER_ID = "demo-user-01";

function isoDaysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function defaultSchedule(): ScheduleDay[] {
  const plan: { activity: string; status: DayStatus; volume_units: number }[] = [
    { activity: "Upper Body Strength", status: "planned", volume_units: 16 },
    { activity: "Rest", status: "rest", volume_units: 0 },
    { activity: "Lower Body Strength", status: "planned", volume_units: 18 },
    { activity: "Cardio + Core", status: "planned", volume_units: 12 },
    { activity: "Push + Pull Hypertrophy", status: "planned", volume_units: 20 },
    { activity: "Rest", status: "rest", volume_units: 0 },
    { activity: "Full Body", status: "planned", volume_units: 16 },
  ];
  return plan.map((p, i) => ({
    day_date: isoDaysFromNow(i),
    activity: p.activity,
    status: p.status,
    volume_units: p.volume_units,
  }));
}

const statusLabel: Record<DayStatus, string> = {
  planned: "Planned",
  completed: "Completed",
  active_recovery: "Active Recovery",
  micro_circuit: "Micro-Circuit",
  rest: "Rest",
};

export default function SchedulerPanel() {
  const [schedule] = useState<ScheduleDay[]>(defaultSchedule);
  const [missedDate, setMissedDate] = useState<string>(schedule[0].day_date);
  const [missedActivity, setMissedActivity] = useState<string>(
    schedule[0].activity,
  );
  const [reason, setReason] = useState<string>("Fast food day");
  const [user_id, setUserId] = useState<string>(DEFAULT_USER_ID);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RecalibrateResponse | null>(null);

  const missedDay = useMemo(
    () => schedule.find((d) => d.day_date === missedDate),
    [schedule, missedDate],
  );

  async function recalibrate() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.recalibrate({
        user_id,
        missed_day: missedDate,
        missed_activity: missedActivity,
        reason: reason || null,
        current_schedule: schedule,
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  function renderDay(day: ScheduleDay) {
    return (
      <div className="schedule-day" key={day.day_date}>
        <span className="date">{day.day_date}</span>
        <span className="activity">{day.activity}</span>
        <span className="badge">{day.volume_units} vol</span>
        <span className={`badge ${day.status}`}>{statusLabel[day.status]}</span>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Checkerboard Scheduler</h2>
      <p className="subtitle">
        Missed a workout or had a cheat day? Recalibrate the next 7 days
        without any guilt, streaks, or failure flags.
      </p>

      <div className="form-row">
        <div className="field">
          <label htmlFor="sched-user">User ID</label>
          <input
            id="sched-user"
            value={user_id}
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="sched-missed">Missed day</label>
          <select
            id="sched-missed"
            value={missedDate}
            onChange={(e) => {
              setMissedDate(e.target.value);
              const d = schedule.find((x) => x.day_date === e.target.value);
              setMissedActivity(d?.activity ?? "");
            }}
          >
            {schedule.map((d) => (
              <option key={d.day_date} value={d.day_date}>
                {d.day_date} — {d.activity}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="sched-activity">Originally scheduled</label>
          <input
            id="sched-activity"
            value={missedActivity}
            onChange={(e) => setMissedActivity(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="sched-reason">Reason (optional)</label>
          <input
            id="sched-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. fast food day, too tired"
          />
        </div>
      </div>

      <div className="actions">
        <button className="btn" onClick={recalibrate} disabled={loading}>
          {loading ? <span className="spinner" /> : "Recalibrate schedule"}
        </button>
      </div>

      <h3 style={{ marginBottom: 4 }}>Current schedule</h3>
      <div className="schedule">{schedule.map(renderDay)}</div>

      {error && <div className="error">{error}</div>}

      {result && (
        <div className="success" style={{ marginTop: 16 }}>
          {result.message}
          <div style={{ marginTop: 6, fontWeight: 600 }}>
            Redistributed volume: {result.redistributed_volume_units} units
          </div>
        </div>
      )}

      {result && (
        <>
          <h3 style={{ marginBottom: 4, marginTop: 16 }}>Updated schedule</h3>
          <div className="schedule">{result.updated_schedule.map(renderDay)}</div>
        </>
      )}
    </div>
  );
}
