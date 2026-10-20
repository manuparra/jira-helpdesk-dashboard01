import React, { useState } from 'react';
import { 
  Server, RefreshCw, LogOut, AlertTriangle, Search, Grid, Table as TableIcon
} from 'lucide-react';
import { TokenModal } from './TokenModal';
import { WeeklyIndicators } from './WeeklyIndicators';
import { PeriodicHygiene } from './PeriodicHygiene';
import { DashboardGrid } from './DashboardGrid';
import { TicketTable } from './TicketTable';
import { TicketModal } from './TicketModal';
import { MOCK_SNH_TICKETS } from './mockData';

export function App() {
  const [authConfig, setAuthConfig] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showHygiene, setShowHygiene] = useState(false);
  const [viewMode, setViewMode] = useState('boxes'); // 'boxes' | 'table'

  // Modal State for Box Click
  const [selectedBoxTitle, setSelectedBoxTitle] = useState(null);
  const [selectedBoxTickets, setSelectedBoxTickets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Initialize data on auth connect
  const handleConnect = async (config) => {
    setLoading(true);
    setError(null);
    setAuthConfig(config);

    if (config.isMock) {
      setTimeout(() => {
        setTickets(MOCK_SNH_TICKETS);
        setLoading(false);
      }, 500);
    } else {
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

        const targetUrl = config.jiraUrl.replace(/\/$/, '');
        const endpoint = targetUrl.includes('jira.skatelescope.org')
          ? `/jira-api/rest/api/2/search?jql=${encodeURIComponent(jql)}`
          : `${targetUrl}/rest/api/2/search?jql=${encodeURIComponent(jql)}`;

        const res = await fetch(endpoint, { method: 'GET', headers });

        if (!res.ok) {
          throw new Error(`JIRA API responded with HTTP ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        
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
        console.warn('Real JIRA connection fallback to mock SNH dataset.', err);
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

  const handleBoxClick = (boxTitle, boxTickets) => {
    setSelectedBoxTitle(boxTitle);
    setSelectedBoxTickets(boxTickets);
    setIsModalOpen(true);
  };

  // Filtered tickets by search query
  const searchFilteredTickets = tickets.filter(t => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.key.toLowerCase().includes(q) ||
      t.summary.toLowerCase().includes(q) ||
      (t.areaNode || '').toLowerCase().includes(q) ||
      (t.assignee || '').toLowerCase().includes(q)
    );
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

          {/* Periodic Hygiene Component */}
          {showHygiene && (
            <PeriodicHygiene tickets={tickets} onHygieneAction={handleHygieneAction} />
          )}

          {/* Search & View Mode Switcher */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <div style={{ position: 'relative', width: '340px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket key, summary, area, assignee..."
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <button
                onClick={() => setViewMode('boxes')}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: viewMode === 'boxes' ? 'var(--accent-cyan)' : 'transparent',
                  color: viewMode === 'boxes' ? '#000' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Grid size={15} /> Card Boxes View
              </button>
              <button
                onClick={() => setViewMode('table')}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: viewMode === 'table' ? 'var(--accent-cyan)' : 'transparent',
                  color: viewMode === 'table' ? '#000' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <TableIcon size={15} /> Full Table View
              </button>
            </div>
          </div>

          {/* Render Box Grid or Classic Table based on viewMode */}
          {viewMode === 'boxes' ? (
            <DashboardGrid 
              tickets={searchFilteredTickets} 
              onSelectBox={handleBoxClick} 
            />
          ) : (
            <TicketTable 
              tickets={searchFilteredTickets} 
              jiraUrl={authConfig.jiraUrl} 
              onUpdateTicketAction={handleUpdateTicketAction} 
            />
          )}

          {/* Modal for displaying box ticket list */}
          <TicketModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={selectedBoxTitle}
            tickets={selectedBoxTickets}
            jiraUrl={authConfig.jiraUrl}
          />
        </>
      )}
    </div>
  );
}

export default App;

