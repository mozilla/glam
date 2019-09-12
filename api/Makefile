.PHONY: build run shell gcrbuild gcrdeploy

export PORT=8000

build:
	docker-compose build

run:
	docker-compose up

shell:
	docker-compose run api /bin/bash

gcrbuild:
	gcloud builds submit --tag gcr.io/mdv2-test-244418/mdv2-api

gcrdeploy:
	gcloud beta run deploy --image gcr.io/mdv2-test-244418/mdv2-api --platform managed
