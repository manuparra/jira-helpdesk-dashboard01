import React, { useState, useEffect } from 'react';
import { 
  Server, Shield, RefreshCw, LogOut, CheckCircle2, AlertTriangle, 
  ExternalLink, Layers, Search, Filter
} from 'lucide-react';
import { TokenModal } from './TokenModal';
import { WeeklyIndicators } from './WeeklyIndicators';
import { ReviewFilters } from './ReviewFilters';
import { TicketTable } from './TicketTable';
import { PeriodicHygiene } from './PeriodicHygiene';
import { MOCK_SNH_TICKETS } from './mockData';

export function App() {
  const [authConfig, setAuthConfig] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showHygiene, setShowHygiene] = useState(false);

  // Initialize data on auth connect
  const handleConnect = async (config) => {
    setLoading(true);
    setError(null);
    setAuthConfig(config);

    if (config.isMock) {
      // Load SKA SNH Mock dataset
      setTimeout(() => {
        setTickets(MOCK_SNH_TICKETS);
        setLoading(false);
      }, 600);
    } else {
      // Real API fetch attempt via proxy/direct fetch
      try {
        const jql = `project = "${config.projectKey}" ORDER BY updated DESC`;
        const headers = {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        };

        if (config.authType === 'pat') {
          headers['Authorization'] = `Bearer ${config.token}`;
        } else {
          headers['Authorization'] = `Basic ${btoa(`${config.email}:${config.token}`)}`;
        }

        const res = await fetch(`${config.jiraUrl}/rest/api/2/search?jql=${encodeURIComponent(jql)}`, {
          method: 'GET',
          headers
        });

        if (!res.ok) {
          throw new Error(`JIRA API responded with HTTP ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        
        // Transform Jira REST issue response into app model
        const formatted = (data.issues || []).map(issue => ({
          id: issue.id,
          key: issue.key,
          summary: issue.fields.summary,
          areaNode: issue.fields.components?.[0]?.name || issue.fields.customfield_10000 || 'General SRC',
          assignee: issue.fields.assignee ? issue.fields.assignee.displayName : null,
          reporter: issue.fields.reporter?.displayName || 'Unknown',
          status: issue.fields.status?.name || 'Open',
          priority: issue.fields.priority?.name || 'Medium',
          impact: issue.fields.priority?.name === 'Highest' ? 'High Impact' : 'Normal',
          created: issue.fields.created,
          updated: issue.fields.updated,
          lastMeaningfulUpdate: issue.fields.updated,
          nextAction: 'Pending review',
          reviewDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
          isCrossNode: issue.fields.labels?.includes('cross-node') || false,
          isBlocker: issue.fields.priority?.name === 'Highest',
          pendingClosure: issue.fields.status?.name === 'Resolved',
          acceptancePending: issue.fields.status?.name === 'Waiting for customer'
        }));

        setTickets(formatted);
      } catch (err) {
        console.warn('Real JIRA connection error/CORS restriction. Falling back to SNH workspace data.', err);
        setError(`Failed to fetch from live JIRA (${err.message}). Loaded SKA SNH project data.`);
        setTickets(MOCK_SNH_TICKETS);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLogout = () => {
    setAuthConfig(null);
    setTickets([]);
  };

  const handleUpdateTicketAction = (ticketKey, nextAction, reviewDate) => {
    setTickets(prev => prev.map(t => {
      if (t.key === ticketKey) {
        return {
          ...t,
          nextAction,
          reviewDate,
          lastMeaningfulUpdate: new Date().toISOString()
        };
      }
      return t;
    }));
  };

  const handleHygieneAction = (ticketKey, actionType) => {
    setTickets(prev => prev.map(t => {
      if (t.key === ticketKey) {
        if (actionType === 'close') return { ...t, status: 'Closed', pendingClosure: false };
        if (actionType === 'merge') return { ...t, status: 'Closed', summary: `[MERGED] ${t.summary}` };
        if (actionType === 'convert') return { ...t, status: 'Converted', summary: `[CONVERTED TO TASK] ${t.summary}` };
        if (actionType === 'retain') return { ...t, pendingClosure: false, reviewDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0] };
      }
      return t;
    }));
  };

  // Filter calculation
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const filterCounts = {
    all: tickets.length,
    unassigned: tickets.filter(t => !t.assignee && t.status !== 'Closed').length,
    acceptance_pending: tickets.filter(t => t.acceptancePending || t.status === 'Pending User Acceptance').length,
    high_impact: tickets.filter(t => t.impact === 'High Impact' || t.priority === 'Highest').length,
    inactivity: tickets.filter(t => {
      const updated = new Date(t.updated || t.created);
      return ((now - updated) / (1000 * 3600 * 24)) >= 3 && t.status !== 'Closed';
    }).length,
    blockers: tickets.filter(t => t.isBlocker || t.priority === 'Highest').length,
    cross_node: tickets.filter(t => t.isCrossNode).length,
    closure_candidates: tickets.filter(t => t.pendingClosure || t.status === 'Resolved').length
  };

  const filteredTickets = tickets.filter(t => {
    // Search matching
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchKey = t.key.toLowerCase().includes(q);
      const matchSummary = t.summary.toLowerCase().includes(q);
      const matchArea = (t.areaNode || '').toLowerCase().includes(q);
      const matchOwner = (t.assignee || '').toLowerCase().includes(q);
      if (!matchKey && !matchSummary && !matchArea && !matchOwner) return false;
    }

    // Filter tab logic
    if (activeFilter === 'unassigned') return !t.assignee && t.status !== 'Closed';
    if (activeFilter === 'acceptance_pending') return t.acceptancePending || t.status === 'Pending User Acceptance';
    if (activeFilter === 'high_impact') return t.impact === 'High Impact' || t.priority === 'Highest';
    if (activeFilter === 'inactivity') {
      const updated = new Date(t.updated || t.created);
      return ((now - updated) / (1000 * 3600 * 24)) >= 3 && t.status !== 'Closed';
    }
    if (activeFilter === 'blockers') return t.isBlocker || t.priority === 'Highest';
    if (activeFilter === 'cross_node') return t.isCrossNode;
    if (activeFilter === 'closure_candidates') return t.pendingClosure || t.status === 'Resolved';

    return true;
  });

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px' }}>
      {/* Header */}
      <header className="glass-panel" style={{
        padding: '20px 28px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
            padding: '10px',
            borderRadius: '12px',
            color: '#000',
            display: 'flex'
          }}>
            <Server size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
                SKA Science Regional Centre Helpdesk Review
              </h1>
              <span className="badge badge-cyan">SNH Project</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
              One exception list supporting meeting and daily duty checks • JIRA SKAO Node
            </p>
          </div>
        </div>

        {authConfig && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setShowHygiene(!showHygiene)}
              style={{
                padding: '8px 16px',
                background: showHygiene ? 'rgba(139, 92, 246, 0.25)' : 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={15} color="#8b5cf6" />
              {showHygiene ? 'Hide Hygiene View' : 'Periodic Hygiene (Monthly/PI)'}
            </button>

            <button
              onClick={handleLogout}
              style={{
                padding: '8px 14px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#fca5a5',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <LogOut size={15} /> Disconnect
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      {!authConfig ? (
        <TokenModal onConnect={handleConnect} isConnecting={loading} />
      ) : (
        <>
          {error && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '20px',
              color: '#fde68a',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <AlertTriangle size={18} color="#f59e0b" />
              {error}
            </div>
          )}

          {/* Weekly Indicators KPI Bar */}
          <WeeklyIndicators tickets={tickets} />

          {/* Periodic Hygiene Component (If toggled or active) */}
          {showHygiene && (
            <PeriodicHygiene tickets={tickets} onHygieneAction={handleHygieneAction} />
          )}

          {/* Search & Filter Toolbar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <div style={{ position: 'relative', width: '320px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket key, summary, area, owner..."
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              />
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Showing <strong>{filteredTickets.length}</strong> of {tickets.length} tickets
            </div>
          </div>

          {/* Review Filters Tabs */}
          <ReviewFilters 
            currentFilter={activeFilter} 
            onSelectFilter={setActiveFilter} 
            counts={filterCounts} 
          />

          {/* Visible Ticket Fields Table */}
          <TicketTable 
            tickets={filteredTickets} 
            jiraUrl={authConfig.jiraUrl} 
            onUpdateTicketAction={handleUpdateTicketAction} 
          />
        </>
      )}
    </div>
  );
}

export default App;
