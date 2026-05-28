// src/components/layout/Layout.jsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { Avatar, Tag } from '../ui';

const LINKS = [
  {
    to: '/dashboard', label: 'Inicio',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  },
  {
    to: '/sessions', label: 'Asesorias',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
  },
  {
    to: '/tutors', label: 'Tutores',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  },
  {
    to: '/my-sessions', label: 'Mis Asesorias',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>,
  },
  {
    to: '/chat', label: 'Mensajes',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  },
  {
    to: '/profile', label: 'Perfil',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  },
];

const NavLink = ({ to, label, icon, active }) => (
  <Link to={to} style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 12px', borderRadius: 'var(--r)',
    background: active ? 'var(--ink)' : 'transparent',
    color: active ? 'var(--bg)' : 'var(--ink-3)',
    fontSize: 13, fontWeight: active ? 600 : 400,
    transition: 'all var(--t) var(--ease)',
    textDecoration: 'none',
  }}
  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--bg-2)'; e.currentTarget.style.color = 'var(--ink)'; } }}
  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-3)'; } }}
  >
    <span style={{ flexShrink: 0, opacity: active ? 1 : 0.7 }}>{icon}</span>
    {label}
  </Link>
);

const Layout = ({ children }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasRole } = useAuthStore();

  const isActive = (to) => pathname === to || (to !== '/dashboard' && pathname.startsWith(to + '/'));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── SIDEBAR ───────────────────────────── */}
      <aside style={{
        width: 'var(--nav-w)', flexShrink: 0,
        background: 'var(--surface)',
        borderRight: '1.5px solid var(--line)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', inset: '0 auto 0 0',
        zIndex: 100,
      }}>

        {/* Logotipo — gran tipografia display */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1.5px solid var(--line)' }}>
          <Link to="/dashboard" style={{ textDecoration: 'none', display: 'block' }}>
            {/* Wordmark con Bebas Neue */}
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 26, letterSpacing: '0.04em',
              color: 'var(--ink)', lineHeight: 1,
              marginBottom: 2,
            }}>
              TUTOR<span style={{ color: 'var(--green)', textShadow: '0 0 12px rgba(0,230,118,0.5)' }}>MATCH</span>
            </div>
            <div style={{
              fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
              color: 'var(--ink-4)', fontWeight: 600,
            }}>
              Campus Connect
            </div>
          </Link>
        </div>

        {/* Role indicator */}
        {user && (
          <div style={{
            margin: '12px 16px', padding: '8px 10px',
            background: hasRole('tutor') ? 'var(--green-dim)' : 'var(--bg-2)',
            border: `1.5px solid ${hasRole('tutor') ? 'var(--green-bd)' : 'var(--line)'}`,
            borderRadius: 'var(--r)',
            fontSize: 11, fontWeight: 700,
            color: hasRole('tutor') ? '#007a3d' : 'var(--ink-3)',
            textTransform: 'uppercase', letterSpacing: '0.07em',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: hasRole('tutor') ? 'var(--green)' : 'var(--ink-4)',
              flexShrink: 0,
            }} />
            {hasRole('tutor') ? 'Tutor activo' : 'Solo asesorado'}
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {LINKS.map(l => (
            <NavLink key={l.to} {...l} active={isActive(l.to)} />
          ))}

          {hasRole('tutor') && (
            <>
              <div style={{ height: 1, background: 'var(--line)', margin: '8px 4px' }} />
              <Link to="/sessions/create" style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', borderRadius: 'var(--r)',
                background: 'var(--green)', color: 'var(--ink)',
                fontSize: 13, fontWeight: 700, textDecoration: 'none',
                boxShadow: '0 0 16px rgba(0,230,118,0.25)',
                transition: 'all var(--t) var(--ease)',
              }}
              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.08)'}
              onMouseLeave={e => e.currentTarget.style.filter = ''}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
                Nueva Asesoria
              </Link>
            </>
          )}

          {hasRole('admin') && (
            <>
              <div style={{ height: 1, background: 'var(--line)', margin: '8px 4px' }} />
              <NavLink
                to="/admin" label="Admin" active={isActive('/admin')}
                icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
              />
            </>
          )}
        </nav>

        {/* User footer */}
        <div style={{ borderTop: '1.5px solid var(--line)', padding: '12px 12px' }}>
          {!hasRole('tutor') && (
            <Link to="/profile" style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
              marginBottom: 8, borderRadius: 'var(--r)',
              background: 'var(--bg-2)', border: '1.5px solid var(--line)',
              textDecoration: 'none', transition: 'border-color var(--t)',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--ink-3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--line)'}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)' }}>Activar rol de tutor</span>
            </Link>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <Avatar src={user?.avatar_url} name={user?.full_name || ''} size={32} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.full_name}
              </div>
              <div style={{ fontSize: 10, color: 'var(--ink-4)' }}>{user?.semester ? `${user.semester}° sem` : ''} {user?.career?.split(' ')[0]}</div>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              title="Cerrar sesion"
              style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: 'var(--ink-4)', borderRadius: 4, transition: 'color var(--t)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-4)'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN ──────────────────────────────── */}
      <main style={{ flex: 1, marginLeft: 'var(--nav-w)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
