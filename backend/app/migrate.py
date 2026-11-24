import os
from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session


def run_migrations(engine: Engine):
    """
    Safely inspects existing database tables and columns,
    applies incremental schema updates without dropping or deleting data,
    and seeds default categories and initial admin role if configured.
    """
    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())

    with engine.begin() as conn:
        # Check and update 'users' table
        if "users" in existing_tables:
            user_cols = {col["name"] for col in inspector.get_columns("users")}
            
            user_migrations = [
                ("role", "ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'student' NOT NULL"),
                ("avatar_url", "ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500) NULL"),
                ("bio", "ALTER TABLE users ADD COLUMN bio TEXT NULL"),
                ("college", "ALTER TABLE users ADD COLUMN college VARCHAR(255) NULL"),
                ("department", "ALTER TABLE users ADD COLUMN department VARCHAR(255) NULL"),
                ("graduation_year", "ALTER TABLE users ADD COLUMN graduation_year INT NULL"),
                ("skills", "ALTER TABLE users ADD COLUMN skills VARCHAR(500) NULL"),
                ("github_url", "ALTER TABLE users ADD COLUMN github_url VARCHAR(255) NULL"),
                ("linkedin_url", "ALTER TABLE users ADD COLUMN linkedin_url VARCHAR(255) NULL"),
                ("is_active", "ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE NOT NULL"),
                ("updated_at", "ALTER TABLE users ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL"),
            ]
            for col_name, sql in user_migrations:
                if col_name not in user_cols:
                    print(f"Applying migration: adding {col_name} to users")
                    conn.execute(text(sql))

        # Check and update 'projects' table
        if "projects" in existing_tables:
            project_cols = {col["name"] for col in inspector.get_columns("projects")}
            
            project_migrations = [
                ("short_description", "ALTER TABLE projects ADD COLUMN short_description VARCHAR(500) NULL"),
                ("problem_statement", "ALTER TABLE projects ADD COLUMN problem_statement TEXT NULL"),
                ("proposed_solution", "ALTER TABLE projects ADD COLUMN proposed_solution TEXT NULL"),
                ("screenshots", "ALTER TABLE projects ADD COLUMN screenshots TEXT NULL"),
                ("status", "ALTER TABLE projects ADD COLUMN status VARCHAR(50) DEFAULT 'published' NOT NULL"),
                ("is_featured", "ALTER TABLE projects ADD COLUMN is_featured BOOLEAN DEFAULT FALSE NOT NULL"),
                ("is_hidden", "ALTER TABLE projects ADD COLUMN is_hidden BOOLEAN DEFAULT FALSE NOT NULL"),
            ]
            for col_name, sql in project_migrations:
                if col_name not in project_cols:
                    print(f"Applying migration: adding {col_name} to projects")
                    conn.execute(text(sql))

    # Re-inspect to seed initial data
    with Session(engine) as session:
        # Seed categories if table exists and is empty
        try:
            from .models import Category, User
            cat_count = session.query(Category).count()
            if cat_count == 0:
                default_categories = [
                    Category(name="Web Development", slug="web-development", description="Full-stack, frontend, and backend web applications", icon="Globe"),
                    Category(name="Mobile Applications", slug="mobile-apps", description="iOS, Android, React Native, and Flutter projects", icon="Smartphone"),
                    Category(name="AI & Machine Learning", slug="ai-machine-learning", description="Deep learning, NLP, computer vision, and predictive models", icon="Brain"),
                    Category(name="Data Science & Analytics", slug="data-science", description="Data pipelines, big data analytics, and interactive dashboards", icon="BarChart3"),
                    Category(name="Cybersecurity", slug="cybersecurity", description="Security tools, cryptography, penetration testing, and audits", icon="ShieldCheck"),
                    Category(name="IoT & Embedded Systems", slug="iot-embedded", description="Hardware integration, microcontrollers, and smart sensors", icon="Cpu"),
                    Category(name="Cloud & DevOps", slug="cloud-devops", description="CI/CD, container orchestration, serverless, and cloud architecture", icon="Cloud"),
                    Category(name="Open Source Tools", slug="open-source", description="Developer utilities, libraries, and open-source frameworks", icon="Code2"),
                ]
                session.add_all(default_categories)
                session.commit()
                print("Seeded default categories.")
        except Exception as e:
            session.rollback()
            print(f"Categories seed note: {e}")

        # Check ADMIN_EMAIL for initial administrator role
        admin_email = os.getenv("ADMIN_EMAIL")
        if admin_email:
            try:
                from .models import User
                admin_user = session.query(User).filter(User.email == admin_email).first()
                if admin_user and admin_user.role != "admin":
                    admin_user.role = "admin"
                    session.commit()
                    print(f"Promoted configured ADMIN_EMAIL user to admin role: {admin_email}")
            except Exception as e:
                session.rollback()
                print(f"Admin email note: {e}")


if __name__ == "__main__":
    from .database import engine, Base
    Base.metadata.create_all(bind=engine)
    run_migrations(engine)
    print("Database migrations completed successfully.")
