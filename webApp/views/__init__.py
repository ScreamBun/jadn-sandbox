import flask_admin
from flask_admin.contrib.sqla import ModelView

from .root import root
from .load import load
from .validate import validate

from ..models import *


def register_all(app, db):
    app.logger.info('Registering Endpoint Blueprints')
    app.register_blueprint(root, url_prefix='')
    app.register_blueprint(load, url_prefix='/load')
    app.register_blueprint(validate, url_prefix='/validate')

    # Create admin
    if app.config['ADMIN_ENABLED'] or app.config['DEBUG']:
        app.logger.warning('Admin Views Enabled')
        adm = flask_admin.Admin(app, name='OpenC2 Admin', template_mode='bootstrap3')

        # Add views
        adm.add_view(ModelView(Schemas, db.session, endpoint='admin_schemas'))
        adm.add_view(ModelView(Messages, db.session, endpoint='admin_messages'))


__all__ = ['root', 'register_all']