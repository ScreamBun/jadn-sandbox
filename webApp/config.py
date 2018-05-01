import json
import os


class Config(object):
    APP_DIR = os.path.realpath(os.path.dirname(__file__))

    if os.path.isfile('/.dockerenv'):
        ORIGINAL_DATA = os.path.join(APP_DIR, 'data')
        VERSION_INFO = json.loads(open(os.path.join(ORIGINAL_DATA, 'version.json'), 'r').read())
        APP_DATA = os.path.join('/', 'data')

    else:
        APP_DATA = os.path.join(APP_DIR, 'data')
        VERSION_INFO = json.loads(open(os.path.join(APP_DATA, 'version.json'), 'r').read())

    APPLICATION_ROOT = '/'

    TEMPLATE_FOLDER = os.path.join(APP_DIR, "templates")

    OPEN_C2_DATA = os.path.join(APP_DATA, "openc2_files")

    SECRET_KEY = 'openc2openc2'

    DEBUG = False

    INIT = True

    # Logger
    LOGGER_NAME = 'OpenC2_JADN'

    LOG_LEVEL = 'INFO'

    VERSION = '1.1.1'

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

    # Options parsed in from cmdline
    OPTIONS = None


class DefaultConfig(Config):
    DEBUG = False

    LOG_LEVEL = 'INFO'


class DevConfig(Config):
    DEBUG = True

    LOG_LEVEL = 'DEBUG'