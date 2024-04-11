import {useLocation, Navigate, Outlet, useNavigate} from 'react-router-dom';
import axios from '../api/axios';
import useAuth from "../hooks/useAuth";
import getCookie from '../functions/getCookie';
import {useEffect} from 'react';

const RESTORE_SESSION_URL = '/restore';
 
const RequireAuth = ({allowedRoles}) => {
    const {auth, setAuth} = useAuth();
    const location = useLocation();

    // Navigating back to desired url after login
    const navigate = useNavigate();
    const from = location.state?.from?.pathname || "/";

    const csrftoken = getCookie('csrftoken');

    useEffect(() => {
        console.log("User:", auth.user);
        console.log("Access Level:", auth.accessLevel);
      }, [auth]);

    const GetUser = async () => {

        // e.preventDefault();
        try {
            const response = await axios.post(RESTORE_SESSION_URL, 
                JSON.stringify({}),
                {
                    headers: { 
                        'Content-Type': 'application/json', 
                        'X-CSRFToken' : csrftoken,
                    },    
                }
            );
            console.log(response.status);
            console.log(response.data.user);
            console.log(response.data.userlevel);
            setAuth({user: response.data.user, accessLevel: response.data.userlevel});
            navigate(from, { replace: true});

        }
        catch (err) {
            // TODO put catch error statements back in if possible
            //If there is no error coming back from the server
            // if(!err?.response){
            //     setErrMsg('No Server Response')
            // }
            // else if (err.response?.status === 403) {
            //     setErrMsg('You do not have the required permissions')
            // } else {
            //     setErrMsg('Get User Failed')
            //     console.log("Error: Catch Statement")
            // }
            // errRef.current.focus();
        }
    }

    if (!auth.user){
        GetUser();
        }

    return (
        // Check the roles, then find the role passed and check the allowed roles and see if it includes the value passed
        auth?.accessLevel?.find(accessLevel => allowedRoles?.includes(accessLevel))
            // if it does send them to the outlet page requested
            ? <Outlet />
            : auth?.user
                // if not but they are still logged in as a different user role
                ? <Navigate to="/unauthorized" state={{ from: location}} replace />
                // if still not logged in at all
                : <Navigate to="/login" state={{ from: location}} replace />
 
    );
}
 
export default RequireAuth;