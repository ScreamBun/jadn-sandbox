import json
import os


class Config(object):
    APP_DIR = os.path.realpath(os.path.dirname(__file__))

    APPLICATION_ROOT = '/'

    TEMPLATE_FOLDER = os.path.join(APP_DIR, "templates")

    SECRET_KEY = 'openc2openc2'

    DEBUG = False

    INIT = True

    # Logger
    LOGGER_NAME = 'OpenC2_JADN'

    LOG_LEVEL = 'INFO'

    # Set in server (pkg) __init__
    LOG_HANDLER = None

    # SQLAlchemy
    SQLALCHEMY_ECHO = False

    SQLALCHEMY_TRACK_MODIFICATIONS = True

    SQLALCHEMY_DATABASE_FILE = os.path.join(APP_DIR, 'OpenC2.sqlite')

    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + SQLALCHEMY_DATABASE_FILE

    VERSION = '1.1.1'

    VERSION_INFO = json.loads(open(os.path.join(APP_DIR, 'version.json'), 'r').read())

    # Allowed Headers/Methods
    HEADERS = [
        'Authorization',
        'Content-Type',
        'Cookie',
        'Session',
        'Username',
        'X-Requested-With',
        'X-Forwarded-For',
    ]

    METHODS = [
        'DELETE',
        'GET',
        'HEAD',
        'OPTIONS',
        'POST',
        'PUT'
    ]

    # Alembic
    ALEMBIC_CONFIG_FILE = os.path.join(APP_DIR, "alembic/alembic.ini")

    ALEMBIC_UPDATE = {
        "script_location": os.path.join(APP_DIR, "alembic"),
        "sqlalchemy.url": SQLALCHEMY_DATABASE_URI
    }

    # Options parsed in from cmdline
    OPTIONS = None


class DefaultConfig(Config):
    ADMIN_ENABLED = False

    DEBUG = False

    LOG_LEVEL = 'INFO'


class DevConfig(Config):
    ADMIN_ENABLED = True

    DEBUG = True

    LOG_LEVEL = 'DEBUG'