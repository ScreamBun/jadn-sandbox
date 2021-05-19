import multiprocessing
import os

DEFAULT = {
    'workers': multiprocessing.cpu_count() * 2 + 1,
    'preload_app': True
}

for k, v in os.environ.items():
    if k.startswith("GUNICORN_"):
        key = k.split('_', 1)[1].lower()
        locals()[key] = v

for k, v in DEFAULT.items():
    if k not in locals():
        locals()[k] = v

locals()['bind'] = ':8080'

if not os.path.isdir('./logs'):
    os.mkdir('./logs')