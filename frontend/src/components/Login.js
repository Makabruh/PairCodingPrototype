import {useRef, useState, useEffect, useContext} from 'react';
//Created a global state with use context for the app
import AuthContext from "../context/AuthProvider"
import axios from '../api/axios';
import userRoles from '../functions/dictionaries';
import useAuth from '../hooks/useAuth';
import getCookie from '../functions/getCookie';
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

    // This effect runs on the first render of the page, fetching a csrf token from the backend
    useEffect(() => {
        const fetchToken = async () => {
            try {
                const response = await axios.get(LOGIN_URL, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true
                });
            } catch (error) {
                if(!error?.response){
                    console.log('No Server Response')
                }
                else {
                    console.log("Error: No token received")
                }
            }
        }
        fetchToken();
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();
        const csrftoken = getCookie('csrftoken');
        console.log(csrftoken)
        try {
            const response = await axios.post(LOGIN_URL, 
                JSON.stringify({ username: user, password: pwd}),
                {
                    headers: { 
                        'Content-Type': 'application/json',
                        'X-CSRFToken' : csrftoken,
                    },
                }
            );
            // Get the access level from the stored user level in the database
            const accessLevel = response?.data?.userlevel;
            //Saved in the global context
            //  Access level now set to access codes provided in the dictionary userRoles
            setAuth({user, accessLevel: [userRoles["AuthUser"], userRoles[accessLevel]]});
            setUser('');
            setPwd('');
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
            

            <button>
                Sign In
            </button>

            <p>
                <span className="hyperlink">
                <a href='/forgotpassword'>Forgotten Password</a>
                </span>
            </p>

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