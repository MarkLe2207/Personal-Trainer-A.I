"use client";

import { useMemo, useState } from "react";
import { api, ApiError, CoachQueryResponse, RecipeResult } from "../lib/api";
import { useApp } from "../lib/app-context";

export default function NutritionPanel() {
  const { pantry, completedWorkouts } = useApp();

  const lastWorkout = useMemo(() => completedWorkouts[0] ?? null, [completedWorkouts]);

  const [user_query, setUserQuery] = useState<string>(
    "Give me a high-protein meal idea using only what I have in my storage.",
  );
  const [fatigue, setFatigue] = useState<string>("6");
  const [goal, setGoal] = useState<string>("muscle recovery");
  const [chatLoading, setChatLoading] = useState(false);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState<CoachQueryResponse | null>(null);
  const [recipes, setRecipes] = useState<RecipeResult[]>([]);

  function pantryContext() {
    return pantry.length > 0 ? pantry : undefined;
  }

  function workoutHint() {
    return lastWorkout
      ? ` I just completed ${lastWorkout.routine} (${lastWorkout.muscle}, ${lastWorkout.duration} min) on ${lastWorkout.day}.`
      : "";
  }

  async function askAdvice() {
    setChatLoading(true);
    setError(null);
    setReply(null);
    setRecipes([]);
    const pantryItems = pantryContext();
    const constraint =
      pantryItems && pantryItems.length > 0
        ? ` Use ONLY these ingredients from my storage: ${pantryItems.join(", ")}. Do not suggest anything not in this list.`
        : " My storage is currently empty, so suggest ideas that only need basic pantry staples.";
    try {
      const res = await api.coach({
        user_query: `${user_query}${constraint}${workoutHint()}`,
        context: {
          pantry_items: pantryItems,
          fatigue_level: fatigue ? Number(fatigue) : undefined,
          workout_goal: goal || undefined,
        },
      });
      setReply(res);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e));
    } finally {
      setChatLoading(false);
    }
  }

  async function searchRecipes() {
    setRecipeLoading(true);
    setError(null);
    setRecipes([]);
    setReply(null);
    const pantryItems = pantryContext();
    if (!pantryItems || pantryItems.length === 0) {
      setError("Your storage is empty. Add ingredients in the Storage tab first.");
      setRecipeLoading(false);
      return;
    }
    try {
      const res = await api.searchRecipes({
        pantry_items: pantryItems,
        top_k: 5,
        min_protein_g: null,
      });
      setRecipes(res.results);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e));
    } finally {
      setRecipeLoading(false);
    }
  }

  function useLastWorkout() {
    if (!lastWorkout) {
      setUserQuery(
        "Give me post-workout recovery advice and a meal using only my storage items.",
      );
    } else {
      setUserQuery(
        `I just finished ${lastWorkout.routine} (${lastWorkout.muscle}, ${lastWorkout.duration} min). Give me post-workout recovery advice and a meal using only my storage items.`,
      );
    }
  }

  return (
    <div className="card">
      <h2>AI Coach &amp; Nutrition</h2>
      <p className="subtitle">
        Recipes and advice are generated using <strong>only</strong> the
        ingredients currently in your Storage ({pantry.length} items).
      </p>

      {lastWorkout ? (
        <div className="info">
          Last completed session: <strong>{lastWorkout.routine}</strong> (
          {lastWorkout.muscle}, {lastWorkout.duration} min, {lastWorkout.day}).
        </div>
      ) : (
        <div className="info">
          No workout completed yet — finish a session in the Exercise tab to get
          personalized post-workout advice.
        </div>
      )}

      <div className="form-row" style={{ marginTop: 16 }}>
        <div className="field" style={{ flexBasis: "100%" }}>
          <label htmlFor="nut-q">Ask for a recipe / nutrition advice</label>
          <textarea
            id="nut-q"
            value={user_query}
            onChange={(e) => setUserQuery(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="nut-fatigue">Fatigue (1–10)</label>
          <input
            id="nut-fatigue"
            type="number"
            min={1}
            max={10}
            value={fatigue}
            onChange={(e) => setFatigue(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="nut-goal">Goal</label>
          <input
            id="nut-goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
        </div>
      </div>

      <div className="actions" style={{ flexWrap: "wrap", gap: 10 }}>
        <button className="btn" onClick={askAdvice} disabled={chatLoading}>
          {chatLoading ? <span className="spinner" /> : "Get recipe &amp; advice"}
        </button>
        <button
          className="btn btn-secondary"
          onClick={searchRecipes}
          disabled={recipeLoading}
        >
          {recipeLoading ? "Searching…" : "Search recipes from storage"}
        </button>
        <button className="btn btn-secondary" onClick={useLastWorkout}>
          Post-workout advice
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

      {recipes.length > 0 && (
        <>
          <div className="info">Found {recipes.length} recipe(s) matched to your storage</div>
          {recipes.map((r) => (
            <div className="result-card" key={r.id}>
              <div className="result-head">
                <h3>{r.name}</h3>
                <span className="score">
                  {(r.similarity_score * 100).toFixed(1)}% match
                </span>
              </div>
              <p>{r.description}</p>
              <div className="meta">
                <span className="badge planned">{r.protein_g}g protein</span>
                <span className="badge rest">{r.calories} kcal</span>
                <span className="badge completed">
                  Needs: {r.ingredients}
                </span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
