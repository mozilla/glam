# Development

GLAM is maintained on GitHub at:

https://github.com/mozilla/glam

GLAM uses Docker for local development and deployment. Please make sure to
install [Docker] and [Docker Compose] on your computer to contribute code or
documentation changes.

[docker]: https://docs.docker.com/engine/installation/#supported-platforms
[docker compose]: https://docs.docker.com/compose/install/

## Configuration

To set the application up, please copy the `.env-dist` file to one named `.env`.

Set the `DJANGO_SECRET_KEY` variable using the output of the following command
after logging into the Docker container with `make shell`:

```
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

Reach out to someone on the #glam Slack channel for the values of
`GOOGLE_CLOUD_PROJECT` and `AUTH0_*` variables.

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

The last step is to populate the aggregation tables with data from desktop
Firefox:

```bash
./manage.py import_desktop_aggs <CHANNEL>
```

where `CHANNEL` is one of `nightly`, `beta`, or `release`.

You can also import data from a custom bucket using the bucket argument.
Remember to set the project accordingly:

```bash
export GOOGLE_CLOUD_PROJECT=<PROJECT>
./manage.py import_desktop_aggs release --bucket <BUCKET>
```

You will need to have viewer permissions in the non-prod GCP project to pull
down data. Reach out to someone on the #glam Slack channel if you need the
proper authorization.

Data from glean may be pulled down using the following command:

```bash
./manage.py import_glean_aggs <PRODUCT>
```

## Starting the server

To start the application, run:

```
make up
```

The GLAM server is now running at http://localhost:8000. You can hit API
endpoints with `curl` like this example:

```
curl -s -X POST -H "Content-Type: application/json" http://localhost:8000/api/v1/data/ -d '{"query": {"channel": "nightly", "versions": ["70"], "probe": "gc_ms", "aggregationLevel": "version"}}' | python -m json.tool
```

## Starting the front-end

To build and run the front-end, run the following command on your computer (not
in the docker container) at the root of the repository:

```
npm run dev
```

Once finished open the website at http://localhost:5000 to start browsing.

## Code quality

To automatically benefit from the code quality tools that are included with this
project, use an editor (such as
[Visual Studio Code](https://code.visualstudio.com/)) with plugins for
[EditorConfig](https://editorconfig.org/), [ESLint](https://eslint.org/),
[Prettier](https://prettier.io/), and [Svelte](https://svelte.dev/).

When installed correctly, these plugins will warn you when your code contains
potential problems or when it's formatted inconsistently. If you choose to, you
can also configure your editor to automatically format files with Prettier upon
save.

Even with these plugins, you may want to run `npm run format` and `npm test`
before sharing your code to be sure that you didn't miss anything. Also, be
aware that Prettier and its plugins can rarely break existing code. You may want
to double-check that everything works after running `npm run format` just in
case.

## Resetting the database

Often for local development it's nice to delete all the data and perform a clean
import. Probably the easiest way to achieve this is to delete the database
Docker container and start over. Here are the steps.

Stop the Docker processes and remove the database container. This will ask you
to confirm.

```
docker-compose stop
docker-compose rm db
```

Drop into the shell and run all migrations to recreate the database tables.

```
make shell
./manage.py migrate
```

At this point you have the table schemas but no data. Run the imports, including
the probe imports, as documented above.

## Run the tests

To run the GLAM server test suite, run the following command:

```
make test
```

This will spin up a Docker container to run the tests, so please set up the
development setup first.

The default options for running the test are in `pytest.ini`. This is a good set
of defaults.

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

`--pdb`: Drop into pdb on test failure.

`--create-db`: Create a new test database.

`--showlocals`: Shows local variables in tracebacks on errors.

`--exitfirst`: Exits on the first failure.

See `pytest --help` for more arguments.
