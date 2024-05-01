import {useLocation, Navigate, Outlet, useNavigate} from 'react-router-dom';
import axios from '../api/axios';
import userRoles from '../functions/dictionaries';
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
            // create a list of the text versions of the user roles obtained from the session
            const differentRoles = response.data.userlevel
            // Create an empty list to hold the access coded vesions of user access levels
            const accessLevels = []
            // FOr each text based role find the coded version in the dictionary userRoles and appen the empty list with them.
            for (let i=0; i < differentRoles.length; i++){
                accessLevels.push(userRoles[differentRoles[i]])
            };
            // TODO remove console log when finished testing
            console.log("Access Levels:", accessLevels);
            // Reset the Auth state with the current user and the coded user access levels
            setAuth({user: response.data.user, accessLevel: accessLevels});
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