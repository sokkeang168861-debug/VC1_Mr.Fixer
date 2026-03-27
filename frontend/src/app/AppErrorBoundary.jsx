import React from "react";

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: "",
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || "Something went wrong while rendering the page.",
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App render error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 px-6 py-16">
          <div className="mx-auto max-w-2xl rounded-3xl border border-rose-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-rose-500">
              Page Error
            </p>
            <h1 className="mt-3 text-2xl font-bold text-slate-900">
              This screen could not be displayed.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {this.state.errorMessage}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white hover:bg-rose-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
