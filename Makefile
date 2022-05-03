.PHONY: build up shell test

build:
	docker-compose build

up:
	docker-compose up

shell:
	docker-compose run --rm server /bin/bash

format:
	python3 -m black glam ./*.py
	python3 -m flake8 glam ./*.py

lint:
	python3 -m flake8 --max-line-length 100 .
	python3 -m black --check glam ./*.py

test: lint
	docker-compose run --rm server pytest -s --dc=Test glam/
