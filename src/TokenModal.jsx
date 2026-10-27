import React, { useState } from 'react';
import { Key, ShieldCheck, Server, AlertCircle, RefreshCw, LogOut, CheckCircle2, Lock } from 'lucide-react';
import packageJson from '../package.json';

export function TokenModal({ onConnect, isConnecting }) {
  const [token, setToken] = useState('');
  const [jiraUrl, setJiraUrl] = useState('https://jira.skatelescope.org');
  const [projectKey, setProjectKey] = useState('SNH');
  const [email, setEmail] = useState('');
  const [authType, setAuthType] = useState('pat'); // 'pat' (Personal Access Token) or 'basic'

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!token.trim()) return;
    onConnect({ token, jiraUrl, projectKey, email, authType, isMock: false });
  };

  const handleDemoMode = () => {
    onConnect({ token: 'DEMO_TOKEN_SNH_2026', jiraUrl, projectKey: 'SNH', email: 'demo@skatelescope.org', authType: 'pat', isMock: true });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(5, 8, 15, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '520px',
        width: '100%',
        padding: '36px',
        borderRadius: '16px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        border: '1px solid rgba(0, 240, 255, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #00f0ff, #3b82f6)',
            padding: '10px',
            borderRadius: '12px',
            display: 'flex',
            color: '#000'
          }}>
            <Server size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
              SKA Helpdesk Dashboard
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Authentication & Jira API Connection
            </p>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '2px' }}>
              Version {packageJson.version}
            </p>
          </div>
        </div>

        <div style={{
          background: 'rgba(0, 240, 255, 0.05)',
          border: '1px solid rgba(0, 240, 255, 0.15)',
          borderRadius: '8px',
          padding: '12px 14px',
          fontSize: '0.82rem',
          color: '#a5f3fc',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px'
        }}>
          <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#00f0ff' }} />
          <div>
            Connect directly to SKA JIRA project <strong>SNH</strong> (<code>https://jira.skatelescope.org/projects/SNH/</code>).
            Your token stays strictly client-side in session state.
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              JIRA BASE URL
            </label>
            <input 
              type="text" 
              value={jiraUrl} 
              onChange={(e) => setJiraUrl(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.9rem'
              }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                AUTHENTICATION TYPE
              </label>
              <select 
                value={authType} 
                onChange={(e) => setAuthType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              >
                <option value="pat">Personal Access Token (PAT) / Bearer</option>
                <option value="basic">API Token (Basic Auth)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                PROJECT KEY
              </label>
              <input 
                type="text" 
                value={projectKey} 
                onChange={(e) => setProjectKey(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-mono)'
                }}
                required
              />
            </div>
          </div>

          {authType === 'basic' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                EMAIL / USERNAME
              </label>
              <input 
                type="text" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@skatelescope.org"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
                required
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              JIRA API TOKEN / PAT
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password" 
                value={token} 
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste Personal Access Token or API Key..."
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              />
              <Key size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button
              type="submit"
              disabled={isConnecting}
              style={{
                flex: 1,
                padding: '12px',
                background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
                border: 'none',
                borderRadius: '8px',
                color: '#05080f',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isConnecting ? <RefreshCw className="spin" size={18} /> : <Lock size={18} />}
              Connect to JIRA
            </button>

            <button
              type="button"
              onClick={handleDemoMode}
              style={{
                padding: '12px 18px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-main)',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              Load SNH Demo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
