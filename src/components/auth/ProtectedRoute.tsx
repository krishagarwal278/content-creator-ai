import { useAuth } from "@/context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = () => {
    const { session, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!session) {
        return <Navigate to="/auth" replace />;
    }

    return <Outlet />;
};
