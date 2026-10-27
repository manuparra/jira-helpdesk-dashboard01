export const AREAS = [
  'Unassigned',
  'SRCNet Management',
  'Operations',
  'Data Management',
  'Authentication / Authorisation',
  'Metadata Management',
  'Operational Tooling',
  'Science Enabling Applications',
  'Federated Execution',
  'Science Support',
  'Science Gateway',
  'Science Workflows'
];

const normalise = (value) => String(value || '').trim().toLowerCase();

export const isActiveTicket = (ticket) => !['done', 'resolved', 'closed'].includes(normalise(ticket.status));

// A single definition keeps the Ownerless KPI and Unassigned review box aligned.
export const isOwnerlessTicket = (ticket) => !ticket.assignee && isActiveTicket(ticket);

// JIRA may return the area as a component or a dedicated custom field.
// Keep both forms so the dashboard also works with older tickets.
export function ticketHasArea(ticket, area) {
  const ticketAreas = [
    ticket.area,
    ticket.areaNode,
    ...(Array.isArray(ticket.areas) ? ticket.areas : []),
    ...(Array.isArray(ticket.components) ? ticket.components : [])
  ].map(normalise);

  return ticketAreas.includes(normalise(area));
}

export function countActiveTicketsForArea(tickets, area) {
  return tickets.filter((ticket) => isActiveTicket(ticket) && ticketHasArea(ticket, area)).length;
}
