# Guilt-Free Personal Trainer & AI Pantry Companion — Backend

## Prerequisites
- Python 3.10+
- [Ollama](https://ollama.com) installed and running locally, with a model pulled:
  ```bash
  ollama pull llama3
  # or: ollama pull mistral
  ollama serve
  ```
- Tesseract OCR binary installed on the host (pytesseract is only a wrapper):
  ```bash
  # macOS
  brew install tesseract
  # Debian/Ubuntu
  sudo apt-get install tesseract-ocr
  ```

## Setup
```bash
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Run
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
Docs available at `http://localhost:8000/docs`.

## Project layout
```
main.py                    # FastAPI app, CORS, router registration, health check
requirements.txt
routers/
  checkerboard.py           # POST /api/checkerboard/recalibrate
  ai_coach.py                # POST /api/coach/query
  knowledge.py                # POST /api/knowledge/search-recipes, /search-exercises
  vision.py                    # POST /api/vision/scan-receipt
services/
  ollama_service.py            # LangChain + Ollama coach persona logic
  vector_service.py             # ChromaDB init, seeding, and query helpers
```

## Notes
- ChromaDB persists to `./chroma_data` and is auto-seeded with demo recipes/exercises on first run.
- `services/ollama_service.py` defaults to model `llama3` at `http://localhost:11434`; change `DEFAULT_MODEL` / `DEFAULT_BASE_URL` there to use `mistral` or a remote Ollama host.
- The `/api/checkerboard/recalibrate` endpoint intentionally never emits failure states — missed days become "Active Recovery" and their volume is folded into upcoming "Micro-Circuit" sessions.
