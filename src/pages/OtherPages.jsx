// src/pages/OtherPages.jsx
// FIXED: imports at top, no require(), no useAuthStore inside component body
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usersAPI, chatAPI, adminAPI } from '../api';
import useAuthStore from '../store/authStore';
import Layout from '../components/layout/Layout';
import { Btn, Avatar, Stars, Tag, Card, Input, Spin, Empty, Skel, StatusTag } from '../components/ui';
import { formatDate, formatTime, formatCost } from '../lib/utils';

/* ── TUTORS PAGE ──────────────────────────────────────────── */
const TutorCard = ({ tutor }) => {
  const navigate = useNavigate();
  return (
    <Card hover onClick={() => navigate(`/users/${tutor.id}`)} p={18}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
        <Avatar src={tutor.avatar_url} name={tutor.full_name} size={48} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2, lineHeight: 1.2 }}>
            {tutor.full_name}
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 4 }}>
            {tutor.career} · {tutor.semester}° Sem.
          </div>
          {tutor.profile?.rating > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Stars rating={Math.round(tutor.profile.rating)} size={11} />
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--amber)' }}>
                {Number(tutor.profile.rating).toFixed(1)}
              </span>
              <span style={{ fontSize: 10, color: 'var(--ink-4)' }}>
                ({tutor.profile.total_sessions} ses.)
              </span>
            </div>
          )}
        </div>
      </div>
      {tutor.profile?.bio && (
        <p style={{
          fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.5, marginBottom: 10,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {tutor.profile.bio}
        </p>
      )}
      {tutor.profile?.subjects?.length > 0 && (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {tutor.profile.subjects.slice(0, 3).map(s => (
            <span key={s} style={{
              padding: '2px 8px', background: 'var(--bg-2)', border: '1px solid var(--line)',
              borderRadius: 4, fontSize: 10, color: 'var(--ink-3)', fontWeight: 500,
            }}>{s}</span>
          ))}
          {tutor.profile.subjects.length > 3 && (
            <span style={{ fontSize: 10, color: 'var(--ink-4)', alignSelf: 'center' }}>
              +{tutor.profile.subjects.length - 3}
            </span>
          )}
        </div>
      )}
    </Card>
  );
};

export const TutorsPage = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async (q = '') => {
    setLoading(true);
    try {
      const params = { limit: 24 };
      if (q) params.search = q;
      const { data } = await usersAPI.getTutors(params);
      setTutors(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load(search);
  };

  return (
    <Layout>
      <div style={{ padding: '36px 40px', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>
              Red academica
            </div>
            <h1 style={{ fontSize: 32, letterSpacing: '-0.03em' }}>Tutores</h1>
          </div>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar tutor..."
              style={{
                height: 38, padding: '0 13px', width: 220,
                background: 'var(--surface)', border: '1.5px solid var(--line)',
                borderRadius: 'var(--r)', fontSize: 13, outline: 'none',
                fontFamily: 'var(--font-body)', color: 'var(--ink)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--ink)'}
              onBlur={e => e.target.style.borderColor = 'var(--line)'}
            />
            <Btn type="submit" variant="primary">Buscar</Btn>
          </form>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 16 }}>
            {Array(6).fill(0).map((_, i) => (
              <Card key={i} p={18}><Skel h={48} r={8} /><Skel h={12} w="60%" style={{ marginTop: 10 }} /></Card>
            ))}
          </div>
        ) : tutors.length === 0 ? (
          <Empty title="Sin tutores" desc="Intenta otro nombre o carrera" />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
            {tutors.map(t => <TutorCard key={t.id} tutor={t} />)}
          </div>
        )}
      </div>
    </Layout>
  );
};

