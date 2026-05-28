// src/pages/SessionsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sessionsAPI } from '../api';
import useAuthStore from '../store/authStore';
import Layout from '../components/layout/Layout';
import { Button, Input, Select, Badge, Avatar, StatusBadge, Card, EmptyState, Spinner, Stars } from '../components/ui';
import { formatDate, formatTime, formatDuration, getModalityLabel, getDifficultyLabel, formatCost } from '../lib/utils';

const MODALITY_OPTIONS = [
  { value: '', label: 'Todas las modalidades' },
  { value: 'virtual', label: 'Virtual' },
  { value: 'presential', label: 'Presencial' },
];

const DIFFICULTY_OPTIONS = [
  { value: '', label: 'Cualquier nivel' },
  { value: 'basic', label: 'Básico' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzado' },
];

const TYPE_OPTIONS = [
  { value: '', label: 'Todos los tipos' },
  { value: 'individual', label: 'Individual' },
  { value: 'group', label: 'Grupal' },
  { value: 'quick', label: 'Rápida' },
  { value: 'scheduled', label: 'Programada' },
];

const SessionCard = ({ session, onEnroll }) => {
  const navigate = useNavigate();
  const spotsLeft = session.available_spots;
  const spotsPercent = ((session.max_spots - spotsLeft) / session.max_spots) * 100;

  return (
    <div
      onClick={() => navigate(`/sessions/${session.id}`)}
      style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)', padding: '20px',
        cursor: 'pointer', transition: 'all var(--transition)',
        display: 'flex', flexDirection: 'column', gap: '14px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-light)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <Badge variant={session.modality === 'virtual' ? 'info' : 'success'}>
              {getModalityLabel(session.modality)}
            </Badge>
            <Badge variant="default">{getDifficultyLabel(session.difficulty)}</Badge>
            {session.cost === 0 && <Badge variant="accent">Gratis</Badge>}
          </div>
          <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '4px', lineHeight: 1.3 }}>
            {session.title}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 600 }}>
            {session.subject}
          </p>
        </div>
        <StatusBadge status={session.status} />
      </div>

      {/* Description */}
      {session.description && (
        <p style={{
          fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {session.description}
        </p>
      )}

      {/* Meta info */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        {[
          { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', text: `${formatDate(session.scheduled_at)} ${formatTime(session.scheduled_at)}` },
          { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', text: formatDuration(session.duration_minutes) },
          { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', text: `${spotsLeft} / ${session.max_spots} lugares` },
        ].map(({ icon, text }) => (
          <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={icon} />
            </svg>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{text}</span>
          </div>
        ))}
      </div>

      {/* Spots bar */}
      <div>
        <div style={{ height: 3, background: 'var(--border)', borderRadius: 2 }}>
          <div style={{
            height: '100%', borderRadius: 2,
            width: `${spotsPercent}%`,
            background: spotsLeft === 0 ? 'var(--error)' : spotsLeft <= 2 ? 'var(--warning)' : 'var(--success)',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar src={session.tutor?.avatar_url} name={session.tutor?.full_name || ''} size={28} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-display)' }}>
              {session.tutor?.full_name}
            </div>
            {session.tutor?.profile?.rating > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Stars rating={Math.round(session.tutor.profile.rating)} size={10} />
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  {session.tutor.profile.rating}
                </span>
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-display)', color: session.cost > 0 ? 'var(--text-primary)' : 'var(--success)' }}>
            {formatCost(session.cost)}
          </span>
          <Button
            size="sm"
            disabled={session.status !== 'available' || spotsLeft === 0}
            onClick={(e) => { e.stopPropagation(); onEnroll(session.id); }}
          >
            {spotsLeft === 0 ? 'Lleno' : 'Unirse'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const SessionsPage = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuthStore();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '', subject: '', modality: '', difficulty: '', session_type: '', max_cost: '',
  });

  const load = async (currentPage = 1, currentFilters = filters) => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 9 };
      Object.entries(currentFilters).forEach(([k, v]) => { if (v !== '') params[k] = v; });
      const { data } = await sessionsAPI.getAll(params);
      setSessions(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1, filters); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load(1, filters);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setPage(1);
    load(1, newFilters);
  };

  const handleEnroll = async (id) => {
    try {
      await sessionsAPI.enroll(id);
      navigate(`/sessions/${id}`);
    } catch (e) {
      alert(e.response?.data?.message || 'Error al inscribirse');
    }
  };

  return (
    <Layout>
      <div style={{ padding: '32px 40px', maxWidth: 'var(--content-max)', margin: '0 auto', width: '100%' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>Asesorías</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Encuentra la asesoría perfecta para tu necesidad académica
            </p>
          </div>
          {hasRole('tutor') && (
            <Button onClick={() => navigate('/sessions/create')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>
              </svg>
              Nueva Asesoría
            </Button>
          )}
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <Input
                placeholder="Buscar por materia, título o descripción..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                prefix={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                }
              />
            </div>
            <Button type="submit">Buscar</Button>
          </div>
        </form>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '28px', flexWrap: 'wrap' }}>
          <select
            value={filters.modality}
            onChange={(e) => handleFilterChange('modality', e.target.value)}
            style={{
              height: '36px', padding: '0 12px', background: 'var(--bg-card)',
              border: `1px solid ${filters.modality ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
              fontSize: '13px', cursor: 'pointer', outline: 'none',
            }}
          >
            {MODALITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            value={filters.difficulty}
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            style={{
              height: '36px', padding: '0 12px', background: 'var(--bg-card)',
              border: `1px solid ${filters.difficulty ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
              fontSize: '13px', cursor: 'pointer', outline: 'none',
            }}
          >
            {DIFFICULTY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            value={filters.session_type}
            onChange={(e) => handleFilterChange('session_type', e.target.value)}
            style={{
              height: '36px', padding: '0 12px', background: 'var(--bg-card)',
              border: `1px solid ${filters.session_type ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
              fontSize: '13px', cursor: 'pointer', outline: 'none',
            }}
          >
            {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {(filters.modality || filters.difficulty || filters.session_type || filters.search) && (
            <Button variant="ghost" size="sm" onClick={() => {
              const reset = { search: '', subject: '', modality: '', difficulty: '', session_type: '', max_cost: '' };
              setFilters(reset);
              load(1, reset);
            }}>
              Limpiar filtros
            </Button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
            <Spinner size={32} />
          </div>
        ) : sessions.length === 0 ? (
          <EmptyState
            title="No se encontraron asesorías"
            description="Intenta cambiar los filtros o busca otra materia"
            action={hasRole('tutor') && (
              <Button onClick={() => navigate('/sessions/create')}>Crear la primera</Button>
            )}
          />
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px', marginBottom: '28px' }}>
              {sessions.map((s) => (
                <SessionCard key={s.id} session={s} onEnroll={handleEnroll} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => { setPage(p => p - 1); load(page - 1); }}>
                  Anterior
                </Button>
                <span style={{ display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {page} / {totalPages}
                </span>
                <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => { setPage(p => p + 1); load(page + 1); }}>
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default SessionsPage;
