// src/lib/utils.js

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

export const formatTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('es-MX', {
    hour: '2-digit', minute: '2-digit',
  });
};

export const formatDuration = (minutes) => {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
};

export const formatCost = (cost) => {
  if (cost === 0 || cost === null || cost === undefined) return 'Gratis';
  return `$${Number(cost).toFixed(0)} MXN`;
};

export const getModalityLabel = (modality) => ({
  virtual: 'Virtual',
  presential: 'Presencial',
}[modality] || modality);

export const getDifficultyLabel = (difficulty) => ({
  basic: 'Básico',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
  any: 'Cualquier nivel',
}[difficulty] || difficulty);

export const getStatusLabel = (status) => ({
  available: 'Disponible',
  full: 'Lleno',
  in_progress: 'En curso',
  completed: 'Completada',
  cancelled: 'Cancelada',
}[status] || status);

export const truncate = (str, len = 100) => {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '...' : str;
};
