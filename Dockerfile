# FRONTEND IMAGE
FROM node:lts-slim AS frontend

WORKDIR /app

COPY package.json /app/
RUN npm install
COPY . /app/
RUN npm run build
# END FRONTEND BUILDER IMAGE

# FINAL IMAGE
FROM python:3-slim AS final

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
ENV PATH="/venv/bin:$PATH"

RUN python -m venv /venv

WORKDIR /app

COPY api/requirements.txt /app/
RUN pip install -U pip \
    && pip install -r requirements.txt

COPY api/app.py /app/
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
