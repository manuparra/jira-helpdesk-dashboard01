import React, { useState } from 'react';
import { ExternalLink, Calendar, User, Tag, Clock, Edit3, CheckCircle2, GitMerge, FileX } from 'lucide-react';

export function TicketTable({ tickets, jiraUrl, onUpdateTicketAction }) {
  const [editingKey, setEditingKey] = useState(null);
  const [actionText, setActionText] = useState('');
  const [reviewDate, setReviewDate] = useState('');

  const startEdit = (ticket) => {
    setEditingKey(ticket.key);
    setActionText(ticket.nextAction || '');
    setReviewDate(ticket.reviewDate || new Date().toISOString().split('T')[0]);
  };

  const saveEdit = (ticketKey) => {
    onUpdateTicketAction(ticketKey, actionText, reviewDate);
    setEditingKey(null);
  };

  const calculateWaitTime = (createdStr) => {
    const created = new Date(createdStr);
    const now = new Date();
    const diffHours = Math.floor((now - created) / (1000 * 3600));
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h`;
    return `${diffHours}h`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  if (tickets.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No tickets match the selected review filter.
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '14px 16px', fontWeight: 600 }}>KEY & SUMMARY</th>
              <th style={{ padding: '14px 16px', fontWeight: 600 }}>AREA / NODE</th>
              <th style={{ padding: '14px 16px', fontWeight: 600 }}>OWNER / ASSIGNEE</th>
              <th style={{ padding: '14px 16px', fontWeight: 600 }}>STATUS & FLAGS</th>
              <th style={{ padding: '14px 16px', fontWeight: 600 }}>WAIT TIME</th>
              <th style={{ padding: '14px 16px', fontWeight: 600 }}>LAST MEANINGFUL UPDATE</th>
              <th style={{ padding: '14px 16px', fontWeight: 600 }}>NEXT ACTION & REVIEW DATE</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(ticket => {
              const isEditing = editingKey === ticket.key;
              const isOverdue = ticket.reviewDate && ticket.reviewDate < new Date().toISOString().split('T')[0];

              return (
                <tr 
                  key={ticket.key} 
                  style={{ 
                    borderBottom: '1px solid var(--border-color)',
                    transition: 'background 0.15s',
                    background: isOverdue ? 'rgba(245, 158, 11, 0.03)' : 'transparent'
                  }}
                >
                  {/* Key & Summary */}
                  <td style={{ padding: '16px', maxWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <a 
                        href={`${jiraUrl}/browse/${ticket.key}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="ticket-key"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        {ticket.key}
                        <ExternalLink size={12} />
                      </a>
                      {ticket.priority && (
                        <span className={`badge ${
                          ticket.priority === 'Highest' ? 'badge-red' :
                          ticket.priority === 'High' ? 'badge-pink' : 'badge-cyan'
                        }`}>
                          {ticket.priority}
                        </span>
                      )}
                    </div>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem', lineHeight: '1.3' }}>
                      {ticket.summary}
                    </div>
                  </td>

                  {/* Area / Node */}
                  <td style={{ padding: '16px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Tag size={14} color="var(--accent-cyan)" />
                      <span>{ticket.areaNode || 'Unspecified Node'}</span>
                    </div>
                  </td>

                  {/* Owner / Assignee */}
                  <td style={{ padding: '16px' }}>
                    {ticket.assignee ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff' }}>
                        <User size={14} color="var(--accent-blue)" />
                        <span>{ticket.assignee}</span>
                      </div>
                    ) : (
                      <span className="badge badge-red">Unassigned</span>
                    )}
                  </td>

                  {/* Status & Flags */}
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                      <span className={`badge ${
                        ticket.status === 'Open' ? 'badge-yellow' :
                        ticket.status === 'In Progress' ? 'badge-blue' :
                        ticket.status === 'Resolved' ? 'badge-green' : 'badge-purple'
                      }`}>
                        {ticket.status}
                      </span>

                      {ticket.isBlocker && <span className="badge badge-red">Blocker</span>}
                      {ticket.isCrossNode && <span className="badge badge-cyan">Cross-Node</span>}
                      {ticket.acceptancePending && <span className="badge badge-yellow">Acceptance Pending</span>}
                    </div>
                  </td>

                  {/* Wait Time */}
                  <td style={{ padding: '16px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#a5f3fc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} />
                      {calculateWaitTime(ticket.created)}
                    </div>
                  </td>

                  {/* Last Meaningful Update */}
                  <td style={{ padding: '16px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <div>{formatDate(ticket.lastMeaningfulUpdate)}</div>
                  </td>

                  {/* Next Action and Review Date */}
                  <td style={{ padding: '16px', maxWidth: '300px' }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <textarea
                          value={actionText}
                          onChange={(e) => setActionText(e.target.value)}
                          placeholder="Define next duty review action..."
                          rows={2}
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            background: 'var(--bg-input)',
                            border: '1px solid var(--accent-cyan)',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '0.82rem'
                          }}
                        />
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input
                            type="date"
                            value={reviewDate}
                            onChange={(e) => setReviewDate(e.target.value)}
                            style={{
                              padding: '4px 8px',
                              background: 'var(--bg-input)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '6px',
                              color: '#fff',
                              fontSize: '0.78rem'
                            }}
                          />
                          <button
                            onClick={() => saveEdit(ticket.key)}
                            style={{
                              padding: '4px 10px',
                              background: 'var(--accent-cyan)',
                              color: '#000',
                              border: 'none',
                              borderRadius: '6px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              fontSize: '0.78rem'
                            }}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ color: '#fff', fontSize: '0.85rem' }}>
                          {ticket.nextAction || <span style={{ color: 'var(--text-dim)', italic: 'true' }}>No next action recorded</span>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                          <span style={{ 
                            fontSize: '0.78rem', 
                            color: isOverdue ? '#fca5a5' : 'var(--text-muted)',
                            fontWeight: isOverdue ? 700 : 400,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <Calendar size={12} />
                            Target: {ticket.reviewDate || 'Unscheduled'}
                          </span>
                          <button
                            onClick={() => startEdit(ticket)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--accent-cyan)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.75rem'
                            }}
                          >
                            <Edit3 size={12} /> Edit
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
