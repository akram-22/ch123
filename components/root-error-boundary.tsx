'use client'

import { Component, type ReactNode, type ErrorInfo } from 'react'

interface State {
  hasError: boolean
  message: string
}

/**
 * RootErrorBoundary — top-level safety net.
 * Catches any render error that escapes inner error boundaries and displays
 * a minimal recovery UI instead of a blank white screen.
 */
export class RootErrorBoundary extends Component<{ children: ReactNode }, State> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message ?? 'Unknown error' }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Mainteligence] Root render error:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: '#09090b',
            color: '#fafafa',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            padding: '32px',
            fontFamily: 'monospace',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(239,68,68,0.10)',
              border: '1px solid rgba(239,68,68,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div style={{ textAlign: 'center', maxWidth: 480 }}>
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              Mainteligence — Application Error
            </p>
            <p style={{ fontSize: 11, color: '#52525b', marginBottom: 4 }}>{this.state.message}</p>
            <p style={{ fontSize: 10, color: '#3a3a3d' }}>
              Check the browser console for details.
            </p>
          </div>
          <button
            onClick={() => {
              this.setState({ hasError: false, message: '' })
              window.location.reload()
            }}
            style={{
              fontSize: 11,
              color: '#e8650a',
              border: '1px solid rgba(232,101,10,0.30)',
              background: 'rgba(232,101,10,0.08)',
              padding: '8px 20px',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
