import React from 'react';

export const Icon = ({ name, style, fill, size, ...props }) => {
  const icons = {
    notifications: '🔔',
    leaderboard: '🏆',
    workspace_premium: '⭐',
    pets: '🐎',
    schedule: '📅',
    route: '🏁',
    login: '🔐',
    person: '👤',
    edit: '✏️',
    logout: '🚪',
    settings: '⚙️',
    dashboard: '📊',
    groups: '👥',
    event: '📅',
    check_circle: '✅',
    cancel: '❌',
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️',
    emoji_events: '🏆',
    timer: '⏱️',
    history: '📜',
  };

  return (
    <span style={{ ...style, fontSize: size ? `${size}px` : '1.5rem' }} {...props}>
      {icons[name] || '📄'}
    </span>
  );
};

export const Badge = ({ status, style, ...props }) => {
  const statusStyles = {
    confirmed: { background: 'rgba(91,240,108,0.15)', color: '#5bf06c', border: '1px solid rgba(91,240,108,0.3)' },
    scheduled: { background: 'rgba(91,240,108,0.15)', color: '#5bf06c', border: '1px solid rgba(91,240,108,0.3)' },
    pending: { background: 'rgba(212,160,23,0.15)', color: '#D4A017', border: '1px solid rgba(212,160,23,0.3)' },
    rejected: { background: 'rgba(255,0,0,0.15)', color: '#ff0000', border: '1px solid rgba(255,0,0,0.3)' },
    finished: { background: 'rgba(91,240,108,0.15)', color: '#5bf06c', border: '1px solid rgba(91,240,108,0.3)' },
    accepted: { background: 'rgba(91,240,108,0.15)', color: '#5bf06c', border: '1px solid rgba(91,240,108,0.3)' },
  };

  return (
    <span
      style={{
        padding: '4px 12px',
        borderRadius: '2px',
        fontSize: '12px',
        fontWeight: '700',
        textTransform: 'uppercase',
        ...statusStyles[status] || statusStyles.pending,
        ...style,
      }}
      {...props}
    >
      {status}
    </span>
  );
};

export const fmtDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};