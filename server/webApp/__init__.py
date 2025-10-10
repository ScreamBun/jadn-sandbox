from flask import Flask
from flask_cors import CORS

from webApp.config import DevConfig
from webApp.validator.validator import Validator
from webApp.formatter.logic.format_option_logic import FormatOptionLogic


# Initialize the app
app = Flask(__name__, static_url_path="/static")
app.config.from_object(DevConfig)
CORS(app)
app.url_map.strict_slashes = False

print("Starting JADN Sandbox...")
app.validator = Validator()
app.formatOptionLogic = FormatOptionLogic()

from .views import * 
app = register_all(app)

if app:
    print("Ready, access the app via the link below:")
    print("http://localhost:8082/")
else:
    print("Error during startup")
