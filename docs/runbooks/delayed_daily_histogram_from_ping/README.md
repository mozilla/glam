# Runbook: GLAM fog metrics histogram gap

To be followed when a *daily* histogram table is delayed. I do not recommend reading this Runbook if we don't get the BigEye alert below, since the root cause for this error was likely [fixed](https://github.com/mozilla/bigquery-etl/pull/9775), but if for some reason it happens again, the alert for a delayed table will sent by BigEye on the #glam-dev Slack channel and will look like:
```
As of <some_date_time>, <table> is delayed. It was expected to load by <same_date_but_later_time> and is now <an_amount_of> hours delayed
```

This runbook will use `firefox_desktop__clients_daily_histogram_aggregates_metrics_v1` as the example table, because this is the table that failed freshness for the 3 times we had this issue.

In case the same error happens for a `scalar` table, the steps here also apply with the only caveat being `release` will follow the same steps as `nightly` and `beta`, so it's actually easier.

## Symptom

The daily partition of `firefox_desktop__clients_daily_histogram_aggregates_metrics_v1`
is empty for one submission_date, and the `glam_fog` run for that date was green.
Scalars are fine. Only `ping_type = 'metrics'` is missing.

## Cause

The histogram generator in `generate_glean_sql` looks up metric metadata in the Glean
Dictionary. A network timeout made it exit non-zero. `write_histograms` treated any
non-zero exit as "this ping has no probes" and deleted the generated query directory.
`run_glam_sql` then had nothing to run, the pod exited 0, and the task went green.

Both problems are already fixed in `script/glam/generate_glean_sql` (non-zero now fails
the script, `wait_for_pids` propagates background failures) and
`bigquery_etl/glam/utils.py` (`_get_with_retries`). Check those first if it happens again.

## Why you cannot just re-run the DAG

`*__clients_histogram_aggregates_v1` is partitioned by `sample_id`, keeps no date history,
and is overwritten in place. Its merge filters the accumulated side by a build-date window
relative to `@submission_date`. So:

- Re-running at the old date drops every build newer than that window.
- Replaying from the old date to today double counts the days already merged.

Instead: rebuild only the missing day's metrics delta, then merge it in with the
accumulated-side window pinned to `CURRENT_DATE()`. The merge adds counts together, and
that day's metrics were never added, so nothing is double counted.

## Channels

| Channel | Fix |
|---|---|
| nightly | Step 4 |
| beta | Step 4 |
| release | Step 4-R |

All three need fixing. Release has its own steps because its merge reads a clone of the
table instead of the table itself.

You need an environment with `moz-fx-glam-prod` billing and the
`moz-fx-bigquery-reserv-global:US.glam` reservation.

Run the commands from this folder. Paths starting with `script/` or `sql/` are relative to
the bigquery-etl root, so run those from there.

```bash
export SUBMISSION_DATE=YYYY-MM-DD   # the missing day
export DATE_TAG=${SUBMISSION_DATE//-/}
```

---

## Step 0: confirm the gap

```sql
SELECT submission_date, COUNT(*) AS rows
FROM `moz-fx-glam-prod.glam_etl.firefox_desktop__clients_daily_histogram_aggregates_metrics_v1`
WHERE submission_date BETWEEN DATE_SUB(@submission_date, INTERVAL 7 DAY)
                          AND DATE_ADD(@submission_date, INTERVAL 1 DAY)
GROUP BY submission_date
ORDER BY submission_date;
```

The bad day has 0 rows or is missing. The days around it do not.

## Step 1: rebuild the daily partition

Simply re-run `daily_firefox_desktop`

## Step 2 (optional): write down the numbers before you change anything

Run this for nightly, beta and release:

```sql
SELECT ping_type, COUNT(*) AS rows,
       SUM((SELECT SUM(v.value) FROM UNNEST(histogram_aggregates) ha, UNNEST(ha.value) v)) AS total_counts
FROM `moz-fx-glam-prod.glam_etl.firefox_desktop_glam_nightly__clients_histogram_aggregates_v1`
WHERE ping_type IN ('metrics', 'health')
GROUP BY ping_type;
```

`health` is the control ping. It should not change.

For release, add `AND sample_id BETWEEN 0 AND 4` so you scan a slice instead of 38 TB, and
compare the same slice afterwards. Also run `SELECT COUNT(*)` on the release table, which is
free, and keep the number for Step 6.

## Step 3: back up the tables

These are clones. They share storage with the original, so they are instant and cost almost
nothing.

```bash
for CH in nightly beta release; do
  bq query --use_legacy_sql=false --project_id=moz-fx-glam-prod \
    "CREATE OR REPLACE TABLE \`moz-fx-glam-prod.glam_etl.firefox_desktop_glam_${CH}__clients_histogram_aggregates_v1_bak_${DATE_TAG}\`
     CLONE \`moz-fx-glam-prod.glam_etl.firefox_desktop_glam_${CH}__clients_histogram_aggregates_v1\`"
done
```

Delete the clones once Step 6 passes.

## Step 4: nightly and beta

```bash
for CH in nightly beta; do
  # 4a: build the missing day's metrics delta into _new_v1
  bq query --use_legacy_sql=false --replace \
    --project_id=moz-fx-glam-prod --dataset_id=moz-fx-glam-prod:glam_etl \
    --destination_table=firefox_desktop_glam_${CH}__clients_histogram_aggregates_new_v1 \
    --parameter=submission_date:DATE:$SUBMISSION_DATE \
    --reservation_id=moz-fx-bigquery-reserv-global:US.glam \
    < firefox_desktop_glam_${CH}__step1_delta.sql

  # 4b: merge the delta into _v1 (this query takes no parameters)
  bq query --use_legacy_sql=false --replace \
    --project_id=moz-fx-glam-prod --dataset_id=moz-fx-glam-prod:glam_etl \
    --destination_table=firefox_desktop_glam_${CH}__clients_histogram_aggregates_v1 \
    --reservation_id=moz-fx-bigquery-reserv-global:US.glam \
    < firefox_desktop_glam_${CH}__step2_merge.sql
done
```

