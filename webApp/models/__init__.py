from .message import Messages
from .schema import Schemas

db_tables = {
    'schemas': Schemas,
    'messages': Messages
}

__all__ = ['db_tables', 'Messages', 'Schemas']
