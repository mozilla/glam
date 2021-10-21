# Use files for metrics data

- Status: rejected
- Date: 2020 (this ADR was backfilled for historical purposes)

## Context and Problem Statement

The GLAM data consists mainly of a histogram, percentiles, and counts for each
set of dimensions. This can be stored in a file whose path and name can
represent the dimensions and whose content can contain the actual data.

## Decision Drivers

- The data should be efficient to look up and read for the front-end
- The data should be efficient to write for the ETL
- The data should be cost efficient to write and maintain

## Considered Options

- Move aggregation data, the output from the ETL, into a Postgresql database
- Move aggregation data into another file format more usable for the GLAM
  front-end

## Decision Outcome

Moving the data into Postgresql was chosen, as outlined in the pros/cons below.
To summarize, the need to update the file as new aggregation data was produced
for the same set of dimensions causes a file based approach to be more complex
and something databases were created to solve.

The SQL approach of `INSERT ... ON CONFLICT DO UPDATE ...` accomplishes this
well.

## Pros and Cons of the Options

### File based aggregate storage

The idea is we would write a JSON file based on path so the files all live on
cloud storage and no interim database is required.

An example implementation using SQLite as an intermediate table to make the
grouping by dimensions simpler:

```python
# To generate an sqlite3 table from a GLAM CSV, do something like:
# cat glam-file-XXX.csv.gz |gunzip | sqlite3 -csv -separator ',' glam.db '.import /dev/stdin glam'
# This script runs *much* faster if you create an index on the table:
# create index metrics_index on glam(metric, channel, process, os)

import json
import os
import sqlite3

sqliteConnection = sqlite3.connect('glam.db')
cursor1 = sqliteConnection.cursor()
cursor2 = sqliteConnection.cursor()

for (metric, channel, process, operating_system) in cursor1.execute("SELECT distinct metric, channel, process, os from glam"):
    outdir = os.path.join('data', metric, channel, process, operating_system)
    os.makedirs(outdir, exist_ok=True)
    aggregates = cursor2.execute(
      "SELECT app_build_id, aggregates from glam where metric=? AND channel=? AND process=? AND os=?",
      (metric, channel, process, operating_system)
    ).fetchall()
    open(os.path.join(outdir, 'data.json'), 'w').write(json.dumps(aggregates))
```

#### Pros/cons:

- Pro: This could be a simpler local dev set up.
- Pro: This could improve the slow import times due to the materialized view.
- Pro: This could make adding new products to glam a bit simpler -- no need to
  create new Django models.
- Con: Since data outside the range of the ETL needs to be kept, this can't be a
  simple write operation -- the fresh data needs to be added or updated while
  keeping older data and the resulting data needs to be written out. This
  complicates the file based architecture.

### Database aggregate storage

With this approach we would write the data to an unindexed Postgresql table to
maintain the speed of the imports, and refresh a materialized view of the same
data but with indexes to make querying the data from the API fast.

- Pro: This is already written.
- Pro: Handles the data updating case easily since it's a database.
- Con: The imports are slow due to the size of the data and the materialized
  view.
