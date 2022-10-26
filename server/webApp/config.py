import json
import os

from jadnschema.utils import FrozenDict
from jadnschema.convert import SchemaFormats


class Config:
    APP_DIR = os.path.realpath(os.path.dirname(__file__))
    APP_DATA = os.path.join(APP_DIR, "data")
    VERSION_INFO = json.loads(open(os.path.join(APP_DATA, "version.json"), "r").read())
    APPLICATION_ROOT = "/"
    STATIC_FOLDER = os.path.join(APP_DIR, "static")
    TEMPLATE_FOLDER = os.path.join(APP_DIR, "templates")
    SECRET_KEY = "openc2openc2"
    DEBUG = False
    INIT = True
    # Logger
    LOGGER_NAME = "OpenC2_JADN"
    LOG_LEVEL = "INFO"
    VERSION = "1.1.1"
    # Allowed Headers/Methods
    HEADERS = [
        "Authorization",
        "Content-Type",
        "Cookie",
        "Session",
        "Username",
        "X-Requested-With",
        "X-Forwarded-For",
    ]
    METHODS = [
        "DELETE",
        "GET",
        "HEAD",
        "OPTIONS",
        "POST",
        "PUT"
    ]
    # Options parsed in from cmdline
    OPTIONS = None
    # OpenC2 Options
    OPEN_C2_DATA = os.path.join(APP_DATA, "openc2_files")
    OPEN_C2_SCHEMA_THEME = os.path.join(OPEN_C2_DATA, "openc2_schema_theme.css")

    try:
        with open(os.path.join(APP_DATA, "openc2_files", "messages", "_default_types.json")) as f:
            DEFAULT_MESSAGE_TYPES = json.load(f)
    except Exception:
        DEFAULT_MESSAGE_TYPES = {}

    VALID_SCHEMAS = ["jadn", ]
    VALID_SCHEMA_CONV = FrozenDict({fmt.name: fmt.value for fmt in SchemaFormats})
    VALID_MESSAGES = ["json", "cbor", "xml"]


class DefaultConfig(Config):
    DEBUG = False

    LOG_LEVEL = "INFO"


class DevConfig(Config):
    DEBUG = True

    LOG_LEVEL = "DEBUG"
