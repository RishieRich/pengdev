# Pawan Engineering Copilot

## Quick Local Test

Run the backend from the repo root:

```powershell
cd d:\AI_Projects\ARQ\pengpro1
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
python -m uvicorn backend.main:app --reload --port 8000
```

Run the frontend in a second terminal:

```powershell
cd d:\AI_Projects\ARQ\pengpro1\frontend
npm ci
npm run dev
```

Open `http://localhost:5173`.

## One URL Production Test

This builds the UI and serves it from FastAPI:

```powershell
cd d:\AI_Projects\ARQ\pengpro1\frontend
npm ci
npm run build

cd d:\AI_Projects\ARQ\pengpro1
.\.venv\Scripts\Activate.ps1
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

Open `http://localhost:8000`.

## Live Deploy

For Render or another Python web service:

Build command:

```bash
pip install -r backend/requirements.txt && cd frontend && npm ci && npm run build
```

Start command:

```bash
python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

Set `GROQ_API_KEY` in the host environment if chat should answer with the LLM.
