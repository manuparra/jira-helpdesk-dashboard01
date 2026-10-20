import React from 'react';
import { Activity, ArrowDownRight, ArrowUpRight, Clock3, ShieldAlert, UserX, Users, UserRoundCheck, Timer } from 'lucide-react';
import { isActiveTicket, isOwnerlessTicket } from './areas';
import { addJqlClause, jqlString } from './jql';

const dayMs = 24 * 60 * 60 * 1000;
const today = () => new Date().toISOString().slice(0, 10);
const ageInDays = (date) => Math.floor((Date.now() - new Date(date)) / dayMs);
const median = (values) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};
const formatDuration = (milliseconds) => milliseconds === null ? 'No data' : `${Math.round(milliseconds / dayMs)}d`;

function MetricCard({ title, value, detail, icon, tickets, jql, jqlNote, onSelectBox, tone = 'cyan' }) {
  const open = () => onSelectBox(title, tickets, jql, jqlNote);
  return (
    <div className={`glass-panel metric-card metric-${tone}`} role="button" tabIndex={0} onClick={open}
      onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') open(); }}>
      <div className="metric-card-head"><span>{title}</span>{icon}</div>
      <strong>{value}</strong>
      <p>{detail}</p>
      <button className="view-tickets-link" onClick={(event) => { event.stopPropagation(); open(); }}>View Tickets</button>
    </div>
  );
}

