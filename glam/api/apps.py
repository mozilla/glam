import logging
import threading

from django.apps import AppConfig


logger = logging.getLogger(__name__)


class ApiConfig(AppConfig):
    name = "glam.api"

    def ready(self):
        # First BigQuery + Storage Read calls after process boot pay gRPC
        # channel, auth, and credential-refresh setup. Warm both off-thread by
        # running a trivial query and reading its result via the Storage API.
        threading.Thread(target=self._prewarm_bq, daemon=True).start()

    @staticmethod
    def _prewarm_bq():
        try:
            from glam.api.views import get_bq_client, get_bq_storage_client
            client = get_bq_client()
            bqstorage = get_bq_storage_client()
            row_iter = client.query("SELECT 1 AS x").result()
            list(row_iter.to_arrow_iterable(bqstorage_client=bqstorage))
        except Exception as exc:
            logger.warning("BigQuery client pre-warm failed: %s", exc)
