import React from 'react';
import { Network, ChevronRight, Clock } from 'lucide-react';
import { isActiveTicket } from './areas';
import { addJqlClause, jqlString } from './jql';

const NODES = ['All', 'Australia', 'Canada', 'China', 'Germany', 'Italy', 'Japan', 'SKAO', 'Spain', 'Sweden', 'Switzerland', 'UK'];

const formatLastUpdate = (date) => {
  if (!date) return 'No active tickets';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }).format(new Date(date));
};

export function NodesSummary({ tickets, onSelectBox, baseJql }) {
  return (
    <section className="nodes-section">
      <div className="section-heading">
        <div>
          <h3><Network size={19} /> Nodes</h3>
          <p>Affected Node summary for the selected area. “All” is an explicit JIRA node value.</p>
        </div>
      </div>
      <div className="nodes-grid">
        {NODES.map(node => {
          const nodeTickets = tickets.filter(ticket =>
            isActiveTicket(ticket) && (ticket.affectedNodes || []).includes(node)
          );
          const latestUpdate = nodeTickets.reduce(
            (latest, ticket) => !latest || new Date(ticket.updated) > new Date(latest) ? ticket.updated : latest,
            null
          );
          const jql = addJqlClause(
            baseJql,
            `"Affected Node" = ${jqlString(node)} AND status NOT IN (Resolved, Closed)`
          );
          const openModal = () => onSelectBox(`${node} node`, nodeTickets, jql);

          return (
            <div
              key={node}
              className="glass-panel node-card"
              role="button"
              tabIndex={0}
              onClick={openModal}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') openModal();
              }}
            >
              <div className="node-card-top">
                <div>
                  <span className="node-name">{node}</span>
                  <span className="node-caption">Active tickets</span>
                </div>
                <Network size={19} color="var(--accent-cyan)" />
              </div>
              <strong className="node-count">{nodeTickets.length}</strong>
              <div className="node-update"><Clock size={13} /> Last update: {formatLastUpdate(latestUpdate)}</div>
              <button
                className="view-tickets-link"
                onClick={(event) => {
                  event.stopPropagation();
                  openModal();
                }}
              >
                View Tickets <ChevronRight size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
