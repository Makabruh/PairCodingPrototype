import { useNavigate, Link } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthProvider";
import axios from "../api/axios";
import getCookie from "../common/getCookie";
import getAuthFromBackend from "../hooks/getAuthFromBackend";

const LOGOUT_URL = "/logout";

const Home = () => {
    const { auth, setAuth } = useContext(AuthContext);
    const authTest = getAuthFromBackend();
    //Using local storage to update
    const authTestObject = localStorage.getItem("auth");
    // const authTest = localStorage.getItem("auth.user");
    // const authTest2 = localStorage.getItem("auth.accessToken");

    const navigate = useNavigate();
    const cookie = getCookie('csrftoken');

    const logout = async () => {
        const response = await axios.post(LOGOUT_URL, {withCredentials: true});
        // if used in more components, this should be in context 
        // axios to /logout endpoint 
        setAuth({});
        navigate('/linkpage');
    }

    console.log("cookie: " + cookie)
    console.log("auth: " + auth?.user)
    console.log("test :" + authTestObject)


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