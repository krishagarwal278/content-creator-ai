import { Sidebar } from "./sidebar";
import { Outlet } from "react-router-dom";

export function AppLayout() {
    return (
        <div className="min-h-screen bg-background flex">
            <Sidebar />
            <main className="flex-1 ml-64 min-h-screen">
                <Outlet />
            </main>
        </div>
    );
}
