import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Moon,
  Droplets,
  Activity,
  Smile,
  Sparkles,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { formatShortDate } from '../utils/dateUtils';

export default function InsightsTrendsPage({ checkIns, onNavigate }) {
  const [activeRange, setActiveRange] = useState('7'); // '7' | '30' | '90'

  // Filter chronologically
  const chartData = useMemo(() => {
    if (!checkIns || checkIns.length === 0) return [];

    let limit = 7;
    if (activeRange === '30') limit = 30;
    if (activeRange === '90') limit = 90;

    const sortedAsc = [...checkIns].sort((a, b) => new Date(a.date) - new Date(b.date));
    const sliceCount = Math.min(sortedAsc.length, limit);
    const selected = sortedAsc.slice(sortedAsc.length - sliceCount);

    return selected.map((item) => ({
      ...item,
      displayDate: formatShortDate(item.date),
      sleep: item.Sleep_Duration,
      steps: Math.round(item.Daily_Steps / 1000), // in thousands for scale
      activity: item.Physical_Activity_Level,
      stress: item.Stress_Level,
      overallScore: item.overallScore
    }));
  }, [checkIns, activeRange]);

  // Overall average score for the Wellness Balance circular ring
  const avgScore = useMemo(() => {
    if (chartData.length === 0) return 0;
    return Math.round(chartData.reduce((acc, c) => acc + c.overallScore, 0) / chartData.length);
  }, [chartData]);

  const balanceCircumference = 2 * Math.PI * 44;
  const balanceOffset = balanceCircumference - (avgScore / 100) * balanceCircumference;
  const latestEntry = chartData[chartData.length - 1];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: 'var(--wn-surface)',
            border: '1px solid var(--wn-border)',
            borderRadius: '12px',
            padding: '10px 14px',
            boxShadow: 'var(--wn-shadow-md)',
            fontSize: 12.5
          }}
        >
          <div style={{ fontWeight: 700, color: 'var(--wn-text-primary)', marginBottom: 4 }}>
            {label}
          </div>
          {payload.map((entry, index) => (
            <div key={`p-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 6, color: entry.color, marginTop: 2 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: entry.color }} />
              <span>{entry.name}: <strong>{entry.value}</strong></span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!latestEntry) {
    return (
      <div className="wn-card" style={{ padding: '56px 28px', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: '#E7F5ED', color: '#23845C', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Sparkles size={26} />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--wn-text-primary)' }}>
          Your insights will grow with your data
        </h2>
        <p style={{ fontSize: 14, color: 'var(--wn-text-muted)', margin: '8px auto 20px', maxWidth: 420, lineHeight: 1.5 }}>
          Record a check-in to see your personal wellness trends here.
        </p>
        <button onClick={() => onNavigate('checkin')} className="wn-btn wn-btn-primary">
          Start a check-in
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Top Filter Buttons matching Reference Image */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
        <button
          onClick={() => setActiveRange('7')}
          style={{
            padding: '7px 18px',
            borderRadius: '9999px',
            fontSize: 13,
            fontWeight: 700,
            backgroundColor: activeRange === '7' ? '#735BF2' : 'var(--wn-surface)',
            color: activeRange === '7' ? '#FFFFFF' : 'var(--wn-text-secondary)',
            border: activeRange === '7' ? '1px solid #735BF2' : '1px solid var(--wn-border)',
            boxShadow: activeRange === '7' ? '0 2px 8px rgba(115, 91, 242, 0.3)' : 'none'
          }}
        >
          7 Days
        </button>
        <button
          onClick={() => setActiveRange('30')}
          style={{
            padding: '7px 18px',
            borderRadius: '9999px',
            fontSize: 13,
            fontWeight: 700,
            backgroundColor: activeRange === '30' ? '#735BF2' : 'var(--wn-surface)',
            color: activeRange === '30' ? '#FFFFFF' : 'var(--wn-text-secondary)',
            border: activeRange === '30' ? '1px solid #735BF2' : '1px solid var(--wn-border)',
            boxShadow: activeRange === '30' ? '0 2px 8px rgba(115, 91, 242, 0.3)' : 'none'
          }}
        >
          30 Days
        </button>
        <button
          onClick={() => setActiveRange('90')}
          style={{
            padding: '7px 18px',
            borderRadius: '9999px',
            fontSize: 13,
            fontWeight: 700,
            backgroundColor: activeRange === '90' ? '#735BF2' : 'var(--wn-surface)',
            color: activeRange === '90' ? '#FFFFFF' : 'var(--wn-text-secondary)',
            border: activeRange === '90' ? '1px solid #735BF2' : '1px solid var(--wn-border)',
            boxShadow: activeRange === '90' ? '0 2px 8px rgba(115, 91, 242, 0.3)' : 'none'
          }}
        >
          3 Months
        </button>
        <div
          style={{
            padding: '7px 12px',
            borderRadius: '9999px',
            backgroundColor: 'var(--wn-surface)',
            border: '1px solid var(--wn-border)',
            color: 'var(--wn-text-muted)',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Calendar size={15} />
        </div>
      </div>

      {/* 4 Metric Top Stat Cards with Delta Pills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {/* 1. Sleep */}
        <div className="wn-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: '6px', backgroundColor: '#F4F0FF', color: '#735BF2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Moon size={14} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--wn-text-secondary)' }}>Sleep</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: 'var(--wn-font-heading)', fontSize: 24, fontWeight: 800, color: 'var(--wn-text-primary)' }}>
              {latestEntry.Sleep_Duration} h
            </div>
          </div>
        </div>

        {/* 2. Hydration / Steps */}
        <div className="wn-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: '6px', backgroundColor: '#F0F9FF', color: '#0EA5E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Droplets size={14} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--wn-text-secondary)' }}>Steps</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: 'var(--wn-font-heading)', fontSize: 24, fontWeight: 800, color: 'var(--wn-text-primary)' }}>
              {Number(latestEntry.Daily_Steps).toLocaleString()}
            </div>
          </div>
        </div>

        {/* 3. Activity */}
        <div className="wn-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: '6px', backgroundColor: '#F4F0FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={14} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--wn-text-secondary)' }}>Activity</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: 'var(--wn-font-heading)', fontSize: 24, fontWeight: 800, color: 'var(--wn-text-primary)' }}>
              {latestEntry.Physical_Activity_Level} min
            </div>
          </div>
        </div>

        {/* 4. Mood */}
        <div className="wn-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: '6px', backgroundColor: '#FFF7ED', color: '#FB923C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Smile size={14} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--wn-text-secondary)' }}>Mood</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: 'var(--wn-font-heading)', fontSize: 24, fontWeight: 800, color: 'var(--wn-text-primary)' }}>
              {latestEntry.Stress_Level} / 10
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Weekly Trends (2/3) + Wellness Balance (1/3) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
        {/* Left: Weekly Trends Line Graph */}
        <div className="wn-card" style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--wn-text-primary)' }}>
              Weekly Trends
            </h4>

            {/* Filter tags matching reference image */}
            <div style={{ display: 'flex', gap: 6 }}>
              {['Sleep', 'Steps', 'Activity', 'Stress'].map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    fontSize: 11.5,
                    fontWeight: 600,
                    backgroundColor: tag === 'Sleep' ? '#F4F0FF' : 'var(--wn-surface-subtle)',
                    color: tag === 'Sleep' ? '#735BF2' : 'var(--wn-text-secondary)',
                    border: '1px solid var(--wn-border-light)'
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F4F1EA" />
                <XAxis dataKey="displayDate" stroke="#9CA3AF" fontSize={11.5} />
                <YAxis domain={[0, 12]} stroke="#9CA3AF" fontSize={11.5} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="sleep"
                  name="Sleep (hrs)"
                  stroke="#735BF2"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#735BF2' }}
                />
                <Line
                  type="monotone"
                  dataKey="steps"
                  name="Steps (x1k)"
                  stroke="#0EA5E9"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#0EA5E9' }}
                />
                <Line
                  type="monotone"
                  dataKey="activity"
                  name="Activity (mins)"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#10B981' }}
                />
                <Line
                  type="monotone"
                  dataKey="stress"
                  name="Stress Level"
                  stroke="#FB923C"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#FB923C' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Wellness Balance Circular Score Card */}
        <div className="wn-card" style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--wn-text-primary)', marginBottom: 12 }}>
            Wellness Balance
          </h4>

          {/* Circular Progress Gauge */}
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <svg width="116" height="116" viewBox="0 0 116 116" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="58" cy="58" r="44" fill="none" stroke="#F4F0FF" strokeWidth="10" />
              <circle
                cx="58"
                cy="58"
                r="44"
                fill="none"
                stroke="#735BF2"
                strokeWidth="10"
                strokeDasharray={balanceCircumference}
                strokeDashoffset={balanceOffset}
                strokeLinecap="round"
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--wn-font-heading)', fontSize: 26, fontWeight: 800, color: '#1F2937' }}>
                {avgScore}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#10B981', marginTop: 1 }}>
                {chartData.length} {chartData.length === 1 ? 'record' : 'records'}
              </span>
            </div>
          </div>

          <p style={{ fontSize: 12.5, color: 'var(--wn-text-muted)', textAlign: 'center', marginTop: 16 }}>
            Average wellness score across the selected records
          </p>
        </div>
      </div>

      {/* Bottom Section: AI Insight Banner + Weekly Summary Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
        {/* AI Insight Banner matching reference */}
        <div
          style={{
            backgroundColor: '#FAF5FF',
            border: '1px solid #E9D5FF',
            borderRadius: '16px',
            padding: '18px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: '#EDE4FF',
                color: '#735BF2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#735BF2' }}>
                AI Insight
              </div>
              <div style={{ fontSize: 13, color: '#374151', marginTop: 2, lineHeight: 1.4 }}>
                Latest check-in: {latestEntry.displayDate}. Keep logging to build a clear picture of your wellness over time.
              </div>
            </div>
          </div>
          <ChevronRight size={18} style={{ color: '#9CA3AF' }} />
        </div>

        {/* Weekly Summary Card */}
        <div className="wn-card" style={{ padding: '18px 22px' }}>
          <h5 style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--wn-text-primary)', marginBottom: 12 }}>
            Weekly Summary
          </h5>
          <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--wn-text-muted)' }}>Best day</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#735BF2', marginTop: 3 }}>
                {chartData.reduce((best, entry) => entry.overallScore > best.overallScore ? entry : best, chartData[0]).displayDate}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--wn-text-muted)' }}>Mood trend</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#10B981', marginTop: 3 }}>
                {chartData.length > 1 ? `${chartData.length} records` : 'Not enough data'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--wn-text-muted)' }}>Activity trend</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0EA5E9', marginTop: 3 }}>
                Latest: {latestEntry.Physical_Activity_Level} min
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
