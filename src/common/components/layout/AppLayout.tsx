import { Sidebar } from "./sidebar";
import { Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 min-h-screen flex-1">
        <Outlet />
      </main>
    </div>
  );
}
