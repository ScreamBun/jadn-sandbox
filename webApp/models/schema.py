from .. import database as db


class Schemas(db.Model):
    """
    id          Dynamic id of the schema
    name        Name of the stored schema
    data        Schema text
    """
    id = db.Column(db.Integer(), primary_key=True, unique=True)
    name = db.Column(db.String(64))
    data = db.Column(db.Text())
