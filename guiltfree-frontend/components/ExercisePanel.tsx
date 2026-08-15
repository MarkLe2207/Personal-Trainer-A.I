"use client";

import { useState } from "react";
import { api, ApiError, ExerciseResult } from "../lib/api";

export default function ExercisePanel() {
  const [query, setQuery] = useState<string>("no equipment leg day");
  const [top_k, setTopK] = useState<number>(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ExerciseResult[]>([]);

  async function search() {
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const res = await api.searchExercises({ query, top_k });
      setResults(res.results);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Exercise Search</h2>
      <p className="subtitle">
        Find movements by muscle group or equipment via vector search.
      </p>

      <div className="form-row">
        <div className="field" style={{ flexBasis: "100%" }}>
          <label htmlFor="ex-query">Query</label>
          <input
            id="ex-query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="ex-k">Top results (1–20)</label>
          <input
            id="ex-k"
            type="number"
            min={1}
            max={20}
            value={top_k}
            onChange={(e) => setTopK(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="actions">
        <button className="btn" onClick={search} disabled={loading}>
          {loading ? <span className="spinner" /> : "Search exercises"}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {results.length > 0 && (
        <div className="info">Found {results.length} exercise(s)</div>
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
            <span className="badge planned">{r.muscle_group}</span>
            <span className="badge rest">{r.equipment}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
