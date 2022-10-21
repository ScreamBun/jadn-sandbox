from flask import Flask
from .config import DefaultConfig
from .validator import Validator


# Initialize the app
app = Flask(__name__, static_url_path="/static")
app.config.from_object(DefaultConfig)
app.url_map.strict_slashes = False

print("Starting OpenC2 Flask Server")

app.validator = Validator()

from .views import *
register_all(app)
