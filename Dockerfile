# BACKEND IMAGE
FROM python:3.10.6-slim AS backend

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
ENV PATH="/venv/bin:$PATH"

# Install a few essentials and clean apt caches afterwards.
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        apt-transport-https \
        build-essential \
        curl \
        git \
        libpq-dev \
        postgresql-client \
        libffi-dev && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN python -m venv /venv

WORKDIR /app

# We copy the pip requirements first to leverage Docker caching.
COPY ./requirements.txt /app/
RUN pip install -U pip \
    && pip install --no-cache-dir -r requirements.txt

COPY . /app/
# END BACKEND IMAGE


# FRONTEND BUILDER IMAGE
FROM node:18 AS frontend

RUN apt-get update || : && apt-get install python3 -y
RUN apt-get -y install make

WORKDIR /app

COPY package*.json /app/
RUN npm install
COPY . /app/
RUN npm run build

ENTRYPOINT [ "npm", "run" ]
CMD [ "test" ]
# END FRONTEND BUILDER IMAGE


FROM python:3.10.6-slim AS final

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        make && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
ENV PATH="/venv/bin:$PATH"
ENV PORT=8000

EXPOSE ${PORT}

# add a non-privileged user for running the application
RUN groupadd --gid 10001 app && \
    useradd -g app --uid 10001 --shell /usr/sbin/nologin --create-home --home-dir /app app
WORKDIR /app

COPY --from=backend /app/ /app/
COPY --from=backend /venv/ /venv/
COPY --from=frontend /app/public/ /app/public/

USER app
CMD exec gunicorn \
    --workers 2 \
    --threads 8 \
    --worker-tmp-dir /dev/shm \
    --log-file - \
    --access-logfile - \
    glam.wsgi:application
