import os
import toml

from jadnschema.utils import FrozenDict
from jadnschema.convert import SchemaFormats, SchemaVisualizationFormats, SchemaTranslationFormatsForJADN, SchemaTranslationFormatsForJSON

class Config:

    APP_DIR = os.path.realpath(os.path.dirname(__file__))
    APP_DATA = os.path.join(APP_DIR, "app_data")
    FILES_DATA = os.path.join(APP_DIR, "files")

    path_to_toml = os.path.join(APP_DATA, "version.toml")
    version_data = toml.load(path_to_toml)

    VERSION_INFO = version_data["full_version"]
    APP_MODE = version_data["app_mode"]
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
        # "DELETE",
        "GET",
        "HEAD",
        "OPTIONS",
        "POST"
        # "PUT"
    ]
    # Options parsed in from cmdline
    OPTIONS = None
    APP_DATA = os.path.join(APP_DATA, "files")

    SCHEMA_DATA = os.path.join(APP_DATA, "schemas")
    SCHEMA_CUSTOM_DATA = os.path.join(SCHEMA_DATA, "custom")
    SCHEMA_EXAMPLE_DATA = os.path.join(SCHEMA_DATA, "examples")

    DATA = os.path.join(APP_DATA, "data")
    CUSTOM_DATA = os.path.join(DATA, "custom")
    EXAMPLE_DATA = os.path.join(DATA, "examples")

    APP_THEME = os.path.join(APP_DATA, "app_theme.css")

    VALID_SCHEMAS = ["jadn", "jidl", "json" ]
    VALID_SCHEMA_CONV = FrozenDict({fmt.name: fmt.value for fmt in SchemaFormats})
    VALID_SCHEMA_TRANSLATIONS = {
        'jadn': FrozenDict({fmt.name: fmt.value for fmt in SchemaTranslationFormatsForJADN}),
        'json': FrozenDict({fmt.name: fmt.value for fmt in SchemaTranslationFormatsForJSON}),
        'jidl': { 'JADN': 'jadn' }
        }
    VALID_SCHEMA_VISUALIZATIONS = FrozenDict({fmt.name: fmt.value for fmt in SchemaVisualizationFormats})
    VALID_MESSAGES = ["json", "cbor", "xml"]
    VALID_TRANSFORMATIONS = ["resolve references", "strip comments"]

class DefaultConfig(Config):
    DEBUG = False
    LOG_LEVEL = "INFO"


class DevConfig(Config):
    DEBUG = True
    LOG_LEVEL = "DEBUG"
