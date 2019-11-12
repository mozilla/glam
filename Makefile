.PHONY: build shell test

build:
	docker-compose build

shell:
	docker-compose run server /bin/bash

test:
	docker-compose run server pytest -s server/tests/
