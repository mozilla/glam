import os
from wsgiref.simple_server import make_server

from configurations.wsgi import get_wsgi_application


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "glam.settings")
os.environ.setdefault("DJANGO_CONFIGURATION", "Dev")

application = get_wsgi_application()
httpd = make_server("", 8000, application)
httpd.serve_forever()
