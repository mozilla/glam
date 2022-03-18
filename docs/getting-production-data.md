There are times when you may want to get the production data for a specific
metric into your local development GLAM instance for testing and debugging. This
document describes how to do this.

Note: This requires that someone from devops has enabled you to access the
production Postgresql instance via `gcloud sql`.

Once connected to the production Postgresql instance, determine the SQL SELECT
statement for the rows you would like copied locally. Once you have it you will
select all columns excluding the `id` column. In this example we are using the
metric "a11y_instantiated_flag" from Firefox nightly. Run the `\COPY` command to
output the data from the SELECT statement to a CSV file on your local system.

Example of SQL to be run on the production Postgresql instance:

```sql
\COPY (
  SELECT version, os, build_id, process, metric, metric_key, client_agg_type, metric_type, total_users, histogram, percentiles
  FROM glam_desktop_nightly_aggregation
  WHERE metric='a11y_instantiated_flag'
)
TO 'glam.csv' WITH CSV
;
```

This creates a local CSV file with the data you selected.

Next we create a temporary table to import the data into based on the existing
tables, then dropping the `id` column:

```sql
CREATE TABLE tmpcopy (LIKE glam_desktop_nightly_aggregation);
ALTER TABLE tmpcopy DROP COLUMN id;
```

Once this table is in place, we can import the CSV file into the temporary
table:

```sql
\COPY tmpcopy FROM '/app/glam.csv' WITH (FORMAT CSV);
```

Finally, we copy the data into the aggregation tables, updating any that already
match the constraints.

```sql
INSERT INTO glam_desktop_nightly_aggregation (version, os, build_id, process, metric, metric_key, client_agg_type, metric_type, total_users, histogram, percentiles)
SELECT * FROM tmpcopy
ON CONFLICT ON CONSTRAINT desktop_nightly_unique_dimensions
DO UPDATE SET
  total_users = EXCLUDED.total_users,
  histogram = EXCLUDED.histogram,
  percentiles = EXCLUDED.percentiles
;
```

If you need to test the front-end or the API endpoints, which query the
materliazed view instead of the aggregation tables, refresh the view.

```sql
REFRESH MATERIALIZED VIEW view_glam_desktop_nightly_aggregation;
```