export function MetricsSummary({ tickets, onSelectBox, baseJql }) {
  const active = tickets.filter(isActiveTicket);
  const newToday = tickets.filter(ticket => ticket.created?.slice(0, 10) === today());
  const resolvedToday = tickets.filter(ticket => ticket.resolutionDate?.slice(0, 10) === today());
  const changeTickets = [...new Map([...newToday, ...resolvedToday].map(ticket => [ticket.key, ticket])).values()];
  const aged = (days) => active.filter(ticket => ageInDays(ticket.created) >= days);
  const slaTickets = active.filter(ticket => ticket.slaBreached || ticket.slaAtRisk);
  const unassigned = active.filter(isOwnerlessTicket);
  const oldestUnassigned = unassigned.length ? Math.max(...unassigned.map(ticket => ageInDays(ticket.created))) : 0;
  const waiting = active.filter(ticket => ticket.status === 'Waiting for customer');
  const firstResponseSamples = tickets.map(ticket => ticket.firstResponseMs).filter(Number.isFinite);
  const priorities = ['Highest', 'High', 'Medium', 'Low'];
  const technicians = [...new Set(tickets.map(ticket => ticket.assignee).filter(Boolean))].sort();

  return (
    <section className="metrics-section">
      <div className="section-heading"><div><h3><Activity size={19} /> Metrics</h3><p>Operational measures for the selected area.</p></div></div>

      <div className="metrics-grid">
        <MetricCard title="Open tickets" value={active.length} detail={`Backlog change today: ${newToday.length - resolvedToday.length >= 0 ? '+' : ''}${newToday.length - resolvedToday.length}`} icon={<Activity size={19} />} tickets={active} jql={addJqlClause(baseJql, 'status NOT IN (Resolved, Closed)')} onSelectBox={onSelectBox} />
        <MetricCard title="New today" value={newToday.length} detail="Tickets created since start of day" icon={<ArrowUpRight size={19} />} tickets={newToday} jql={addJqlClause(baseJql, 'created >= startOfDay()')} onSelectBox={onSelectBox} tone="blue" />
        <MetricCard title="Resolved today" value={resolvedToday.length} detail="Tickets resolved since start of day" icon={<ArrowDownRight size={19} />} tickets={resolvedToday} jql={addJqlClause(baseJql, 'resolutiondate >= startOfDay()')} onSelectBox={onSelectBox} tone="green" />
        <MetricCard title="Backlog movement" value={`${newToday.length - resolvedToday.length >= 0 ? '+' : ''}${newToday.length - resolvedToday.length}`} detail="New minus resolved today" icon={<Activity size={19} />} tickets={changeTickets} jql={addJqlClause(baseJql, 'created >= startOfDay() OR resolutiondate >= startOfDay()')} onSelectBox={onSelectBox} tone="purple" />
        {[7, 15, 30].map(days => <MetricCard key={days} title={`Backlog aged ${days}+ days`} value={aged(days).length} detail="Open tickets older than threshold" icon={<Clock3 size={19} />} tickets={aged(days)} jql={addJqlClause(baseJql, `created <= -${days}d AND status NOT IN (Resolved, Closed)`)} onSelectBox={onSelectBox} tone="orange" />)}
        <MetricCard title="SLA at risk / breached" value={slaTickets.length} detail="Less than 4h remaining or breached" icon={<ShieldAlert size={19} />} tickets={slaTickets} jql={addJqlClause(baseJql, '"Time to resolution" = breached() OR "Time to resolution" = remaining("4h")')} onSelectBox={onSelectBox} tone="red" />
        <MetricCard title="Median first response" value={formatDuration(median(firstResponseSamples))} detail="Target data is unavailable when JIRA returns no SLA cycles" icon={<Timer size={19} />} tickets={tickets.filter(ticket => Number.isFinite(ticket.firstResponseMs))} jql={addJqlClause(baseJql, '"Time to first response" IS NOT EMPTY')} jqlNote="This project currently returns no completed SLA cycles through the JIRA API, so the median cannot be calculated until SLA samples are available." onSelectBox={onSelectBox} tone="purple" />
        <MetricCard title="Unassigned tickets" value={unassigned.length} detail={unassigned.length ? `Oldest unassigned: ${oldestUnassigned}d` : 'No unassigned active tickets'} icon={<UserX size={19} />} tickets={unassigned} jql={addJqlClause(baseJql, 'assignee IS EMPTY AND status NOT IN (Resolved, Closed)')} onSelectBox={onSelectBox} tone="red" />
        <MetricCard title="Waiting on customer / third party" value={waiting.length} detail="Waiting for customer status" icon={<UserRoundCheck size={19} />} tickets={waiting} jql={addJqlClause(baseJql, 'status = "Waiting for customer"')} jqlNote="This JIRA project exposes “Waiting for customer”; it does not have a separate third-party waiting status." onSelectBox={onSelectBox} tone="orange" />
      </div>

      <h4 className="metrics-subheading">Resolution time by priority</h4>
      <div className="metrics-grid">
        {priorities.map(priority => {
          const resolved = tickets.filter(ticket => ticket.priority === priority && ticket.resolutionDate);
          const duration = median(resolved.map(ticket => new Date(ticket.resolutionDate) - new Date(ticket.created)));
          return <MetricCard key={priority} title={`${priority} priority`} value={formatDuration(duration)} detail={`${resolved.length} resolved ticket${resolved.length === 1 ? '' : 's'}`} icon={<Timer size={19} />} tickets={resolved} jql={addJqlClause(baseJql, `priority = ${priority} AND resolutiondate IS NOT EMPTY`)} onSelectBox={onSelectBox} tone="blue" />;
        })}
      </div>

      <h4 className="metrics-subheading">Workload by technician</h4>
      <div className="metrics-grid">
        {technicians.length ? technicians.map(technician => {
          const assigned = active.filter(ticket => ticket.assignee === technician);
          const completed = resolvedToday.filter(ticket => ticket.assignee === technician);
          const technicianTickets = [...new Map([...assigned, ...completed].map(ticket => [ticket.key, ticket])).values()];
          return <MetricCard key={technician} title={technician} value={assigned.length} detail={`${completed.length} resolved today`} icon={<Users size={19} />} tickets={technicianTickets} jql={addJqlClause(baseJql, `assignee = ${jqlString(technician)} AND (status NOT IN (Resolved, Closed) OR resolutiondate >= startOfDay())`)} onSelectBox={onSelectBox} tone="cyan" />;
        }) : <div className="glass-panel metric-empty">No assigned technicians in this area.</div>}
      </div>
    </section>
  );
}
