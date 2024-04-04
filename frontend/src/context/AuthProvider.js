import {createContext, useState } from "react";

const AuthContext = createContext({});

//The AuthProvider is taking children as props which is the child components that will be wrapped by this
export const AuthProvider = ({children}) => {
    const [auth, setAuth] = useState({});

    //Where children is wrapped with the AuthContext.Provider, this allows the children to access the context changes
    //The value being set to auth, setAuth means they are accessible to any component descendants
    return (
        <AuthContext.Provider value={{auth, setAuth}}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext;