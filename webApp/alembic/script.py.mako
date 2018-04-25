"""${message}

Revision ID: ${up_revision}
Revises: ${down_revision | comma,n}
Create Date: ${create_date}

"""
from alembic import op
import sqlalchemy as sa
${imports if imports else ""}

# revision identifiers, used by Alembic.
revision = ${repr(up_revision)}
down_revision = ${repr(down_revision)}
branch_labels = ${repr(branch_labels)}
depends_on = ${repr(depends_on)}

"""
When adding upgrade/downgrade data:
- The create table(s) should be set to variables and set global
    global TABLE
    TABLE = op.create_table('TABLE',
    ...
    )
- Adding Upgrade Data in the data_upgrades function
- Note: for the id column, it is auto generated on insert and is not required here
- For more info: http://alembic.zzzcomputing.com/en/latest/ops.html
    op.bulk_insert(TABLE,
        [
            {'column1': data, 'column2': data, ...}
        ]
    )
"""


def upgrade():
    ${upgrades if upgrades else "pass"}
    
    data_upgrades()


def downgrade():
    ${downgrades if downgrades else "pass"}
    
    data_downgrades()

def data_upgrades():
    """Add any optional data upgrade migrations here!"""
    pass
    
def data_downgrades():
    """Add any optional data downgrade migrations here!"""
    pass
