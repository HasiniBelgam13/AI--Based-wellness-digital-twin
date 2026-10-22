import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Search,
  ArrowUpDown,
  Eye,
  Trash2,
  CalendarCheck,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  AlertTriangle
} from 'lucide-react';
import { formatFullDate, getDayOfWeek } from '../utils/dateUtils';
import Badge from '../components/common/Badge';
import RecordDetailModal from '../components/modals/RecordDetailModal';
import Modal from '../components/common/Modal';

export default function WellnessHistoryPage({
  checkIns,
  onDeleteCheckIn,
  onNavigate
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [recordToDelete, setRecordToDelete] = useState(null);

  const enrichedCheckIns = useMemo(() => {
    if (!checkIns || checkIns.length === 0) return [];

    const sortedAsc = [...checkIns].sort((a, b) => new Date(a.date) - new Date(b.date));

    const withDeltas = sortedAsc.map((entry, index) => {
      let delta = null;
      if (index > 0) {
        delta = entry.overallScore - sortedAsc[index - 1].overallScore;
      }
      return {
        ...entry,
        delta
      };
    });

    let filtered = withDeltas.filter((item) => {
      if (!searchTerm) return true;
      const lower = searchTerm.toLowerCase();
      return (
        item.date.includes(lower) ||
        (item.wellnessState && item.wellnessState.toLowerCase().includes(lower)) ||
        (item.statusLabel && item.statusLabel.toLowerCase().includes(lower))
      );
    });

    return filtered.sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
  }, [checkIns, searchTerm, sortOrder]);

  const confirmDelete = () => {
    if (recordToDelete) {
      onDeleteCheckIn(recordToDelete.id);
      setRecordToDelete(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Filter and Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--wn-text-primary)' }}>
            Recorded Check-ins
          </h3>
          <p style={{ fontSize: 12.5, color: 'var(--wn-text-muted)' }}>
            Chronological audit of {enrichedCheckIns.length} recorded daily entries.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <Search
              size={14}
              style={{ position: 'absolute', left: 12, top: 11, color: 'var(--wn-text-muted)' }}
            />
            <input
              type="text"
              placeholder="Search date or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: 34, width: 210, fontSize: 13 }}
            />
          </div>

          {/* Sort toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="wn-btn wn-btn-outline"
            style={{ padding: '8px 14px', fontSize: 13 }}
          >
            <ArrowUpDown size={14} />
            <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
          </button>

          <button
            onClick={() => onNavigate('checkin')}
            className="wn-btn wn-btn-primary"
            style={{ padding: '8px 16px', fontSize: 13 }}
          >
            <CalendarCheck size={15} />
            <span>New Check-in</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="wn-card" style={{ padding: 0, overflow: 'hidden' }}>
        {enrichedCheckIns.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Calendar size={38} style={{ color: '#735BF2', margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--wn-text-primary)' }}>
              No Records Found
            </h4>
            <p style={{ fontSize: 13, color: 'var(--wn-text-muted)', maxWidth: 380, margin: '6px auto 16px auto' }}>
              {searchTerm
                ? 'No check-ins match your search filter.'
                : 'Your wellness history begins with your very first daily entry.'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => onNavigate('checkin')}
                className="wn-btn wn-btn-primary"
                style={{ fontSize: 13 }}
              >
                Log Today's Entry
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: 13
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: 'var(--wn-surface-subtle)',
                    borderBottom: '1px solid var(--wn-border)',
                    color: 'var(--wn-text-secondary)',
                    fontWeight: 700,
                    fontSize: 12,
                    letterSpacing: '0.2px'
                  }}
                >
                  <th style={{ padding: '14px 20px' }}>Date</th>
                  <th style={{ padding: '14px 16px' }}>Sleep</th>
                  <th style={{ padding: '14px 16px' }}>Quality</th>
                  <th style={{ padding: '14px 16px' }}>Stress</th>
                  <th style={{ padding: '14px 16px' }}>Steps</th>
                  <th style={{ padding: '14px 16px' }}>Activity</th>
                  <th style={{ padding: '14px 16px' }}>Heart Rate</th>
                  <th style={{ padding: '14px 16px' }}>Score</th>
                  <th style={{ padding: '14px 16px' }}>Change</th>
                  <th style={{ padding: '14px 16px' }}>Wellness State</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {enrichedCheckIns.map((row) => (
                  <tr
                    key={row.id}
                    style={{
                      borderBottom: '1px solid var(--wn-border-light)',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--wn-surface-subtle)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--wn-text-primary)' }}>
                        {formatFullDate(row.date)}
                      </div>
                      <span style={{ fontSize: 11.5, color: 'var(--wn-text-muted)' }}>
                        {getDayOfWeek(row.date)}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px', color: 'var(--wn-text-primary)' }}>
                      <strong>{row.Sleep_Duration}</strong> hrs
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      {row.Quality_of_Sleep} / 10
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          color:
                            row.Stress_Level <= 3
                              ? '#10B981'
                              : row.Stress_Level <= 6
                              ? 'var(--wn-text-primary)'
                              : '#FB923C',
                          fontWeight: 700
                        }}
                      >
                        {row.Stress_Level} / 10
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      {Number(row.Daily_Steps).toLocaleString()}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      {row.Physical_Activity_Level} min
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      {row.Heart_Rate} bpm
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontFamily: 'var(--wn-font-heading)', fontSize: 16, fontWeight: 800, color: '#1F2937' }}>
                          {row.overallScore}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--wn-text-muted)' }}>/ 100</span>
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      {row.delta !== null ? (
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 2,
                            fontSize: 12,
                            fontWeight: 700,
                            color:
                              row.delta > 0
                                ? '#10B981'
                                : row.delta < 0
                                ? '#F43F5E'
                                : 'var(--wn-text-muted)'
                          }}
                        >
                          {row.delta > 0 && <ArrowUpRight size={13} />}
                          {row.delta < 0 && <ArrowDownRight size={13} />}
                          {row.delta === 0 && <Minus size={13} />}
                          <span>
                            {row.delta > 0 ? `+${row.delta}` : row.delta < 0 ? `${row.delta}` : '0'} pts
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: 11.5, color: 'var(--wn-text-muted)' }}>
                          Baseline
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <Badge label={row.wellnessState || 'Not available'} size="sm" />
                    </td>

                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <button
                          onClick={() => setSelectedRecord(row)}
                          style={{
                            padding: '5px 9px',
                            borderRadius: '8px',
                            color: '#735BF2',
                            backgroundColor: '#F4F0FF',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 12,
                            fontWeight: 600
                          }}
                          title="View Record"
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </button>

                        <button
                          onClick={() => setRecordToDelete(row)}
                          style={{
                            padding: '5px 8px',
                            borderRadius: '8px',
                            color: '#F43F5E',
                            backgroundColor: '#FFF1F2',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 12
                          }}
                          title="Delete Record"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <RecordDetailModal
        isOpen={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
        record={selectedRecord}
      />

      <Modal
        isOpen={Boolean(recordToDelete)}
        onClose={() => setRecordToDelete(null)}
        title="Confirm Record Deletion"
        maxWidth={440}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                backgroundColor: '#FFF1F2',
                color: '#F43F5E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <AlertTriangle size={18} />
            </div>
            <div>
              <p style={{ fontSize: 13.5, color: 'var(--wn-text-primary)', margin: 0 }}>
                Are you sure you want to delete the check-in record for{' '}
                <strong>{recordToDelete && formatFullDate(recordToDelete.date)}</strong>?
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button
              onClick={() => setRecordToDelete(null)}
              className="wn-btn wn-btn-outline"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="wn-btn"
              style={{ backgroundColor: '#F43F5E', color: '#fff' }}
            >
              Delete Entry
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
