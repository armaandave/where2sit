"""initial migration

Revision ID: c43746168412
Revises: 
Create Date: 2025-06-06 13:37:48.464919
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'c43746168412'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'theaters',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('osm_id', sa.BigInteger(), nullable=False, unique=True),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('brand', sa.String(), nullable=True),
        sa.Column('operator', sa.String(), nullable=True),
        sa.Column('street', sa.String(), nullable=True),
        sa.Column('city', sa.String(), nullable=True),
        sa.Column('state', sa.String(), nullable=True),
        sa.Column('postcode', sa.String(), nullable=True),
        sa.Column('country', sa.String(), nullable=True),
        sa.Column('lat', sa.Float(), nullable=True),
        sa.Column('lon', sa.Float(), nullable=True),
        sa.Column('website', sa.String(), nullable=True),
        sa.Column('screens_count', sa.Integer(), nullable=True),
        sa.Column('screens_count_source', sa.String(), nullable=True),
    )

    op.create_table(
        'screens',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('theater_id', sa.Integer(), sa.ForeignKey('theaters.id'), nullable=False),
        sa.Column('screen_number', sa.Integer(), nullable=False),
        sa.Column('layout_json', sa.JSON(), nullable=True)
    )


def downgrade() -> None:
    op.drop_table('screens')
    op.drop_table('theaters')