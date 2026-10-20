import React from 'react';
import { X, ExternalLink, User, Tag, Clock, Copy } from 'lucide-react';

export function TicketModal({ isOpen, onClose, title, tickets, jiraUrl, jql, jqlNote }) {
  if (!isOpen) return null;

  const copyJql = async () => {
    await navigator.clipboard?.writeText(jql);
  };

  const calculateWaitTime = (createdStr) => {
    if (!createdStr) return 'N/A';
    const created = new Date(createdStr);
    const now = new Date();
    const diffHours = Math.floor((now - created) / (1000 * 3600));
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h`;
    return `${diffHours}h`;
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 10, 25, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '1000px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          border: '1px solid rgba(0, 240, 255, 0.25)',
          overflow: 'hidden',
          borderRadius: '16px'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              {title}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Showing {tickets.length} ticket{tickets.length === 1 ? '' : 's'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: '#fff',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Table */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          <section className="jql-debug" aria-label="JIRA query used for this card">
            <div>
              <span>JIRA query</span>
              <code>{jql}</code>
              {jqlNote && <p>{jqlNote}</p>}
            </div>
            <button onClick={copyJql} title="Copy JQL" aria-label="Copy JQL">
              <Copy size={15} /> Copy
            </button>
          </section>
          {tickets.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No tickets found for this category.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>KEY & SUMMARY</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>KEY AREA</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>ASSIGNEE</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>STATUS</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>AGE / WAIT</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>ACTION & LINK</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(ticket => (
                  <tr 
                    key={ticket.key}
                    style={{ 
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background 0.15s'
                    }}
                  >
                    {/* Key & Summary */}
                    <td style={{ padding: '14px', maxWidth: '300px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span className="ticket-key">{ticket.key}</span>
                        {ticket.priority && (
                          <span className={`badge ${
                            ticket.priority === 'Highest' ? 'badge-red' :
                            ticket.priority === 'High' ? 'badge-pink' : 'badge-cyan'
                          }`}>
                            {ticket.priority}
                          </span>
                        )}
                      </div>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.88rem', lineHeight: '1.3' }}>
                        {ticket.summary}
                      </div>
                    </td>

                    {/* Key Area */}
                    <td style={{ padding: '14px', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Tag size={13} color="var(--accent-cyan)" />
                        <span>{ticket.areaNode || 'Unspecified'}</span>
                      </div>
                    </td>

                    {/* Assignee */}
                    <td style={{ padding: '14px' }}>
                      {ticket.assignee ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff' }}>
                          <User size={13} color="var(--accent-blue)" />
                          <span>{ticket.assignee}</span>
                        </div>
                      ) : (
                        <span className="badge badge-red">Unassigned</span>
                      )}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px' }}>
                      <span className={`badge ${
                        ticket.status === 'Open' ? 'badge-yellow' :
                        ticket.status === 'In Progress' ? 'badge-blue' :
                        ticket.status === 'Resolved' ? 'badge-green' :
                        ticket.status === 'Waiting for customer' ? 'badge-pink' : 'badge-purple'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>

                    {/* Age / Wait */}
                    <td style={{ padding: '14px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#a5f3fc' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} />
                        {calculateWaitTime(ticket.created)}
                      </div>
                    </td>

                    {/* Direct Link */}
                    <td style={{ padding: '14px' }}>
                      <a 
                        href={`${jiraUrl}/browse/${ticket.key}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="badge badge-cyan"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', padding: '6px 10px' }}
                      >
                        Open Ticket <ExternalLink size={13} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
