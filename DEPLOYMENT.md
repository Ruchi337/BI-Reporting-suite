# ShopSense AI - Production Deployment & Operations Guide

This guide covers production deployment for Milestone 4 (Weeks 7–8), including Docker containerization, PostgreSQL cloud provisioning, automated CI/CD via GitHub Actions, and cloud deployment onto AWS EC2/RDS, Render, or Heroku.

---

## 1. Quick Local Execution with Docker

### Prerequisites
- Docker Engine 24+ & Docker Compose v2+
- Gemini API Key (from Google AI Studio)

### Build and Run with Docker Compose
```bash
# 1. Clone or extract the repository
git clone <repo-url> && cd shopsense-ai

# 2. Configure environment
cp .env.example .env
# Edit .env and supply your GEMINI_API_KEY

# 3. Spin up application container and PostgreSQL database
docker compose up --build -d

# 4. View running services and logs
docker compose ps
docker compose logs -f app

# 5. Access the live platform
# Web Application: http://localhost:3000
# OpenAPI / Swagger UI: http://localhost:3000/api/docs
# Healthcheck: http://localhost:3000/api/health
```

### Standalone Docker Container
```bash
# Build production image
docker build -t shopsense-ai:latest .

# Run container on port 3000
docker run -d \
  -p 3000:3000 \
  -e GEMINI_API_KEY="your_api_key_here" \
  --name shopsense-app \
  shopsense-ai:latest
```

---

## 2. Cloud Deployment Options

### Option A: Render (Zero-Config Blueprint)
1. Fork or push this repository to GitHub.
2. Log into [Render.com](https://render.com).
3. Click **New +** > **Blueprint**.
4. Connect your GitHub repository. Render automatically parses `render.yaml` and spins up:
   - `shopsense-ai-service` (Dockerized Web Service)
   - `shopsense-postgres` (Managed PostgreSQL Database)
5. Add your `GEMINI_API_KEY` under the Environment Variables section in the Render Dashboard.
6. Click **Apply**.

### Option B: AWS EC2 & RDS (PostgreSQL)
1. **Launch RDS PostgreSQL**:
   - Engine: PostgreSQL 16
   - Instance: `db.t4g.micro` (Free Tier eligible)
   - Master DB name: `shopsense_db`
   - Security Group: Allow inbound traffic on port `5432` from your EC2 security group.
2. **Launch EC2 Instance**:
   - AMI: Ubuntu Server 24.04 LTS (t3.micro or t3.small)
   - Open ports `80`, `443`, and `3000`.
3. **Provision Container on EC2**:
   ```bash
   sudo apt-get update && sudo apt-get install -y docker.io docker-compose-v2
   sudo systemctl enable --now docker
   git clone <repo-url> && cd shopsense-ai
   export GEMINI_API_KEY="your_key"
   export DATABASE_URL="postgresql://user:pass@your-rds-endpoint.rds.amazonaws.com:5432/shopsense_db"
   docker compose -f docker-compose.prod.yml up -d
   ```

### Option C: Heroku Container Deployment
```bash
heroku login
heroku container:login
heroku create shopsense-ai-production
heroku addons:create heroku-postgresql:essential-0
heroku config:set GEMINI_API_KEY="your_api_key"
heroku container:push web -a shopsense-ai-production
heroku container:release web -a shopsense-ai-production
heroku open -a shopsense-ai-production
```

---

## 3. Automated CI/CD (GitHub Actions)
GitHub Actions workflow `.github/workflows/ci.yml` triggers on every push and pull request to `main`:
1. **Lint & Typecheck**: Enforces TypeScript 0-error strict check (`npm run lint`).
2. **Unit Tests**: Executes automated API unit tests (`npm test`).
3. **Docker Build**: Validates multi-stage Docker build layers and cache.
4. **Deploy Smoke Test**: Previews target deployment health.

---

## 4. API Documentation & OpenAPI 3.0
- **Swagger UI Interactive Explorer**: Accessible at `/api/docs` or via the in-app Milestone 4 Hub.
- **Raw OpenAPI 3.0 JSON Specification**: Accessible at `/api/docs/openapi.json`.
