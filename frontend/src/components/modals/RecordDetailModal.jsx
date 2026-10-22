import React from 'react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import { formatFullDate, getDayOfWeek } from '../../utils/dateUtils';
import { Moon, Footprints, Activity, Flame, Heart, Stethoscope } from 'lucide-react';

export default function RecordDetailModal({
  isOpen,
  onClose,
  record
}) {
  if (!record) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Check-in Record Inspection"
      subtitle={`${formatFullDate(record.date)} (${getDayOfWeek(record.date)})`}
      maxWidth={580}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Top Summary Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            backgroundColor: 'var(--wn-surface-subtle)',
            borderRadius: 'var(--wn-radius-md)',
            border: '1px solid var(--wn-border-light)'
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: 'var(--wn-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Overall Score
            </div>
            <div style={{ fontFamily: 'var(--wn-font-heading)', fontSize: 32, fontWeight: 700, color: 'var(--wn-text-primary)' }}>
              {record.overallScore} <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--wn-text-muted)' }}>/ 100</span>
            </div>
          </div>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <Badge label={record.wellnessState || "Not available"} />
            <span style={{ fontSize: 12, color: 'var(--wn-text-muted)' }}>
              {record.statusLabel}
            </span>
          </div>
        </div>

        {/* Daily Measurements Grid */}
        <div>
          <h4 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--wn-text-primary)', marginBottom: 12 }}>
            Recorded Biometrics
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="wn-card-subtle" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Moon size={18} style={{ color: 'var(--wn-lavender)' }} />
              <div>
                <div style={{ fontSize: 11.5, color: 'var(--wn-text-muted)' }}>Sleep Duration & Quality</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--wn-text-primary)' }}>
                  {record.Sleep_Duration} hrs (Quality: {record.Quality_of_Sleep}/10)
                </div>
              </div>
            </div>

            <div className="wn-card-subtle" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Flame size={18} style={{ color: 'var(--wn-peach)' }} />
              <div>
                <div style={{ fontSize: 11.5, color: 'var(--wn-text-muted)' }}>Stress Level</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--wn-text-primary)' }}>
                  {record.Stress_Level} / 10
                </div>
              </div>
            </div>

            <div className="wn-card-subtle" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Footprints size={18} style={{ color: 'var(--wn-sage)' }} />
              <div>
                <div style={{ fontSize: 11.5, color: 'var(--wn-text-muted)' }}>Daily Steps</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--wn-text-primary)' }}>
                  {Number(record.Daily_Steps).toLocaleString()} steps
                </div>
              </div>
            </div>

            <div className="wn-card-subtle" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Activity size={18} style={{ color: 'var(--wn-blue)' }} />
              <div>
                <div style={{ fontSize: 11.5, color: 'var(--wn-text-muted)' }}>Active Movement</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--wn-text-primary)' }}>
                  {record.Physical_Activity_Level} mins
                </div>
              </div>
            </div>

            <div className="wn-card-subtle" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Heart size={18} style={{ color: '#E06D6D' }} />
              <div>
                <div style={{ fontSize: 11.5, color: 'var(--wn-text-muted)' }}>Heart Rate</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--wn-text-primary)' }}>
                  {record.Heart_Rate} bpm
                </div>
              </div>
            </div>

            <div className="wn-card-subtle" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Stethoscope size={18} style={{ color: 'var(--wn-text-secondary)' }} />
              <div>
                <div style={{ fontSize: 11.5, color: 'var(--wn-text-muted)' }}>Blood Pressure</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--wn-text-primary)' }}>
                  {record.Blood_Pressure || "120/80"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calculated Score Breakdown */}
        {record.scores && (
          <div>
            <h4 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--wn-text-primary)', marginBottom: 12 }}>
              Formula Weight Breakdown (adds to 100%)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, textAlign: 'center' }}>
              <div style={{ padding: '10px 8px', borderRadius: 'var(--wn-radius-sm)', backgroundColor: 'var(--wn-surface-subtle)' }}>
                <div style={{ fontSize: 11, color: 'var(--wn-text-muted)' }}>Sleep (30%)</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--wn-text-primary)', marginTop: 2 }}>
                  {record.scores.sleepScore ?? "--"}
                </div>
              </div>
              <div style={{ padding: '10px 8px', borderRadius: 'var(--wn-radius-sm)', backgroundColor: 'var(--wn-surface-subtle)' }}>
                <div style={{ fontSize: 11, color: 'var(--wn-text-muted)' }}>Stress (25%)</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--wn-text-primary)', marginTop: 2 }}>
                  {record.scores.stressManagementScore ?? "--"}
                </div>
              </div>
              <div style={{ padding: '10px 8px', borderRadius: 'var(--wn-radius-sm)', backgroundColor: 'var(--wn-surface-subtle)' }}>
                <div style={{ fontSize: 11, color: 'var(--wn-text-muted)' }}>Steps (25%)</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--wn-text-primary)', marginTop: 2 }}>
                  {record.scores.dailyStepsScore ?? "--"}
                </div>
              </div>
              <div style={{ padding: '10px 8px', borderRadius: 'var(--wn-radius-sm)', backgroundColor: 'var(--wn-surface-subtle)' }}>
                <div style={{ fontSize: 11, color: 'var(--wn-text-muted)' }}>Activity (20%)</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--wn-text-primary)', marginTop: 2 }}>
                  {record.scores.physicalActivityScore ?? "--"}
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <button onClick={onClose} className="wn-btn wn-btn-outline">
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
