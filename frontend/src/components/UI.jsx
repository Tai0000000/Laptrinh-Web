
export function Icon({ name, size = 24, fill = false, style = {}, className = '' }) {
  return (
    <span
      className={`material-symbols-rounded select-none ${className}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
        ...style,
      }}
    >
      {name}
    </span>
  )
}

const BADGE_MAP = {
  confirmed:   { label: 'Xác nhận',        bg: 'rgba(91,240,108,0.15)',   color: '#5bf06c',  border: 'rgba(91,240,108,0.3)',  dot: true  },
  accepted:    { label: 'Đã chấp nhận',    bg: 'rgba(91,240,108,0.15)',   color: '#5bf06c',  border: 'rgba(91,240,108,0.3)',  dot: false },
  approved:    { label: 'Đã duyệt',        bg: 'rgba(91,240,108,0.15)',   color: '#5bf06c',  border: 'rgba(91,240,108,0.3)',  dot: false },
  scheduled:   { label: 'Đã lên lịch',     bg: 'rgba(198,198,199,0.1)',   color: '#c6c6c7',  border: 'rgba(198,198,199,0.3)', dot: false },
  pending:     { label: 'Chờ xác nhận',    bg: 'rgba(198,198,199,0.1)',   color: '#c6c6c7',  border: 'rgba(198,198,199,0.3)', dot: false },
  in_progress: { label: 'Đang diễn ra',    bg: 'rgba(91,240,108,0.15)',   color: '#5bf06c',  border: 'rgba(91,240,108,0.3)',  dot: true  },
  finished:    { label: 'Kết thúc',        bg: 'rgba(134,149,130,0.15)',  color: '#869582',  border: 'rgba(134,149,130,0.3)', dot: false },
  rejected:    { label: 'Từ chối',         bg: 'rgba(255,180,171,0.12)',  color: '#ffb4ab',  border: 'rgba(255,180,171,0.3)', dot: false },
  cancelled:   { label: 'Đã hủy',          bg: 'rgba(255,180,171,0.12)',  color: '#ffb4ab',  border: 'rgba(255,180,171,0.3)', dot: false },
  won:         { label: 'Thắng',           bg: 'rgba(91,240,108,0.15)',   color: '#5bf06c',  border: 'rgba(91,240,108,0.3)',  dot: false },
  lost:        { label: 'Thua',            bg: 'rgba(134,149,130,0.15)',  color: '#869582',  border: 'rgba(134,149,130,0.3)', dot: false },
}

export function Badge({ status, label: customLabel }) {
  const cfg = BADGE_MAP[status] || {
    label: customLabel || status || '—',
    bg: 'rgba(134,149,130,0.1)',
    color: '#869582',
    border: 'rgba(134,149,130,0.3)',
    dot: false,
  }

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '3px 10px',
      borderRadius: 2,
      fontSize: 11,
      fontWeight: 700,
      fontFamily: 'Inter',
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      background: cfg.bg,
      color: cfg.color,
      border: `1px solid ${cfg.border}`,
      whiteSpace: 'nowrap',
    }}>
      {cfg.dot && (
        <span style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: cfg.color,
          display: 'inline-block',
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
      )}
      {customLabel || cfg.label}
    </span>
  )
}

export function fmtDate(dateStr) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export function fmtDateTime(dateStr) {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
      + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return dateStr
  }
}

export function LoadingSpinner({ size = 32 }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 40 }}>
      <div style={{
        width: size,
        height: size,
        border: `3px solid rgba(91,240,108,0.2)`,
        borderTop: `3px solid #5bf06c`,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  )
}

export function EmptyState({ icon = 'inbox', text = 'Không có dữ liệu' }) {
  return (
    <div style={{
      background: '#1f1f21',
      border: '1px solid #3d4a3b',
      borderRadius: 4,
      padding: 40,
      textAlign: 'center',
    }}>
      <Icon name={icon} size={40} style={{ color: '#3d4a3b', marginBottom: 12 }} />
      <p style={{ color: '#869582', fontFamily: 'Inter', fontSize: 14 }}>{text}</p>
    </div>
  )
}
