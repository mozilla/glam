"""
WSGI config for glam project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.9/howto/deployment/wsgi/
"""

import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "glam.settings")
os.environ.setdefault("DJANGO_CONFIGURATION", "Dev")

from configurations.wsgi import get_wsgi_application  # noqa

application = get_wsgi_application()
