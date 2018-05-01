import json
import logging
import os
import re
import shutil

from alembic.config import Config as Alembic_Config
from alembic import command as alembic_cmd
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

from .config import Config
from .validator import Validator


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
        logging.info("Saving database revision, commit message '{}'".format(rev_msg))
        alembic_cmd.revision(alembic_cfg, message=rev_msg, autogenerate=True)
        alembic_cmd.upgrade(alembic_cfg, 'head')

        logging.info("Database updated to current")

    for tbl in db_tables:
        path = os.path.join(app.config.get('APP_DATA'), 'openc2_files', tbl)
        for fle in os.listdir(path):
            if not os.path.isdir(os.path.join(path, fle)) and not fle.startswith('.') and re.match(r'.*\.(json|jadn)$', fle):
                name = fle[:fle.rfind('.')]
                if db_tables[tbl].query.filter(db_tables[tbl].name == name).count() == 0:
                    logging.info("Loading {} {} into database".format(tbl, name))
                    fle_data = json.load(open(os.path.join(path, fle)))

                    db_data = {
                        'name': name,
                        'data': json.dumps(fle_data)
                    }
                    database.session.add(db_tables[tbl](**db_data))
                    database.session.commit()


def walkCopy(src, dst):
    for dirName, subdirList, fileList in os.walk(src):
        d = dirName.replace(src, dst)
        dl = os.listdir(d) if os.path.isdir(d) else []

        for f in fileList:
            if f not in dl:
                # logging.info(f"Copy File {d}/{f}")
                os.makedirs(d, exist_ok=True)
                shutil.copyfile(os.path.join(dirName, f), os.path.join(d, f))


# Gunicorn config - https://sebest.github.io/post/protips-using-gunicorn-inside-a-docker-image/
# Initialize the app
app = Flask(__name__, static_url_path='/static')

app.config.from_object('webApp.config.DefaultConfig')
app.url_map.strict_slashes = False

if app.config.get('ORIGINAL_DATA'):
    logging.info('Im running in a docker container.....')
    walkCopy(app.config.get('ORIGINAL_DATA'), app.config.get('APP_DATA'))

else:
    logging.info('Im running on true system.....')

app.config.from_object('webApp.config.DefaultConfig')
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
