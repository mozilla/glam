# Development

GLAM is maintained on GitHub at:

https://github.com/mozilla/glam

To install a local copy of GLAM, you need:

- [Python](https://www.python.org/) (version 3.8+)
- [node.js](https://nodejs.org/) (version 12+)
- [npm](https://docs.npmjs.com/cli/v7/commands/npm) (v7+): run
  `npm install -g npm@latest` to upgrade to the latest npm
- [Docker](https://www.docker.com/): GLAM uses Docker for local development and
  deployment. Please make sure to install [Docker] and [Docker Compose] on your
  computer to contribute code or documentation changes. Note that GLAM requires
  a fair bit of disk space-- if you're using Docker for Mac, you might want to
  increase the allocation of disk space to the Docker virtual machine to at
  least 100G (via Preferences -> Resources -> Advanced).

[docker]: https://docs.docker.com/engine/installation/#supported-platforms
[docker compose]: https://docs.docker.com/compose/install/

## Configuration

To set the application up, please copy the `.env-dist` file to one named `.env`.

Set the `DJANGO_SECRET_KEY` and `NGINX_SESSION_SECRET` variables using the
output of running the following command twice, after logging into the Docker
container with `make shell`:

```
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

Reach out to someone on the [#datatools](https://matrix.to/#/#datatools:mozilla.org) or #glam Slack channel for the values of the
`GOOGLE_CLOUD_PROJECT` and `OIDC_CLIENT_ID` variables.

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

The next step requires viewer permissions in the non-prod GCP project, please
reach out to someone on the [#datatools](https://matrix.to/#/#datatools:mozilla.org) or #glam Slack channel if you need the proper
authorization. First, log in to GCP or reauthenticate via
[gcloud](https://cloud.google.com/sdk/gcloud/reference/auth/application-default/login)
(outside of the Docker container):

```
gcloud auth application-default login
```

Then, populate the aggregation tables with data from desktop Firefox:

```bash
./manage.py import_desktop_aggs <CHANNEL>
```

where `CHANNEL` is one of `nightly`, `beta`, or `release`.

You can also import data from a custom bucket using the bucket argument.
Remember to set the project accordingly:

```
gcloud auth login --update-adc
```

## Starting the server

To start the application, run:

```
make up
```

This will launch 2 servers:

- http://localhost:3000 is an nginx server configured to authenticate via
  Mozilla's auth0 backend and will proxy GLAM.
- http://localhost:8000 is the Django server that contains the API endpoints and
  serves up the front-end HTML and static assets.

See below for building the front-end Javascript and other static assets.

With these servers running you can, e.g., query the data via `curl`:

```
curl -s -X POST -H "Content-Type: application/json" http://localhost:8000/api/v1/data/ -d '{"query": {"channel": "nightly", "versions": ["70"], "probe": "gc_ms", "aggregationLevel": "version"}}' | python -m json.tool
```

## Building the front-end

The front-end is installed and run on the host system, not in the Docker
container.

To build the front-end, make sure you've installed the npm packages:

```
npm install
```

Then, run the following command:

```
npm run dev
```

This will build and live reload changes as they're made while developing.

## Updating Python dependencies

Python dependencies are maintained in the `requirements.in` file and “compiled”
with hashes and dependencies of dependencies in the `requirements.txt`.

To add a new dependency, add it to the file `requirements.in` and then do
`pip-compile`.

Then, rebuild your Docker environment with `make build`.

After the image is built successfully, you can restart the Docker image with
`make up` and the new dependency should be available.

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
(front-end), and `make format` and `make test` (back-end), before sharing your
code to be sure that you didn't miss anything. Also, be aware that Prettier and
its plugins can rarely break existing code. You may want to double-check that
everything works after running `npm run format` just in case.

## Linting

To test whether the code conforms to the style rules, you can run:

- `npm run format` and `npm test` for front-end code

- `make format` and `make test` for back-end code

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
