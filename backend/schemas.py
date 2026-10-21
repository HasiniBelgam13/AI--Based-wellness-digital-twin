from pydantic import BaseModel


class WellnessInput(BaseModel):

    # Personalization field
    Name: str

    # ML features
    Gender: str
    Age: int
    Occupation: str
    Sleep_Duration: float
    Quality_of_Sleep: int
    Physical_Activity_Level: int
    Stress_Level: int
    BMI_Category: str
    Blood_Pressure: str
    Heart_Rate: int
    Daily_Steps: int
    Sleep_Disorder: str