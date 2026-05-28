// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sessionsAPI, usersAPI } from '../api';
import useAuthStore from '../store/authStore';
import Layout from '../components/layout/Layout';
import { Btn, Avatar, StatusTag, Skel, Card, Stars, Tag } from '../components/ui';
import { formatDate, formatTime, formatCost } from '../lib/utils';

const BigStat = ({ value, label, sub, green }) => (
  <div style={{
    padding: '20px 24px',
    background: green ? 'var(--ink)' : 'var(--surface)',
    border: '1.5px solid var(--line)',
    borderRadius: 'var(--r-lg)',
  }}>
    <div className="display" style={{
      fontSize: 48, lineHeight: 1, letterSpacing: '0.02em',
      color: green ? 'var(--green)' : 'var(--ink)',
      textShadow: green ? '0 0 30px rgba(0,230,118,0.4)' : 'none',
    }}>
      {value}
    </div>
    <div style={{ fontSize: 11, fontWeight: 700, color: green ? 'rgba(255,255,255,0.5)' : 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 6 }}>
      {label}
    </div>
    {sub && <div style={{ fontSize: 11, color: green ? 'rgba(255,255,255,0.3)' : 'var(--ink-4)', marginTop: 2 }}>{sub}</div>}
  </div>
);

const SessionRow = ({ session, onEnroll }) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/sessions/${session.id}`)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 0', borderBottom: '1px solid var(--line-2)',
        cursor: 'pointer', transition: 'opacity var(--t)',
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >
      {/* Modality indicator */}
      <div style={{
        width: 36, height: 36, flexShrink: 0, borderRadius: 'var(--r)',
        background: session.modality === 'virtual' ? 'var(--blue-dim)' : 'var(--green-dim)',
        border: `1.5px solid ${session.modality === 'virtual' ? 'rgba(0,87,255,0.2)' : 'var(--green-bd)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {session.modality === 'virtual' ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={session.modality === 'virtual' ? 'var(--blue)' : '#007a3d'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#007a3d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {session.title}
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontWeight: 600, color: 'var(--ink-2)' }}>{session.subject}</span>
          <span style={{ color: 'var(--line)' }}>·</span>
          <span>{formatDate(session.scheduled_at)}</span>
          <span style={{ color: 'var(--line)' }}>·</span>
          <span>{formatTime(session.scheduled_at)}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <Avatar src={session.tutor?.avatar_url} name={session.tutor?.full_name || ''} size={26} />
        <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{session.available_spots} lugares</span>
        <Btn
          size="sm" variant="outline"
          onClick={e => { e.stopPropagation(); onEnroll(session.id); }}
          disabled={session.status !== 'available' || session.available_spots === 0}
        >
          {session.available_spots === 0 ? 'Lleno' : 'Unirse'}
        </Btn>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { user, hasRole } = useAuthStore();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [history, setHistory] = useState({ as_tutee: [], as_tutor: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      sessionsAPI.getAll({ limit: 6 }),
      usersAPI.getHistory(),
    ]).then(([sRes, hRes]) => {
      setSessions(sRes.data.data || []);
      setHistory(hRes.data.data || { as_tutee: [], as_tutor: [] });
    }).catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  const handleEnroll = async (id) => {
    try {
      await sessionsAPI.enroll(id);
      navigate(`/sessions/${id}`);
    } catch (e) {
      alert(e.response?.data?.message || 'Error al inscribirse');
    }
  };

  const completed = [
    ...history.as_tutee.filter(e => e.session?.status === 'completed'),
    ...history.as_tutor.filter(s => s.status === 'completed'),
  ].length;

  const firstName = user?.full_name?.split(' ')[0] || 'Usuario';
  // Fix: semester comes directly from user object
  const semester = user?.semester;
  const career = user?.career?.split(' ').slice(0, 2).join(' ');

  return (
    <Layout>
      <div style={{ padding: '36px 40px', maxWidth: 1100, margin: '0 auto', width: '100%' }}>

        {/* ── TOP HEADER ── */}
        <div className="fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            {/* Big display greeting */}
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(36px,4vw,56px)',
              letterSpacing: '0.03em', color: 'var(--ink)', lineHeight: 1,
              marginBottom: 8,
            }}>
              HOLA,{' '}
              <span style={{ color: 'var(--green)', textShadow: '0 0 20px rgba(0,230,118,0.35)' }}>
                {firstName.toUpperCase()}
              </span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{career}</span>
              {semester && (
                <>
                  <span style={{ color: 'var(--line)' }}>·</span>
                  <span>{semester}° Semestre</span>
                </>
              )}
              <span style={{ color: 'var(--line)' }}>·</span>
              <span>{new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {hasRole('tutor') ? (
              <Btn variant="green" onClick={() => navigate('/sessions/create')}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
                Nueva Asesoria
              </Btn>
            ) : (
              <Btn variant="primary" onClick={() => navigate('/sessions')}>Buscar asesoria</Btn>
            )}
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div className="fade-up-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 32 }}>
          <BigStat value={history.as_tutee.length} label="Asesorias tomadas" green />
          <BigStat value={completed} label="Completadas" />
          {hasRole('tutor')
            ? <BigStat value={history.as_tutor.length} label="Publicadas" />
            : <BigStat value={user?.roles?.length || 1} label="Roles activos" />
          }
          <BigStat value={semester ? `${semester}°` : '—'} label="Semestre" sub={career} />
        </div>

        {/* ── MAIN GRID ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>

          {/* Left: upcoming sessions */}
          <div className="fade-up-2">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, letterSpacing: '-0.02em' }}>Asesorias disponibles</h2>
              <Link to="/sessions" style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-3)', textDecoration: 'none', letterSpacing: '-0.01em' }}>
                Ver todas →
              </Link>
            </div>

            <Card p={0} style={{ overflow: 'hidden' }}>
              <div style={{ padding: '0 20px' }}>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} style={{ padding: '14px 0', borderBottom: '1px solid var(--line-2)', display: 'flex', gap: 12 }}>
                      <Skel w={36} h={36} r={8} />
                      <div style={{ flex: 1 }}><Skel h={13} w="55%" /><Skel h={11} w="40%" style={{ marginTop: 6 }} /></div>
                    </div>
                  ))
                ) : sessions.length === 0 ? (
                  <div style={{ padding: '40px 0', textAlign: 'center', fontSize: 13, color: 'var(--ink-4)' }}>
                    Sin asesorias disponibles ahora
                  </div>
                ) : (
                  sessions.map(s => (
                    <SessionRow key={s.id} session={s} onEnroll={handleEnroll} />
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Right sidebar */}
          <div className="fade-up-3" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Quick actions */}
            <Card p={20}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                Acceso rapido
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { label: 'Explorar asesorias', to: '/sessions' },
                  { label: 'Ver tutores', to: '/tutors' },
                  { label: 'Mensajes', to: '/chat' },
                  { label: 'Mi historial', to: '/my-sessions' },
                  { label: 'Mi perfil', to: '/profile' },
                ].map(({ label, to }) => (
                  <Link key={to} to={to} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '9px 12px', borderRadius: 'var(--r)',
                    background: 'var(--bg-2)', border: '1.5px solid var(--line)',
                    textDecoration: 'none', fontSize: 13, fontWeight: 500, color: 'var(--ink)',
                    transition: 'all var(--t)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ink-3)'; e.currentTarget.style.background = 'var(--bg-3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.background = 'var(--bg-2)'; }}
                  >
                    {label}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--ink-4)" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </Link>
                ))}
              </div>
            </Card>

            {/* Recent history */}
            <Card p={20}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                Reciente
              </h3>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[1,2,3].map(i => <Skel key={i} h={38} r={6} />)}
                </div>
              ) : history.as_tutee.length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--ink-4)' }}>Sin actividad aun</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {history.as_tutee.slice(0, 4).map(e => (
                    <Link key={e.id} to={`/sessions/${e.session?.id}`} style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                      borderRadius: 'var(--r)', background: 'var(--bg-2)', textDecoration: 'none',
                      border: '1px solid var(--line-2)', transition: 'border-color var(--t)',
                    }}
                    onMouseEnter={el => el.currentTarget.style.borderColor = 'var(--ink-4)'}
                    onMouseLeave={el => el.currentTarget.style.borderColor = 'var(--line-2)'}
                    >
                      <div style={{
                        width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                        background: e.session?.status === 'completed' ? 'var(--green)' : e.session?.status === 'cancelled' ? 'var(--red)' : 'var(--amber)',
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--ink)' }}>
                          {e.session?.title}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--ink-4)' }}>{e.session?.subject}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
