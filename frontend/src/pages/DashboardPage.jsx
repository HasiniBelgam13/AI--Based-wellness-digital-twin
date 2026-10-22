import React from 'react';
import {
  Activity,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Footprints,
  Heart,
  Moon,
  Sparkles,
  Star,
  Zap
} from 'lucide-react';
import { formatFullDate, getTodayDateInputValue } from '../utils/dateUtils';
import { getScoreColor, getScoreStatusLabel } from '../utils/scoreCalculator';

function ProgressRow({ icon: Icon, label, current, goal, unit, color, percent }) {
  return (
    <div className="dashboard-progress-row">
      <div className="dashboard-progress-icon" style={{ color, backgroundColor: `${color}16` }}>
        <Icon size={15} />
      </div>
      <div className="dashboard-progress-content">
        <div className="dashboard-progress-title">
          <strong>{label}</strong>
          <span>{percent}%</span>
        </div>
        <div className="dashboard-progress-track">
          <span style={{ width: `${percent}%`, backgroundColor: color }} />
        </div>
        <small>{current} / {goal}{unit}</small>
      </div>
    </div>
  );
}

export default function DashboardPage({ userProfile, checkIns, onNavigate, onOpenGoals }) {
  const latestCheckIn = checkIns?.[0];
  const hasCheckedInToday = checkIns?.some((entry) => entry.date === getTodayDateInputValue()) ?? false;

  if (!latestCheckIn) {
    return (
      <section className="dashboard-empty wn-card">
        <img src="/wellnest-meditation-logo.png" alt="" />
        <h2>Your wellness journey starts here</h2>
        <p>Your personal score and trends will appear after you record your first check-in.</p>
        <button onClick={() => onNavigate('checkin')} className="wn-btn wn-btn-primary">
          Complete your first check-in <ArrowRight size={16} />
        </button>
      </section>
    );
  }

  const score = Math.max(0, Math.min(100, Math.round(Number(latestCheckIn.overallScore) || 0)));
  const statusLabel = latestCheckIn.statusLabel || getScoreStatusLabel(score);
  const scoreColor = getScoreColor(score);
  const goals = userProfile?.goals || {};
  const sleepGoal = Number(goals.sleepDuration || 8);
  const stepsGoal = Number(goals.dailySteps || 10000);
  const activityGoal = Number(goals.physicalActivity || 60);
  const sleepHours = Number(latestCheckIn.Sleep_Duration || 0);
  const stepsCount = Number(latestCheckIn.Daily_Steps || 0);
  const activityMins = Number(latestCheckIn.Physical_Activity_Level || 0);
  const scoreRadius = 58;
  const scoreCircumference = 2 * Math.PI * scoreRadius;
  const scoreOffset = scoreCircumference * (1 - score / 100);
  const percentOf = (value, goal) => Math.min(100, Math.round((value / goal) * 100) || 0);

  const metrics = [
    { label: 'Sleep', value: `${sleepHours} h`, detail: `Quality ${latestCheckIn.Quality_of_Sleep ?? '—'} / 10`, icon: Moon, tone: 'lilac' },
    { label: 'Sleep quality', value: `${latestCheckIn.scores?.sleepQualityScore ?? latestCheckIn.Quality_of_Sleep ?? '—'} / 100`, detail: 'Latest check-in', icon: Star, tone: 'blue' },
    { label: 'Stress level', value: `${latestCheckIn.Stress_Level ?? '—'} / 10`, detail: 'Lower is calmer', icon: Zap, tone: 'peach' },
    { label: 'Activity', value: `${activityMins} min`, detail: `Goal ${activityGoal} min`, icon: Activity, tone: 'green' },
    { label: 'Heart rate', value: latestCheckIn.Heart_Rate ? `${latestCheckIn.Heart_Rate} bpm` : 'Not recorded', detail: 'Latest check-in', icon: Heart, tone: 'rose' },
    { label: 'Daily steps', value: stepsCount.toLocaleString(), detail: `Goal ${stepsGoal.toLocaleString()}`, icon: Footprints, tone: 'teal' }
  ];

  const motivation = score >= 85
    ? 'You have built a strong rhythm. Keep making room for the habits that help you feel your best.'
    : score >= 70
      ? 'You are building steady habits. Small, consistent choices can move your wellness forward.'
      : score >= 50
        ? 'Progress does not need to be perfect. Choose one small habit to focus on today.'
        : 'Be gentle with yourself today. Start with one manageable step and build from there.';

  return (
    <div className="dashboard-page">
      <section className="dashboard-overview">
        <div className="dashboard-score-card">
          <div className="dashboard-score-copy">
            <span className="dashboard-kicker"><Sparkles size={14} /> YOUR DAILY SNAPSHOT</span>
            <h2>Wellness score</h2>
            <p>From your latest check-in</p>
          </div>

          <div className="dashboard-score-ring" aria-label={`Wellness score ${score} out of 100`}>
            <svg viewBox="0 0 152 152" aria-hidden="true">
              <circle cx="76" cy="76" r={scoreRadius} className="dashboard-score-track" />
              <circle
                cx="76"
                cy="76"
                r={scoreRadius}
                className="dashboard-score-value"
                style={{ stroke: scoreColor, strokeDasharray: scoreCircumference, strokeDashoffset: scoreOffset }}
              />
            </svg>
            <div className="dashboard-score-center">
              <strong>{score}<span>/100</span></strong>
              <small className="dashboard-score-status" style={{ color: scoreColor }}>{statusLabel}</small>
            </div>
          </div>

          <button className="dashboard-score-link" onClick={() => onNavigate('insights')}>
            View trends <ArrowRight size={15} />
          </button>
        </div>

        <div className="dashboard-metric-grid">
          {metrics.map(({ label, value, detail, icon: Icon, tone }) => (
            <article className={`dashboard-metric-card tone-${tone}`} key={label}>
              <div className="dashboard-metric-top">
                <span className="dashboard-metric-icon"><Icon size={16} /></span>
                <span>{label}</span>
              </div>
              <strong>{value}</strong>
              <small>{detail}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-lower-grid">
        <article className="dashboard-panel dashboard-goals">
          <div className="dashboard-panel-heading">
            <div>
              <span className="dashboard-kicker">YOUR ROUTINE</span>
              <h3>Goal progress</h3>
            </div>
            <button className="dashboard-text-action" onClick={onOpenGoals}>Edit goals</button>
          </div>
          <ProgressRow icon={Moon} label="Sleep" current={sleepHours} goal={sleepGoal} unit=" h" color="#8977B8" percent={percentOf(sleepHours, sleepGoal)} />
          <ProgressRow icon={Footprints} label="Daily steps" current={stepsCount.toLocaleString()} goal={stepsGoal.toLocaleString()} unit="" color="#5795A0" percent={percentOf(stepsCount, stepsGoal)} />
          <ProgressRow icon={Activity} label="Activity" current={activityMins} goal={activityGoal} unit=" min" color="#5A9C79" percent={percentOf(activityMins, activityGoal)} />
        </article>

        <article className="dashboard-panel dashboard-motivation">
          <div className="dashboard-panel-heading">
            <div>
              <span className="dashboard-kicker"><Sparkles size={13} /> A NOTE FOR TODAY</span>
              <h3>Keep your pace</h3>
            </div>
          </div>
          <p>{motivation}</p>
          <img className="dashboard-motivation-art" src="/wellnest-meditation-logo.png" alt="" />
          <div className="dashboard-motivation-foot">
            <span>Based on your score of {score}</span>
            <span className="dashboard-motivation-flower" aria-hidden="true">✿</span>
          </div>
        </article>

        <article className="dashboard-panel dashboard-latest">
          <div className="dashboard-panel-heading">
            <div>
              <span className="dashboard-kicker"><CalendarDays size={13} /> YOUR RECORD</span>
              <h3>Latest check-in</h3>
            </div>
            <button className="dashboard-icon-action" onClick={() => onNavigate('history')} aria-label="Open wellness history">
              <ChevronRight size={18} />
            </button>
          </div>
          <p className="dashboard-latest-date"><Clock3 size={14} /> {formatFullDate(latestCheckIn.date)}</p>
          <div className="dashboard-latest-score">
            <span>Overall score</span>
            <strong>{score}<small>/100</small></strong>
          </div>
          <span className="dashboard-status-pill" style={{ color: scoreColor, backgroundColor: `${scoreColor}18` }}>{statusLabel}</span>
          <button className="dashboard-latest-link" onClick={() => onNavigate('history')}>View check-in history <ArrowRight size={14} /></button>
        </article>
      </section>

      <section className="dashboard-footer-strip">
        <div className="dashboard-footer-message">
          {hasCheckedInToday ? <CheckCircle2 size={18} /> : <Moon size={18} />}
          <span>
            {hasCheckedInToday
              ? "Today's check-in is complete. You're all set for today."
              : 'Rest well today. Give tomorrow your best.'}
          </span>
        </div>
        <div className="dashboard-footer-actions">
          <button onClick={() => onNavigate('checkin')} className="wn-btn wn-btn-primary">
            {hasCheckedInToday ? "View today's check-in" : 'Complete check-in'}
          </button>
          <button onClick={() => onNavigate('whatif')} className="wn-btn wn-btn-outline">Explore What-If</button>
        </div>
      </section>
    </div>
  );
}