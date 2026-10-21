from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import joblib
import pandas as pd

from backend.schemas import WellnessInput
from backend.database import (
    create_database,
    save_prediction,
    get_predictions
)
from backend.what_if import run_what_if


# ==========================================
# CREATE FASTAPI APPLICATION
# ==========================================

app = FastAPI(
    title="AI-Based Personal Wellness Digital Twin",
    description="Wellness prediction and What-If analysis API",
    version="1.0"
)


# ==========================================
# ENABLE CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# LOAD MODEL
# ==========================================

MODEL_PATH = "models/wellness_model.pkl"

model = joblib.load(MODEL_PATH)


# ==========================================
# CREATE DATABASE
# ==========================================

create_database()


# ==========================================
# HOME
# ==========================================

@app.get("/")
def home():

    return {
        "message": "AI-Based Personal Wellness Digital Twin API",
        "status": "running"
    }


# ==========================================
# PREDICTION
# ==========================================

@app.post("/predict")
def predict(data: WellnessInput):

    try:

        model_input = {

            "Gender": data.Gender,

            "Age": data.Age,

            "Occupation": data.Occupation,

            "Sleep Duration": data.Sleep_Duration,

            "Quality of Sleep": data.Quality_of_Sleep,

            "Physical Activity Level":
                data.Physical_Activity_Level,

            "Stress Level": data.Stress_Level,

            "BMI Category": data.BMI_Category,

            "Blood Pressure": data.Blood_Pressure,

            "Heart Rate": data.Heart_Rate,

            "Daily Steps": data.Daily_Steps,

            "Sleep Disorder": data.Sleep_Disorder
        }


        input_dataframe = pd.DataFrame(
            [model_input]
        )


        # Make prediction

        prediction = model.predict(
            input_dataframe
        )[0]


        # Get probabilities

        probabilities = {}

        if hasattr(model, "predict_proba"):

            probability_values = (
                model.predict_proba(
                    input_dataframe
                )[0]
            )

            classes = model.classes_

            for class_name, probability in zip(
                classes,
                probability_values
            ):

                probabilities[class_name] = round(
                    float(probability) * 100,
                    2
                )


        # Save prediction

        save_prediction(
            data,
            prediction
        )


        return {

            "Wellness_State": prediction,

            "Probabilities": probabilities
        }


    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ==========================================
# PREDICTION HISTORY
# ==========================================
@app.get("/history")
def history(name: str = None):

    return {
        "history": get_predictions(name)
    }

# ==========================================
# WHAT-IF ANALYSIS
# ==========================================

@app.post("/what-if")
def what_if(
    current_data: WellnessInput,
    new_data: WellnessInput
):

    try:

        result = run_what_if(
            model,
            current_data,
            new_data
        )

        return result


    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )