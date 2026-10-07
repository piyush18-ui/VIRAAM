.PHONY: dev backend frontend test clean

dev:
	@echo "Starting Viraam Backend and Frontend..."
	powershell -Command "Start-Process powershell -ArgumentList '-NoExit', '-Command', '$$env:PYTHONPATH=\"backend\"; .venv\Scripts\python -m uvicorn app.main:app --reload --port 8000'; cd frontend; npm run dev"

backend:
	powershell -Command "$$env:PYTHONPATH='backend'; .venv\Scripts\python -m uvicorn app.main:app --reload --port 8000"

frontend:
	cd frontend && npm run dev

test:
	.venv\Scripts\pytest -v

clean:
	Remove-Item -Recurse -Force -ErrorAction SilentlyContinue backend\viraam.db viraam.db
