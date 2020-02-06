import pytest
from django.contrib.auth.models import AnonymousUser

from glam.auth.drf import OIDCTokenAuthentication


@pytest.fixture(autouse=True)
def enable_db_access_for_all_tests(db):
    pass


@pytest.fixture(autouse=True)
def not_authenticated(monkeypatch):
    monkeypatch.setattr(
        OIDCTokenAuthentication,
        "authenticate",
        lambda self, request: (AnonymousUser(), {"scope": None}),
    )
