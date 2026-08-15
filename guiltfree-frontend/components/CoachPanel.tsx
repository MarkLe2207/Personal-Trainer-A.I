"use client";

import { useState } from "react";
import { api, ApiError, CoachQueryResponse } from "../lib/api";

export default function CoachPanel() {
  const [user_query, setUserQuery] = useState<string>(
    "I had a burger yesterday and skipped my workout. What should I do today?",
  );
  const [pantry, setPantry] = useState<string>("chicken breast, eggs, broccoli");
  const [fatigue, setFatigue] = useState<string>("7");
  const [goal, setGoal] = useState<string>("fat loss");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState<CoachQueryResponse | null>(null);

  async function ask() {
    setLoading(true);
    setError(null);
    setReply(null);
    try {
      const pantryItems = pantry
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await api.coach({
        user_query,
        context: {
          pantry_items: pantryItems.length ? pantryItems : undefined,
          fatigue_level: fatigue ? Number(fatigue) : undefined,
          workout_goal: goal || undefined,
        },
      });
      setReply(res);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>AI Coach</h2>
      <p className="subtitle">
        Text your situation to Coach — golden-retriever energy on wins,
        sarcastic best-friend energy on setbacks. Requires Ollama running with
        the `llama3` model.
      </p>

      <div className="form-row">
        <div className="field" style={{ flexBasis: "100%" }}>
          <label htmlFor="coach-q">Your message</label>
          <textarea
            id="coach-q"
            value={user_query}
            onChange={(e) => setUserQuery(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="coach-pantry">Pantry items (comma separated)</label>
          <input
            id="coach-pantry"
            value={pantry}
            onChange={(e) => setPantry(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="coach-fatigue">Fatigue (1–10)</label>
          <input
            id="coach-fatigue"
            type="number"
            min={1}
            max={10}
            value={fatigue}
            onChange={(e) => setFatigue(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="coach-goal">Workout goal</label>
          <input
            id="coach-goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="strength, fat loss, …"
          />
        </div>
      </div>

      <div className="actions">
        <button className="btn" onClick={ask} disabled={loading}>
          {loading ? <span className="spinner" /> : "Ask Coach"}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {reply && (
        <div className="chat">
          <div className="chat-bubble user">{user_query}</div>
          <div className="chat-bubble coach">
            {reply.response}
            <span className="model">via {reply.model_used}</span>
          </div>
        </div>
      )}
    </div>
  );
}
