import logging
import os
import sys
from optparse import OptionParser
import multiprocessing_logging
from alembic.config import Config as Alembic_Config
from alembic import command as alembic_cmd
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from .config import Config

_LEVELS = {
    "CRITICAL": logging.CRITICAL,
    "ERROR": logging.ERROR,
    "WARNING": logging.WARNING,
    "INFO": logging.INFO,
    "DEBUG": logging.DEBUG,
    "NOTSET": logging.NOTSET
}


def set_logging(verbosity="INFO"):
    log_level = _LEVELS.get(verbosity, logging.INFO)
    log_format = '%(asctime)s %(name)-5s %(levelname)-8s %(message)s'
    log_date_format = '%Y-%m-%d %H:%M:%S'
    Config.LOG_HANDLER.setLevel(log_level)

    logging.basicConfig(
        level=log_level,
        format=log_format,
        datefmt=log_date_format,
        handlers=[Config.LOG_HANDLER]
    )

    multiprocessing_logging.install_mp_handler()


def init_database(rev_msg=None):
    database_file = app.config['SQLALCHEMY_DATABASE_FILE']
    alembic_cfg = Alembic_Config(app.config.get('ALEMBIC_CONFIG_FILE'))
    opts = app.config.get('ALEMBIC_UPDATE')

    for opt in opts:
        alembic_cfg.set_main_option(opt, opts[opt])

    # check if there is a database there, if not, create one.
    if not os.path.isfile(database_file):
        logging.info("Database Does Not Exists, Creating Database")
        versions = os.path.join(app.config.get('APP_DIR'), 'alembic/versions')
        ver_list = list(filter(lambda f: not f.startswith('.'), os.listdir(versions)))

        print(os.path.isdir(versions), len(ver_list))

        if os.path.isdir(versions) and len(ver_list) == 0:
            alembic_cmd.revision(alembic_cfg, message="Init Database", autogenerate=True)

        alembic_cmd.upgrade(alembic_cfg, 'head')
        logging.info("Database created using default schema, upgraded to head")

    else:
        logging.info("Database Exists, Updating to Current if not already")
        alembic_cmd.upgrade(alembic_cfg, 'head')

    if rev_msg is not None:
        logging.info(f"Saving database revision, commit message '{rev_msg}'")
        alembic_cmd.revision(alembic_cfg, message=rev_msg, autogenerate=True)
        alembic_cmd.upgrade(alembic_cfg, 'head')

        logging.info("Database updated to current")


Config.LOG_HANDLER = logging.StreamHandler(sys.stdout)

parser = OptionParser(description='NetVamp REST Server')
parser.add_option('-H', '--host', default='127.0.0.1')
parser.add_option('-P', '--port', default='8080')
parser.add_option('-L', '--log-level', default="INFO", dest="level", help='DEBUG|INFO|WARNING|ERROR|CRITICAL')
parser.add_option('-R', '--revision', default=False, dest="revision", action="store_true")
parser.add_option('-M', '--message', dest="message")
parser.add_option('-D', '--debug', default=False, dest="debug", action="store_true")
parser.add_option('-V', '--version', default=Config.VERSION, dest="version", action='version')

option, args = parser.parse_args()

Config.OPTIONS = option

set_logging(option.level)
logging.info(f"Runtime Options: {option}")

# Initialize the app
app = Flask(__name__, static_url_path='/static')

app.config.from_object('webApp.config.DefaultConfig')
app.url_map.strict_slashes = False

app.logger.handlers = []
app.logger.addHandler(logging.getLogger().handlers[0])

logging.info('Starting OpenC2 Flask Server')
logging.info(f'Flask setup with {"Debug" if option.debug else "Prod"}, {option.host}:{option.port}')

database = SQLAlchemy(app)
from .models import *

if option.revision and option.message is not None:
    init_database(option.message)
else:
    init_database()

from .views import *
register_all(app, database)


if __name__ == 'webApp':
    options = app.config.get('OPTIONS')
    app.run(debug=options.debug, host=options.host, port=int(options.port))