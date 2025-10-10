from .api import api
from .root import root


def register_all(app):
    app.register_blueprint(root, url_prefix="")
    app.register_blueprint(api, url_prefix="/api")
    
    return app


__all__ = [
    "root",
    "register_all"
]
