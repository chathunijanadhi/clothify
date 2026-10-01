# Clothify

Clothify is split into independent frontend and backend npm projects. See [backend/README.md](./backend/README.md) and [frontend/README.md](./frontend/README.md) for their application details.

## Run with Docker

Install Docker Desktop or Docker Engine with the Docker Compose plugin. Create a root `.env` from `.env.example` and provide values for `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `JWT_SECRET`. Set the `VITE_FIREBASE_*` variables only if enabling Firebase authentication; these are bundled into public browser assets, so never put server secrets there. The API URL defaults to `http://localhost:5000/api`.

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

## Observability

Logging, live/ready health checks, Prometheus metrics, and a pre-provisioned Grafana dashboard are included. The default Compose stack does not start monitoring services. Set `LOG_LEVEL` as needed (`info` is the default), and set a strong `GRAFANA_ADMIN_PASSWORD` in the root `.env` before starting the monitoring profile.

```powershell
docker compose --profile monitoring up --build -d
Invoke-RestMethod http://localhost:5000/api/health/live
Invoke-RestMethod http://localhost:5000/api/health/ready
Invoke-WebRequest http://localhost:9090/-/healthy
Invoke-WebRequest http://localhost:3000/api/health
```

Open Prometheus at `http://localhost:9090` and Grafana at `http://localhost:3000` (Grafana user: `admin`; use `GRAFANA_ADMIN_PASSWORD` from `.env`). Both monitoring UIs are bound to loopback only. Prometheus scrapes `http://backend:9464/metrics` over a dedicated internal Compose network; port `9464` is not published to the host and `/metrics` is deliberately absent from the public API. Use the Prometheus UI or Grafana dashboard to inspect those metrics. The frontend Nginx explicitly returns 404 for `/metrics`.

Each backend request produces a JSON log with method, route pattern, response status, duration, and request ID. The API reuses an incoming `X-Request-Id` or generates one and returns it in the response header. `LOG_LEVEL` controls verbosity. Sensitive password, token, authorization, and cookie fields are redacted.

The dashboard's `http_requests_total` request rate is requests per second; `http_request_duration_seconds` is a duration histogram used to calculate p95 latency; the 5xx panel is the percentage of server-error responses. `process_resident_memory_bytes` reports Node.js process resident memory and process CPU counters are converted to CPU cores per second. `db_pool_total_connections`, `db_pool_idle_connections`, and `db_pool_waiting_requests` report PostgreSQL pool usage.

Prometheus evaluates three alert rules (without a notifier): `BackendDown` fires when the backend is unreachable for 1 minute; `BackendHigh5xxRate` fires when the 5xx ratio exceeds 5% for 5 minutes; and `BackendHighP95Latency` fires when p95 request duration exceeds 1 second for 5 minutes. The rules are visible in Prometheus but are not delivered to email/chat until an Alertmanager/notifier is configured.

Run backend observability checks with:

```powershell
Set-Location backend
npm test
npm run build
```

## Testing

Run the backend unit and API tests with coverage, then run the frontend component and service tests with coverage:

```powershell
Set-Location backend
npm ci
npm run test:coverage

Set-Location ..\frontend
npm ci
npm run test:coverage
```

The backend test suite mocks database-facing services for deterministic health, authentication, and product-route checks. CI additionally starts a PostgreSQL 15 service and applies all migrations before running backend tests. Both test jobs generate text, HTML, and LCOV coverage reports under their respective `coverage` directories; GitHub Actions uploads these reports as `backend-coverage` and `frontend-coverage` artifacts. Coverage thresholds are intentionally set at 1% for the backend and 0.25% for the frontend as starting floors while the suites are expanded.
