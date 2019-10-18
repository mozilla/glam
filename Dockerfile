FROM node:lts-slim AS frontend

WORKDIR /app

COPY package.json /app/
RUN npm install
COPY . /app/
RUN npm run build

FROM python:3.7-slim

WORKDIR /app

COPY api/requirements.txt /app/
RUN pip install -U pip \
    && pip install -r requirements.txt

COPY api/app.py /app/
COPY --from=frontend /app/public/ /app/public/

CMD exec /usr/local/bin/gunicorn \
    --bind 0.0.0.0:${PORT} \
    --workers 2 \
    --threads 8 \
    --worker-tmp-dir /dev/shm \
    --log-file - \
    --access-logfile - \
    app:app
