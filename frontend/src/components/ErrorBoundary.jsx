import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const msg = this.state.error?.message || String(this.state.error);

    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0f172a', padding: 24, fontFamily: 'monospace',
      }}>
        <div style={{
          maxWidth: 640, width: '100%', background: '#1e293b',
          border: '1px solid #ef4444', borderRadius: 12, padding: 32,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <span style={{ fontSize: 28 }}>💥</span>
            <h1 style={{ color: '#ef4444', fontSize: 20, fontWeight: 700, margin: 0 }}>
              Runtime Error
            </h1>
          </div>
          <pre style={{
            background: '#0f172a', color: '#fca5a5', padding: 16,
            borderRadius: 8, fontSize: 13, overflowX: 'auto',
            whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0,
          }}>
            {msg}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 20, padding: '10px 24px', background: '#6366f1',
              color: 'white', border: 'none', borderRadius: 8,
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}
          >
            Reload trang
          </button>
        </div>
      </div>
    );
  }
}
