import {useRef, useState, useEffect, useContext} from 'react';
//Created a global state with use context for the app
import AuthContext from "../context/AuthProvider"
import axios from '../api/axios';
import useAuth from '../hooks/useAuth';
import { Link, useNavigate, useLocation} from 'react-router-dom';

// const bcrypt = require('bcryptjs');
const LOGIN_URL = '/login';
const USERNAME_URL = '/username';

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

    //Set the focus on the username input when the component loads
    useEffect(() => {
        userRef.current.focus();
    }, [])

    //Empty the error message if the user changes the username or password states
    useEffect(() => {
        setErrMsg('');
    }, [user, pwd])

    useEffect(() => {
        console.log("User:", auth.user);
        console.log("Access Token:", auth.accessToken);
      }, [auth]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            //Failing at this block
            const response = await axios.post(LOGIN_URL, 
                JSON.stringify({ username: user, password: pwd}),
                {
                    headers: { 
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true
                }
            );
            //Get the CSRF token from the response data
            //! This access token is not used as a csrf token, could change this to represent a level of user access
            const accessToken = response?.data?.csrf_token;
            //Saved in the global context
            // TODO change the user level to an access token representing a user level, for different user types
            setAuth({user, accessToken: ["AnyUser", "Employer"]});
            setUser('');
            setPwd('');
            // TODO check this functions correctly instead of set success to true.
            navigate(from, { replace: true});
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
                    <a href='/register'>Sign Up</a>
                </span>
            </p>
        </form>
    </section>
        )}

export default Login