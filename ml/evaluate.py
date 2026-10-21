import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix
)


# ==========================================
# 1. LOAD DATASET
# ==========================================

DATA_PATH = "data/Sleep_health_and_lifestyle_dataset.csv"

df = pd.read_csv(DATA_PATH)

print("Dataset loaded successfully!")
print("Rows:", df.shape[0])
print("Columns:", df.shape[1])


# ==========================================
# 2. CREATE WELLNESS SCORE
# ==========================================

df["Wellness_Score"] = 0

df.loc[
    df["Quality of Sleep"] >= 7,
    "Wellness_Score"
] += 2

df.loc[
    df["Stress Level"] <= 4,
    "Wellness_Score"
] += 2

df.loc[
    df["Physical Activity Level"] >= 60,
    "Wellness_Score"
] += 2

df.loc[
    df["Sleep Duration"] >= 7,
    "Wellness_Score"
] += 2


# ==========================================
# 3. CREATE WELLNESS STATE
# ==========================================

def classify_wellness(score):

    if score >= 6:
        return "Healthy"

    elif score >= 3:
        return "Moderate"

    else:
        return "Concern"


df["Wellness_State"] = df[
    "Wellness_Score"
].apply(classify_wellness)


# ==========================================
# 4. PREPARE FEATURES
# ==========================================

X = df.drop(
    columns=[
        "Person ID",
        "Wellness_Score",
        "Wellness_State"
    ]
)

y = df["Wellness_State"]


# ==========================================
# 5. TRAIN TEST SPLIT
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


# ==========================================
# 6. LOAD TRAINED MODEL
# ==========================================

MODEL_PATH = "models/wellness_model.pkl"

model = joblib.load(MODEL_PATH)

print("\nModel loaded successfully!")


# ==========================================
# 7. MAKE PREDICTIONS
# ==========================================

predictions = model.predict(X_test)


# ==========================================
# 8. CALCULATE METRICS
# ==========================================

accuracy = accuracy_score(
    y_test,
    predictions
)

precision = precision_score(
    y_test,
    predictions,
    average="weighted",
    zero_division=0
)

recall = recall_score(
    y_test,
    predictions,
    average="weighted",
    zero_division=0
)

f1 = f1_score(
    y_test,
    predictions,
    average="weighted",
    zero_division=0
)


# ==========================================
# 9. DISPLAY RESULTS
# ==========================================

print("\n========================================")
print("MODEL EVALUATION")
print("========================================")

print(
    "Accuracy :",
    round(accuracy, 4)
)

print(
    "Precision:",
    round(precision, 4)
)

print(
    "Recall   :",
    round(recall, 4)
)

print(
    "F1 Score :",
    round(f1, 4)
)


# ==========================================
# 10. CLASSIFICATION REPORT
# ==========================================

print("\n========================================")
print("CLASSIFICATION REPORT")
print("========================================")

print(
    classification_report(
        y_test,
        predictions,
        zero_division=0
    )
)


# ==========================================
# 11. CONFUSION MATRIX
# ==========================================

print("\n========================================")
print("CONFUSION MATRIX")
print("========================================")

print(
    confusion_matrix(
        y_test,
        predictions
    )
)