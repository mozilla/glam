# BACKEND IMAGE
FROM python:3.10.4-slim AS backend

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
ENV PATH="/venv/bin:$PATH"

# Install a few essentials and clean apt caches afterwards.
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        apt-transport-https build-essential curl git libpq-dev \
        postgresql-client libffi-dev  && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN python -m venv /venv

WORKDIR /app

# We copy the pip requirements first to leverage Docker caching.
COPY ./requirements.txt /app/
RUN pip install -U pip \
    && pip install --no-cache-dir -r requirements.txt

COPY manage.py /app/manage.py
COPY pytest.ini /app/pytest.ini
COPY glam /app/glam
# END BACKEND IMAGE


# FRONTEND BUILDER IMAGE
FROM node:12 AS frontend

RUN apt-get update || : && apt-get install python3 -y
RUN apt-get -y install make

WORKDIR /app

COPY package*.json /app/
RUN npm install
COPY . /app/
RUN npm run build
# END FRONTEND BUILDER IMAGE


# FINAL IMAGE
FROM python:3.10.4-slim AS final

EXPOSE 8000

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
ENV PATH="/venv/bin:$PATH"

WORKDIR /app

COPY --from=backend /app/manage.py /app/manage.py
COPY --from=backend /app/glam/ /app/glam/
COPY --from=backend /venv/ /venv/
COPY --from=frontend /app/public/ /app/public/

CMD exec gunicorn \
    --bind 0.0.0.0:8000 \
    --workers 2 \
    --threads 8 \
    --worker-tmp-dir /dev/shm \
    --log-file - \
    --access-logfile - \
    glam.wsgi:application
# END FINAL IMAGE
