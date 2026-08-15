"use client";

import { useState } from "react";
import { api, ApiError, RecipeResult } from "../lib/api";

export default function RecipePanel() {
  const [pantry, setPantry] = useState<string>("chicken, broccoli, eggs");
  const [top_k, setTopK] = useState<number>(5);
  const [minProtein, setMinProtein] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<RecipeResult[]>([]);

  async function search() {
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const pantryItems = pantry
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await api.searchRecipes({
        pantry_items: pantryItems,
        top_k,
        min_protein_g: minProtein ? Number(minProtein) : null,
      });
      setResults(res.results);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Recipe Search</h2>
      <p className="subtitle">
        RAG search over the recipe collection, constrained to what is in your
        pantry.
      </p>

      <div className="form-row">
        <div className="field" style={{ flexBasis: "100%" }}>
          <label htmlFor="recipe-pantry">Pantry items (comma separated)</label>
          <input
            id="recipe-pantry"
            value={pantry}
            onChange={(e) => setPantry(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="recipe-k">Top results (1–20)</label>
          <input
            id="recipe-k"
            type="number"
            min={1}
            max={20}
            value={top_k}
            onChange={(e) => setTopK(Number(e.target.value))}
          />
        </div>
        <div className="field">
          <label htmlFor="recipe-protein">Min protein (g, optional)</label>
          <input
            id="recipe-protein"
            type="number"
            min={0}
            value={minProtein}
            onChange={(e) => setMinProtein(e.target.value)}
            placeholder="e.g. 30"
          />
        </div>
      </div>

      <div className="actions">
        <button className="btn" onClick={search} disabled={loading}>
          {loading ? <span className="spinner" /> : "Search recipes"}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {results.length > 0 && (
        <div className="info">Found {results.length} recipe(s)</div>
      )}

      {results.map((r) => (
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
            <span className="badge completed">Ingredients: {r.ingredients}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
