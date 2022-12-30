import logging
import os
import re

from flask import Blueprint, Response, current_app, render_template, request, send_file, url_for
from flask_restful import Api, Resource

logger = logging.getLogger()
root = Blueprint("index", __name__)
api = Api(root)


def unquote(url):
    return re.compile("%([0-9a-fA-F]{2})", re.M).sub(lambda m: chr(int(m.group(1), 16)), url)


class Root(Resource):
    """
    Endpoint for /
    """
    def get(self, path=""):
        resp = Response(render_template("index.html"), mimetype="text/html")
        resp.status_code = 200
        return resp


class Endpoints(Resource):
    """
    Endpoint for /endpoints
    """
    def get(self):
        routes_by_app = {}

        for rule in current_app.url_map.iter_rules():
            url_app = rule.endpoint.split(".")[0]

            options = {}
            for arg in rule.arguments:
                options[arg] = f"[{arg}]"

            url = url_for(rule.endpoint, **options)

            if not re.match(r"^\/admin\/admin_", unquote(url)):
                if url_app not in routes_by_app:
                    routes_by_app[url_app] = []

                routes_by_app[url_app].append({
                    "url": unquote(url),
                    "endpoint": rule.endpoint,
                    "methods": ", ".join(rule.methods)
                })

        resp = Response(render_template("routes/routes.html", routes=routes_by_app, page_title="App Routes"), mimetype="text/html")
        resp.status_code = 200
        return resp


class StaticFiles(Resource):
    """
    endpoint for /(js|css|img|assets)/*
    """
    def get(self, filename):
        filetype = re.match(r"/(js|css|img|assets)/.*", request.path).groups()[0]
        filePath = os.path.join(current_app.config.get("STATIC_FOLDER"), filetype, filename)

        if os.path.isfile(filePath):
            return send_file(filePath, as_attachment=False)

        return "", 404


class CatchAll(Resource):
    """
    Endpoint for /[:content]
    Catch all for non-existant endpoints
    """
    def get(self, content):
        """
        Error message to appear in the event a user navigates to an endpoint that does not exist
        :param content: path that was navigated to
        :return: error message
        """
        current_app.logger.warning("Endpoint Does Not Exist: %s", content)

        err = {
            "message": [
                f"The requested URL /{content} was not found on the server.",
                "If you entered the URL manually please check your spelling and try again.",
            ]
        }

        resp = Response(render_template("error/error.html", error=err, page_title="Error"), mimetype="text/html")
        resp.status_code = 200
        return resp


# Register resources
# api.add_resource(Root, "/")
api.add_resource(Endpoints, "/endpoints")
api.add_resource(StaticFiles, *[f"/{type_}/<path:filename>" for type_ in ("js", "css", "img", "assets")])
api.add_resource(Root, "/", "/<path:path>")
