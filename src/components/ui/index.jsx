// src/components/ui/index.jsx
import React from 'react';

/* ── BUTTON ─────────────────────────────────────── */
export const Btn = ({
  children, variant = 'primary', size = 'md',
  loading, disabled, full, onClick, type = 'button', style: sx
}) => {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 7, fontFamily: 'var(--font-body)', fontWeight: 600,
    border: 'none', cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: `all var(--t) var(--ease)`, whiteSpace: 'nowrap',
    width: full ? '100%' : 'auto', opacity: disabled ? 0.45 : 1,
    letterSpacing: '-0.01em', position: 'relative', overflow: 'hidden',
  };
  const sizes = {
    sm: { padding: '7px 14px', fontSize: 12, borderRadius: 'var(--r)', height: 32 },
    md: { padding: '9px 18px', fontSize: 13, borderRadius: 'var(--r)', height: 38 },
    lg: { padding: '13px 28px', fontSize: 14, borderRadius: 'var(--r)', height: 46 },
    xl: { padding: '16px 36px', fontSize: 15, borderRadius: 'var(--r)', height: 54 },
  };
  const variants = {
    primary:   { background: 'var(--ink)', color: 'var(--bg)', boxShadow: 'none' },
    green:     { background: 'var(--green)', color: 'var(--ink)', boxShadow: '0 0 20px rgba(0,230,118,0.3)' },
    outline:   { background: 'transparent', color: 'var(--ink)', border: '1.5px solid var(--ink)' },
    ghost:     { background: 'transparent', color: 'var(--ink-2)', border: '1.5px solid var(--line)' },
    danger:    { background: 'var(--red-dim)', color: 'var(--red)', border: '1.5px solid rgba(255,59,59,0.3)' },
    white:     { background: 'var(--surface)', color: 'var(--ink)', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  };
  return (
    <button
      type={type} onClick={onClick} disabled={disabled || loading}
      style={{ ...base, ...sizes[size], ...variants[variant], ...sx }}
      onMouseEnter={e => {
        if (disabled || loading) return;
        if (variant === 'primary') e.currentTarget.style.background = '#222';
        if (variant === 'green') e.currentTarget.style.filter = 'brightness(1.1)';
        if (variant === 'outline' || variant === 'ghost') e.currentTarget.style.background = 'var(--bg-2)';
      }}
      onMouseLeave={e => {
        if (disabled || loading) return;
        e.currentTarget.style.background = variants[variant].background || 'transparent';
        e.currentTarget.style.filter = '';
      }}
    >
      {loading && <Spin size={13} color="currentColor" />}
      {children}
    </button>
  );
};

/* ── SPIN ────────────────────────────────────────── */
export const Spin = ({ size = 20, color = 'var(--green)' }) => (
  <div style={{
    width: size, height: size, flexShrink: 0,
    border: `2px solid rgba(0,0,0,0.08)`,
    borderTopColor: color, borderRadius: '50%',
    animation: 'spin 0.65s linear infinite',
  }} />
);

/* ── FIELD ────────────────────────────────────────── */
export const Field = ({ label, error, hint, children, required }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    {label && (
      <label style={{
        fontSize: 11, fontWeight: 700, color: 'var(--ink-3)',
        textTransform: 'uppercase', letterSpacing: '0.07em',
      }}>
        {label}{required && <span style={{ color: 'var(--red)', marginLeft: 3 }}>*</span>}
      </label>
    )}
    {children}
    {error && <span style={{ fontSize: 11, color: 'var(--red)' }}>{error}</span>}
    {hint && !error && <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>{hint}</span>}
  </div>
);

const inputBase = (err) => ({
  width: '100%', height: 42,
  padding: '0 13px',
  background: 'var(--surface)',
  border: `1.5px solid ${err ? 'var(--red)' : 'var(--line)'}`,
  borderRadius: 'var(--r)',
  color: 'var(--ink)', fontSize: 14, outline: 'none',
  transition: 'border-color var(--t)',
  fontFamily: 'var(--font-body)',
});

export const Input = ({ label, error, hint, required, type = 'text', ...props }) => (
  <Field label={label} error={error} hint={hint} required={required}>
    <input
      type={type} {...props}
      style={inputBase(error)}
      onFocus={e => { if (!error) e.target.style.borderColor = 'var(--ink)'; }}
      onBlur={e => { if (!error) e.target.style.borderColor = 'var(--line)'; }}
    />
  </Field>
);

export const Textarea = ({ label, error, hint, required, rows = 4, ...props }) => (
  <Field label={label} error={error} hint={hint} required={required}>
    <textarea
      rows={rows} {...props}
      style={{
        ...inputBase(error), height: 'auto', padding: '10px 13px',
        resize: 'vertical', lineHeight: 1.55,
      }}
      onFocus={e => { if (!error) e.target.style.borderColor = 'var(--ink)'; }}
      onBlur={e => { if (!error) e.target.style.borderColor = 'var(--line)'; }}
    />
  </Field>
);

