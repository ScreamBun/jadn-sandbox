import json
import logging
import multiprocessing_logging
import os
import re
import sys

from alembic.config import Config as Alembic_Config
from alembic import command as alembic_cmd
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

from .config import Config
from .validator import Validator

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
        ver_list = list(filter(lambda f: not f.startswith('.') and not os.path.isdir(os.path.join(versions, f)), os.listdir(versions)))

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

    for tbl in db_tables:
        path = os.path.join(app.config.get('APP_DATA'), 'openc2_files', tbl)
        for fle in os.listdir(path):
            if not os.path.isdir(os.path.join(path, fle)) and not fle.startswith('.') and re.match(r'.*\.(json|jadn)$',
                                                                                                   fle):
                name = fle[:fle.rfind('.')]
                if db_tables[tbl].query.filter(db_tables[tbl].name == name).count() == 0:
                    logging.info(f"Loading {tbl} {name} into database")
                    fle_data = json.load(open(os.path.join(path, fle)))

                    db_data = {
                        'name': name,
                        'data': json.dumps(fle_data)
                    }
                    database.session.add(db_tables[tbl](**db_data))
                    database.session.commit()


Config.LOG_HANDLER = logging.StreamHandler(sys.stdout)

set_logging(Config.LOG_LEVEL)

# Initialize the app
app = Flask(__name__, static_url_path='/static')

app.config.from_object('webApp.config.DevConfig')
app.url_map.strict_slashes = False

app.logger.handlers = []
app.logger.addHandler(logging.getLogger().handlers[0])

logging.info('Starting OpenC2 Flask Server')

database = SQLAlchemy(app)
from .models import *

init_database()

app.validator = Validator()

from .views import *
register_all(app, database)
