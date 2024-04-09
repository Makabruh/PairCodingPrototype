import {createContext, useState, useEffect } from "react";
import getAuthFromBackend from "../hooks/getAuthFromBackend";

const AuthContext = createContext({});

//The AuthProvider is taking children as props which is the child components that will be wrapped by this
export const AuthProvider = ({children}) => {
    //TODO - Use the getAuthFromBackend function to fetch the auth details using the sessionid and the csrftoken
    //TODO - Set this as the default
    const [auth, setAuth] = useState({});

    // Using useEffect so that when there is a re-render, this will apply
    useEffect(() => {
        // Use an async function so that the object is returned rather than a promise
        const fetchData = async () => {
            try {
                //Use the custom hook
                const authDetails = await getAuthFromBackend();
                //Set auth
                console.log("authProvider:" + authDetails.username)
                //setAuth(authDetails);
            } catch (error) {
                console.error("No details", error);
                // Set auth to null in case of error
                //setAuth(null);
            }
            
        };
        // Run the above function
        fetchData();
        console.log(auth)
    }, []);

    //Where children is wrapped with the AuthContext.Provider, this allows the children to access the context changes
    //The value being set to auth, setAuth means they are accessible to any component descendants
    return (
        <AuthContext.Provider value={{auth, setAuth}}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext;