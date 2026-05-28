// src/pages/SessionDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { sessionsAPI, reviewsAPI, chatAPI } from '../api';
import useAuthStore from '../store/authStore';
import Layout from '../components/layout/Layout';
import { Button, Avatar, Badge, StatusBadge, Card, Stars, Spinner } from '../components/ui';
import { formatDate, formatTime, formatDuration, getModalityLabel, getDifficultyLabel, formatCost } from '../lib/utils';

const SessionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuthStore();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewSent, setReviewSent] = useState(false);

  const load = async () => {
    try {
      const { data } = await sessionsAPI.getById(id);
      setSession(data.data);
    } catch {
      navigate('/sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await sessionsAPI.enroll(id);
      await load();
    } catch (e) {
      alert(e.response?.data?.message || 'Error al inscribirse');
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = async () => {
    if (!confirm('¿Cancelar tu inscripción?')) return;
    try {
      await sessionsAPI.unenroll(id);
      await load();
    } catch (e) {
      alert(e.response?.data?.message || 'Error');
    }
  };

  const handleStatusChange = async (status) => {
    setStatusLoading(true);
    try {
      await sessionsAPI.updateStatus(id, status);
      await load();
    } catch (e) {
      alert(e.response?.data?.message || 'Error');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      await reviewsAPI.create({ session_id: id, ...reviewForm });
      setReviewSent(true);
    } catch (e) {
      alert(e.response?.data?.message || 'Error al enviar reseña');
    }
  };

  const handleChat = async () => {
    try {
      await chatAPI.send({ receiver_id: session.tutor_id, content: `Hola! Vi tu asesoría "${session.title}"`, message_type: 'text' });
      navigate('/chat');
    } catch {
      navigate('/chat');
    }
  };

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spinner size={40} />
      </div>
    </Layout>
  );

  if (!session) return null;

  const isOwner = session.is_owner;
  const isEnrolled = session.is_enrolled;
  const spotsLeft = session.available_spots;

  return (
    <Layout>
      <div style={{ padding: '32px 40px', maxWidth: 'var(--content-max)', margin: '0 auto', width: '100%' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', marginBottom: '24px' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Volver a asesorías
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '28px' }}>
          {/* Main */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Header */}
            <Card>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
                <Badge variant={session.modality === 'virtual' ? 'info' : 'success'}>{getModalityLabel(session.modality)}</Badge>
                <Badge variant="default">{getDifficultyLabel(session.difficulty)}</Badge>
                {session.cost === 0 && <Badge variant="accent">Gratis</Badge>}
                <StatusBadge status={session.status} />
              </div>
              <h1 style={{ fontSize: '26px', marginBottom: '8px' }}>{session.title}</h1>
              <p style={{ fontSize: '15px', color: 'var(--accent)', fontWeight: 600, marginBottom: '16px' }}>{session.subject}</p>
              {session.description && (
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{session.description}</p>
              )}

              {/* Tags */}
              {session.tags?.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
                  {session.tags.map(t => (
                    <span key={t} style={{
                      padding: '4px 10px', background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)', borderRadius: 'var(--radius-full)',
                      fontSize: '12px', color: 'var(--text-secondary)',
                    }}>{t}</span>
                  ))}
                </div>
              )}
            </Card>

            {/* Details */}
            <Card>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', fontFamily: 'var(--font-display)' }}>
                Detalles
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {[
                  { label: 'Fecha', value: formatDate(session.scheduled_at) },
                  { label: 'Hora', value: formatTime(session.scheduled_at) },
                  { label: 'Duración', value: formatDuration(session.duration_minutes) },
                  { label: 'Modalidad', value: getModalityLabel(session.modality) },
                  { label: 'Cupos', value: `${spotsLeft} disponibles de ${session.max_spots}` },
                  { label: 'Costo', value: formatCost(session.cost) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: '3px' }}>{label}</div>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>{value}</div>
                  </div>
                ))}
                {session.modality === 'presential' && session.location && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: '3px' }}>Ubicación</div>
                    <div style={{ fontSize: '14px' }}>{session.location}</div>
                  </div>
                )}
                {session.modality === 'virtual' && isEnrolled && session.meet_link && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: '3px' }}>Enlace (visible al inscribirte)</div>
                    <a href={session.meet_link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px', color: 'var(--accent)' }}>{session.meet_link}</a>
                  </div>
                )}
              </div>
            </Card>

            {/* Enrolled users */}
            {(isOwner || isEnrolled) && session.enrollments?.length > 0 && (
              <Card>
                <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', fontFamily: 'var(--font-display)' }}>
                  Inscritos ({session.enrollments.filter(e => e.status === 'confirmed').length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {session.enrollments.filter(e => e.status === 'confirmed').map(e => (
                    <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Avatar src={e.user?.avatar_url} name={e.user?.full_name || ''} size={32} />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-display)' }}>{e.user?.full_name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{e.user?.career}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Review form */}
            {isEnrolled && session.status === 'completed' && !reviewSent && (
              <Card style={{ border: '1px solid var(--accent-border)', background: 'var(--accent-muted)' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>
                  Califica esta asesoría
                </h3>
                <form onSubmit={handleReview} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>Rating</div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <button key={s} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: s }))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                          <svg width="28" height="28" viewBox="0 0 20 20" fill={s <= reviewForm.rating ? 'var(--accent)' : 'var(--border-light)'}>
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={reviewForm.comment}
                    onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                    placeholder="Comparte tu experiencia con este tutor..."
                    rows={3}
                    style={{
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)', padding: '10px 12px',
                      color: 'var(--text-primary)', fontSize: '13px', resize: 'none',
                      fontFamily: 'var(--font-body)', outline: 'none',
                    }}
                  />
                  <Button type="submit">Enviar reseña</Button>
                </form>
              </Card>
            )}
            {reviewSent && (
              <Card style={{ border: '1px solid var(--success)', background: 'var(--success-muted)', textAlign: 'center', padding: '20px' }}>
                <p style={{ color: 'var(--success)', fontWeight: 600 }}>Reseña enviada. Gracias!</p>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Actions */}
            <Card>
              <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '4px', color: session.cost > 0 ? 'var(--text-primary)' : 'var(--success)' }}>
                {formatCost(session.cost)}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                {spotsLeft} lugar{spotsLeft !== 1 ? 'es' : ''} disponible{spotsLeft !== 1 ? 's' : ''}
              </div>

              {!isOwner && session.status === 'available' && !isEnrolled && (
                <Button fullWidth size="lg" loading={enrolling} onClick={handleEnroll} disabled={spotsLeft === 0}>
                  {spotsLeft === 0 ? 'Sin lugares' : 'Inscribirme'}
                </Button>
              )}
              {!isOwner && isEnrolled && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ padding: '10px', background: 'var(--success-muted)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 'var(--radius)', textAlign: 'center', fontSize: '13px', color: 'var(--success)', fontWeight: 600 }}>
                    Inscrito
                  </div>
                  <Button variant="danger" fullWidth onClick={handleUnenroll} size="sm">
                    Cancelar inscripción
                  </Button>
                </div>
              )}
              {!isOwner && (
                <Button variant="secondary" fullWidth onClick={handleChat} style={{ marginTop: '8px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  Contactar tutor
                </Button>
              )}

              {/* Owner controls */}
              {isOwner && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-display)', marginBottom: '4px' }}>
                    Controles del tutor
                  </div>
                  {session.status === 'available' && (
                    <Button variant="secondary" fullWidth loading={statusLoading} onClick={() => handleStatusChange('in_progress')}>
                      Iniciar asesoría
                    </Button>
                  )}
                  {session.status === 'in_progress' && (
                    <Button fullWidth loading={statusLoading} onClick={() => handleStatusChange('completed')}>
                      Marcar completada
                    </Button>
                  )}
                  {['available', 'in_progress'].includes(session.status) && (
                    <Button variant="danger" fullWidth loading={statusLoading} onClick={() => handleStatusChange('cancelled')}>
                      Cancelar
                    </Button>
                  )}
                </div>
              )}
            </Card>

            {/* Tutor card */}
            <Card>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-display)', marginBottom: '14px' }}>
                Tutor
              </h3>
              <Link to={`/users/${session.tutor_id}`} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <Avatar src={session.tutor?.avatar_url} name={session.tutor?.full_name || ''} size={48} />
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                      {session.tutor?.full_name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {session.tutor?.career}
                    </div>
                  </div>
                </div>
              </Link>
              <div style={{ display: 'flex', gap: '16px' }}>
                {session.tutor_profile?.rating > 0 && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>
                      {session.tutor_profile.rating}
                    </div>
                    <Stars rating={Math.round(session.tutor_profile.rating)} size={12} />
                  </div>
                )}
                {session.tutor_profile?.total_sessions > 0 && (
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                      {session.tutor_profile.total_sessions}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>asesorías</div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SessionDetailPage;
