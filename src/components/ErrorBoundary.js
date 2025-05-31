import React from 'react';
import { logError, addBreadcrumb } from '../utils/sentry';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Add breadcrumb for error boundary trigger
    addBreadcrumb(
      'ErrorBoundary: Error caught',
      'error',
      'error',
      { error: error.toString() }
    );
    
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log error to Sentry with additional context
    logError(error, {
      errorBoundary: true,
      componentStack: errorInfo.componentStack,
      errorInfo: errorInfo,
      props: this.props,
      timestamp: new Date().toISOString()
    });

    // Store error info in state for display
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    addBreadcrumb(
      'ErrorBoundary: User clicked retry',
      'user',
      'info'
    );
    
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <h2>🛠️ Something went wrong</h2>
            <p>We're sorry, but there was an error in the animal rescue assistant.</p>
            <p>Our team has been notified and is working to fix this issue.</p>
            
            <details>
              <summary>Error details</summary>
              <pre>{this.state.error?.toString()}</pre>
              {this.state.errorInfo && (
                <details style={{ marginTop: '10px' }}>
                  <summary>Component stack</summary>
                  <pre style={{ fontSize: '0.8em', color: '#666' }}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </details>
            
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                onClick={this.handleRetry}
                className="retry-button"
              >
                🔄 Try Again
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="retry-button"
                style={{ background: '#6b7280' }}
              >
                🔃 Reload Page
              </button>
            </div>
            
            <p style={{ fontSize: '0.8em', color: '#666', marginTop: '15px' }}>
              If this problem persists, please contact support with the error details above.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 