import os
import toml

from jadnschema.utils import FrozenDict
from jadnschema.convert import SchemaFormats, SchemaVisualizationFormats, SchemaTranslationFormatsForJADN, SchemaTranslationFormatsForJSON

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

    OPEN_C2_SCHEMA_DATA = os.path.join(APP_DATA, "openc2_files", "schemas")
    OPEN_C2_SCHEMA_CUSTOM_DATA = os.path.join(OPEN_C2_SCHEMA_DATA, "custom")
    OPEN_C2_SCHEMA_EXAMPLE_DATA = os.path.join(OPEN_C2_SCHEMA_DATA, "examples")

    OPEN_C2_MESSAGE_DATA = os.path.join(APP_DATA, "openc2_files", "messages")
    OPEN_C2_MESSAGE_CUSTOM_DATA = os.path.join(OPEN_C2_MESSAGE_DATA, "custom")
    OPEN_C2_MESSAGE_EXAMPLE_DATA = os.path.join(OPEN_C2_MESSAGE_DATA, "examples")

    OPEN_C2_SCHEMA_THEME = os.path.join(OPEN_C2_DATA, "openc2_schema_theme.css")
    PROFILE_TEST_DATA = os.path.join(APP_DATA, "test_messages")

    VALID_SCHEMAS = ["jadn", "json" ]
    VALID_SCHEMA_CONV = FrozenDict({fmt.name: fmt.value for fmt in SchemaFormats})
    VALID_SCHEMA_TRANSLATIONS = {
        'jadn': FrozenDict({fmt.name: fmt.value for fmt in SchemaTranslationFormatsForJADN}),
        'json': FrozenDict({fmt.name: fmt.value for fmt in SchemaTranslationFormatsForJSON})
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
