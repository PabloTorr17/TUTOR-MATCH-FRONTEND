// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { usersAPI } from '../api';
import useAuthStore from '../store/authStore';
import Layout from '../components/layout/Layout';
import { Button, Input, Textarea, Avatar, Card, Badge, Stars, Divider } from '../components/ui';

const ProfilePage = () => {
  const { user, updateUser, addRole, hasRole } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    full_name: '', bio: '',
    subjects: '', career: '', semester: '',
  });

  useEffect(() => {
    usersAPI.me().then(({ data }) => {
      const p = data.data;
      setProfile(p);
      setForm({
        full_name: p.full_name || '',
        bio: p.profile?.bio || '',
        subjects: p.profile?.subjects?.join(', ') || '',
        career: p.career || '',
        semester: p.semester || '',
      });
    });
  }, []);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        full_name: form.full_name,
        bio: form.bio,
        career: form.career,
        semester: parseInt(form.semester),
        subjects: form.subjects ? form.subjects.split(',').map(s => s.trim()).filter(Boolean) : [],
      };
      const { data } = await usersAPI.updateMe(payload);
      setProfile(data.data);
      updateUser({ full_name: form.full_name, career: form.career });
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      alert(e.response?.data?.message || 'Error guardando perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleBecomeTutor = async () => {
    try {
      await addRole('tutor');
      alert('Ahora eres tutor. Puedes publicar asesorías.');
    } catch (e) {
      alert(e.response?.data?.message || 'Error');
    }
  };

  if (!profile) return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <div style={{ width: 32, height: 32, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div style={{ padding: '32px 40px', maxWidth: 860, margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>Mi perfil</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Gestiona tu información académica y preferencias</p>
        </div>

        {saved && (
          <div style={{ padding: '12px 14px', background: 'var(--success-muted)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 'var(--radius)', fontSize: '13px', color: 'var(--success)', marginBottom: '20px' }}>
            Perfil actualizado exitosamente
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px' }}>
          {/* Main */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <Avatar src={profile.avatar_url} name={profile.full_name} size={64} />
                  <div>
                    <h2 style={{ fontSize: '20px', marginBottom: '4px' }}>{profile.full_name}</h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{profile.career} · {profile.semester}° Sem.</p>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                      {profile.roles?.map(r => (
                        <Badge key={r} variant={r === 'tutor' ? 'accent' : r === 'admin' ? 'warning' : 'default'}>
                          {r}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setEditing(!editing)}>
                  {editing ? 'Cancelar' : 'Editar'}
                </Button>
              </div>

              {!editing ? (
                <>
                  {profile.profile?.bio ? (
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{profile.profile.bio}</p>
                  ) : (
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Sin descripción. Haz clic en Editar para agregar una.</p>
                  )}
                  {profile.profile?.subjects?.length > 0 && (
                    <div style={{ marginTop: '16px' }}>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Materias</p>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {profile.profile.subjects.map(s => (
                          <span key={s} style={{ padding: '4px 10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', fontSize: '12px' }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <Input label="Nombre completo" name="full_name" value={form.full_name} onChange={handle} required />
                  <Textarea label="Descripción" name="bio" value={form.bio} onChange={handle}
                    placeholder="Cuéntanos sobre tu experiencia académica..." rows={3} />
                  <Input label="Materias (separadas por coma)" name="subjects" value={form.subjects}
                    onChange={handle} placeholder="Cálculo, Álgebra, Programación..." />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Input label="Carrera" name="career" value={form.career} onChange={handle} />
                    <Input label="Semestre" name="semester" type="number" value={form.semester} onChange={handle} min={1} max={12} />
                  </div>
                  <Button type="submit" loading={loading}>Guardar cambios</Button>
                </form>
              )}
            </Card>

            {/* Become tutor */}
            {!hasRole('tutor') && (
              <Card style={{ border: '1px solid var(--accent-border)', background: 'var(--accent-muted)' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Conviertete en tutor</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
                  Comparte tu conocimiento, ayuda a otros estudiantes y construye tu reputación académica.
                </p>
                <Button onClick={handleBecomeTutor}>Activar rol de tutor</Button>
              </Card>
            )}
          </div>

          {/* Stats sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Card>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-display)', marginBottom: '16px' }}>
                Estadísticas
              </h3>
              {[
                { label: 'Rating', value: profile.profile?.rating > 0 ? profile.profile.rating.toFixed(1) : 'N/A' },
                { label: 'Asesorías totales', value: profile.profile?.total_sessions || 0 },
                { label: 'Asistencia', value: `${profile.profile?.attendance_rate || 100}%` },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{label}</span>
                  <span style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>{value}</span>
                </div>
              ))}
            </Card>

            <Card>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-display)', marginBottom: '12px' }}>
                Cuenta
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Email</p>
              <p style={{ fontSize: '13px', marginBottom: '12px', wordBreak: 'break-all' }}>{profile.email}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Miembro desde</p>
              <p style={{ fontSize: '13px' }}>{new Date(profile.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long' })}</p>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
