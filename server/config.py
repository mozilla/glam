class Config:
    APP_NAME = "GLAM (-)"

    DEBUG = False
    TESTING = False
    SECRET_KEY = "base"  # Change in subclasses.

    SQLALCHEMY_ECHO = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = "sqlite://"


class ProductionConfig(Config):
    APP_NAME = "GLAM (prod)"


class StagingConfig(Config):
    APP_NAME = "GLAM (stage)"


class DevConfig(Config):
    APP_NAME = "GLAM (dev)"


class LocalConfig(Config):
    APP_NAME = "GLAM (local)"

    DEBUG = True
    SECRET_KEY = "local-dev"
    SQLALCHEMY_DATABASE_URI = "postgres://postgres@db/postgres"
    SQLALCHEMY_ECHO = True


class TestingConfig(Config):
    APP_NAME = "GLAM (testing)"

    DEBUG = True
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"


# Set the `FLASK_CONFIG` environment variable to one of these keys.
configs = {
    "prod": ProductionConfig,
    "stage": StagingConfig,
    "dev": DevConfig,
    "local": LocalConfig,
    "test": TestingConfig,
}
