# import flask_admin
# from flask_admin.contrib.sqla import ModelView

from .root import root
from .load import load
from .validate import validate

# from ..models import *


def register_all(app, db):
    app.logger.info('Registering Endpoint Blueprints')
    app.register_blueprint(root, url_prefix='')
    app.register_blueprint(load, url_prefix='/load')
    app.register_blueprint(validate, url_prefix='/validate')

    '''
    # Create admin
    if app.config['ADMIN_ENABLED'] or app.config['DEBUG']:
        app.logger.warning('Admin Views Enabled')
        adm = flask_admin.Admin(app, name='NetVamp Admin', template_mode='bootstrap3')

        # Add views
        adm.add_view(ModelView(Storage, db.session, endpoint='admin_storage'))
        adm.add_view(ModelView(Queries, db.session, endpoint='admin_queries'))
        adm.add_view(ModelView(Replays, db.session, endpoint='admin_replays'))
        adm.add_view(ModelView(Services, db.session, endpoint='admin_services'))
        adm.add_view(ModelView(Sessions, db.session, endpoint='admin_sessions'))
        adm.add_view(ModelView(System, db.session, endpoint='admin_system'))
        adm.add_view(ModelView(Users, db.session, endpoint='admin_users'))
    '''


__all__ = ['root', 'register_all']