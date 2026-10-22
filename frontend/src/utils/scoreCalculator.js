/**
 * WellNest Transparent Score Calculator Utility
 * Implements rule-based, explainable calculations for daily wellness measurements.
 * Weights add up to 100%:
 * - Sleep Score: 30%
 * - Stress Management Score: 25%
 * - Daily Steps Score: 25%
 * - Physical Activity Score: 20%
 */

export const DEFAULT_GOALS = {
  sleepDuration: 8.0,    // Target hours per night
  dailySteps: 10000,     // Target steps per day
  physicalActivity: 60,  // Target active minutes per day
};

/**
 * Normalizes sleep quality (scale 1 - 10) to a 0 - 100 score.
 */
export function calculateSleepQualityScore(quality) {
  if (quality === undefined || quality === null || isNaN(quality)) return null;
  const clamped = Math.max(1, Math.min(10, Number(quality)));
  return Math.round((clamped / 10) * 100);
}

/**
 * Calculates Sleep Score by combining duration closeness to target and sleep quality.
 * Duration accuracy contributes 40%, sleep quality contributes 60%.
 */
export function calculateSleepScore(duration, quality, targetDuration = DEFAULT_GOALS.sleepDuration) {
  if (duration === undefined || duration === null || isNaN(duration)) return null;
  const numDuration = Number(duration);
  const target = Number(targetDuration) || 8.0;

  // Closeness penalty: 15 points off for each hour deviation from target
  const diff = Math.abs(numDuration - target);
  const durationScore = Math.max(0, Math.min(100, Math.round(100 - diff * 15)));

  const qualityScore = calculateSleepQualityScore(quality);
  if (qualityScore === null) {
    return durationScore;
  }

  return Math.round(0.4 * durationScore + 0.6 * qualityScore);
}

/**
 * Calculates Physical Activity Score based on target active minutes.
 */
export function calculatePhysicalActivityScore(activityMinutes, targetActivity = DEFAULT_GOALS.physicalActivity) {
  if (activityMinutes === undefined || activityMinutes === null || isNaN(activityMinutes)) return null;
  const target = Number(targetActivity) || 60;
  const minutes = Math.max(0, Number(activityMinutes));
  return Math.min(100, Math.round((minutes / target) * 100));
}

/**
 * Calculates Daily Steps Score based on target step goal.
 */
export function calculateDailyStepsScore(steps, targetSteps = DEFAULT_GOALS.dailySteps) {
  if (steps === undefined || steps === null || isNaN(steps)) return null;
  const target = Number(targetSteps) || 10000;
  const numSteps = Math.max(0, Number(steps));
  return Math.min(100, Math.round((numSteps / target) * 100));
}

/**
 * Calculates Stress Management Score.
 * User reports stress on scale 1 (very calm) to 10 (extreme stress).
 * Lower stress yields a higher stress management score:
 * Stress 1 -> 100, Stress 5 -> 56, Stress 10 -> 0.
 */
export function calculateStressManagementScore(stressLevel) {
  if (stressLevel === undefined || stressLevel === null || isNaN(stressLevel)) return null;
  const clamped = Math.max(1, Math.min(10, Number(stressLevel)));
  return Math.round(((10 - clamped) / 9) * 100);
}

/**
 * Returns a descriptive status label for a given score (0 - 100).
 */
export function getScoreStatusLabel(score) {
  if (score === null || score === undefined || isNaN(score)) return "Pending";
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  return "Needs Attention";
}

/**
 * Returns color token according to score status.
 */
export function getScoreColor(score) {
  if (score === null || score === undefined || isNaN(score)) return "var(--wn-text-muted)";
  if (score >= 85) return "var(--wn-green)";
  if (score >= 70) return "var(--wn-primary)";
  if (score >= 50) return "var(--wn-peach)";
  return "var(--wn-rose)";
}

/**
 * Calculates all individual scores and the weighted overall wellness score.
 * Handles missing fields gracefully with clear partial weighting if any metrics are omitted.
 */
