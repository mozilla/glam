#!/usr/bin/env bash

set -e  # Exit immediately on error.
set -x  # Echo commands to stdout.

CLUSTER="${CLUSTER:-export-to-firestore-}`date +'%Y%m%d%H%M'`"

# Image version 1.4 includes Python 3.6 by default.
# See: https://cloud.google.com/dataproc/docs/concepts/versioning/dataproc-versions
gcloud dataproc clusters create "$CLUSTER" \
    --image-version 1.4 \
    --num-workers=5 \
    --max-idle=10m \
    --zone us-central1-a \
    --region us-central1 \
    --scopes cloud-platform \
    --metadata='PIP_PACKAGES=google-cloud-firestore==1.4.0 google-cloud-bigquery==1.20.0' \
    --initialization-actions gs://dataproc-initialization-actions/python/pip-install.sh \
    --properties dataproc:dataproc.logging.stackdriver.enable=true \
    --properties dataproc:dataproc.logging.stackdriver.job.driver.enable=true \
    --properties dataproc:dataproc.logging.stackdriver.job.yarn.container.enable=true \
    --properties dataproc:jobs.file-backed-output.enable=true \
    --properties yarn:yarn.log-aggregation-enable=true


gcloud dataproc jobs submit pyspark dataproc.py \
    --cluster="$CLUSTER" \
    --region us-central1 \
    --jars=gs://spark-lib/bigquery/spark-bigquery-latest.jar

