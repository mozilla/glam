FROM python:3.7-slim
LABEL maintainer="Rob Hudson <robhudson@mozilla.com>"

WORKDIR /app

# We copy the pip requirements first to leverage Docker caching.
COPY ./requirements.txt /app/
RUN pip install -U pip && pip install -r requirements.txt

COPY app.py /app/

CMD exec /usr/local/bin/gunicorn \
     --bind 0.0.0.0:${PORT} \
     --workers 2 \
     --threads 8 \
     --worker-tmp-dir /dev/shm \
     --log-file - \
     --access-logfile - \
     app:app
