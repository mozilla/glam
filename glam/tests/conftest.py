import os
import pytest


@pytest.fixture(autouse=True)
def enable_db_access_for_all_tests(db):
    pass


def pytest_configure(config):
    os.environ["PYTEST_RUNNING"] = "true"


def pytest_unconfigure(config):
    os.environ.pop("PYTEST_RUNNING")
