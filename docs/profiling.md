# Profiling

If the need to profile the Django app arises, we have done this once and
outlined the following process.

Launch the docker container with ports for local connections:

```
docker-compose run --service-ports server bash
```

Within the docker container launch the `profilingServer.py` file:

```
python -m cProfile -o <profile-file> glam/profilingServer.py
```

Test the app as needed, for example, hit a specific API endpoint with `curl`
or browse the app. When finished, quit the `profilingServer.py` and examine
the profile file using `pstats`:

```
>>> import pstats
>>> s = pstats.Stats("<profile file>")
>>> s.sort_stats("cumtime").print_stats("glam")
```
