# FRONTEND IMAGE
FROM node:lts-slim AS frontend

WORKDIR /app

COPY package.json /app/
RUN npm install
COPY . /app/
RUN npm run build
# END FRONTEND BUILDER IMAGE

# BACKEND IMAGE
FROM python:3-slim AS backend

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
ENV PATH="/venv/bin:$PATH"

RUN python -m venv /venv

WORKDIR /app

# Install python requirements
COPY api/requirements.txt /app/
RUN pip install -U pip \
    && pip install --no-cache-dir -r requirements.txt
# END BACKEND IMAGE

# FINAL IMAGE
FROM python:3-slim AS final

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
ENV PATH="/venv/bin:$PATH"
ENV PORT=8000

WORKDIR /app

COPY api/app.py /app/
COPY --from=backend /venv/ /venv/
COPY --from=frontend /app/public/ /app/public/

CMD exec gunicorn \
    --bind 0.0.0.0:${PORT} \
    --workers 2 \
    --threads 8 \
    --worker-tmp-dir /dev/shm \
    --log-file - \
    --access-logfile - \
    app:app
# END FINAL IMAGE
