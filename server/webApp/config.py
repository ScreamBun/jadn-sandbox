import json
import os
import toml

from jadnschema.utils import FrozenDict
from jadnschema.convert import SchemaFormats


class Config:

    APP_DIR = os.path.realpath(os.path.dirname(__file__))
    APP_DATA = os.path.join(APP_DIR, "data")

    path_to_toml = os.path.join(APP_DATA, "version.toml")
    version_data = toml.load(path_to_toml)

    VERSION_INFO = version_data["full_version"]
    APPLICATION_ROOT = "/"
    STATIC_FOLDER = os.path.join(APP_DIR, "static")
    TEMPLATE_FOLDER = os.path.join(APP_DIR, "templates")
    SECRET_KEY = "openc2openc2"
    DEBUG = False
    INIT = True
    LOG_LEVEL = "INFO"
    
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
    PROFILE_TEST_DATA = os.path.join(APP_DATA, "test_messages")

    try:
        with open(os.path.join(APP_DATA, "openc2_files", "messages", "_default_types.json"), "r", encoding="utf-8") as f:
            DEFAULT_MESSAGE_TYPES = json.load(f)
    except Exception:  # pylint: disable=broad-except
        # TODO: pick better exception
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
