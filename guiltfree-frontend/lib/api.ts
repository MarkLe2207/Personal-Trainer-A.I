export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------
export interface HealthCheck {
  status: string;
  service: string;
  version: string;
}

// ---------------------------------------------------------------------------
// Checkerboard Scheduler
// ---------------------------------------------------------------------------
export type DayStatus =
  | "planned"
  | "completed"
  | "active_recovery"
  | "micro_circuit"
  | "rest";

export interface ScheduleDay {
  day_date: string; // YYYY-MM-DD
  activity: string;
  status: DayStatus;
  volume_units: number;
}

export interface RecalibrateRequest {
  user_id: string;
  missed_day: string;
  missed_activity: string;
  reason?: string | null;
  current_schedule: ScheduleDay[];
}

export interface RecalibrateResponse {
  user_id: string;
  updated_schedule: ScheduleDay[];
  message: string;
  redistributed_volume_units: number;
}

// ---------------------------------------------------------------------------
// AI Coach
// ---------------------------------------------------------------------------
export interface CoachContext {
  pantry_items?: string[];
  fatigue_level?: number;
  workout_goal?: string;
}

export interface CoachQueryRequest {
  user_query: string;
  context?: CoachContext;
}

export interface CoachQueryResponse {
  response: string;
  model_used: string;
}

// ---------------------------------------------------------------------------
// Knowledge Search (RAG)
// ---------------------------------------------------------------------------
export interface RecipeResult {
  id: string;
  name: string;
  description: string;
  similarity_score: number;
  protein_g: number;
  calories: number;
  ingredients: string;
}

export interface RecipeSearchRequest {
  pantry_items: string[];
  top_k: number;
  min_protein_g?: number | null;
}

export interface RecipeSearchResponse {
  results: RecipeResult[];
  count: number;
}

export interface ExerciseResult {
  id: string;
  name: string;
  description: string;
  similarity_score: number;
  muscle_group: string;
  equipment: string;
}

export interface ExerciseSearchRequest {
  query: string;
  top_k: number;
}

export interface ExerciseSearchResponse {
  results: ExerciseResult[];
  count: number;
}

// ---------------------------------------------------------------------------
// Receipt Scanner (OCR)
// ---------------------------------------------------------------------------
export interface ScannedReceiptResponse {
  items: string[];
  item_count: number;
  raw_text_preview: string;
}

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, init);

  if (!res.ok) {
    let detail = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      if (typeof body.detail === "string") {
        detail = body.detail;
      }
    } catch {
      // keep default message if body isn't JSON
    }
    throw new ApiError(res.status, detail);
  }

  return (await res.json()) as T;
}

function postJson<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export const api = {
  health(): Promise<HealthCheck> {
    return request<HealthCheck>("/");
  },

  recalibrate(req: RecalibrateRequest): Promise<RecalibrateResponse> {
    return postJson<RecalibrateResponse>("/api/checkerboard/recalibrate", req);
  },

  coach(req: CoachQueryRequest): Promise<CoachQueryResponse> {
    return postJson<CoachQueryResponse>("/api/coach/query", req);
  },

  searchRecipes(req: RecipeSearchRequest): Promise<RecipeSearchResponse> {
    return postJson<RecipeSearchResponse>("/api/knowledge/search-recipes", req);
  },

  searchExercises(req: ExerciseSearchRequest): Promise<ExerciseSearchResponse> {
    return postJson<ExerciseSearchResponse>("/api/knowledge/search-exercises", req);
  },

  async scanReceipt(file: File): Promise<ScannedReceiptResponse> {
    const form = new FormData();
    form.append("file", file);
    return request<ScannedReceiptResponse>("/api/vision/scan-receipt", {
      method: "POST",
      body: form,
    });
  },
};
