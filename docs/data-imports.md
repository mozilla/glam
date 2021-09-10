# Data Imports

The data imports pick up where the ETL leaves off by copying and importing the
CSV files into the Postgresql database. This document describes that process in
more detail and also some of the schema choices that were made to optimize the
imports for speed.

The examples below will use Firefox on Android as the example, as it is a Glean
based product and will be the example for future products in GLAM going forward.

## Schema

The Firefox for Desktop (aka fenix) product has 2 tables assocated with its
data. The aggregation table and the materialized view on top of that data.

### The aggregation table

The aggregation table exists so imports can be as fast as possible. It has
minimal indexes and constraints so data can import quickly. The only index is
the primary key `id`. The only constraint is a unique constraint comprised of
the dimensions of the data (e.g. channel, build ID, metric, etc.) so that we can
assure we have only 1 row across these dimensions. This unique constraint is
also used in the "upsert" during the imports so that if new data comes in that
doesn't have a unique constraint conflict we insert it, or if a matching record
exists across these dimensions we update the data. The data in this context
means the columns: `total_users`, `histogram`, and `percentiles`. Once a row
exists these columns will be updated daily as new data gets aggregated and the
values change.

### The materialized view

The materialized view exists so the API queries are as fast as possible. It is a
direct copy of the aggregation table but with added indexes, roughly to match
the top level selectors in GLAM, which end up being SQL `WHERE` clauses. These
extra indexes improve the speed of these `WHERE` clauses. Since the materialized
view has indexes, refreshing it is time and resource intensive, but it is
performed `CONCURRENTLY` so that the API still functions while it is being
refreshed.

The SQL to create the materialized view is part of the Django migrations system
and is raw SQL, since Django doesn't have a direct way to model these in Python.
An example file is found
[here](https://github.com/mozilla/glam/blob/main/glam/api/migrations/0012_fenix_views.py).

Firefox for Desktop is similar to the above except we break down the data
further by channel due to the size of the data, so each channel has the above
described two tables each.

## CSV imports

The import process kicks off via the Django management commands. For Firefox for
Android the execution looks like:

    python manage.py import_glean_aggs nightly

Follow along with the management command
[here](https://github.com/mozilla/glam/blob/main/glam/api/management/commands/import_glean_aggs.py).

The following are the steps that the imports follow to import the data:

- **Create a list of files** to import by pattern matching all files in the GCS
  bucket, matching for Fenix and the app ID. In the code we call these `blobs`.
- For each file:
  - we **create a temporary table**, download the blob, then call the
    `import_file` function, which:
    - **loads the CSV data** into this temporary table using the Postgresql
      `COPY` command, which is the fastest method to get CSV data into the
      database, then
    - **performs an "upsert"** to quickly move the data into the main
      aggregation table
- Once all files have been imported, we **refresh the materialized view** so the
  new data is shared via the API
