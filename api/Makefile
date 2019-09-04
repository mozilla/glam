.PHONY: build run shell gcrbuild gcrdeploy

export PORT=8000

build:
	docker build -t mdv2-api:latest .

run:
	docker run -ti --rm \
   -p 8000:${PORT} \
   -e PORT=${PORT} \
   -e GOOGLE_APPLICATION_CREDENTIALS=/tmp/gcp-app-creds.json \
   -v ${PWD}/gcp-app-creds.json:/tmp/gcp-app-creds.json:ro \
   mdv2-api

shell:
	docker run -ti --rm \
   -p 8000:${PORT} \
   -e PORT=${PORT} \
   -e GOOGLE_APPLICATION_CREDENTIALS=/tmp/gcp-app-creds.json \
   -v ${PWD}/gcp-app-creds.json:/tmp/gcp-app-creds.json:ro \
   mdv2-api \
   /bin/bash

gcrbuild:
   gcloud builds submit --tag gcr.io/mdv2-test-244418/mdv2-api

gcrdeploy:
   gcloud beta run deploy --image gcr.io/mdv2-test-244418/mdv2-api --platform managed
