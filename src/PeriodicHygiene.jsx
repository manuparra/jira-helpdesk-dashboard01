import React from 'react';
import { RefreshCw, CheckCircle2, GitMerge, FileX, Archive, ShieldCheck, AlertCircle } from 'lucide-react';
import { isActiveTicket } from './areas';

export function PeriodicHygiene({ tickets, onHygieneAction }) {
  // Stale or closure-flagged open tickets.
  const hygieneCandidates = tickets.filter(t => {
    const updated = new Date(t.updated || t.created);
    const daysInactive = (new Date() - updated) / (1000 * 3600 * 24);
    return isActiveTicket(t) && (daysInactive > 14 || t.pendingClosure);
  });

  return (
    <div className="glass-panel" id="periodic-hygiene" style={{ padding: '24px', marginBottom: '28px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw size={18} color="#8b5cf6" />
            Periodic Hygiene Sweep (Monthly / PI Review)
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '2px' }}>
            Decide action for stale or closure-flagged open tickets: <strong>Retain</strong>, <strong>Close</strong>, <strong>Merge</strong>, or <strong>Convert</strong>. Verify completion of previous review actions.
          </p>
        </div>

        <span className="badge badge-purple">
          {hygieneCandidates.length} Candidates Pending Sweep
        </span>
      </div>

      {hygieneCandidates.length === 0 ? (
        <div style={{ padding: '16px', color: 'var(--text-dim)', fontSize: '0.88rem', fontStyle: 'italic' }}>
          All SNH tickets are up-to-date. No periodic hygiene actions required for this PI cycle.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {hygieneCandidates.map(ticket => (
            <div 
              key={ticket.key} 
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '500px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="ticket-key">{ticket.key}</span>
                  <span className="badge badge-purple">{ticket.status}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    Area: {ticket.areaNode}
                  </span>
                </div>
                <div style={{ color: 'var(--text-main)', fontSize: '0.88rem', fontWeight: 500 }}>
                  {ticket.summary}
                </div>
                {ticket.nextAction && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)' }}>
                    Prev Action: {ticket.nextAction}
                  </div>
                )}
              </div>

              {/* Action Buttons: Retain, Close, Merge, Convert */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => onHygieneAction(ticket.key, 'retain')}
                  style={{
                    padding: '6px 12px',
                    background: 'rgba(59, 130, 246, 0.15)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '6px',
                    color: '#bfdbfe',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <ShieldCheck size={14} /> Retain
                </button>

                <button
                  onClick={() => onHygieneAction(ticket.key, 'close')}
                  style={{
                    padding: '6px 12px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '6px',
                    color: '#a7f3d0',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <CheckCircle2 size={14} /> Close
                </button>

                <button
                  onClick={() => onHygieneAction(ticket.key, 'merge')}
                  style={{
                    padding: '6px 12px',
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '6px',
                    color: '#fde68a',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <GitMerge size={14} /> Merge
                </button>

                <button
                  onClick={() => onHygieneAction(ticket.key, 'convert')}
                  style={{
                    padding: '6px 12px',
                    background: 'rgba(236, 72, 153, 0.15)',
                    border: '1px solid rgba(236, 72, 153, 0.3)',
                    borderRadius: '6px',
                    color: '#fbcfe8',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <FileX size={14} /> Convert
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
