import React from 'react';
import { getScoreStatusLabel, getScoreColor } from '../../utils/scoreCalculator';

/**
 * Large circular wellness score indicator.
 * Displays score from 0 - 100 with smooth SVG stroke and status label.
 */
export default function CircularScore({
  score,
  size = 180,
  strokeWidth = 12,
  showLabel = true,
  sublabel = "Overall Balance"
}) {
  const isAvailable = score !== null && score !== undefined && !isNaN(score);
  const displayScore = isAvailable ? Math.round(score) : "--";
  const statusLabel = isAvailable ? getScoreStatusLabel(score) : "Pending";
  const strokeColor = isAvailable ? getScoreColor(score) : "var(--wn-border)";

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = isAvailable ? Math.max(0, Math.min(100, score)) : 0;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)', transition: 'stroke-dashoffset 0.8s ease' }}
      >
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--wn-surface-subtle)"
          strokeWidth={strokeWidth}
        />
        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s ease' }}
        />
      </svg>

      {/* Center Label */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: size,
          height: size,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}
      >
        <span
          style={{
            fontFamily: 'var(--wn-font-heading)',
            fontSize: size * 0.27,
            fontWeight: 700,
            color: 'var(--wn-text-primary)',
            lineHeight: 1
          }}
        >
          {displayScore}
        </span>
        <span
          style={{
            fontSize: 11.5,
            fontWeight: 500,
            color: 'var(--wn-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            marginTop: 4
          }}
        >
          {sublabel}
        </span>
      </div>

      {/* Status Pill below */}
      {showLabel && (
        <div
          style={{
            marginTop: 14,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 14px',
            borderRadius: 'var(--wn-radius-full)',
            background: 'var(--wn-surface-subtle)',
            border: '1px solid var(--wn-border-light)',
            fontSize: 13,
            fontWeight: 600,
            color: strokeColor
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: strokeColor
            }}
          />
          {statusLabel}
        </div>
      )}
    </div>
  );
}
