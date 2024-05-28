# conftest.py
import os
import pytest

from flask import Flask
from flask.testing import FlaskClient

@pytest.fixture()
def app() -> Flask:
    app = Flask(__name__)
    
    # configure app
    # APP_DIR = os.path.join(os.path.realpath(os.path.dirname(__file__)), "..")
    APP_DIR = os.path.join( os.path.dirname( __file__ ), '..' )
    APP_DATA = os.path.join(APP_DIR, "data")
    FILES_DATA = os.path.join(APP_DIR, "files")    
    
    app.config.update({"APP_DIR": APP_DIR})
    app.config.update({"APP_DATA": APP_DATA})
    app.config.update({"FILES_DATA": FILES_DATA})

    return app


@pytest.fixture()
def client(app: Flask) -> FlaskClient:
    return app.test_client()


@pytest.fixture(autouse=True)
def _provide_app_context(app: Flask):
    with app.app_context():
        yield