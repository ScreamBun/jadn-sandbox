from flask import Flask
from flask_cors import CORS
from .config import DevConfig
from .validator import Validator
from .formatter.logic import FormatOptionLogic


# Initialize the app
app = Flask(__name__, static_url_path="/static")
app.config.from_object(DevConfig)
CORS(app)
app.url_map.strict_slashes = False

print("Starting JADN Sandbox...")
app.validator = Validator()
app.formatOptionLogic = FormatOptionLogic()

from .views import *  # pylint: disable=wrong-import-position
register_all(app)

print("The JADN Sandbox is ready for work!")
print("Go to the URL below in your browser:")
print("http://localhost:8082/")