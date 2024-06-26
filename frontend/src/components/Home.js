import { useNavigate, Link } from "react-router-dom";
import {useRef, useState, useContext} from 'react';
import AuthContext from "../context/AuthProvider";
import axios from '../api/axios';
import useAuth from "../hooks/useAuth";
import getCookie from '../functions/getCookie';

const LOGOUT_URL = '/logout';

//TEST22

const Home = () => {   
    const { setAuth } = useContext(AuthContext);
    const { auth } = useAuth();
    const navigate = useNavigate();

    // Refs
    const errRef = useRef();

    // States
    const [user, setUser] = useState('');
    const [errMsg, setErrMsg] = useState('');
    // setUser(auth.user);

    //? Does this need to be in the logout async function?
    const csrftoken = getCookie('csrftoken');

    const logout = async (e) => {
        // if used in more components, this should be in context 
        // axios to /logout endpoint 
        e.preventDefault();
        try {
            //Failing at this block
            const response = await axios.post(LOGOUT_URL, 
                JSON.stringify({ username: auth.user}),
                {
                    headers: { 
                        'Content-Type': 'application/json', 
                        'X-CSRFToken' : csrftoken,
                },      
                }
            );
            setAuth({});
            navigate('/linkpage');
        }
        catch (err) {
            //If there is no error coming back from the server
            if(!err?.response){
                setErrMsg('No Server Response')
            }
            else if (err.response?.status === 403) {
                setErrMsg('You do not have the required permissions')
            } else {
                setErrMsg('Logout Failed')
                console.log("Error: Catch Statement")
            }
            errRef.current.focus();
        }
    }

    return (
        <section>
            {/* The error message displayed at the top if there is one (assertive means announced immediately when the focus is put on the error message) */}
            <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
            <h1>Home</h1>
            <br />
            <p>You are logged in!</p>
            <br />
            <Link to={`/verifyuser/${auth.user}`}>Change your Password</Link>
            <br />
            <Link to="/employer">Go to the Employer page</Link>
            <br />
            <Link to="/trainingprovider">Go to the Training Provider page</Link>
            <br />
            <Link to="/apprentice">Go to the Apprentice Page</Link>
            <br />
            <Link to="/linkpage">Go to the Link Page</Link>
            <div className="flexGrow">
                <button onClick={logout}>Sign Out</button>
            </div>
        </section>
    )
}

export default Home