import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      let firestoreInfo = null;

      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error) {
            firestoreInfo = parsed;
            errorMessage = parsed.error;
          }
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-midnight flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-midnight/60 border border-gold/20 rounded-[40px] p-8 text-center space-y-6 backdrop-blur-xl">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-display font-black text-gold uppercase tracking-tight">
                Critical Failure
              </h2>
              <p className="text-parchment/60 text-sm leading-relaxed">
                {errorMessage.includes("Missing or insufficient permissions") 
                  ? "You don't have permission to perform this action. Please check your character's access or contact the DM."
                  : errorMessage}
              </p>
            </div>

            {firestoreInfo && (
              <div className="bg-midnight/40 rounded-2xl p-4 text-left border border-gold/10 overflow-hidden">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gold/40 mb-2">Technical Details</p>
                <div className="text-[10px] font-mono text-parchment/40 break-all space-y-1">
                  <p>Op: {firestoreInfo.operationType}</p>
                  <p>Path: {firestoreInfo.path}</p>
                  <p>User: {firestoreInfo.authInfo.userId || "Anonymous"}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-gold text-midnight font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-gold/90 transition-all active:scale-95"
              >
                <RefreshCw size={18} />
                RETRY ACTION
              </button>
              
              <button
                onClick={this.handleReset}
                className="w-full py-4 bg-gold/10 text-gold font-black rounded-2xl border border-gold/20 flex items-center justify-center gap-2 hover:bg-gold/20 transition-all"
              >
                <Home size={18} />
                RETURN TO SAFETY
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
