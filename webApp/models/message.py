from .. import app, database as db


class Messages(db.Model):
    """
    id          Dynamic id of the message
    name        Name of the stored schema
    data        Schema text
    """
    id = db.Column(db.Integer(), primary_key=True, unique=True)
    name = db.Column(db.String(64))
    data = db.Column(db.Text())
