import logging

from django.apps import AppConfig


logger = logging.getLogger("django")


class GlamAppConfig(AppConfig):
    name = "glam"

