import { useNavigate, Link } from "react-router-dom";
import {useRef, useState, useEffect} from 'react';
import axios from '../api/axios';
import getCookie from '../functions/getCookie';

const FORGOT_PASS = '/forgotpassword';

const PasswordReset = () => { 

    //States for the new password
    const [email, setEmail] = useState('');
    const [emailFocus, setEmailFocus] = useState(false);

    // Refs
    const errRef = useRef();

    // States
    const [errMsg, setErrMsg] = useState('');

    const handleSubmit = async (e) => {
        console.log("Click")
    }

return (
    <section>
        {/* The error message displayed at the top if there is one (assertive means announced immediately when the focus is put on the error message) */}
        <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
        <h1>Forgot Your Password?</h1>
        
        <form>
            <label htmlFor='email'>Please enter your account's email address: </label>
            <input
                type="email"
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
            ></input>
            <button onClick={handleSubmit}>Request Password Reset</button>
        </form>

        <br />
        <Link to="/">Go Home</Link>
        <br />
    </section>
)
}

export default PasswordReset