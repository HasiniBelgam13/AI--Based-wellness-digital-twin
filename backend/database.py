import sqlite3
import os


# ==========================================
# DATABASE PATH
# ==========================================

DATABASE_FOLDER = "database"

os.makedirs(
    DATABASE_FOLDER,
    exist_ok=True
)

DATABASE_PATH = os.path.join(
    DATABASE_FOLDER,
    "wellness.db"
)


# ==========================================
# CREATE DATABASE
# ==========================================

def create_database():

    connection = sqlite3.connect(
        DATABASE_PATH
    )

    cursor = connection.cursor()

    # Create table if it doesn't exist
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS predictions (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            name TEXT,

            gender TEXT,

            age INTEGER,

            occupation TEXT,

            sleep_duration REAL,

            quality_of_sleep INTEGER,

            physical_activity_level INTEGER,

            stress_level INTEGER,

            bmi_category TEXT,

            blood_pressure TEXT,

            heart_rate INTEGER,

            daily_steps INTEGER,

            sleep_disorder TEXT,

            wellness_state TEXT,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # ------------------------------------------------
    # Add name column to an OLD existing database
    # ------------------------------------------------

    cursor.execute("""
        PRAGMA table_info(predictions)
    """)

    columns = [
        row[1]
        for row in cursor.fetchall()
    ]

    if "name" not in columns:

        cursor.execute("""
            ALTER TABLE predictions
            ADD COLUMN name TEXT
        """)

    connection.commit()

    connection.close()


# ==========================================
# SAVE PREDICTION
# ==========================================

def save_prediction(data, wellness_state):

    connection = sqlite3.connect(
        DATABASE_PATH
    )

    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO predictions (

            name,
            gender,
            age,
            occupation,
            sleep_duration,
            quality_of_sleep,
            physical_activity_level,
            stress_level,
            bmi_category,
            blood_pressure,
            heart_rate,
            daily_steps,
            sleep_disorder,
            wellness_state

        )

        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (

        data.Name,
        data.Gender,
        data.Age,
        data.Occupation,
        data.Sleep_Duration,
        data.Quality_of_Sleep,
        data.Physical_Activity_Level,
        data.Stress_Level,
        data.BMI_Category,
        data.Blood_Pressure,
        data.Heart_Rate,
        data.Daily_Steps,
        data.Sleep_Disorder,
        wellness_state
    ))

    connection.commit()

    connection.close()


# ==========================================
# GET USER HISTORY
# ==========================================

def get_predictions(name=None):

    connection = sqlite3.connect(
        DATABASE_PATH
    )

    connection.row_factory = sqlite3.Row

    cursor = connection.cursor()

    if name:

        cursor.execute("""
            SELECT *
            FROM predictions
            WHERE LOWER(name) = LOWER(?)
            ORDER BY id DESC
        """, (name,))

    else:

        cursor.execute("""
            SELECT *
            FROM predictions
            ORDER BY id DESC
        """)

    rows = cursor.fetchall()

    connection.close()

    return [
        dict(row)
        for row in rows
    ]