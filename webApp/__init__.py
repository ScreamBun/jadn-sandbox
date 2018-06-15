import os
import shutil

from flask import Flask

from .validator import Validator


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

app.config.from_object('webApp.config.DevConfig')
app.url_map.strict_slashes = False

if app.config.get('ORIGINAL_DATA'):
    print('Im running in a docker container.....')
    walkCopy(app.config.get('ORIGINAL_DATA'), app.config.get('APP_DATA'))

else:
    print('Im running on true system.....')

print('Starting OpenC2 Flask Server')

app.validator = Validator()

from .views import *
register_all(app)
