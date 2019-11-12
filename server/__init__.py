import os

from flask import Flask, render_template
from flask_caching import Cache
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

from server.config import configs


db = SQLAlchemy()
cache = Cache(config={"CACHE_TYPE": "simple", "default_timeout": 60 * 15})


def create_app(config_override=None):
    """Create and configure an instance of the Flask application."""

    app = Flask(
        __name__.split(".")[0],
        static_folder="/app/public",
        template_folder="/app/public",
        static_url_path="",
    )
    if config_override is not None:
        app.config.from_object(configs[config_override])
    else:
        FLASK_CONFIG = os.environ.get("FLASK_CONFIG", "local")
        print(f"Using FLASK_CONFIG={FLASK_CONFIG}")
        app.config.from_object(configs[FLASK_CONFIG])

    # Add CORS.
    CORS(app)

    # Initialize Flask-SQLAlchemy and Cache.
    db.init_app(app)
    cache.init_app(app)

    configure_blueprints(app)

    # Simple index route for publishing front-end assets.
    @app.route("/")
    def index():
        return render_template("index.html")

    return app


def configure_blueprints(app):
    """Configure blueprints in views."""

    from server import api

    app.register_blueprint(api.bp)

    return app
