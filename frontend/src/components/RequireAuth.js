import {useLocation, Navigate, Outlet} from 'react-router-dom';
import useAuth from "../hooks/useAuth";
 
const RequireAuth = () => {
    const {auth} = useAuth();
    const location = useLocation();
 
    return (
        // If user then navigate to outlet (page wanted), if not, navigate to login page and once logged in, back to outlet
        auth?.user
            ? <Outlet />
            : <Navigate to="/login" state={{ from: location}} replace />
 
    );
}
 
export default RequireAuth;