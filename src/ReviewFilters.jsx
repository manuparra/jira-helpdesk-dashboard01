import React, { useState } from 'react';
import { 
  Filter, UserX, Clock, ShieldAlert, AlertCircle, 
  GitBranch, CheckSquare, Layers, Calendar, User, Tag
} from 'lucide-react';

export function ReviewFilters({ currentFilter, onSelectFilter, counts }) {
  const filters = [
    { id: 'all', label: 'All SNH Tickets', icon: <Layers size={16} />, color: '#00f0ff' },
    { id: 'unassigned', label: 'Unassigned', icon: <UserX size={16} />, color: '#ef4444' },
    { id: 'acceptance_pending', label: 'Acceptance Pending', icon: <Clock size={16} />, color: '#f59e0b' },
    { id: 'high_impact', label: 'High Impact', icon: <AlertCircle size={16} />, color: '#ec4899' },
    { id: 'inactivity', label: 'Inactivity (>3d)', icon: <Clock size={16} />, color: '#8b5cf6' },
    { id: 'blockers', label: 'Blockers', icon: <ShieldAlert size={16} />, color: '#dc2626' },
    { id: 'cross_node', label: 'Cross-Node', icon: <GitBranch size={16} />, color: '#06b6d4' },
    { id: 'closure_candidates', label: 'Closure Candidates', icon: <CheckSquare size={16} />, color: '#10b981' }
  ];

  return (
    <div style={{
      display: 'flex',
      gap: '10px',
      overflowX: 'auto',
      paddingBottom: '12px',
      marginBottom: '20px',
      scrollbarWidth: 'thin'
    }}>
      {filters.map(f => {
        const isActive = currentFilter === f.id;
        const count = counts[f.id] || 0;

        return (
          <button
            key={f.id}
            onClick={() => onSelectFilter(f.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '10px',
              border: isActive ? `1px solid ${f.color}` : '1px solid var(--border-color)',
              background: isActive ? `rgba(${hexToRgb(f.color)}, 0.15)` : 'var(--bg-card)',
              color: isActive ? '#fff' : 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            <span style={{ color: f.color, display: 'flex' }}>{f.icon}</span>
            <span>{f.label}</span>
            <span style={{
              background: isActive ? f.color : 'rgba(255,255,255,0.1)',
              color: isActive ? '#000' : 'var(--text-main)',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 700
            }}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function hexToRgb(hex) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}
