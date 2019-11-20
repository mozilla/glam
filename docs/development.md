# Development

GLAM is maintained on GitHub at:

https://github.com/mozilla/glam

GLAM uses Docker for local development and deployment. Please make sure to
install [Docker] and [Docker Compose] on your computer to contribute code
or documentation changes.

[docker]: https://docs.docker.com/engine/installation/#supported-platforms
[docker compose]: https://docs.docker.com/compose/install/

## Configuration

To set the application up, please copy the `.env-dist` file to one named
`.env`.

Set the `DJANGO_SECRET_KEY` variable using the output of the following
command after logging into the Docker container with `make shell`:

```
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

## Initial Setup

When first setting up the project you will need to set up the database and
import data that the front-end is expecting.

First, from the project root, log into the Docker container with `make shell`.

Then run the Django migrations to create the tables:

```
./manage.py migrate
```

To gather the probe data that populates the probe API, run the following:

```
./manage.py import_probes
```

The aggregations table depends on having separate tables for each version of
a product and channel. The following command will ensure those tables are
created based on the latest Firefox versions:

```
./manage.py create_version_partitions
```

The last step is to populate the aggregation tables with data. To do this,
reach out to someone on the #glam Slack channel to help you get a CSV file
for import. Once you have it, from `make shell` log in to the Postgresql
database via `./manage.py dbshell` and run the following command, replacing
`<filename>` with the path to the file on your local system:

```
\copy aggregation (channel, version, agg_type, os, build_id, metric, metric_key, client_agg_type, metric_type, total_users, data) FROM <filename> WITH CSV;
```

## Starting the server

To start the application, run:

```
make up
```

The GLAM server is now running at http://localhost:8000. You can hit API
endpoints with `curl` like this example:

```
curl -s -X POST -H "Content-Type: application/json" http://localhost:8000/api/v1/data/ -d '{"query": {"channel": "nightly", "versions": ["70"], "probe": "gc_ms","aggregationLevel": "version"}}' | python -m json.tool
```

## Starting the front-end

To build and run the front-end, run the following command on your computer
(not in the docker container) at the root of the repository:

```
npm run dev
```

Once finished open the website at http://localhost:5000 to start browsing.

## Run the tests

To run the GLAM server test suite, run the following command:

```
make test
```

This will spin up a Docker container to run the tests, so please set up the
development setup first.

The default options for running the test are in `pytest.ini`. This is a
good set of defaults.

Alternatively, e.g. when you want to only run part of the tests first open a
console to the web container..

```
make shell
```

and then run pytest directly:

```
pytest
```

Some helpful command line arguments to pytest (won't work on `make test`):

`--pdb`:
Drop into pdb on test failure.

`--create-db`:
Create a new test database.

`--showlocals`:
Shows local variables in tracebacks on errors.

`--exitfirst`:
Exits on the first failure.

See `pytest --help` for more arguments.
