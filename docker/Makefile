.PHONY: build run shell


build:
	docker build -t mdv2 .

run:
	docker run -v ${PWD}/gcp-creds.json:/tmp/gcp-creds.json -e GOOGLE_APPLICATION_CREDENTIALS=/tmp/gcp-creds.json -ti --rm mdv2

shell:
	docker run -ti --rm mdv2 /bin/bash
