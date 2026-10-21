import pandas as pd


# ==========================================
# CONVERT API INPUT TO MODEL INPUT
# ==========================================

def convert_to_model_input(data):

    return pd.DataFrame([{

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
    }])


# ==========================================
# WHAT-IF PREDICTION
# ==========================================

def run_what_if(model, current_data, new_data):

    current_input = convert_to_model_input(
        current_data
    )

    new_input = convert_to_model_input(
        new_data
    )


    # Current prediction

    current_prediction = model.predict(
        current_input
    )[0]


    # New prediction

    new_prediction = model.predict(
        new_input
    )[0]


    return {

        "current_wellness_state":
            current_prediction,

        "what_if_wellness_state":
            new_prediction,

        "changed": (
            current_prediction != new_prediction
        )
    }