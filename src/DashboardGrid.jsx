import React from 'react';
import { 
  UserX, Clock, AlertCircle, ShieldAlert, GitBranch, 
  CheckSquare, Layers, Folder, UserCheck, AlertTriangle, 
  CheckCircle2, MessageSquare, ChevronRight
} from 'lucide-react';
import { isActiveTicket, isOwnerlessTicket } from './areas';
import { addJqlClause, jqlString } from './jql';

export function DashboardGrid({ tickets, onSelectBox, baseJql }) {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const openTickets = tickets.filter(isActiveTicket);

  // Helper calculation functions
  const getDaysDiff = (dateStr) => {
    if (!dateStr) return 0;
    const d = new Date(dateStr);
    return (now - d) / (1000 * 3600 * 24);
  };

  // Section 1: Review Categories
  const reviewBoxes = [
    {
      id: 'unassigned',
      title: 'Unassigned',
      subtitle: 'Open tickets needing lead assignment',
      tickets: openTickets.filter(isOwnerlessTicket),
      jql: addJqlClause(baseJql, 'assignee IS EMPTY AND status NOT IN (Done, Resolved, Closed)'),
      icon: <UserX size={20} color="#ef4444" />,
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.08)'
    },
    {
      id: 'acceptance_pending',
      title: 'Acceptance Pending',
      subtitle: 'Waiting for user/requester confirmation',
      tickets: openTickets.filter(t => t.acceptancePending || t.status === 'Waiting for customer' || t.status === 'Pending User Acceptance'),
      jql: addJqlClause(baseJql, 'status IN ("Waiting for customer", "Pending User Acceptance") AND status NOT IN (Done, Resolved, Closed)'),
      icon: <Clock size={20} color="#f59e0b" />,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.08)'
    },
    {
      id: 'high_impact',
      title: 'High Impact / Priority',
      subtitle: 'Critical & highest priority issues',
      tickets: openTickets.filter(t => t.impact === 'High Impact' || t.priority === 'Highest' || t.priority === 'High'),
      jql: addJqlClause(baseJql, 'priority IN (High, Highest) AND status NOT IN (Done, Resolved, Closed)'),
      icon: <AlertCircle size={20} color="#ec4899" />,
      color: '#ec4899',
      bg: 'rgba(236, 72, 153, 0.08)'
    },
    {
      id: 'inactivity',
      title: 'Inactivity / Ageing (>3d)',
      subtitle: 'No updates for over 3 days',
      tickets: openTickets.filter(t => getDaysDiff(t.updated || t.created) >= 3),
      jql: addJqlClause(baseJql, 'updated <= -3d AND status NOT IN (Done, Resolved, Closed)'),
      icon: <Clock size={20} color="#8b5cf6" />,
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.08)'
    },
    {
      id: 'blockers',
      title: 'Blockers / Pending',
      subtitle: 'Flagged blockers & critical path holds',
      tickets: openTickets.filter(t => t.isBlocker || t.priority === 'Highest'),
      jql: addJqlClause(baseJql, 'priority = Highest AND status NOT IN (Done, Resolved, Closed)'),
      icon: <ShieldAlert size={20} color="#dc2626" />,
      color: '#dc2626',
      bg: 'rgba(220, 38, 38, 0.08)'
    },
    {
      id: 'cross_node',
      title: 'Cross-Node / All',
      subtitle: 'Inter-SRC & cross-functional tickets',
      tickets: openTickets.filter(t => t.isCrossNode),
      jql: addJqlClause(baseJql, 'labels = cross-node AND status NOT IN (Done, Resolved, Closed)'),
      icon: <GitBranch size={20} color="#06b6d4" />,
      color: '#06b6d4',
      bg: 'rgba(6, 182, 212, 0.08)'
    },
    {
      id: 'closure_candidates',
      title: 'Closure Candidates',
      subtitle: 'Open tickets flagged for closure review',
      tickets: openTickets.filter(t => t.pendingClosure),
      jql: addJqlClause(baseJql, 'status NOT IN (Done, Resolved, Closed)'),
      icon: <CheckSquare size={20} color="#10b981" />,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.08)'
    },
    {
      id: 'all_tickets',
      title: 'All Active Tickets',
      subtitle: 'Complete list of open tickets',
      tickets: openTickets,
      jql: addJqlClause(baseJql, 'status NOT IN (Done, Resolved, Closed)'),
      icon: <Layers size={20} color="#00f0ff" />,
      color: '#00f0ff',
      bg: 'rgba(0, 240, 255, 0.08)'
    }
  ];

  // Section 2: Time & Status Breakdown
  const statusTimeBoxes = [
    {
      id: 'active_tickets',
      title: 'Active Tickets',
      subtitle: 'Open & In-Progress status',
      tickets: openTickets.filter(t => t.status === 'Open' || t.status === 'In Progress'),
      jql: addJqlClause(baseJql, 'status IN (Open, "In Progress") AND status NOT IN (Done, Resolved, Closed)'),
      icon: <CheckCircle2 size={20} color="#3b82f6" />,
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.08)'
    },
    {
      id: 'overdue_actions',
      title: 'Overdue Actions',
      subtitle: 'Passed planned duty review date',
      tickets: openTickets.filter(t => t.reviewDate && t.reviewDate < todayStr),
      jql: addJqlClause(baseJql, 'status NOT IN (Done, Resolved, Closed)'),
      jqlNote: 'The review target is maintained by the dashboard. The overdue comparison is applied after JIRA returns the selected area tickets.',
      icon: <AlertTriangle size={20} color="#f97316" />,
      color: '#f97316',
      bg: 'rgba(249, 115, 22, 0.08)'
    },
    {
      id: 'ageing_5d',
      title: '5+ Days Old',
      subtitle: 'Tickets created 5 to 14 days ago',
      tickets: openTickets.filter(t => {
        const days = getDaysDiff(t.created);
        return days >= 5 && days < 15;
      }),
      jql: addJqlClause(baseJql, 'created >= -14d AND created < -5d AND status NOT IN (Done, Resolved, Closed)'),
      icon: <Clock size={20} color="#a855f7" />,
      color: '#a855f7',
      bg: 'rgba(168, 85, 247, 0.08)'
    },
    {
      id: 'ageing_15d',
      title: '15+ Days Old',
      subtitle: 'Tickets created 15 to 29 days ago',
      tickets: openTickets.filter(t => {
        const days = getDaysDiff(t.created);
        return days >= 15 && days < 30;
      }),
      jql: addJqlClause(baseJql, 'created >= -29d AND created < -15d AND status NOT IN (Done, Resolved, Closed)'),
      icon: <Clock size={20} color="#e11d48" />,
      color: '#e11d48',
      bg: 'rgba(225, 29, 72, 0.08)'
    },
    {
      id: 'ageing_30d',
      title: '30+ Days Old',
      subtitle: 'Stalled tickets active >30 days',
      tickets: openTickets.filter(t => getDaysDiff(t.created) >= 30),
      jql: addJqlClause(baseJql, 'created <= -30d AND status NOT IN (Done, Resolved, Closed)'),
      icon: <AlertCircle size={20} color="#be123c" />,
      color: '#be123c',
      bg: 'rgba(190, 18, 60, 0.08)'
    },
    {
      id: 'waiting_customer',
      title: 'Waiting for Customer',
      subtitle: 'Awaiting user response or feedback',
      tickets: openTickets.filter(t => t.status === 'Waiting for customer' || t.acceptancePending),
      jql: addJqlClause(baseJql, 'status = "Waiting for customer" AND status NOT IN (Done, Resolved, Closed)'),
      icon: <MessageSquare size={20} color="#06b6d4" />,
      color: '#06b6d4',
      bg: 'rgba(6, 182, 212, 0.08)'
    },
    {
      id: 'pending_to_close',
      title: 'Pending to Close',
      subtitle: 'Open tickets flagged for closure review',
      tickets: openTickets.filter(t => t.pendingClosure),
      jql: addJqlClause(baseJql, 'status NOT IN (Done, Resolved, Closed)'),
      icon: <CheckSquare size={20} color="#10b981" />,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.08)'
    }
  ];

  // Section 3: Key Area Grouping
  const keyAreasMap = {};
  openTickets.forEach(t => {
    const area = t.areaNode || 'Unspecified Area';
    if (!keyAreasMap[area]) keyAreasMap[area] = [];
    keyAreasMap[area].push(t);
  });
  const keyAreaBoxes = Object.keys(keyAreasMap).map(area => ({
    id: `area_${area}`,
    title: area,
    subtitle: `Key Area • ${keyAreasMap[area].length} Ticket(s)`,
    tickets: keyAreasMap[area],
    jql: addJqlClause(baseJql, 'status NOT IN (Done, Resolved, Closed)'),
    icon: <Folder size={20} color="#00f0ff" />,
    color: '#00f0ff',
    bg: 'rgba(0, 240, 255, 0.06)'
  }));

  // Section 4: Assignee Grouping
  const assigneeMap = {};
  openTickets.forEach(t => {
    const owner = t.assignee || 'Unassigned';
    if (!assigneeMap[owner]) assigneeMap[owner] = [];
    assigneeMap[owner].push(t);
  });
  const assigneeBoxes = Object.keys(assigneeMap).map(owner => ({
    id: `owner_${owner}`,
    title: owner,
    subtitle: owner === 'Unassigned' ? 'Unassigned Queue' : 'Open tickets',
    tickets: assigneeMap[owner],
    jql: addJqlClause(baseJql, `${owner === 'Unassigned' ? 'assignee IS EMPTY' : `assignee = ${jqlString(owner)}`} AND status NOT IN (Done, Resolved, Closed)`),
    icon: <UserCheck size={20} color={owner === 'Unassigned' ? '#ef4444' : '#3b82f6'} />,
    color: owner === 'Unassigned' ? '#ef4444' : '#3b82f6',
    bg: owner === 'Unassigned' ? 'rgba(239, 68, 68, 0.06)' : 'rgba(59, 130, 246, 0.06)'
  }));
  assigneeBoxes.sort((first, second) => {
    if (first.title === 'Unassigned') return 1;
    if (second.title === 'Unassigned') return -1;
    const surname = (name) => name.includes(',')
      ? name.split(',')[0].trim()
      : name.trim().split(/\s+/).at(-1);
    return surname(first.title).localeCompare(surname(second.title), undefined, { sensitivity: 'base' })
      || first.title.localeCompare(second.title, undefined, { sensitivity: 'base' });
  });

  const renderCardGrid = (boxes) => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
      gap: '16px'
    }}>
      {boxes.map(box => (
        <div
          key={box.id}
          onClick={() => onSelectBox(box.title, box.tickets, box.jql, box.jqlNote)}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') onSelectBox(box.title, box.tickets, box.jql, box.jqlNote);
          }}
          className="glass-panel"
          style={{
            padding: '18px 20px',
            background: box.bg,
            border: `1px solid ${box.color}40`,
            borderRadius: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.borderColor = box.color;
            e.currentTarget.style.boxShadow = `0 8px 20px ${box.color}25`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = `${box.color}40`;
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{
                padding: '8px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {box.icon}
              </div>
              <span style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                fontFamily: 'var(--font-mono)'
              }}>
                {box.tickets.length}
              </span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px 0', lineHeight: 1.2 }}>
              {box.title}
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
              {box.subtitle}
            </p>
          </div>

          <button
            className="view-tickets-link"
            style={{ color: box.color }}
            onClick={(event) => {
              event.stopPropagation();
              onSelectBox(box.title, box.tickets, box.jql, box.jqlNote);
            }}
          >
            View Tickets <ChevronRight size={14} />
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginBottom: '32px' }}>
      {/* 1. Core Review Focus Areas */}
      <section id="review-categories">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            Core Review Categories
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>• Click any box to inspect list</span>
        </div>
        {renderCardGrid(reviewBoxes)}
      </section>

      {/* 2. Status & Ageing Timelines */}
      <section id="status-ageing">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            Status & Ageing Timelines
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>• Active, Overdues, 5d, 15d, 30d+, Pending Close</span>
        </div>
        {renderCardGrid(statusTimeBoxes)}
      </section>

      {/* 3. Breakdown by Key Area */}
      <section id="tickets-by-area">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            Tickets by Key Area / Node
          </h3>
        </div>
        {renderCardGrid(keyAreaBoxes)}
      </section>

      {/* 4. Breakdown by Assignee */}
      <section id="tickets-by-assignee">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            Ticket by Assignee (Open tickets)
          </h3>
        </div>
        {renderCardGrid(assigneeBoxes)}
      </section>
    </div>
  );
}
