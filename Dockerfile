FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 UV_CACHE_DIR=/tmp/uv-cache
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg ca-certificates && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir uv==0.9.2
COPY apps/api/pyproject.toml apps/api/uv.lock /app/apps/api/
RUN uv sync --frozen --no-dev --project apps/api
COPY apps/api/app /app/apps/api/app
COPY scripts /app/scripts
COPY contracts /app/contracts
COPY supabase/migrations /app/supabase/migrations
RUN useradd --create-home --uid 10001 pasar && chown -R pasar:pasar /app
USER pasar
ENV PATH="/app/apps/api/.venv/bin:$PATH"
CMD ["sh", "-c", "exec uvicorn app.main:app --app-dir apps/api --host 0.0.0.0 --port ${PORT:-8010} --no-access-log"]
