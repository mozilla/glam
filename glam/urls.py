from django.conf import settings
from django.urls import path
from django.views.generic.base import TemplateView

from .api import views as api_views
from .auth import views as auth_views


urlpatterns = [
    path(
        "",
        TemplateView.as_view(
            template_name="index.html",
            extra_context={
                "GA_TRACKING_ID": settings.GA_TRACKING_ID,
            }
        ),
        name="index"
    ),
    path("api/v1/data/", api_views.aggregations, name="v1-data"),
    path("api/v1/probes/", api_views.probes, name="v1-probes"),
    path("api/v1/probes/random/", api_views.random_probes, name="v1-random-probes"),
    path("api/v1/updates/", api_views.updates, name="v1-updates"),
    path(
        "api/v1/front-end-auth-config/",
        auth_views.front_end_auth_config,
        name="v1-front-end-auth-config",
    ),
]
