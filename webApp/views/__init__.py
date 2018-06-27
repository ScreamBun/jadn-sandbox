from .convert import convert
from .create import create
from .load import load
from .root import root
from .validate import validate


def register_all(app):
    app.logger.info('Registering Endpoint Blueprints')
    app.register_blueprint(root, url_prefix='')
    app.register_blueprint(convert, url_prefix='/convert')
    # app.register_blueprint(create, url_prefix='/create')
    app.register_blueprint(load, url_prefix='/load')
    app.register_blueprint(validate, url_prefix='/validate')


__all__ = ['root', 'register_all']
