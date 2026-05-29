// src/pages/AuthPages.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Button, Input, Select, Divider } from '../components/ui';

const CAREERS = [
  'Licenciatura en Administración',
  'Ingeniería Ambiental',
  'Ingeniería Bioquímica',
  'Ingeniería en Electrónica',
  'Ingeniería en Gestión Empresarial',
  'Ingeniería Industrial',
  'Ingeniería Mecánica',
  'Ingeniería Mecatrónica',
  'Ingeniería Química',
  'Ingeniería en Semiconductores',
  'Ingeniería en Sistemas Computacionales',
  'Maestrias',
].map((c) => ({ value: c, label: c }));

const SEMESTERS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1}° Semestre`,
}));

// ─── AUTH LAYOUT ──────────────────────────────────────────────
const AuthLayout = ({ children, title, subtitle, side }) => (
  <div style={{
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    minHeight: '100vh', background: 'var(--bg-primary)',
  }}>
    {/* Left panel */}
    <div style={{
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', padding: '60px',
      borderRight: '1px solid var(--border)',
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '48px', textDecoration: 'none' }}>
        <div style={{
          width: 36, height: 36, background: 'var(--accent)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#0a0a0a">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
          TutorMatch
        </span>
      </Link>

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: 'clamp(28px, 3vw, 40px)', marginBottom: '10px', letterSpacing: '-0.03em' }}>
          {title}
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {subtitle}
        </p>
      </div>

      {children}
    </div>

    {/* Right panel - visual */}
    <div style={{
      background: 'var(--bg-secondary)',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      padding: '60px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Grid pattern */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
        opacity: 0.4,
      }} />
      {/* Accent glow */}
      <div style={{
        position: 'absolute', width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(245,166,35,0.15) 0%, transparent 70%)',
        borderRadius: '50%', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
      }} />
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 320 }}>
        {side}
      </div>
    </div>
  </div>
);

// ─── LOGIN PAGE ───────────────────────────────────────────────
export const LoginPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Bienvenido de vuelta"
      subtitle="Accede a tu cuenta para encontrar o publicar asesorías en tu campus."
      side={
        <>
          <div style={{
            fontSize: '64px', fontFamily: 'var(--font-display)', fontWeight: 800,
            color: 'var(--accent)', lineHeight: 1, marginBottom: '16px',
            letterSpacing: '-0.05em',
          }}>
            4.9
          </div>
          <p style={{ fontSize: '18px', fontWeight: 600, fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
            Rating promedio de tutores
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Más de 500 asesorías completadas este semestre en el campus
          </p>
          <div style={{ display: 'flex', gap: '24px', marginTop: '32px', justifyContent: 'center' }}>
            {[['120+', 'Tutores'], ['850+', 'Estudiantes'], ['30+', 'Materias']].map(([n, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>{n}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</div>
              </div>
            ))}
          </div>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && (
          <div style={{
            padding: '12px 14px', background: 'var(--error-muted)',
            border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius)',
            fontSize: '13px', color: 'var(--error)',
          }}>
            {error}
          </div>
        )}
        <Input
          label="Correo institucional"
          type="email" name="email"
          placeholder="tu@universidad.edu"
          value={form.email} onChange={handleChange}
          required
        />
        <Input
          label="Contraseña"
          type="password" name="password"
          placeholder="••••••••"
          value={form.password} onChange={handleChange}
          required
        />
        <Button type="submit" loading={loading} fullWidth size="lg">
          Iniciar sesión
        </Button>

        <Divider label="o" />

        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
          No tienes cuenta?{' '}
          <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>
            Registrarse
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

// ─── REGISTER PAGE ────────────────────────────────────────────
export const RegisterPage = () => {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const [form, setForm] = useState({
    full_name: '', email: '', password: '',
    career: '', semester: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ ...form, semester: parseInt(form.semester) });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Crea tu cuenta"
      subtitle="Únete a la comunidad de aprendizaje colaborativo de tu universidad."
      side={
        <>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px',
          }}>
            {[
              ['Publica', 'asesorías en minutos'],
              ['Encuentra', 'tutores calificados'],
              ['Chatea', 'en tiempo real'],
              ['Gana', 'reputación académica'],
            ].map(([bold, rest]) => (
              <div key={bold} style={{
                padding: '16px', background: 'var(--bg-card)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                textAlign: 'left',
              }}>
                <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>{bold}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: 2 }}>{rest}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Gratis para todos los estudiantes del campus. Empieza como asesorado y activa el rol de tutor cuando quieras.
          </p>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {error && (
          <div style={{
            padding: '12px 14px', background: 'var(--error-muted)',
            border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius)',
            fontSize: '13px', color: 'var(--error)',
          }}>
            {error}
          </div>
        )}
        <Input label="Nombre completo" name="full_name" placeholder="Juan Pérez García"
          value={form.full_name} onChange={handleChange} required />
        <Input label="Correo institucional" type="email" name="email"
          placeholder="juan@universidad.edu"
          value={form.email} onChange={handleChange} required />
        <Input label="Contraseña" type="password" name="password"
          placeholder="Mínimo 8 caracteres, mayúsculas y números"
          value={form.password} onChange={handleChange} required />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Select label="Semestre" name="semester" options={SEMESTERS}
            placeholder="Selecciona" value={form.semester} onChange={handleChange} required />
          <Select label="Carrera" name="career" options={CAREERS}
            placeholder="Tu carrera" value={form.career} onChange={handleChange} required />
        </div>
        <Button type="submit" loading={loading} fullWidth size="lg" style={{ marginTop: 4 }}>
          Crear cuenta
        </Button>
        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Iniciar sesión</Link>
        </p>
      </form>
    </AuthLayout>
  );
};