/* ── MY SESSIONS PAGE ─────────────────────────────────────── */
export const MySessionsPage = () => {
  const { hasRole } = useAuthStore();
  const [history, setHistory] = useState({ as_tutee: [], as_tutor: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('tutee');

  useEffect(() => {
    usersAPI.getHistory()
      .then(({ data }) => setHistory(data.data || { as_tutee: [], as_tutor: [] }))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const items = tab === 'tutee' ? history.as_tutee : history.as_tutor;

  const TabBtn = ({ id, label, count }) => (
    <button
      onClick={() => setTab(id)}
      style={{
        padding: '7px 16px', fontFamily: 'var(--font-body)', fontSize: 13,
        fontWeight: 600, cursor: 'pointer', borderRadius: 'var(--r)',
        background: tab === id ? 'var(--ink)' : 'transparent',
        color: tab === id ? 'var(--bg)' : 'var(--ink-3)',
        border: `1.5px solid ${tab === id ? 'var(--ink)' : 'var(--line)'}`,
        transition: 'all var(--t)',
        display: 'flex', alignItems: 'center', gap: 7,
      }}
    >
      {label}
      {count > 0 && (
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '1px 6px',
          background: tab === id ? 'rgba(255,255,255,0.2)' : 'var(--bg-3)',
          borderRadius: 20, color: 'inherit',
        }}>{count}</span>
      )}
    </button>
  );

  return (
    <Layout>
      <div style={{ padding: '36px 40px', maxWidth: 860, margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>
            Historial
          </div>
          <h1 style={{ fontSize: 32, letterSpacing: '-0.03em' }}>Mis Asesorias</h1>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <TabBtn id="tutee" label="Como asesorado" count={history.as_tutee.length} />
          {hasRole('tutor') && (
            <TabBtn id="tutor" label="Como tutor" count={history.as_tutor.length} />
          )}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Array(4).fill(0).map((_, i) => (
              <Card key={i} p={16}><Skel h={14} w="50%" /><Skel h={12} w="30%" style={{ marginTop: 8 }} /></Card>
            ))}
          </div>
        ) : items.length === 0 ? (
          <Empty
            title={tab === 'tutee' ? 'Sin asesorias tomadas' : 'Sin asesorias publicadas'}
            desc={tab === 'tutee' ? 'Explora y unete a asesorias disponibles' : 'Crea tu primera asesoria'}
            action={tab === 'tutor' && hasRole('tutor') && (
              <Link to="/sessions/create">
                <Btn variant="primary">Crear asesoria</Btn>
              </Link>
            )}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map((item) => {
              const session = tab === 'tutee' ? item.session : item;
              if (!session) return null;
              return (
                <Link key={item.id || session.id} to={`/sessions/${session.id}`} style={{ textDecoration: 'none' }}>
                  <Card hover p={16}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3, letterSpacing: '-0.01em' }}>
                          {session.title}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--ink-3)', display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span>{session.subject}</span>
                          <span style={{ color: 'var(--line)' }}>·</span>
                          <span>{formatDate(session.scheduled_at)}</span>
                          <span style={{ color: 'var(--line)' }}>·</span>
                          <span>{session.modality === 'virtual' ? 'Virtual' : 'Presencial'}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                        {tab === 'tutor' && session.enrollments && (
                          <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                            {Array.isArray(session.enrollments) ? session.enrollments.length : 0} inscritos
                          </span>
                        )}
                        <StatusTag status={session.status} />
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-4)" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

/* ── CHAT PAGE ────────────────────────────────────────────── */
export const ChatPage = () => {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    chatAPI.getConversations()
      .then(({ data }) => setConversations(data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async (conv) => {
    setSelected(conv);
    try {
      const { data } = await chatAPI.getMessages(conv.conversation_id);
      setMessages(data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !selected || sending) return;

    const receiverId = selected.last_message?.sender?.id === user?.id
      ? selected.last_message?.receiver_id
      : selected.last_message?.sender?.id;

    if (!receiverId) return;
    setSending(true);
    try {
      await chatAPI.send({ receiver_id: receiverId, content: newMsg.trim(), message_type: 'text' });
      setNewMsg('');
      const { data } = await chatAPI.getMessages(selected.conversation_id);
      setMessages(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        {/* Conversations list */}
        <div style={{
          width: 280, flexShrink: 0,
          borderRight: '1.5px solid var(--line)',
          display: 'flex', flexDirection: 'column',
          background: 'var(--surface)',
        }}>
          <div style={{ padding: '20px 16px 14px', borderBottom: '1.5px solid var(--line)' }}>
            <h2 style={{ fontSize: 18, letterSpacing: '-0.02em' }}>Mensajes</h2>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Array(4).fill(0).map((_, i) => <Skel key={i} h={56} r={8} />)}
              </div>
            ) : conversations.length === 0 ? (
              <div style={{ padding: '40px 16px', textAlign: 'center', fontSize: 13, color: 'var(--ink-4)' }}>
                Sin conversaciones aun
              </div>
            ) : conversations.map((conv, i) => {
              const isMe = conv.last_message?.sender?.id === user?.id;
              const name = isMe
                ? 'Tu mensaje'
                : (conv.last_message?.sender?.full_name || 'Usuario');
              const isSelected = selected?.conversation_id === conv.conversation_id;
              return (
                <div
                  key={conv.conversation_id || i}
                  onClick={() => loadMessages(conv)}
                  style={{
                    padding: '12px 14px', cursor: 'pointer',
                    background: isSelected ? 'var(--bg-2)' : 'transparent',
                    borderBottom: '1px solid var(--line-2)',
                    transition: 'background var(--t)',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-2)'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', gap: 9, alignItems: 'center' }}>
                    <Avatar name={name} size={36} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{name}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {conv.last_message?.content || ''}
                      </div>
                    </div>
                    {conv.unread_count > 0 && (
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%',
                        background: 'var(--green)', color: 'var(--ink)',
                        fontSize: 9, fontWeight: 800,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>{conv.unread_count}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Messages area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
          {!selected ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-4)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--line)" strokeWidth="1.5" style={{ marginBottom: 12 }}>
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
              <p style={{ fontSize: 14 }}>Selecciona una conversacion</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ padding: '14px 20px', borderBottom: '1.5px solid var(--line)', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar name={selected.last_message?.sender?.full_name || ''} size={32} />
                <div style={{ fontWeight: 700, fontSize: 14 }}>
                  {selected.last_message?.sender?.id === user?.id ? 'Conversacion' : (selected.last_message?.sender?.full_name || 'Usuario')}
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {messages.map((msg) => {
                  const mine = msg.sender?.id === user?.id;
                  return (
                    <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '68%', padding: '9px 13px',
                        background: mine ? 'var(--ink)' : 'var(--surface)',
                        color: mine ? 'var(--bg)' : 'var(--ink)',
                        border: mine ? 'none' : '1.5px solid var(--line)',
                        borderRadius: mine ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                        fontSize: 13, lineHeight: 1.5,
                      }}>
                        {msg.content}
                      </div>
                      <span style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 3 }}>
                        {new Date(msg.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} style={{ padding: '14px 20px', borderTop: '1.5px solid var(--line)', background: 'var(--surface)', display: 'flex', gap: 10 }}>
                <input
                  value={newMsg} onChange={e => setNewMsg(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  style={{
                    flex: 1, height: 40, padding: '0 13px',
                    background: 'var(--bg)', border: '1.5px solid var(--line)',
                    borderRadius: 'var(--r)', fontSize: 13, outline: 'none',
                    fontFamily: 'var(--font-body)', color: 'var(--ink)',
                    transition: 'border-color var(--t)',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--ink)'}
                  onBlur={e => e.target.style.borderColor = 'var(--line)'}
                />
                <button
                  type="submit"
                  disabled={!newMsg.trim() || sending}
                  style={{
                    width: 40, height: 40, background: 'var(--ink)', border: 'none',
                    borderRadius: 'var(--r)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: !newMsg.trim() || sending ? 0.4 : 1,
                    transition: 'opacity var(--t)',
                  }}
                >
                  {sending ? (
                    <Spin size={14} color="var(--bg)" />
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

/* ── ADMIN PAGE ───────────────────────────────────────────── */
export const AdminPage = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminAPI.getStats(), adminAPI.getUsers({ limit: 20 })])
      .then(([s, u]) => {
        setStats(s.data.data);
        setUsers(u.data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (id) => {
    try {
      await adminAPI.toggleUser(id);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: !u.is_active } : u));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size={36} />
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div style={{ padding: '36px 40px', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>
            Panel
          </div>
          <h1 style={{ fontSize: 32, letterSpacing: '-0.03em' }}>Administrador</h1>
        </div>

        {/* Stats grid */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
            {[
              { n: stats.users?.total ?? 0,          l: 'Usuarios totales' },
              { n: stats.users?.tutors ?? 0,          l: 'Tutores activos' },
              { n: stats.sessions?.total ?? 0,        l: 'Asesorias totales' },
              { n: stats.sessions?.completed ?? 0,    l: 'Completadas' },
            ].map(({ n, l }) => (
              <Card key={l} p={20}>
                <div className="display" style={{ fontSize: 36, color: 'var(--ink)', lineHeight: 1, marginBottom: 6 }}>{n}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 500 }}>{l}</div>
              </Card>
            ))}
          </div>
        )}

        {/* Top subjects */}
        {stats?.top_subjects?.length > 0 && (
          <Card p={24} style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, marginBottom: 18, letterSpacing: '-0.02em' }}>Materias mas solicitadas</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stats.top_subjects.slice(0, 6).map((s, i) => (
                <div key={s.subject} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 22, fontSize: 11, color: 'var(--ink-4)', fontWeight: 700, textAlign: 'right' }}>#{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{s.subject}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}>{s.count}</span>
                    </div>
                    <div style={{ height: 3, background: 'var(--bg-3)', borderRadius: 2 }}>
                      <div style={{
                        height: '100%', borderRadius: 2,
                        background: i === 0 ? 'var(--green)' : 'var(--ink)',
                        width: `${(s.count / stats.top_subjects[0].count) * 100}%`,
                        transition: 'width 0.5s var(--ease)',
                      }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Users table */}
        <Card p={0} style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1.5px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 15, letterSpacing: '-0.02em' }}>Usuarios ({users.length})</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-2)' }}>
                  {['Nombre', 'Email', 'Carrera', 'Roles', 'Estado', ''].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 10, fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1.5px solid var(--line)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--line-2)', background: i % 2 === 0 ? 'transparent' : 'var(--bg)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar name={u.full_name} size={28} />
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{u.full_name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--ink-3)' }}>{u.email}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--ink-3)' }}>{u.career?.split(' ').slice(0, 2).join(' ')}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {u.roles?.map(r => <Tag key={r} color={r === 'admin' ? 'ink' : r === 'tutor' ? 'green' : 'default'}>{r}</Tag>)}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Tag color={u.is_active ? 'green' : 'red'}>{u.is_active ? 'Activo' : 'Inactivo'}</Tag>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        onClick={() => handleToggle(u.id)}
                        style={{
                          padding: '5px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                          background: 'var(--bg-2)', border: '1.5px solid var(--line)',
                          borderRadius: 'var(--r)', color: 'var(--ink-2)',
                          fontFamily: 'var(--font-body)', transition: 'all var(--t)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--ink-3)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--line)'}
                      >
                        {u.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
};
