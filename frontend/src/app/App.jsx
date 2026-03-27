import AppRoutes from "./AppRoutes";
import AppErrorBoundary from "./AppErrorBoundary";

export default function App() {
  return (
    <AppErrorBoundary>
      <AppRoutes />
    </AppErrorBoundary>
  );
}