export const Select = ({ label, error, required, options = [], placeholder, ...props }) => (
  <Field label={label} error={error} required={required}>
    <select
      {...props}
      style={{
        ...inputBase(error), cursor: 'pointer', appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%237a7a7a' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 13px center',
        paddingRight: 36,
      }}
      onFocus={e => e.target.style.borderColor = 'var(--ink)'}
      onBlur={e => e.target.style.borderColor = 'var(--line)'}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </Field>
);

/* ── TAG / BADGE ─────────────────────────────────── */
export const Tag = ({ children, color = 'default' }) => {
  const colors = {
    default:  { bg: 'var(--bg-3)', fg: 'var(--ink-2)', bd: 'var(--line)' },
    green:    { bg: 'var(--green-dim)', fg: '#009944', bd: 'var(--green-bd)' },
    red:      { bg: 'var(--red-dim)', fg: 'var(--red)', bd: 'rgba(255,59,59,0.3)' },
    amber:    { bg: 'var(--amber-dim)', fg: '#a05f00', bd: 'rgba(255,149,0,0.3)' },
    blue:     { bg: 'var(--blue-dim)', fg: 'var(--blue)', bd: 'rgba(0,87,255,0.3)' },
    ink:      { bg: 'var(--ink)', fg: 'var(--bg)', bd: 'var(--ink)' },
  };
  const c = colors[color] || colors.default;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 9px', fontSize: 10, fontWeight: 700,
      borderRadius: 4, background: c.bg, color: c.fg,
      border: `1px solid ${c.bd}`,
      textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
};

export const StatusTag = ({ status }) => {
  const map = {
    available:   { label: 'Disponible', color: 'green' },
    full:        { label: 'Lleno',       color: 'amber' },
    in_progress: { label: 'En curso',   color: 'blue' },
    completed:   { label: 'Completada', color: 'default' },
    cancelled:   { label: 'Cancelada',  color: 'red' },
  };
  const m = map[status] || { label: status, color: 'default' };
  return <Tag color={m.color}>{m.label}</Tag>;
};

/* ── AVATAR ──────────────────────────────────────── */
export const Avatar = ({ src, name = '', size = 36 }) => {
  const initials = name.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const hue = (name.charCodeAt(0) || 0) * 37 % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: src ? 'transparent' : `hsl(${hue},55%,88%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 700, color: `hsl(${hue},55%,30%)`,
      overflow: 'hidden', border: '1.5px solid var(--line-2)',
      fontFamily: 'var(--font-body)',
    }}>
      {src
        ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : (initials || '?')}
    </div>
  );
};

/* ── STARS ───────────────────────────────────────── */
export const Stars = ({ rating = 0, size = 12 }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1,2,3,4,5].map(s => (
      <svg key={s} width={size} height={size} viewBox="0 0 20 20"
        fill={s <= Math.round(rating) ? 'var(--amber)' : 'var(--line)'}>
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
      </svg>
    ))}
  </div>
);

/* ── SKELETON ────────────────────────────────────── */
export const Skel = ({ w = '100%', h = 16, r = 6 }) => (
  <div style={{
    width: w, height: h, borderRadius: r,
    background: 'linear-gradient(90deg, var(--bg-2) 25%, var(--bg-3) 50%, var(--bg-2) 75%)',
    backgroundSize: '400px 100%', animation: 'shimmer 1.4s infinite',
  }} />
);

/* ── DIVIDER ─────────────────────────────────────── */
export const Divider = ({ label, my = 20 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: `${my}px 0` }}>
    <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
    {label && <span style={{ fontSize: 11, color: 'var(--ink-4)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</span>}
    {label && <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />}
  </div>
);

/* ── EMPTY ───────────────────────────────────────── */
export const Empty = ({ title, desc, action }) => (
  <div style={{ textAlign: 'center', padding: '64px 24px' }}>
    <div style={{
      width: 56, height: 56, borderRadius: 'var(--r-lg)',
      background: 'var(--bg-3)', border: '1.5px solid var(--line)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 16px',
    }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--ink-4)" strokeWidth="1.5">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
    </div>
    <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 5 }}>{title}</p>
    {desc && <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 16 }}>{desc}</p>}
    {action}
  </div>
);

/* ── CARD ────────────────────────────────────────── */
export const Card = ({ children, hover, onClick, p = 20, style: sx }) => (
  <div
    onClick={onClick}
    style={{
      background: 'var(--surface)', border: '1.5px solid var(--line)',
      borderRadius: 'var(--r-lg)', padding: p,
      transition: 'all var(--t) var(--ease)',
      cursor: onClick ? 'pointer' : 'default', ...sx,
    }}
    onMouseEnter={hover || onClick ? e => {
      e.currentTarget.style.borderColor = 'var(--ink-3)';
      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.07)';
      if (onClick) e.currentTarget.style.transform = 'translateY(-1px)';
    } : undefined}
    onMouseLeave={hover || onClick ? e => {
      e.currentTarget.style.borderColor = 'var(--line)';
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.transform = 'translateY(0)';
    } : undefined}
  >
    {children}
  </div>
);

// ── ALIASES for backward compatibility ────────────────────────
export const Button = Btn;
export const Badge = Tag;
export const Spinner = Spin;
export const EmptyState = Empty;
export const StatusBadge = StatusTag;
export const Skeleton = Skel;
