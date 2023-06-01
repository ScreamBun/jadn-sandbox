import multiprocessing
import os

from pathlib import Path

localVars = locals()
GunicornEnv = {
    'bind': ':8082',
    'workers': multiprocessing.cpu_count() * 2 + 1,
    'preload_app': True
}
GunicornEnv.update({k.split('_', 1)[1].lower(): v for k, v in os.environ.items() if k.startswith("GUNICORN_")})

for k, v in GunicornEnv.items():
    if k not in localVars:
        localVars[k] = v

logs = Path('./logs')
logs.mkdir(exist_ok=True)
