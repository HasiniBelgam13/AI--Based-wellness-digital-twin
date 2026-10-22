import React, { useState, useEffect } from 'react';
import {
  Sliders,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Moon,
  Flame,
  Activity,
  Footprints,
  Heart,
  Info,
  Bot,
  AlertCircle
} from 'lucide-react';
import { calculateAllScores } from '../utils/scoreCalculator';
import { runWhatIfAnalysis } from '../services/wellnessService';
import CircularScore from '../components/common/CircularScore';
import Badge from '../components/common/Badge';

export default function WhatIfAnalysisPage({
  currentUser,
  userProfile,
  checkIns,
  onNavigate
}) {
  const latestCheckIn = checkIns && checkIns.length > 0 ? checkIns[0] : null;

  const [scenario, setScenario] = useState({
    sleepDuration: 8.0,
    sleepQuality: 8,
    stressLevel: 3,
    physicalActivity: 60,
    dailySteps: 10000,
    heartRate: 70
  });

  const [mlComparison, setMlComparison] = useState(null);

  useEffect(() => {
    if (latestCheckIn) {
      setScenario({
        sleepDuration: latestCheckIn.Sleep_Duration,
        sleepQuality: latestCheckIn.Quality_of_Sleep,
        stressLevel: latestCheckIn.Stress_Level,
        physicalActivity: latestCheckIn.Physical_Activity_Level,
        dailySteps: latestCheckIn.Daily_Steps,
        heartRate: latestCheckIn.Heart_Rate || 70
      });
    }
  }, [latestCheckIn]);

  const hypotheticalScoreResult = latestCheckIn
    ? calculateAllScores(
        {
          Sleep_Duration: scenario.sleepDuration,
          Quality_of_Sleep: scenario.sleepQuality,
          Stress_Level: scenario.stressLevel,
          Physical_Activity_Level: scenario.physicalActivity,
          Daily_Steps: scenario.dailySteps,
          Heart_Rate: scenario.heartRate
        },
        userProfile?.goals
      )
    : null;

  useEffect(() => {
    if (!latestCheckIn) return;

    let isMounted = true;
    const timeout = setTimeout(async () => {
      try {
        const res = await runWhatIfAnalysis(
          latestCheckIn,
          {
            Sleep_Duration: scenario.sleepDuration,
            Quality_of_Sleep: scenario.sleepQuality,
            Stress_Level: scenario.stressLevel,
            Physical_Activity_Level: scenario.physicalActivity,
            Daily_Steps: scenario.dailySteps,
            Heart_Rate: scenario.heartRate
          },
          userProfile
        );
        if (isMounted) setMlComparison(res);
      } catch (err) {
        console.warn('What-If ML request failed:', err);
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [scenario, latestCheckIn, userProfile]);

  const handleResetToBaseline = () => {
    if (latestCheckIn) {
      setScenario({
        sleepDuration: latestCheckIn.Sleep_Duration,
        sleepQuality: latestCheckIn.Quality_of_Sleep,
        stressLevel: latestCheckIn.Stress_Level,
        physicalActivity: latestCheckIn.Physical_Activity_Level,
        dailySteps: latestCheckIn.Daily_Steps,
        heartRate: latestCheckIn.Heart_Rate || 70
      });
    }
  };

  if (!latestCheckIn) {
    return (
      <div
        className="wn-card"
        style={{
          maxWidth: 640,
          margin: '40px auto',
          padding: '48px 40px',
          textAlign: 'center'
        }}
      >
        <AlertCircle size={40} style={{ color: '#735BF2', margin: '0 auto 16px auto' }} />
        <h3 style={{ fontSize: 19, fontWeight: 800, color: 'var(--wn-text-primary)' }}>
          Check-in Required for What-If Analysis
        </h3>
        <p style={{ fontSize: 13.5, color: 'var(--wn-text-secondary)', maxWidth: 460, margin: '10px auto 24px auto', lineHeight: 1.5 }}>
          The What-If digital twin simulator compares hypothetical lifestyle adjustments against your real saved measurements. Please complete your first check-in to establish your baseline.
        </p>
        <button
          onClick={() => onNavigate('checkin')}
          className="wn-btn wn-btn-primary"
          style={{ fontSize: 14 }}
        >
          Complete First Check-in
        </button>
      </div>
    );
  }

  const baselineScore = latestCheckIn.overallScore;
  const hypotheticalScore = hypotheticalScoreResult?.overallScore || baselineScore;
  const scoreDelta = hypotheticalScore - baselineScore;

  let explanatoryInsight = "";
  if (scoreDelta > 0) {
    explanatoryInsight = `In this hypothetical scenario, optimizing your habits increases your overall score by +${scoreDelta} points (${baselineScore} → ${hypotheticalScore}).`;
  } else if (scoreDelta < 0) {
    explanatoryInsight = `In this hypothetical scenario, reduced rest or higher stress lowers your overall score by ${scoreDelta} points (${baselineScore} → ${hypotheticalScore}).`;
  } else {
    explanatoryInsight = "Hypothetical measurements currently mirror your baseline check-in values.";
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Disclaimer Banner */}
      <div
        style={{
          backgroundColor: '#FAF5FF',
          border: '1px solid #E9D5FF',
          borderRadius: '16px',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Info size={17} style={{ color: '#735BF2', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: '#4B5563' }}>
            <strong>Hypothetical Sandbox:</strong> Moving these sliders simulates outcomes in real-time. Original recorded check-ins are never altered.
          </span>
        </div>
        <button
          onClick={handleResetToBaseline}
          className="wn-btn wn-btn-outline"
          style={{ padding: '6px 14px', fontSize: 12.5 }}
        >
          <RotateCcw size={13} />
          <span>Reset to Baseline</span>
        </button>
      </div>

      {/* Main Grid: Sliders on Left, Instant Comparison on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
        {/* Left Column: Sliders */}
        <div className="wn-card" style={{ padding: '28px 30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '8px',
                backgroundColor: '#F4F0FF',
                color: '#735BF2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Sliders size={17} />
            </div>
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--wn-text-primary)' }}>
                Adjust Hypothetical Measurements
              </h4>
              <span style={{ fontSize: 12, color: 'var(--wn-text-muted)' }}>
                Drag sliders to see how your score and wellness state change
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Sleep Duration */}
            <div className="wn-form-group" style={{ marginBottom: 0 }}>
              <div className="wn-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Moon size={15} style={{ color: '#735BF2' }} /> Sleep Duration
                </span>
                <span style={{ color: '#735BF2', fontWeight: 700 }}>
                  {scenario.sleepDuration} hrs{' '}
                  <span style={{ fontSize: 11, color: 'var(--wn-text-muted)' }}>
                    (Baseline: {latestCheckIn.Sleep_Duration}h)
                  </span>
                </span>
              </div>
              <input
                type="range"
                min="4.0"
                max="12.0"
                step="0.1"
                value={scenario.sleepDuration}
                onChange={(e) => setScenario({ ...scenario, sleepDuration: parseFloat(e.target.value) })}
                style={{ accentColor: '#735BF2' }}
              />
            </div>

            {/* Sleep Quality */}
            <div className="wn-form-group" style={{ marginBottom: 0 }}>
              <div className="wn-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={15} style={{ color: '#735BF2' }} /> Sleep Quality
                </span>
                <span style={{ color: '#735BF2', fontWeight: 700 }}>
                  {scenario.sleepQuality} / 10{' '}
                  <span style={{ fontSize: 11, color: 'var(--wn-text-muted)' }}>
                    (Baseline: {latestCheckIn.Quality_of_Sleep})
                  </span>
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={scenario.sleepQuality}
                onChange={(e) => setScenario({ ...scenario, sleepQuality: parseInt(e.target.value, 10) })}
                style={{ accentColor: '#735BF2' }}
              />
            </div>

            {/* Stress Level */}
            <div className="wn-form-group" style={{ marginBottom: 0 }}>
              <div className="wn-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Flame size={15} style={{ color: '#FB923C' }} /> Stress Level
                </span>
                <span style={{ color: '#FB923C', fontWeight: 700 }}>
                  {scenario.stressLevel} / 10{' '}
                  <span style={{ fontSize: 11, color: 'var(--wn-text-muted)' }}>
                    (Baseline: {latestCheckIn.Stress_Level})
                  </span>
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={scenario.stressLevel}
                onChange={(e) => setScenario({ ...scenario, stressLevel: parseInt(e.target.value, 10) })}
                style={{ accentColor: '#FB923C' }}
              />
            </div>

            {/* Daily Steps */}
            <div className="wn-form-group" style={{ marginBottom: 0 }}>
              <div className="wn-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Footprints size={15} style={{ color: '#0EA5E9' }} /> Daily Steps
                </span>
                <span style={{ color: '#0EA5E9', fontWeight: 700 }}>
                  {Number(scenario.dailySteps).toLocaleString()} steps{' '}
                  <span style={{ fontSize: 11, color: 'var(--wn-text-muted)' }}>
                    (Baseline: {Number(latestCheckIn.Daily_Steps).toLocaleString()})
                  </span>
                </span>
              </div>
              <input
                type="range"
                min="2000"
                max="20000"
                step="500"
                value={scenario.dailySteps}
                onChange={(e) => setScenario({ ...scenario, dailySteps: parseInt(e.target.value, 10) })}
                style={{ accentColor: '#0EA5E9' }}
              />
            </div>

            {/* Physical Activity */}
            <div className="wn-form-group" style={{ marginBottom: 0 }}>
              <div className="wn-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Activity size={15} style={{ color: '#10B981' }} /> Active Minutes
                </span>
                <span style={{ color: '#10B981', fontWeight: 700 }}>
                  {scenario.physicalActivity} mins{' '}
                  <span style={{ fontSize: 11, color: 'var(--wn-text-muted)' }}>
                    (Baseline: {latestCheckIn.Physical_Activity_Level}m)
                  </span>
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="180"
                step="5"
                value={scenario.physicalActivity}
                onChange={(e) => setScenario({ ...scenario, physicalActivity: parseInt(e.target.value, 10) })}
                style={{ accentColor: '#10B981' }}
              />
            </div>

            {/* Heart Rate */}
            <div className="wn-form-group" style={{ marginBottom: 0 }}>
              <div className="wn-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Heart size={15} style={{ color: '#F43F5E' }} /> Resting Heart Rate
                </span>
                <span style={{ color: 'var(--wn-text-primary)', fontWeight: 700 }}>
                  {scenario.heartRate} bpm{' '}
                  <span style={{ fontSize: 11, color: 'var(--wn-text-muted)' }}>
                    (Baseline: {latestCheckIn.Heart_Rate || 70} bpm)
                  </span>
                </span>
              </div>
              <input
                type="range"
                min="55"
                max="100"
                step="1"
                value={scenario.heartRate}
                onChange={(e) => setScenario({ ...scenario, heartRate: parseInt(e.target.value, 10) })}
                style={{ accentColor: '#F43F5E' }}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Instant Comparison Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Comparison Score Card */}
          <div className="wn-card" style={{ padding: '24px 22px' }}>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--wn-text-primary)', textAlign: 'center', marginBottom: 18 }}>
              Simulated Score Comparison
            </h4>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
              {/* Baseline */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--wn-text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Current Baseline
                </div>
                <CircularScore
                  score={baselineScore}
                  size={110}
                  strokeWidth={9}
                  showLabel={false}
                />
                <div style={{ marginTop: 6, fontSize: 12.5, fontWeight: 700, color: 'var(--wn-text-secondary)' }}>
                  {latestCheckIn.statusLabel}
                </div>
              </div>

              {/* Arrow with Score Delta */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <ArrowRight size={20} style={{ color: 'var(--wn-text-muted)' }} />
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    fontSize: 12,
                    fontWeight: 700,
                    backgroundColor:
                      scoreDelta > 0
                        ? '#ECFDF5'
                        : scoreDelta < 0
                        ? '#FFF7ED'
                        : 'var(--wn-surface-subtle)',
                    color:
                      scoreDelta > 0
                        ? '#10B981'
                        : scoreDelta < 0
                        ? '#FB923C'
                        : 'var(--wn-text-muted)'
                  }}
                >
                  {scoreDelta > 0 ? `+${scoreDelta} pts` : scoreDelta < 0 ? `${scoreDelta} pts` : '0 pts'}
                </span>
              </div>

              {/* Hypothetical */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: '#735BF2', textTransform: 'uppercase', marginBottom: 6 }}>
                  Simulated Outcome
                </div>
                <CircularScore
                  score={hypotheticalScore}
                  size={110}
                  strokeWidth={9}
                  showLabel={false}
                />
                <div style={{ marginTop: 6, fontSize: 12.5, fontWeight: 700, color: '#735BF2' }}>
                  {hypotheticalScoreResult?.statusLabel}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 20,
                padding: '12px 14px',
                borderRadius: '12px',
                backgroundColor: 'var(--wn-surface-subtle)',
                fontSize: 12.5,
                color: 'var(--wn-text-secondary)',
                lineHeight: 1.4,
                textAlign: 'center'
              }}
            >
              {explanatoryInsight}
            </div>
          </div>

          {/* Simulated State Transition */}
          <div className="wn-card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Sparkles size={16} style={{ color: '#10B981' }} />
              <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--wn-text-primary)' }}>
                Simulated Wellness Status
              </h4>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: 'var(--wn-surface-subtle)', borderRadius: '12px' }}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--wn-text-muted)' }}>Current Status</span>
                <div style={{ marginTop: 4 }}>
                  <Badge label={latestCheckIn.wellnessState || "Not available"} />
                </div>
              </div>

              <ArrowRight size={16} style={{ color: 'var(--wn-text-muted)' }} />

              <div>
                <span style={{ fontSize: 11, color: 'var(--wn-text-muted)' }}>Simulated Status</span>
                <div style={{ marginTop: 4 }}>
                  <Badge
                    label={mlComparison?.whatIfWellnessState || latestCheckIn.wellnessState || "Not available"}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sub-score shifts */}
          {hypotheticalScoreResult && latestCheckIn.scores && (
            <div className="wn-card" style={{ padding: '18px 22px' }}>
              <h5 style={{ fontSize: 13, fontWeight: 700, color: 'var(--wn-text-primary)', marginBottom: 10 }}>
                Sub-score Shifts
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--wn-text-secondary)' }}>Sleep Score</span>
                  <span>{latestCheckIn.scores.sleepScore} → <strong style={{ color: '#735BF2' }}>{hypotheticalScoreResult.scores.sleepScore}</strong></span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--wn-text-secondary)' }}>Stress Balance</span>
                  <span>{latestCheckIn.scores.stressManagementScore} → <strong style={{ color: '#FB923C' }}>{hypotheticalScoreResult.scores.stressManagementScore}</strong></span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--wn-text-secondary)' }}>Daily Steps Progress</span>
                  <span>{latestCheckIn.scores.dailyStepsScore} → <strong style={{ color: '#0EA5E9' }}>{hypotheticalScoreResult.scores.dailyStepsScore}</strong></span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--wn-text-secondary)' }}>Physical Activity</span>
                  <span>{latestCheckIn.scores.physicalActivityScore} → <strong style={{ color: '#10B981' }}>{hypotheticalScoreResult.scores.physicalActivityScore}</strong></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
