import { useNavigate, Link } from "react-router-dom";
import { useContext, useEffect } from "react";
import AuthContext from "../context/AuthProvider";
import axios from "../api/axios";
import getCookie from "../common/getCookie";
import getAuthFromBackend from "../hooks/getAuthFromBackend";

const LOGOUT_URL = "/logout";

const Home = () => {
    const { auth, setAuth } = useContext(AuthContext);

    //This should only be running on update
    useEffect(() => {
        const fetchData = async () => {
            const authTest = await getAuthFromBackend();
            console.log("authTest:", authTest);
        };
    
        fetchData();
    }, []);


    const navigate = useNavigate();
    const cookie = getCookie('csrftoken');

    const logout = async () => {
        const response = await axios.post(LOGOUT_URL, {withCredentials: true});
        // if used in more components, this should be in context 
        // axios to /logout endpoint 
        setAuth({});
        navigate('/linkpage');
    }

    


    return (
        <section>
            <h1>Home</h1>
            <br />
            <p>You are logged in!</p>
            <br />
            <Link to="/editor">Go to the Editor page</Link>
            <br />
            <Link to="/admin">Go to the Admin page</Link>
            <br />
            <Link to="/lounge">Go to the Lounge</Link>
            <br />
            <Link to="/linkpage">Go to the link page</Link>
            <div className="flexGrow">
                <button onClick={logout}>Sign Out</button>
            </div>
        </section>
    )
}

export default Home