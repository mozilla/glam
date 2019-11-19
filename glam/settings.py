"""
Django settings for glam.

For more information on this file, see
https://docs.djangoproject.com/en/1.9/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.9/ref/settings/
"""
import os
from datetime import datetime, timedelta, timezone

from configurations import Configuration, values
from dockerflow.version import get_version


class Core(Configuration):
    """Configuration that will never change per-environment."""

    #: The directory in which the settings file reside.
    THIS_DIR = os.path.dirname(os.path.abspath(__file__))
    #: Build paths inside the project like this: os.path.join(BASE_DIR, ...)
    BASE_DIR = os.path.dirname(THIS_DIR)

    #: The current GLAM version.
    VERSION = get_version(BASE_DIR)

    #: Using the default first site found by django.contrib.sites
    SITE_ID = 1

    #: The installed apps.
    INSTALLED_APPS = [
        # Run whitenoise with runserver
        "whitenoise.runserver_nostatic",
        # Project specific apps
        "glam.apps.GlamAppConfig",
        "glam.api",
        # Third party apps
        "dockerflow.django",
        # Django apps
        "django.contrib.admin",
        "django.contrib.auth",
        "django.contrib.contenttypes",
        "django.contrib.sessions",
        "django.contrib.messages",
        "django.contrib.staticfiles",
        # needs to load after django.contrib.auth
        # "mozilla_django_oidc",
    ]

    MIDDLEWARE = [
        "django.middleware.security.SecurityMiddleware",
        "whitenoise.middleware.WhiteNoiseMiddleware",
        "dockerflow.django.middleware.DockerflowMiddleware",
        "django.contrib.sessions.middleware.SessionMiddleware",
        "django.middleware.common.CommonMiddleware",
        "django.middleware.csrf.CsrfViewMiddleware",
        "django.contrib.auth.middleware.AuthenticationMiddleware",
        "django.contrib.messages.middleware.MessageMiddleware",
        "django.middleware.clickjacking.XFrameOptionsMiddleware",
    ]

    ROOT_URLCONF = "glam.urls"

    WSGI_APPLICATION = "glam.wsgi.application"

    DEFAULT_FROM_EMAIL = "telemetry-alerts@mozilla.com"

    AUTHENTICATION_BACKENDS = ("django.contrib.auth.backends.ModelBackend",)

    # Internationalization
    # https://docs.djangoproject.com/en/1.9/topics/i18n/
    LANGUAGE_CODE = "en-us"
    TIME_ZONE = "UTC"
    USE_I18N = False
    USE_L10N = False
    USE_TZ = True
    DATETIME_FORMAT = "Y-m-d H:i"  # simplified ISO format since we assume UTC

    STATICFILES_DIRS = [
        os.path.join(BASE_DIR, "public"),
    ]
    STATIC_ROOT = values.Value(default=os.path.join(BASE_DIR, "public", "static"))
    STATIC_URL = "/static/"

    # the directory to have Whitenoise serve automatically on the root of the URL
    WHITENOISE_ROOT = STATIC_ROOT

    SILENCED_SYSTEM_CHECKS = [
        # We can't set SECURE_HSTS_INCLUDE_SUBDOMAINS since this runs under a
        # mozilla.org subdomain
        "security.W005",
        "security.W009",  # we know the SECRET_KEY is strong
    ]

    TEMPLATES = [
        {
            "BACKEND": "django.template.backends.django.DjangoTemplates",
            "DIRS": [os.path.join(BASE_DIR, "public")],
            "APP_DIRS": True,
            "OPTIONS": {
                "context_processors": [
                    "django.template.context_processors.debug",
                    "django.template.context_processors.request",
                    "django.contrib.auth.context_processors.auth",
                    "django.contrib.messages.context_processors.messages",
                ],
            },
        }
    ]


class Base(Core):
    """Configuration that may change per-environment, some with defaults."""

    SECRET_KEY = values.SecretValue()

    DEBUG = values.BooleanValue(default=False)

    ALLOWED_HOSTS = values.ListValue([])

    # Database
    # https://docs.djangoproject.com/en/1.9/ref/settings/#databases
    DATABASES = values.DatabaseURLValue("postgres://postgres@db/postgres")

    # If we start using the cache for anything heavy, consider using a true
    # cache instead of locmem as default cache. This is mostly a placeholder.
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        },
        'probe-labels': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'probe-labels',
        }
    }

    LOGGING_USE_JSON = values.BooleanValue(False)

    def LOGGING(self):
        return {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "json": {
                    "()": "dockerflow.logging.JsonLogFormatter",
                    "logger_name": "glam",
                },
                "verbose": {"format": "%(levelname)s %(asctime)s %(name)s %(message)s"},
                "django.server": {
                    "()": "django.utils.log.ServerFormatter",
                    "format": "[%(server_time)s] %(message)s",
                },
            },
            "handlers": {
                "console": {
                    "level": "DEBUG",
                    "class": "logging.StreamHandler",
                    "formatter": "json" if self.LOGGING_USE_JSON else "verbose",
                },
                "django.server": {
                    "level": "INFO",
                    "class": "logging.StreamHandler",
                    "formatter": "django.server",
                },
            },
            "loggers": {
                "root": {"level": "INFO", "handlers": ["console"]},
                "django.db.backends": {
                    "level": "ERROR",
                    "handlers": ["console"],
                    "propagate": False,
                },
                "django.server": {
                    "handlers": ["django.server"],
                    "level": "INFO",
                    "propagate": False,
                },
                "mozilla_django_oidc": {
                    "level": "INFO",
                    "handlers": ["console"],
                    "propagate": False,
                },
            },
        }


class Dev(Base):
    "Configuration to be used during development and base class for testing"

    @property
    def VERSION(self):
        return {"version": datetime.now(tz=timezone.utc).strftime("%Y%m%d%H%M%S")}

    MIDDLEWARE = Base.MIDDLEWARE + ["glam.middleware.dev_cors_middleware"]


class Test(Dev):
    "Configuration to be used during testing"
    DEBUG = False

    SECRET_KEY = values.Value("not-so-secret-after-all")

    PASSWORD_HASHERS = ("django.contrib.auth.hashers.MD5PasswordHasher",)


class Stage(Base):
    "Configuration to be used in stage environment"

    LOGGING_USE_JSON = True

    ACCOUNT_DEFAULT_HTTP_PROTOCOL = "https"
    SECURE_SSL_REDIRECT = True
    SECURE_HSTS_SECONDS = int(timedelta(days=365).total_seconds())
    # Mark session and CSRF cookies as being HTTPS-only.
    CSRF_COOKIE_SECURE = True
    SESSION_COOKIE_SECURE = True
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = "DENY"
    # This is needed to get a CRSF token in /admin
    ANON_ALWAYS = True

    @property
    def DATABASES(self):
        # require encrypted connections to Postgres
        DATABASES = super().DATABASES.value.copy()
        DATABASES["default"].setdefault("OPTIONS", {})["sslmode"] = "require"
        return DATABASES

    DOCKERFLOW_CHECKS = [
        "dockerflow.django.checks.check_database_connected",
        "dockerflow.django.checks.check_migrations_applied",
    ]


class Prod(Stage):
    "Configuration to be used in prod environment"
    pass
