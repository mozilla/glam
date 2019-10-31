import pytest

from server import create_app, db as _db


@pytest.fixture
def app():
    # For testing, ensure that FLASK_CONFIG=test is set in the environment.
    return create_app("test")


@pytest.fixture
def db(app):

    _db.init_app(app)
    _db.create_all()

    yield _db

    _db.drop_all()
