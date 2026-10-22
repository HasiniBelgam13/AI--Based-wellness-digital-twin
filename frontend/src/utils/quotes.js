/**
 * WellNest Motivational Microcopy & Supportive Guidance
 * Empathetic, calm, non-judgmental wellness affirmations.
 */

export const EMPTY_STATE_QUOTE = {
  quote: "Every journey begins with one small check-in.",
  subtext: "Track your rest, movement, and calm to understand your personal rhythm.",
  category: "welcome"
};

export function getMotivationalMessage(latestScore, scores = {}, delta = null) {
  if (latestScore === null || latestScore === undefined) {
    return EMPTY_STATE_QUOTE;
  }

  // Priority 1: High stress needs immediate gentle calm
  if (scores.stressManagementScore !== null && scores.stressManagementScore < 45) {
    return {
      quote: "Pause, breathe, and give yourself a moment of calm.",
      subtext: "A calmer mind begins with a little quiet breathing space.",
      category: "calm"
    };
  }

  // Priority 2: Low sleep
  if (scores.sleepScore !== null && scores.sleepScore < 50) {
    return {
      quote: "Your rest deserves attention. Try moving closer to your sleep goal tonight.",
      subtext: "Listen to your body. Rest is productive, too.",
      category: "sleep"
    };
  }

  // Priority 3: Positive progress compared to previous check-in
  if (delta !== null && delta > 2) {
    return {
      quote: "You're building a beautiful rhythm. Keep nurturing your habits.",
      subtext: `Your overall balance improved by ${delta} points from your last check-in.`,
      category: "progress"
    };
  }

  // Priority 4: High physical activity
  if (scores.physicalActivityScore !== null && scores.physicalActivityScore >= 85) {
    return {
      quote: "Look at you, building healthier habits one step at a time!",
      subtext: "Every healthy habit is a quiet investment in yourself.",
      category: "movement"
    };
  }

  // Priority 5: Excellent overall score
  if (latestScore >= 80) {
    const excellentQuotes = [
      {
        quote: "You're nurturing your vitality with harmony and consistency.",
        subtext: "Your body deserves the same gentle care you give everything else.",
        category: "vitality"
      },
      {
        quote: "Your wellness journey is yours. Celebrate every small improvement.",
        subtext: "Progress, not perfection.",
        category: "vitality"
      }
    ];
    return excellentQuotes[Math.floor(Math.random() * excellentQuotes.length)];
  }

  // Priority 6: Balanced/Moderate score
  return {
    quote: "One better choice today is a beautiful start.",
    subtext: "Small steps, stronger habits. Give tomorrow your best.",
    category: "balance"
  };
}
