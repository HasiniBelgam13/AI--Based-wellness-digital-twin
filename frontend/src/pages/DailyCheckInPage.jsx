import React, { useState, useEffect } from 'react';
import {
  Moon,
  Droplets,
  Activity,
  Zap,
  Save,
  CheckCircle2,
  Calendar,
  Heart,
  ArrowRight
} from 'lucide-react';
import { getTodayDateInputValue } from '../utils/dateUtils';
import { calculateAllScores } from '../utils/scoreCalculator';
import { predictWellness } from '../services/wellnessService';
import { saveCheckIn } from '../services/storageService';
import Modal from '../components/common/Modal';

const MOOD_OPTIONS = [
  { id: 'terrible', label: 'Terrible', emoji: '😫', color: '#A855F7', stressDefault: 9 },
  { id: 'bad', label: 'Bad', emoji: '🙁', color: '#FB923C', stressDefault: 7 },
  { id: 'okay', label: 'Okay', emoji: '😐', color: '#FBBF24', stressDefault: 5 },
  { id: 'good', label: 'Good', emoji: '🙂', color: '#10B981', stressDefault: 3 },
  { id: 'great', label: 'Great', emoji: '😃', color: '#06B6D4', stressDefault: 2 }
];

export default function DailyCheckInPage({
  currentUser,
  userProfile,
  checkIns,
  onCheckInSaved,
  onNavigate
}) {
  const today = getTodayDateInputValue();

  const [date, setDate] = useState(today);
  const [sleepHours, setSleepHours] = useState('');
  const [dailySteps, setDailySteps] = useState('');
  const [activityTime, setActivityTime] = useState('');
  const [stressLevel, setStressLevel] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);
  const [heartRate, setHeartRate] = useState('');

  const [saving, setSaving] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [isUpdateConfirmationOpen, setIsUpdateConfirmationOpen] = useState(false);
  const checkInForSelectedDate = checkIns.find((entry) => entry.date === date);
  const hasCheckedInToday = date === today && Boolean(checkInForSelectedDate);

  useEffect(() => {
    const existing = checkInForSelectedDate;
    if (existing) {
      setSleepHours(existing.Sleep_Duration);
      setDailySteps(existing.Daily_Steps);
      setActivityTime(existing.Physical_Activity_Level);
      setStressLevel(existing.Stress_Level);
      setHeartRate(existing.Heart_Rate ?? '');
      if (existing.Stress_Level <= 2) setSelectedMood('great');
      else if (existing.Stress_Level <= 4) setSelectedMood('good');
      else if (existing.Stress_Level <= 6) setSelectedMood('okay');
      else if (existing.Stress_Level <= 8) setSelectedMood('bad');
      else setSelectedMood('terrible');
    } else {
      setSleepHours('');
      setDailySteps('');
      setActivityTime('');
      setStressLevel(null);
      setSelectedMood(null);
      setHeartRate('');
    }
  }, [date, checkInForSelectedDate]);

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood.id);
    setStressLevel(mood.stressDefault);
  };

  const handleStressChange = (value) => {
    setStressLevel(value);
    const closestMood = MOOD_OPTIONS.reduce((closest, mood) =>
      Math.abs(mood.stressDefault - value) < Math.abs(closest.stressDefault - value) ? mood : closest
    );
    setSelectedMood(closestMood.id);
  };

  const persistCheckIn = async () => {
    setSaving(true);

    try {
      const duration = Number(sleepHours);
      const steps = Number(dailySteps);
      const activity = Number(activityTime);

      const entryDraft = {
        date,
        Sleep_Duration: duration,
        Quality_of_Sleep: selectedMood === 'great' ? 9 : selectedMood === 'good' ? 8 : selectedMood === 'okay' ? 6 : 4,
        Stress_Level: Number(stressLevel),
        Physical_Activity_Level: activity,
        Daily_Steps: steps,
        Heart_Rate: Number(heartRate),
        Blood_Pressure: userProfile?.bloodPressure || '120/80',
        BMI_Category: userProfile?.bmiCategory || 'Normal',
        Gender: userProfile?.gender || 'Female',
        Age: userProfile?.age || 28,
        Occupation: userProfile?.occupation || 'Doctor',
        Sleep_Disorder: userProfile?.sleepDisorder || 'None',
        name: currentUser?.name || ''
      };

      const scoreResults = calculateAllScores(entryDraft, userProfile?.goals);
      const mlResponse = await predictWellness(entryDraft, userProfile);

      const fullRecord = {
        ...entryDraft,
        overallScore: scoreResults.overallScore,
        statusLabel: scoreResults.statusLabel,
        scores: scoreResults.scores,
        wellnessState: mlResponse.wellnessState,
        probabilities: mlResponse.probabilities,
        isFromML: mlResponse.isFromML,
        createdAt: new Date().toISOString()
      };

      const saved = saveCheckIn(currentUser.id, fullRecord);
      onCheckInSaved(saved);

      setSuccessInfo({
        date: saved.date,
        overallScore: saved.overallScore,
        statusLabel: saved.statusLabel,
        wellnessState: saved.wellnessState
      });
    } catch (err) {
      setValidationError(err.message || 'Error saving check-in.');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setValidationError('');
    setSuccessInfo(null);

    const duration = Number(sleepHours);
    if (duration < 3 || duration > 16) {
      setValidationError('Please enter a realistic sleep duration (3 - 16 hours).');
      return;
    }

    if (!selectedMood || stressLevel === null) {
      setValidationError('Choose your mood and stress level before saving.');
      return;
    }

    if (checkIns.some((entry) => entry.date === date)) {
      setIsUpdateConfirmationOpen(true);
      return;
    }

    await persistCheckIn();
  };

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {hasCheckedInToday && (
        <div
          role="status"
          style={{
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            borderRadius: '16px',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: '#047857'
          }}
        >
          <CheckCircle2 size={20} />
          <span><strong>Today's check-in is complete.</strong> Your saved values are shown below.</span>
        </div>
      )}

      {/* Success Notification */}
      {successInfo && (
        <div
          style={{
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            borderRadius: '16px',
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--wn-shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: '#10B981',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CheckCircle2 size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: '#065F46' }}>
                Check-in Saved Successfully!
              </h4>
              <p style={{ fontSize: 13, color: '#047857' }}>
                Overall Score: <strong>{successInfo.overallScore} / 100</strong> ({successInfo.statusLabel}) • Wellness state: <strong>{successInfo.wellnessState}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('dashboard')}
            className="wn-btn"
            style={{ backgroundColor: '#10B981', color: '#fff', padding: '8px 16px', fontSize: 13 }}
          >
            Go to Dashboard
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Main Form + Side Illustration Card (Matching Reference Layout) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' }}>
        {/* Form Card */}
        <form onSubmit={handleSave} className="wn-card" style={{ padding: '32px 36px' }}>
          {/* Header row with date picker */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--wn-text-primary)' }}>
              Basic Details
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={15} style={{ color: 'var(--wn-text-muted)' }} />
              <input
                type="date"
                value={date}
                max={today}
                onChange={(e) => setDate(e.target.value)}
                style={{ padding: '6px 10px', fontSize: 12.5 }}
              />
            </div>
          </div>

          {/* 2x2 Basic Details Inputs (Matching Reference) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
            {/* 1. Sleep Hours */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, color: 'var(--wn-text-secondary)', marginBottom: 8 }}>
                <Moon size={15} style={{ color: '#735BF2' }} />
                <span>Sleep Hours</span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  step="0.1"
                  min="3"
                  max="16"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  style={{ width: '100%', paddingRight: 55, fontWeight: 600, fontSize: 15 }}
                  required
                />
                <span style={{ position: 'absolute', right: 12, top: 11, fontSize: 12, color: 'var(--wn-text-muted)' }}>
                  hours
                </span>
              </div>
            </div>

            {/* 2. Daily Steps / Hydration */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, color: 'var(--wn-text-secondary)', marginBottom: 8 }}>
                <Droplets size={15} style={{ color: '#0EA5E9' }} />
                <span>Daily Steps Count</span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  step="100"
                  min="0"
                  max="40000"
                  value={dailySteps}
                  onChange={(e) => setDailySteps(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  style={{ width: '100%', paddingRight: 55, fontWeight: 600, fontSize: 15 }}
                  required
                />
                <span style={{ position: 'absolute', right: 12, top: 11, fontSize: 12, color: 'var(--wn-text-muted)' }}>
                  steps
                </span>
              </div>
            </div>

            {/* 3. Activity Time */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, color: 'var(--wn-text-secondary)', marginBottom: 8 }}>
                <Activity size={15} style={{ color: '#10B981' }} />
                <span>Activity Time</span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  step="5"
                  min="0"
                  max="300"
                  value={activityTime}
                  onChange={(e) => setActivityTime(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  style={{ width: '100%', paddingRight: 65, fontWeight: 600, fontSize: 15 }}
                  required
                />
                <span style={{ position: 'absolute', right: 12, top: 11, fontSize: 12, color: 'var(--wn-text-muted)' }}>
                  minutes
                </span>
              </div>
            </div>

            {/* 4. Stress Level Slider */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 600, color: 'var(--wn-text-secondary)', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Zap size={15} style={{ color: '#FB923C' }} />
                  <span>Stress Level</span>
                </div>
                <span style={{ color: '#735BF2', fontWeight: 700 }}>
                  {stressLevel === null ? 'Choose level' : `${stressLevel} / 10`}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={stressLevel ?? 5}
                onChange={(e) => handleStressChange(parseInt(e.target.value, 10))}
                style={{ width: '100%', height: 6, accentColor: '#735BF2' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, color: 'var(--wn-text-secondary)', marginBottom: 8 }}>
                <Heart size={15} style={{ color: '#E06D6D' }} />
                <span>Heart Rate</span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  min="30"
                  max="220"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  style={{ width: '100%', paddingRight: 55, fontWeight: 600, fontSize: 15 }}
                  required
                />
                <span style={{ position: 'absolute', right: 12, top: 11, fontSize: 12, color: 'var(--wn-text-muted)' }}>
                  bpm
                </span>
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--wn-border-light)', margin: '24px 0' }} />

          {/* Mood Section (Matching Reference 5 Mood Faces) */}
          <div>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--wn-text-primary)', marginBottom: 4 }}>
              Mood
            </h4>
            <p style={{ fontSize: 12.5, color: 'var(--wn-text-muted)', marginBottom: 16 }}>
              How are you feeling right now?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 28 }}>
              {MOOD_OPTIONS.map((mood) => {
                const isSelected = selectedMood === mood.id;
                return (
                  <button
                    key={mood.id}
                    type="button"
                    onClick={() => handleMoodSelect(mood)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8,
                      padding: '14px 8px',
                      borderRadius: '16px',
                      backgroundColor: isSelected ? 'var(--wn-surface)' : 'var(--wn-surface-subtle)',
                      border: isSelected ? `2px solid ${mood.color}` : '1px solid var(--wn-border-light)',
                      boxShadow: isSelected ? `0 4px 12px ${mood.color}33` : 'none',
                      transform: isSelected ? 'translateY(-2px)' : 'none',
                      transition: 'all 0.16s ease'
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        backgroundColor: isSelected ? `${mood.color}22` : 'var(--wn-surface)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 22
                      }}
                    >
                      {mood.emoji}
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? mood.color : 'var(--wn-text-secondary)'
                      }}
                    >
                      {mood.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {validationError && (
            <p role="alert" style={{ color: '#C2414B', fontSize: 13, marginBottom: 12 }}>
              {validationError}
            </p>
          )}

          {/* Prominent Reference Purple Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="wn-btn wn-btn-primary"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: 15,
              fontWeight: 700,
              borderRadius: '12px',
              letterSpacing: '0.2px'
            }}
          >
            <Save size={18} />
            <span>{saving ? 'Evaluating & Saving...' : 'Save Check-In'}</span>
          </button>
        </form>

        <Modal
          isOpen={isUpdateConfirmationOpen}
          onClose={() => setIsUpdateConfirmationOpen(false)}
          title={date === today ? "Today's check-in is already saved" : 'A check-in already exists'}
          subtitle="Would you like to replace the saved check-in with these updated values?"
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              className="wn-btn wn-btn-outline"
              onClick={() => setIsUpdateConfirmationOpen(false)}
            >
              Keep existing
            </button>
            <button
              type="button"
              className="wn-btn wn-btn-primary"
              disabled={saving}
              onClick={async () => {
                setIsUpdateConfirmationOpen(false);
                await persistCheckIn();
              }}
            >
              Replace check-in
            </button>
          </div>
        </Modal>

        {/* Right Side Card: "Take care of your mind, body and heart. 💚" with Potted Plant */}
        <div
          className="wn-card"
          style={{
            padding: '28px 24px',
            backgroundColor: '#FFFDF9',
            border: '1px solid #F5EEDB',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          <p
            style={{
              fontFamily: 'var(--wn-font-heading)',
              fontSize: 16,
              fontWeight: 700,
              color: 'var(--wn-text-primary)',
              lineHeight: 1.45,
              marginBottom: 18
            }}
          >
            "Take care of your mind, body and heart. 💚"
          </p>

          {/* Botanical Potted Plant Illustration SVG */}
          <svg viewBox="0 0 160 210" width="150" height="200">
            {/* Plant Pot */}
            <path d="M 50 160 L 60 200 L 100 200 L 110 160 Z" fill="#E6D3B3" />
            <ellipse cx="80" cy="160" rx="30" ry="6" fill="#D4BC96" />
            <ellipse cx="80" cy="161" rx="28" ry="4" fill="#6B4F35" />

            {/* Central Stem */}
            <path d="M 80 160 Q 78 100 80 40" stroke="#059669" strokeWidth="4" fill="none" strokeLinecap="round" />

            {/* Leaves in lush botanical tiers */}
            <path d="M 80 135 Q 45 130 50 110 Q 75 115 80 135 Z" fill="#10B981" />
            <path d="M 80 120 Q 115 115 110 95 Q 85 100 80 120 Z" fill="#34D399" />
            <path d="M 80 95 Q 48 90 52 70 Q 74 75 80 95 Z" fill="#059669" />
            <path d="M 80 80 Q 112 75 106 55 Q 85 62 80 80 Z" fill="#10B981" />
            <path d="M 80 50 Q 80 20 80 30 Q 70 35 80 50 Z" fill="#34D399" />

            {/* Soft Aura Glow */}
            <circle cx="80" cy="90" r="60" fill="#ECFDF5" opacity="0.4" />
          </svg>

          <p style={{ fontSize: 12, color: 'var(--wn-text-muted)', marginTop: 12, lineHeight: 1.4 }}>
            Take time for yourself. Consistent habits nurture everyday vitality.
          </p>
        </div>
      </div>
    </div>
  );
}
