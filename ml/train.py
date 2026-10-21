import pandas as pd
import os
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer

from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier

from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.metrics import classification_report


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


# Good sleep quality
df.loc[df["Quality of Sleep"] >= 7, "Wellness_Score"] += 2

# Low stress
df.loc[df["Stress Level"] <= 4, "Wellness_Score"] += 2

# Good physical activity
df.loc[df["Physical Activity Level"] >= 60, "Wellness_Score"] += 2

# Good sleep duration
df.loc[df["Sleep Duration"] >= 7, "Wellness_Score"] += 2


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


df["Wellness_State"] = df["Wellness_Score"].apply(classify_wellness)


# ==========================================
# 4. DISPLAY CLASS DISTRIBUTION
# ==========================================

print("\n========================================")
print("WELLNESS STATE DISTRIBUTION")
print("========================================")

print(df["Wellness_State"].value_counts())


# ==========================================
# 5. REMOVE UNNECESSARY COLUMNS
# ==========================================

# Person ID is only an identifier.
# Wellness_Score was used to create the target.
# We don't want the model to directly see either.

X = df.drop(
    columns=[
        "Person ID",
        "Wellness_Score",
        "Wellness_State"
    ]
)

y = df["Wellness_State"]


# ==========================================
# 6. IDENTIFY COLUMN TYPES
# ==========================================

numeric_features = X.select_dtypes(
    include=["int64", "float64"]
).columns.tolist()

categorical_features = X.select_dtypes(
    include=["object"]
).columns.tolist()


print("\nNumeric features:")
print(numeric_features)

print("\nCategorical features:")
print(categorical_features)


# ==========================================
# 7. PREPROCESSING
# ==========================================

numeric_pipeline = Pipeline(
    steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ]
)


categorical_pipeline = Pipeline(
    steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(
            handle_unknown="ignore",
            sparse_output=False
        ))
    ]
)


preprocessor = ColumnTransformer(
    transformers=[
        ("numeric", numeric_pipeline, numeric_features),
        ("categorical", categorical_pipeline, categorical_features)
    ]
)


# ==========================================
# 8. TRAIN TEST SPLIT
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


print("\nTraining records:", len(X_train))
print("Testing records:", len(X_test))


# ==========================================
# 9. DEFINE MODELS
# ==========================================

models = {

    "Logistic Regression":
        LogisticRegression(
            max_iter=2000
        ),

    "Decision Tree":
        DecisionTreeClassifier(
            random_state=42
        ),

    "Random Forest":
        RandomForestClassifier(
            n_estimators=200,
            random_state=42
        )
}


# ==========================================
# 10. TRAIN AND EVALUATE
# ==========================================

results = {}

best_model = None
best_score = 0
best_model_name = ""


for name, model in models.items():

    print("\n========================================")
    print(name)
    print("========================================")

    pipeline = Pipeline(
        steps=[
            ("preprocessing", preprocessor),
            ("model", model)
        ]
    )

    pipeline.fit(X_train, y_train)

    predictions = pipeline.predict(X_test)

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

    print("Accuracy :", round(accuracy, 4))
    print("Precision:", round(precision, 4))
    print("Recall   :", round(recall, 4))
    print("F1 Score :", round(f1, 4))

    print("\nClassification Report:")
    print(
        classification_report(
            y_test,
            predictions,
            zero_division=0
        )
    )

    results[name] = {
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1
    }

    if f1 > best_score:

        best_score = f1
        best_model = pipeline
        best_model_name = name


# ==========================================
# 11. SAVE BEST MODEL
# ==========================================

os.makedirs("models", exist_ok=True)

MODEL_PATH = "models/wellness_model.pkl"

joblib.dump(
    best_model,
    MODEL_PATH
)


# ==========================================
# 12. FINAL RESULT
# ==========================================

print("\n========================================")
print("TRAINING COMPLETED")
print("========================================")

print("Best Model:", best_model_name)

print(
    "Best F1 Score:",
    round(best_score, 4)
)

print(
    "Model saved at:",
    MODEL_PATH
)