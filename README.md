# Clothify

Clothify is split into independent frontend and backend npm projects. See [backend/README.md](./backend/README.md) and [frontend/README.md](./frontend/README.md) for their application details.

## Run with Docker

Install Docker Desktop or Docker Engine with the Docker Compose plugin. Create a root `.env` from `.env.example` and provide values for `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `JWT_SECRET`. Set the `VITE_FIREBASE_*` variables only if enabling Firebase authentication; the API URL defaults to `http://localhost:5000/api`.

```powershell
Copy-Item .env.example .env
# Edit .env with local values; never commit it.
docker compose up --build
```

Compose waits for PostgreSQL to become healthy, runs the one-shot migration service, then starts the API and frontend. Visit `http://localhost:8080`; check API/database readiness at `http://localhost:5000/api/health`. Stop the stack with `Ctrl+C`, or run `docker compose down` in another terminal. `docker compose down -v` also deletes the local database volume.

The frontend is built into the image, so changes to `VITE_*` values require rebuilding it with `docker compose build --no-cache frontend`.

## CI/CD pipeline

GitHub Actions runs on changes affecting the application or Docker setup in pushes and pull requests targeting `main`. Backend build/tests and frontend lint/build must pass before Docker image builds and Trivy scans. On pushes to `main`, passing images are pushed to GHCR with the commit SHA and `latest` tags. Set the GitHub Actions repository variables `VITE_API_URL` and `VITE_FIREBASE_*` to bake the intended public frontend configuration into those images. Deployment is intentionally a placeholder.

```text
Push / pull request to main
             |
       +-----+-----+
       |           |
    Backend     Frontend
   build/test   lint/build
       |           |
       +-----+-----+
             |
      Docker build
             |
    Trivy CRITICAL scan
             |
    Push to GHCR (main only)
             |
    Deployment placeholder
```
