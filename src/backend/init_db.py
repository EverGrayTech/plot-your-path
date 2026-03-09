"""Database initialization script."""

# Import models so SQLAlchemy metadata is fully populated before create_all.
import backend.models  # noqa: F401
from backend.database import Base, engine


def init_database():
    """
    Initialize the database by creating all tables.

    This function creates all tables defined in the models if they don't exist.
    It's safe to run multiple times as it won't recreate existing tables.
    """
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")
    print(f"Tables created: {', '.join(Base.metadata.tables.keys())}")


if __name__ == "__main__":
    init_database()
