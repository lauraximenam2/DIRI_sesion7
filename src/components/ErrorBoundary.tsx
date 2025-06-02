// src/components/ErrorBoundary.tsx
import React, { ErrorInfo, ReactNode } from 'react';
import logger from '../services/logging'; 

interface ErrorBoundaryProps {
  fallback: ReactNode; 
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error; 
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Actualiza el estado para que el siguiente renderizado muestre la UI de fallback
    return { hasError: true, error: error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error("Error capturado por ErrorBoundary:", error, { componentStack: errorInfo.componentStack });
  }

  render() {
    if (this.state.hasError) {
      if (typeof this.props.fallback === 'function') {
        return (this.props.fallback as (error?: Error) => ReactNode)(this.state.error);
      }
      return this.props.fallback;
    }
    return this.props.children;
  }
}
export default ErrorBoundary;