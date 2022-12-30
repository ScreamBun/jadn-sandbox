from .api import api
from .root import root


def register_all(app):
    app.logger.info("Registering Endpoint Blueprints")
    app.register_blueprint(root, url_prefix="")
    app.register_blueprint(api, url_prefix="/api")


__all__ = [
    "root",
    "register_all"
]
