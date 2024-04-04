import {useRef, useState, useEffect, useContext} from 'react';
import axios from '../api/axios';
//Created a global state with use context for the app
import useAuth from '../hooks/useAuth';
import { Link, useNavigate, useLocation} from 'react-router-dom';

const bcrypt = require('bcryptjs');
const LOGIN_URL = '/login';

const Login = () => {
    const {auth, setAuth} = useAuth()

    // Navigating back to desired url after login
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    //Refs
    const userRef = useRef();
    const errRef = useRef();

    //States
    const [user, setUser] = useState('');
    const [pwd, setPwd] = useState('');
    const [errMsg, setErrMsg] = useState('');
    //TODO For testing purposes - Remove
    const [success, setSuccess] = useState('');

    //Set the focus on the username input when the component loads
    useEffect(() => {
        userRef.current.focus();
    }, [])

    //Empty the error message if the user changes the username or password states
    useEffect(() => {
        setErrMsg('');
    }, [user, pwd])

    useEffect(() => {
        localStorage.setItem("auth", auth);
        localStorage.setItem("auth.accessToken", auth.accessToken);
        console.log("auth:", auth);
        console.log("User:", auth.user);
        console.log("Password:", auth.password);
        console.log("Access Token:", auth.accessToken);
      }, [auth]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            //Failing at this block
            const response = await axios.post(LOGIN_URL, 
                JSON.stringify({ username: user, password: pwd}),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );
            //Get the CSRF token from the response data
            const accessToken = response?.data?.csrf_token;
            //Saved in the global context
            //TODO - Add roles from userLevel fetched from backend ?
            setAuth({user, pwd, roles: "authenticated", accessToken});
            //localStorage.setItem(auth);
            // localStorage.setItem("auth.user", user);
            // localStorage.setItem("auth.roles", "authenticated");
            // localStorage.setItem("auth.accessToken", accessToken);
            setUser('');
            setPwd('');
            setSuccess(true); 
        }
        catch (err) {
            //If there is no error coming back from the server
            if(!err?.response){
                setErrMsg('No Server Response')
            }
            else if (err.response?.status === 400) {
                setErrMsg('Incorrect Username or Password')
            }
            else if (err.response?.status === 401) {
                setErrMsg('Unauthorised')
            }
            else if (err.response?.status === 403) {
                setErrMsg('You do not have the required permissions')
            } else {
                setErrMsg('Login Failed')
                console.log("Error: Catch Statement")
            }
            errRef.current.focus();
        }
    

    }

    return (
        // Open a fragment to show a different view if logged in already
        <>
            {success ? (
                <section>
                    <h1>Logged in</h1>
                    <br/>
                    <p>
                    <Link to="/">Home</Link>
                    </p>
                </section>
            ) : (
        <section>
            {/* The error message displayed at the top if there is one (assertive means announced immediately when the focus is put on the error message) */}
            <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
            <h1>Sign In</h1>
            <form onSubmit={handleSubmit}>
                {/* The label needs to match the input */}
                <label htmlFor='username'>Username: </label>
                {/* value makes this a controlled input, crucial for clearing the inputs on submission */}
                <input 
                    type="text" 
                    id="username" 
                    ref={userRef}
                    autoComplete='off'
                    onChange={(e) => setUser(e.target.value)}
                    value={user}
                    required
                />

                {/* The label needs to match the input */}
                <label htmlFor='password'>Password: </label>
                {/* value makes this a controlled input, crucial for clearing the inputs on submission */}
                <input 
                    type="password" 
                    id="password" 
                    onChange={(e) => setPwd(e.target.value)}
                    value={pwd}
                    required
                />
                <br />

                <button>
                    Sign In
                </button>

                <br />

                <p>
                    Need an Account? <br />
                    <span className="line">
                        {/* LINK GOES HERE TODO */}
                        <a href='#'>Sign Up</a>
                    </span>
                </p>
            </form>
        </section>
            )}
            </>
    )
}

export default Login