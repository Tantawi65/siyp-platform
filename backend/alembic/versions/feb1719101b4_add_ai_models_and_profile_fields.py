"""add ai models and profile fields

Revision ID: feb1719101b4
Revises: b0e7694d88aa
Create Date: 2026-10-03 09:54:49.157589

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'feb1719101b4'
down_revision: Union[str, None] = 'b0e7694d88aa'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new profile fields
    op.add_column('profiles', sa.Column('major', sa.String(), nullable=True))
    op.add_column('profiles', sa.Column('education_level', sa.String(), nullable=True))
    op.add_column('profiles', sa.Column('gpa', sa.String(), nullable=True))
    op.add_column('profiles', sa.Column('skills', sa.String(), nullable=True))
    op.add_column('profiles', sa.Column('interests', sa.String(), nullable=True))
    op.add_column('profiles', sa.Column('languages', sa.String(), nullable=True))
    op.add_column('profiles', sa.Column('date_of_birth', sa.String(), nullable=True))
    
    # Try to add FK constraint to user_id on profiles (it might already exist depending on DB state, so we handle it gracefully if possible, or just add it)
    try:
        op.create_foreign_key('fk_profiles_user_id', 'profiles', 'users', ['user_id'], ['id'], ondelete='CASCADE')
    except:
        pass

    # Create AI Recommendation table
    op.create_table(
        'ai_recommendations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('raw_recommendation', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_ai_recommendations_id'), 'ai_recommendations', ['id'], unique=False)
    op.create_index(op.f('ix_ai_recommendations_user_id'), 'ai_recommendations', ['user_id'], unique=False)

    # Create AI Chat History table
    op.create_table(
        'ai_chat_history',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('role', sa.String(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_ai_chat_history_id'), 'ai_chat_history', ['id'], unique=False)
    op.create_index(op.f('ix_ai_chat_history_user_id'), 'ai_chat_history', ['user_id'], unique=False)

    # Create AI Usage Logs table
    op.create_table(
        'ai_usage_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('date', sa.String(), nullable=False),
        sa.Column('requests_count', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_ai_usage_logs_id'), 'ai_usage_logs', ['id'], unique=False)
    op.create_index(op.f('ix_ai_usage_logs_user_id'), 'ai_usage_logs', ['user_id'], unique=False)
    op.create_index(op.f('ix_ai_usage_logs_date'), 'ai_usage_logs', ['date'], unique=False)


def downgrade() -> None:
    op.drop_table('ai_usage_logs')
    op.drop_table('ai_chat_history')
    op.drop_table('ai_recommendations')
    
    op.drop_column('profiles', 'date_of_birth')
    op.drop_column('profiles', 'languages')
    op.drop_column('profiles', 'interests')
    op.drop_column('profiles', 'skills')
    op.drop_column('profiles', 'gpa')
    op.drop_column('profiles', 'education_level')
    op.drop_column('profiles', 'major')
