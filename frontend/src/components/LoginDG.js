import {useRef, useState, useEffect} from 'react';
import useAuth from '../hooks/useAuth';
import { Link, useNavigate, useLocation} from 'react-router-dom';

import axios from '../api/axios';

const LOGIN_URL = 'http://localhost:8000/login/'
const bcrypt = require('bcryptjs');

const Login = () => {
    const {setAuth} = useAuth()

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    const userRef = useRef();
    const errRef = useRef();

    const [user, setUser] = useState('');
    const [pwd, setPwd] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const [success, setSuccess] = useState(false);  //todo remove

    useEffect(() => {
        userRef.current.focus();
    }, [])

    useEffect(() => {
        setErrMsg('');
    }, [user, pwd])

    const handleSubmit = async (e) => {
        e.preventDefault();

        // console.log({
        //     userName: user,
        //     password: pwd,
        // })

        const salt = bcrypt.genSaltSync(10);
        console.log(salt);
        const hashedPassword = await bcrypt.hash(pwd,salt);
        console.log(hashedPassword);

        try {
            console.log(JSON.stringify({user, pwd}))
            console.log(JSON.stringify({username: user, password: hashedPassword}))
            const response = await axios.post(LOGIN_URL, 
                JSON.stringify({userName: user, password: hashedPassword}),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );

            console.log(JSON.stringify(response?.data));
            console.log(response.statusText);

            setUser('');
            setPwd('');
            setSuccess(true);  //todo remove
            // navigate(from, { replace: true});  //todo replace
        } catch (err) {
            if (!err?.response) {
                setErrMsg('No Server Response');
            } else if (err.response?.status === 400) {
                setErrMsg('Incorrect Username or Password');
            } else if (err.response?.status === 401) {
                setErrMsg('Unauthorized');
            } else {
                setErrMsg('Login Failed');
            }
            errRef.current.focus();
        }
    

    }

    return (
        <>
            {success ? (   // todo remove
                <section>
                    <h1>You are logged in!</h1>
                    <br/>
                    <p>
                        <a href="#">Go to Home</a>
                    </p>
                </section>
            ) : (     

        <section>
            <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
            <h1>Sign In</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="username">Username: </label>
                <input
                    type="text"
                    id="username"
                    ref={userRef}
                    autoComplete="off"
                    onChange={(e) => setUser(e.target.value)}
                    value={user}
                    required
                />
                <label htmlFor="password">Password: </label>
                <input
                    type="password"
                    id="password"
                    onChange={(e) => setPwd(e.target.value)}
                    value={pwd}
                    required
                />
                <button>Sign In</button>
            </form>
            <p>
                Need an Account?<br />
                <span className="line">
                    {/*put router link here*/}
                    <a href="/register">Sign Up</a>
                </span>
            </p>
        </section>
            )}
            </>
    )

}

export default Login