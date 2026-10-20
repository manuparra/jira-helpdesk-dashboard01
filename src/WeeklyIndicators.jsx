import React from 'react';
import { Activity, UserX, AlertOctagon, Flame, Archive, ChevronRight } from 'lucide-react';
import { isActiveTicket, isOwnerlessTicket } from './areas';

export function WeeklyIndicators({ tickets, onSelectBox }) {
  const activeTickets = tickets.filter(isActiveTicket);
  const ownerlessTickets = tickets.filter(isOwnerlessTicket);
  
  // Overdue actions: reviewDate < today
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueActions = tickets.filter(t => t.reviewDate && t.reviewDate < todayStr && t.status !== 'Closed').length;

  // Stalled high priority: Priority High/Highest & updated > 7 days ago
  const now = new Date();
  const stalledHighPriority = tickets.filter(t => {
    if (t.status === 'Closed' || t.status === 'Resolved') return false;
    const isHigh = t.priority === 'High' || t.priority === 'Highest' || t.impact === 'High Impact';
    const updatedDate = new Date(t.updated || t.created);
    const diffDays = (now - updatedDate) / (1000 * 3600 * 24);
    return isHigh && diffDays >= 7;
  }).length;

  // Pending closure
  const pendingClosure = tickets.filter(t => t.pendingClosure || t.status === 'Resolved' || t.status === 'Pending Closure').length;

  const kpis = [
    {
      title: 'Active Total',
      value: activeTickets.length,
      sub: 'Open & In-Progress SNH Tickets',
      tickets: activeTickets,
      icon: <Activity size={22} color="#00f0ff" />,
      borderColor: 'rgba(0, 240, 255, 0.3)',
      bg: 'rgba(0, 240, 255, 0.05)'
    },
    {
      title: 'Ownerless Count',
      value: ownerlessTickets.length,
      sub: 'Unassigned Tickets Pending Lead',
      tickets: ownerlessTickets,
      icon: <UserX size={22} color="#ef4444" />,
      borderColor: 'rgba(239, 68, 68, 0.3)',
      bg: 'rgba(239, 68, 68, 0.05)'
    },
    {
      title: 'Overdue Actions',
      value: overdueActions,
      sub: 'Passed Review Target Date',
      tickets: tickets.filter(t => t.reviewDate && t.reviewDate < todayStr && t.status !== 'Closed'),
      icon: <AlertOctagon size={22} color="#f59e0b" />,
      borderColor: 'rgba(245, 158, 11, 0.3)',
      bg: 'rgba(245, 158, 11, 0.05)'
    },
    {
      title: 'Stalled High Priority',
      value: stalledHighPriority,
      sub: 'High Impact & Inactive >7d',
      tickets: tickets.filter(t => {
        if (!isActiveTicket(t)) return false;
        const isHigh = t.priority === 'High' || t.priority === 'Highest' || t.impact === 'High Impact';
        const updatedDate = new Date(t.updated || t.created);
        return isHigh && (now - updatedDate) / (1000 * 3600 * 24) >= 7;
      }),
      icon: <Flame size={22} color="#ec4899" />,
      borderColor: 'rgba(236, 72, 153, 0.3)',
      bg: 'rgba(236, 72, 153, 0.05)'
    },
    {
      title: 'Pending Closure',
      value: pendingClosure,
      sub: 'Resolved / Hygiene Sweep',
      tickets: tickets.filter(t => t.pendingClosure || t.status === 'Resolved' || t.status === 'Pending Closure'),
      icon: <Archive size={22} color="#10b981" />,
      borderColor: 'rgba(16, 185, 129, 0.3)',
      bg: 'rgba(16, 185, 129, 0.05)'
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '28px'
    }}>
      {kpis.map((kpi, idx) => (
        <div
          key={idx}
          className="glass-panel"
          role="button"
          tabIndex={0}
          onClick={() => onSelectBox(kpi.title, kpi.tickets)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') onSelectBox(kpi.title, kpi.tickets);
          }}
          style={{
          padding: '20px',
          background: kpi.bg,
          borderColor: kpi.borderColor,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          cursor: 'pointer'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {kpi.title}
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}>
              {kpi.icon}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1 }}>
              {kpi.value}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '6px' }}>
              {kpi.sub}
            </div>
          </div>
          <button
            className="view-tickets-link"
            onClick={(event) => {
              event.stopPropagation();
              onSelectBox(kpi.title, kpi.tickets);
            }}
          >
            View Tickets <ChevronRight size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
