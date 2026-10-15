import React, { Component, type ReactNode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#180808",
            color: "#fca5a5",
            padding: "32px",
            fontFamily: "monospace",
            zIndex: 999999,
            overflow: "auto"
          }}
        >
          <h2 style={{ color: "#ef4444", fontSize: "20px", marginBottom: "12px" }}>
            Terjadi Kesalahan Render Antarmuka
          </h2>
          <pre
            style={{
              background: "#2a0a0a",
              padding: "16px",
              borderRadius: "8px",
              whiteSpace: "pre-wrap"
            }}
          >
            {this.state.error?.stack || this.state.error?.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "16px",
              padding: "8px 16px",
              background: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Muat Ulang Halaman
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
