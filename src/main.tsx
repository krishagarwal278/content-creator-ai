// import "@/config/polyfills";
import { createRoot } from "react-dom/client";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import App from "./App";
import "./styles/index.css";

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div style={{ padding: 20, color: "red" }}>
      <h1>Something went wrong.</h1>
      <pre>{error?.toString()}</pre>
      <button type="button" onClick={resetErrorBoundary}>
        Try again
      </button>
    </div>
  );
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(e) => console.error("React Error Boundary caught:", e)}
    >
      <App />
    </ErrorBoundary>,
  );
} else {
  console.error("Root element not found");
}
