import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth'; 


export default function ProtectedRoute({ allowedRoles }) {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />; 
    }

    return <Outlet />;
}