Notes:

- `--replace` in 4a is correct. `_new_v1` is scratch and the scheduled run overwrites it
  every day. Only 4b writes `_v1`.
- Run 4a and 4b back to back, and not while `glam_fog` is running. If a scheduled run lands
  between them, run 4a again, because it overwrote `_new_v1`.
- Nothing to clean up. The next scheduled run overwrites `_new_v1`.
- These queries keep versions `latest_version - 3 + 1` through `latest_version`. If the major
  version changed between the missing day and today, the delta and the accumulated side use
  different windows. Check the version spread in `_new_v1` before running 4b.

## Step 4-R: release

Release needs the same merge into
`firefox_desktop_glam_release__clients_histogram_aggregates_v1`. Two differences:

- The merge reads the accumulated side from `..._clients_histogram_aggregates_snapshot_v1`.
  That table is a clone of `_v1`, remade on every `glam_fog` run by
  `sql/moz-fx-glam-prod/glam_etl/firefox_desktop_glam_release__clients_histogram_aggregates_snapshot_v1/init.sql`.
  `_v1` is still the table that matters. Fix it there and the next clone carries the fix.
- `_v1` is written in 5 `sample_id` chunks and the first chunk uses `--replace`, which empties
  the table. So the merge cannot read `_v1` while writing it. It reads the clone instead.
  Refresh the clone first.

```bash
CH=release

# 4-R.a: refresh the clone from the current _v1 (instant, no data is copied)
bq query --use_legacy_sql=false --project_id=moz-fx-glam-prod \
  < sql/moz-fx-glam-prod/glam_etl/firefox_desktop_glam_release__clients_histogram_aggregates_snapshot_v1/init.sql

# 4-R.b: build the missing day's metrics delta into _new_v1
bq query --use_legacy_sql=false --replace \
  --project_id=moz-fx-glam-prod --dataset_id=moz-fx-glam-prod:glam_etl \
  --destination_table=firefox_desktop_glam_${CH}__clients_histogram_aggregates_new_v1 \
  --parameter=submission_date:DATE:$SUBMISSION_DATE \
  --reservation_id=moz-fx-bigquery-reserv-global:US.glam \
  < firefox_desktop_glam_${CH}__step1_delta.sql

# 4-R.c: merge clone + delta into _v1, one chunk at a time, in this order
for RANGE in "0 2" "3 5" "6 9" "10 49" "50 99"; do
  MIN=${RANGE% *}; MAX=${RANGE#* }
  if [ "$MIN" = "0" ]; then WRITE="--replace"; else WRITE="--append_table --noreplace"; fi
  bq query --use_legacy_sql=false $WRITE \
    --project_id=moz-fx-glam-prod --dataset_id=moz-fx-glam-prod:glam_etl \
    --destination_table=firefox_desktop_glam_${CH}__clients_histogram_aggregates_v1 \
    --parameter=min_sample_id:INT64:$MIN --parameter=max_sample_id:INT64:$MAX \
    --reservation_id=moz-fx-bigquery-reserv-global:US.glam \
    < firefox_desktop_glam_${CH}__step2_merge.sql
done
```

Notes:

- Do not run the chunks in parallel and do not skip 4-R.a. If the clone is stale, the merge
  writes old data into `_v1` and rolls the channel back to whenever the clone was taken.
- `_v1` is incomplete from the moment the first chunk starts until the last one finishes.
  It is about 918M rows and 38 TB scanned in total. The daily DAG does the same thing, so
  this is normal, but do not start it close to the `glam_fog` run. If a chunk fails, restore
  `_v1` from the Step 3 clone and start again from 4-R.a.
- The ranges are only chunking. Any split works as long as it covers 0 to 99 once. These are
  the ones the DAG uses.

## Step 5: let the scheduled runs pick it up

Do not re-run the export by hand. Everything downstream is rebuilt from the accumulator, so
the normal schedule publishes the fix:

- nightly and beta: the next daily `glam_fog` run, 02:00 UTC.
- release: the next `glam_fog_release` run, Saturday 10:00 UTC.

So finish Step 4 before the end of the day for nightly and beta, and before Saturday for
release. If you miss the window, the fix still sits in the accumulator and goes out on the
following run. Nothing is lost.

## Step 6: verify

Run the Step 2 query again for each channel. `metrics` rows and `total_counts` should go up.
`health` should be the same.

For release, also check that all 100 sample ids are there and the row count is close to what
you wrote down in Step 2. A short table means a chunk was skipped or run twice:

```sql
SELECT COUNT(*) AS rows, COUNT(DISTINCT sample_id) AS sample_ids
FROM `moz-fx-glam-prod.glam_etl.firefox_desktop_glam_release__clients_histogram_aggregates_v1`;
```

To roll a channel back:

```bash
bq query --use_legacy_sql=false --project_id=moz-fx-glam-prod \
  "CREATE OR REPLACE TABLE \`moz-fx-glam-prod.glam_etl.firefox_desktop_glam_${CH}__clients_histogram_aggregates_v1\`
   CLONE \`moz-fx-glam-prod.glam_etl.firefox_desktop_glam_${CH}__clients_histogram_aggregates_v1_bak_${DATE_TAG}\`"
```

Check the served data in GLAM after the scheduled run from Step 5 finishes.

---

## A different ping is missing

The only metrics-specific part is `WHERE ping_type = 'metrics'` at the end of
`step1_delta.sql`. Change that and leave everything else alone.
