from django.conf import settings
from django.urls import path, re_path
from django.views.generic.base import TemplateView

from .api import views as api_views


spa_view = TemplateView.as_view(
    template_name="index.html",
    extra_context={
        "GA_TRACKING_ID": settings.GA_TRACKING_ID,
    },
)

urlpatterns = [
    path("api/v1/data/", api_views.aggregations, name="v1-data"),
    path("api/v1/metric-keys/", api_views.metric_keys, name="v1-metric-keys"),
    path("api/v1/probes/", api_views.probes, name="v1-probes"),
    path("api/v1/probes/random", api_views.random_probes, name="v1-random-probes"),
    path("api/v1/updates/", api_views.updates, name="v1-updates"),
    path("api/v1/usage/", api_views.usage, name="v1-usage"),
    re_path(r"^.*$", spa_view, name="index"),
]
