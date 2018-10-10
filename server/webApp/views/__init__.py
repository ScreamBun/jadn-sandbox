from .convert import convert
from .load import load
from .root import root
from .validate import validate


def register_all(app):
    app.logger.info('Registering Endpoint Blueprints')
    app.register_blueprint(root, url_prefix='')
    app.register_blueprint(convert, url_prefix='/api/convert')
    app.register_blueprint(load, url_prefix='/api/load')
    app.register_blueprint(validate, url_prefix='/api/validate')


__all__ = ['root', 'register_all']
