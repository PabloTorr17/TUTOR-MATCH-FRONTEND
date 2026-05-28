// src/pages/CreateSessionPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionsAPI } from '../api';
import Layout from '../components/layout/Layout';
import { Button, Input, Select, Textarea, Card } from '../components/ui';

const SUBJECTS = [
  'Cálculo Diferencial','Cálculo Integral','Álgebra Lineal','Probabilidad y Estadística',
  'Programación Orientada a Objetos','Estructuras de Datos','Bases de Datos',
  'Algoritmos y Complejidad','Redes de Computadoras','Sistemas Operativos',
  'Desarrollo Web','Inteligencia Artificial','Física I','Física II',
  'Química General','Inglés Técnico','Ética Profesional','Administración de Proyectos',
].map(s => ({ value: s, label: s }));

const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  return d.toISOString().slice(0, 16);
};

const CreateSessionPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '', subject: '', description: '',
    modality: 'virtual', meet_link: '', location: '',
    scheduled_at: tomorrow(), duration_minutes: 60,
    max_spots: 1, cost: 0, difficulty: 'intermediate',
    session_type: 'scheduled', tags: '',
  });

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        scheduled_at: new Date(form.scheduled_at).toISOString(),
        duration_minutes: parseInt(form.duration_minutes),
        max_spots: parseInt(form.max_spots),
        cost: parseFloat(form.cost),
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      const { data } = await sessionsAPI.create(payload);
      navigate(`/sessions/${data.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Error al crear asesoría');
    } finally {
      setLoading(false);
    }
  };

  const Section = ({ title, children }) => (
    <div>
      <h3 style={{
        fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.1em',
        fontFamily: 'var(--font-display)', marginBottom: '16px',
        paddingBottom: '8px', borderBottom: '1px solid var(--border)',
      }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {children}
      </div>
    </div>
  );

  return (
    <Layout>
      <div style={{ padding: '32px 40px', maxWidth: 860, margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '28px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', marginBottom: '16px' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Volver
          </button>
          <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>Nueva asesoría</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Completa los detalles para publicar tu asesoría
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
            {/* Main form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

              {error && (
                <div style={{ padding: '12px 14px', background: 'var(--error-muted)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius)', fontSize: '13px', color: 'var(--error)' }}>
                  {error}
                </div>
              )}

              <Section title="Información básica">
                <Input label="Título" name="title" value={form.title} onChange={handle}
                  placeholder="Ej: Ayuda con derivadas e integrales" required />
                <Select label="Materia" name="subject" options={SUBJECTS}
                  placeholder="Selecciona la materia" value={form.subject} onChange={handle} required />
                <Textarea label="Descripción" name="description" value={form.description}
                  onChange={handle} placeholder="Describe qué temas cubrirás, qué aprenderán los estudiantes..."
                  rows={4} />
                <Input label="Etiquetas (separadas por coma)" name="tags" value={form.tags}
                  onChange={handle} placeholder="cálculo, derivadas, regla de la cadena" />
              </Section>

              <Section title="Modalidad y ubicación">
                <Select label="Modalidad" name="modality" value={form.modality} onChange={handle}
                  options={[{ value: 'virtual', label: 'Virtual' }, { value: 'presential', label: 'Presencial' }]} />
                {form.modality === 'virtual' ? (
                  <Input label="Enlace de reunión" name="meet_link" value={form.meet_link}
                    onChange={handle} placeholder="https://meet.google.com/abc-def-ghi" required />
                ) : (
                  <Input label="Ubicación" name="location" value={form.location}
                    onChange={handle} placeholder="Ej: Biblioteca Central, Sala 3" required />
                )}
              </Section>

              <Section title="Fecha y duración">
                <Input label="Fecha y hora" name="scheduled_at" type="datetime-local"
                  value={form.scheduled_at} onChange={handle} required />
                <Select label="Duración" name="duration_minutes" value={form.duration_minutes} onChange={handle}
                  options={[
                    { value: 30, label: '30 minutos' }, { value: 45, label: '45 minutos' },
                    { value: 60, label: '1 hora' }, { value: 90, label: '1.5 horas' },
                    { value: 120, label: '2 horas' }, { value: 180, label: '3 horas' },
                  ]} />
              </Section>
            </div>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '24px', alignSelf: 'flex-start' }}>
              <Card>
                <h3 style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '16px' }}>
                  Configuración
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <Select label="Tipo" name="session_type" value={form.session_type} onChange={handle}
                    options={[
                      { value: 'scheduled', label: 'Programada' },
                      { value: 'individual', label: 'Individual' },
                      { value: 'group', label: 'Grupal' },
                    ]} />
                  <Select label="Dificultad" name="difficulty" value={form.difficulty} onChange={handle}
                    options={[
                      { value: 'basic', label: 'Básico' },
                      { value: 'intermediate', label: 'Intermedio' },
                      { value: 'advanced', label: 'Avanzado' },
                      { value: 'any', label: 'Cualquier nivel' },
                    ]} />
                  <Input label="Cupos disponibles" name="max_spots" type="number"
                    value={form.max_spots} onChange={handle} min={1} max={30} />
                  <Input label="Costo (MXN)" name="cost" type="number"
                    value={form.cost} onChange={handle} min={0} step={0.01}
                    hint="Pon 0 si es gratuita" />
                </div>
              </Card>

              {/* Preview */}
              <Card style={{ background: 'var(--accent-muted)', border: '1px solid var(--accent-border)' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px', fontFamily: 'var(--font-display)' }}>
                  Vista previa
                </h4>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div><strong style={{ color: 'var(--text-primary)' }}>{form.title || 'Sin título'}</strong></div>
                  <div>{form.subject || 'Sin materia'}</div>
                  <div>{form.modality === 'virtual' ? 'Virtual' : 'Presencial'} · {form.max_spots} cupo{form.max_spots !== 1 ? 's' : ''}</div>
                  <div style={{ fontWeight: 600, color: form.cost > 0 ? 'var(--text-primary)' : 'var(--success)' }}>
                    {form.cost > 0 ? `$${form.cost} MXN` : 'Gratis'}
                  </div>
                </div>
              </Card>

              <Button type="submit" loading={loading} fullWidth size="lg">
                Publicar asesoría
              </Button>
              <Button variant="ghost" fullWidth onClick={() => navigate(-1)}>
                Cancelar
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateSessionPage;
