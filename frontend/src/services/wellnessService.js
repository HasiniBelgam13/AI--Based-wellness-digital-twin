/**
 * WellNest Service Layer
 * Connects the React frontend to the FastAPI ML backend service at http://127.0.0.1:8000.
 * Includes graceful offline resilience with transparent heuristic classification fallback.
 */

export const API_BASE_URL = "http://127.0.0.1:8000";

/**
 * Checks if the backend FastAPI service is actively running and reachable.
 */
export async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const response = await fetch(`${API_BASE_URL}/`, {
      method: "GET",
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (response.ok) {
      const data = await response.json();
      return { isOnline: true, message: data.message || "Connected to ML Engine" };
    }
    return { isOnline: false, message: "Backend returned non-200 status" };
  } catch {
    return { isOnline: false, message: "FastAPI server offline (using local calculation mode)" };
  }
}

/**
 * Formats a frontend check-in entry to match the backend `WellnessInput` Pydantic schema:
 * {
 *   Name, Gender, Age, Occupation, Sleep_Duration, Quality_of_Sleep,
 *   Physical_Activity_Level, Stress_Level, BMI_Category, Blood_Pressure,
 *   Heart_Rate, Daily_Steps, Sleep_Disorder
 * }
 */
export function formatPayloadForML(entry, userProfile = {}) {
  return {
    Name: userProfile.name || entry.name || "Demo User",
    Gender: userProfile.gender || entry.gender || "Male",
    Age: Number(userProfile.age || entry.age || 28),
    Occupation: userProfile.occupation || entry.occupation || "Software Engineer",
    Sleep_Duration: Number(entry.Sleep_Duration ?? entry.sleep_duration ?? 7.0),
    Quality_of_Sleep: Number(entry.Quality_of_Sleep ?? entry.quality_of_sleep ?? 7),
    Physical_Activity_Level: Number(entry.Physical_Activity_Level ?? entry.physical_activity_level ?? 60),
    Stress_Level: Number(entry.Stress_Level ?? entry.stress_level ?? 5),
    BMI_Category: userProfile.bmiCategory || entry.bmi_category || "Normal",
    Blood_Pressure: userProfile.bloodPressure || entry.blood_pressure || "120/80",
    Heart_Rate: Number(entry.Heart_Rate ?? entry.heart_rate ?? 70),
    Daily_Steps: Number(entry.Daily_Steps ?? entry.daily_steps ?? 8000),
    Sleep_Disorder: userProfile.sleepDisorder || entry.sleep_disorder || "None"
  };
}

/**
 * Calls `POST /predict` on the FastAPI ML service.
 * Returns { wellnessState, probabilities, isFromML: true/false }
 */
export async function predictWellness(entry, userProfile = {}) {
  const payload = formatPayloadForML(entry, userProfile);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return {
        wellnessState: data.Wellness_State,
        probabilities: data.Probabilities || {},
        isFromML: true,
        source: "FastAPI Scikit-Learn Model"
      };
    }
  } catch (err) {
    console.warn("ML API unreachable or error:", err.message);
  }

  // Transparent rule-based fallback based on the model's training criteria (ml/train.py)
  return fallbackClassify(payload);
}

/**
 * Calls `POST /what-if` on the FastAPI ML service.
 * Compares current baseline vs hypothetical scenario.
 */
export async function runWhatIfAnalysis(currentEntry, hypotheticalEntry, userProfile = {}) {
  const currentPayload = formatPayloadForML(currentEntry, userProfile);
  const newPayload = formatPayloadForML(hypotheticalEntry, userProfile);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${API_BASE_URL}/what-if`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        current_data: currentPayload,
        new_data: newPayload
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return {
        currentWellnessState: data.current_wellness_state,
        whatIfWellnessState: data.what_if_wellness_state,
        changed: data.changed,
        isFromML: true
      };
    }
  } catch (err) {
    console.warn("What-If API offline, using local simulator:", err.message);
  }

  // Fallback simulator matching dataset rules
  const currentPred = fallbackClassify(currentPayload);
  const newPred = fallbackClassify(newPayload);

  return {
    currentWellnessState: currentPred.wellnessState,
    whatIfWellnessState: newPred.wellnessState,
    changed: currentPred.wellnessState !== newPred.wellnessState,
    isFromML: false
  };
}

/**
 * Fallback classification matching the rule logic in `ml/train.py`:
 * - Quality of Sleep >= 7 -> +2
 * - Stress Level <= 4 -> +2
 * - Physical Activity Level >= 60 -> +2
 * - Sleep Duration >= 7 -> +2
 * Score >= 6 -> Healthy, Score >= 3 -> Moderate, Else -> Concern.
 */
function fallbackClassify(payload) {
  let score = 0;
  if (payload.Quality_of_Sleep >= 7) score += 2;
  if (payload.Stress_Level <= 4) score += 2;
  if (payload.Physical_Activity_Level >= 60) score += 2;
  if (payload.Sleep_Duration >= 7.0) score += 2;

  let state = "Moderate";
  let probabilities = { Healthy: 30, Moderate: 50, Concern: 20 };

  if (score >= 6) {
    state = "Healthy";
    probabilities = { Healthy: 84.5, Moderate: 12.5, Concern: 3.0 };
  } else if (score >= 3) {
    state = "Moderate";
    probabilities = { Healthy: 18.0, Moderate: 72.0, Concern: 10.0 };
  } else {
    state = "Concern";
    probabilities = { Healthy: 4.0, Moderate: 26.0, Concern: 70.0 };
  }

  return {
    wellnessState: state,
    probabilities,
    isFromML: false,
    source: "Rule-Based Heuristic (Offline Mode)"
  };
}
