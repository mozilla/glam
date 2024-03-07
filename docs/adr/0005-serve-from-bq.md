# Use BigQuery for metrics data

-Status: -Deciders: Eduardo Filho, Linh Nguyen, Rob Miller -Date: 2023-01-19

## Context and Problem Statement

Postgres acts as both a historical database and a cache for GLAM aggregated data
processed in BigQuery. We can remove Postgres from the stack and make GLAM serve
data directly from BigQuery, significantly reducing operational burden, reducing
some costs and making data available faster, while maintaining, and possibly
improving, data read performance.

## Decision Drivers

- The data should be efficient to look up and read for the front-end
- The data should be efficient to write for the ETL
- The data should be easy and cost efficient to write and maintain
- The data history should be kept on BigQuery

## Considered Options

- Keep aggregation data in Postgres
- Move aggregation data into a different OLTP system

## Decision Outcome

We decided to move GLAM aggregates from Postgres into BigQuery for historical
and serving purposes. After running a Proof of Concept with properly backfilled
and partitioned tables, it was shown that BigQuery table read times are
comparable (sometimes faster) to current Postgres times for the current volume
of data. Also, updating BigQuery tables takes only 3 minutes at most, compared
to the 15 hours taken by the current glam_glean_imports job that updates
Postgres.

## Pros and Cons of the Options

### Move GLAM aggregates to BigQuery

This idea involves creating GLAM aggregates tables in their final formats (i.e.
ready to be served by GLAM) on BigQuery and replacing Django ORM calls to
Postgres with BigQuery read api calls. The BigQuery tables are updated on a
daily basis from the result tables of GLAM ETL. This is a low-hanging fruit
because of the small amount of changes needed.

#### Pros/Cons

Pro: Serving tables are updated 300x faster (3 minutes vs 15 hours). Pro: GLAM
history of aggregates on BigQuery, making data analysis/debugging/PoC much
easier. Pro: Local/Dev/Stage environments can consume the same data as Prod.
Local environments don’t need to import data locally and always have access to
all the data instead of only 3 last versions. Pro: Data migrations will be much
faster. Pro: No need to get DSRE involved for long-running data migrations.

Con: Some small code changes needed in GLAM. Con: Will lose structured Django
data migration.

### Keep GLAM aggregates in Postgres

Status quo. Pro: Nothing to do Con: Missing out on every pro from Moving GLAM
aggregates to BigQuery

### Move GLAM aggregates to another OLTP system

Investigate different database systems, put together PoCs for each of them and
assess if there’s a better alternative than Postgres.

Pro: We might find something that’s much better for GLAM. Con: Significant
amount of work to set up PoCs for different DB systems. From hosting to table
configuration and optimization, to importing data and connecting to GLAM, this
is not trivial and we didn’t want to spend too much time on this.
