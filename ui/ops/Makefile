run-backend:
	cd ../backend && .venv/bin/uvicorn app.main:app --reload || uvicorn app.main:app --reload

run-frontend:
	cd ../frontend && npm run dev

run-stack:
	$(MAKE) -j2 run-backend run-frontend
