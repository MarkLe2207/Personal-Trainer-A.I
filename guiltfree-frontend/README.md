# Guilt-Free Personal Trainer & AI Pantry Companion — Frontend

Next.js (App Router) single-page dashboard that talks to the FastAPI backend in
`../guiltfree-backend`. It covers all four backend modules plus a health check.

## Backend API this frontend uses

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/` | GET | Health check |
| `/api/checkerboard/recalibrate` | POST | Adaptive 7-day schedule recalibration |
| `/api/coach/query` | POST | AI coach response (LangChain + Ollama) |
| `/api/knowledge/search-recipes` | POST | Pantry-constrained recipe search (ChromaDB RAG) |
| `/api/knowledge/search-exercises` | POST | Exercise search (ChromaDB RAG) |
| `/api/vision/scan-receipt` | POST | Receipt OCR (multipart image upload) |

All API types and calls live in `lib/api.ts`. The backend base URL defaults to
`http://localhost:8000` and can be overridden via the `NEXT_PUBLIC_API_URL`
environment variable (see `.env.example`).

## Prerequisites (Windows)

- Node.js 18+ (LTS recommended) — from <https://nodejs.org>, or:
  ```powershell
  winget install OpenJS.NodeJS.LTS
  ```
- Python 3.10–3.12 (the backend pins older package versions that do **not**
  have wheels for Python 3.14). Python 3.14 is currently installed on this
  machine, so install 3.11/3.12 if `pip install` fails.
- Ollama (only needed for the AI Coach tab): <https://ollama.com> or
  `winget install Ollama.Ollama`, then `ollama pull llama3`.
- Tesseract OCR binary (only needed for the Receipt Scanner tab):
  `winget install UB-Mannheim.TesseractOCR`, then add `C:\Program Files\Tesseract-OCR` to PATH.

## Step 1 — Start the backend

```powershell
cd C:\Users\damil\OneDrive\Documents\GymPT\guiltfree-backend
python -m venv venv
venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

> If PowerShell blocks `Activate.ps1`, run
> `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first.
> API docs will be at <http://localhost:8000/docs>.

## Step 2 — Start the frontend

Open a second terminal:

```powershell
cd C:\Users\damil\OneDrive\Documents\GymPT\guiltfree-frontend
npm install
npm run dev
```

Open <http://localhost:3000>. The green health badge in the header confirms the
backend is reachable.

## Optional

- Change the backend URL (e.g. a remote server): copy `.env.example` to `.env`
  and edit `NEXT_PUBLIC_API_URL`, then restart `npm run dev`.
- The AI Coach returns HTTP 503 if Ollama isn't running; the Receipt Scanner
  returns HTTP 500 if Tesseract isn't installed. The other tabs (Scheduler,
  Recipes, Exercises) work without either, because ChromaDB auto-seeds demo
  data on first boot.
