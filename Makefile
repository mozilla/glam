.PHONY: build up shell test

build:
	docker-compose build

up:
	docker-compose up

shell:
	docker-compose run server /bin/bash

test:
	docker-compose run server pytest -s glam/