export function calculateAllScores(entry, goals = DEFAULT_GOALS) {
  if (!entry) return null;

  const targetDuration = goals?.sleepDuration || DEFAULT_GOALS.sleepDuration;
  const targetSteps = goals?.dailySteps || DEFAULT_GOALS.dailySteps;
  const targetActivity = goals?.physicalActivity || DEFAULT_GOALS.physicalActivity;

  const sleepQualityScore = calculateSleepQualityScore(entry.Quality_of_Sleep ?? entry.quality_of_sleep);
  const sleepScore = calculateSleepScore(
    entry.Sleep_Duration ?? entry.sleep_duration,
    entry.Quality_of_Sleep ?? entry.quality_of_sleep,
    targetDuration
  );
  const physicalActivityScore = calculatePhysicalActivityScore(
    entry.Physical_Activity_Level ?? entry.physical_activity_level,
    targetActivity
  );
  const dailyStepsScore = calculateDailyStepsScore(
    entry.Daily_Steps ?? entry.daily_steps,
    targetSteps
  );
  const stressManagementScore = calculateStressManagementScore(
    entry.Stress_Level ?? entry.stress_level
  );

  // Dynamic weighted sum of available scores
  const subMetrics = [
    { key: "sleep", weight: 0.30, score: sleepScore },
    { key: "stress", weight: 0.25, score: stressManagementScore },
    { key: "steps", weight: 0.25, score: dailyStepsScore },
    { key: "activity", weight: 0.20, score: physicalActivityScore },
  ];

  const available = subMetrics.filter((m) => m.score !== null);
  let overallScore = null;
  let isPartial = false;

  if (available.length > 0) {
    const totalWeight = available.reduce((sum, m) => sum + m.weight, 0);
    const weightedSum = available.reduce((sum, m) => sum + m.score * m.weight, 0);
    overallScore = Math.round(weightedSum / totalWeight);
    isPartial = available.length < subMetrics.length;
  }

  return {
    overallScore,
    statusLabel: getScoreStatusLabel(overallScore),
    isPartial,
    availableMetricsCount: available.length,
    scores: {
      sleepScore,
      sleepQualityScore,
      physicalActivityScore,
      dailyStepsScore,
      stressManagementScore,
    },
    explanations: {
      sleep: getSleepExplanation(sleepScore, entry.Sleep_Duration ?? entry.sleep_duration, targetDuration),
      sleepQuality: getSleepQualityExplanation(sleepQualityScore),
      activity: getActivityExplanation(physicalActivityScore),
      steps: getStepsExplanation(dailyStepsScore),
      stress: getStressExplanation(stressManagementScore),
    },
  };
}

function getSleepExplanation(score, duration, target) {
  if (score === null) return "No sleep data logged today.";
  if (score >= 85) return `Optimal rest achieved (${duration}h logged against ${target}h target).`;
  if (score >= 70) return `Good restorative rest, close to your ${target}h goal.`;
  if (score >= 50) return `Fair sleep duration (${duration}h); an extra 30-60 mins would help.`;
  return `Rest deserves attention. Try moving closer to your ${target}h goal tonight.`;
}

function getSleepQualityExplanation(score) {
  if (score === null) return "Quality unrecorded.";
  if (score >= 80) return "Deep, refreshing sleep reported.";
  if (score >= 60) return "Moderate sleep satisfaction.";
  return "Restless or light sleep indicated.";
}

function getActivityExplanation(score) {
  if (score === null) return "No activity logged.";
  if (score >= 90) return "Exceeded daily activity target with energetic movement.";
  if (score >= 70) return "Solid movement logged today. Keep up the momentum.";
  if (score >= 50) return "Moderate activity; a light walk would boost this score.";
  return "Gentle stretching or light walking can help recharge your body.";
}

function getStepsExplanation(score) {
  if (score === null) return "Step count not entered.";
  if (score >= 90) return "Fantastic step count! Your vitality is thriving.";
  if (score >= 70) return "Great progress towards your daily step goal.";
  if (score >= 50) return "Halfway to your step target today.";
  return "Small steps build stronger habits throughout the day.";
}

function getStressExplanation(score) {
  if (score === null) return "Stress level not reported.";
  if (score >= 80) return "Calm and well-regulated nervous system.";
  if (score >= 60) return "Manageable stress with good resilience.";
  if (score >= 40) return "Moderate tension noted; take brief breathing intervals.";
  return "Pause, breathe, and give yourself a moment of calm space.";
}
