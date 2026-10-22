import React from 'react';
import { getScoreColor } from '../../utils/scoreCalculator';

export default function ScoreCard({
  title,
  score,
  icon: Icon,
  unit = "/ 100",
  rawMeasurement = null,
  explanation = "",
  accentColor = null
}) {
  const isAvailable = score !== null && score !== undefined && !isNaN(score);
  const color = accentColor || (isAvailable ? getScoreColor(score) : "var(--wn-text-muted)");
  const displayScore = isAvailable ? Math.round(score) : "--";

  return (
    <div
      className="wn-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px 22px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {Icon && (
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--wn-radius-sm)',
                backgroundColor: 'var(--wn-surface-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color
              }}
            >
              <Icon size={19} />
            </div>
          )}
          <div>
            <h4 style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--wn-text-primary)' }}>
              {title}
            </h4>
            {rawMeasurement && (
              <span style={{ fontSize: 12, color: 'var(--wn-text-muted)' }}>
                {rawMeasurement}
              </span>
            )}
          </div>
        </div>

        {/* Score Value */}
        <div style={{ textAlign: 'right' }}>
          <span
            style={{
              fontFamily: 'var(--wn-font-heading)',
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--wn-text-primary)'
            }}
          >
            {displayScore}
          </span>
          <span style={{ fontSize: 12, color: 'var(--wn-text-muted)', marginLeft: 3 }}>
            {unit}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          width: '100%',
          height: 6,
          backgroundColor: 'var(--wn-surface-subtle)',
          borderRadius: 'var(--wn-radius-full)',
          overflow: 'hidden',
          margin: '8px 0 12px 0'
        }}
      >
        <div
          style={{
            height: '100%',
            width: isAvailable ? `${Math.max(0, Math.min(100, score))}%` : '0%',
            backgroundColor: color,
            borderRadius: 'var(--wn-radius-full)',
            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </div>

      {/* Explanation Microcopy */}
      <p
        style={{
          fontSize: 12.5,
          color: 'var(--wn-text-secondary)',
          lineHeight: 1.4,
          minHeight: 34
        }}
      >
        {explanation || (isAvailable ? "Calculated from your saved daily measurement." : "Complete a check-in to see this score.")}
      </p>
    </div>
  );
}
