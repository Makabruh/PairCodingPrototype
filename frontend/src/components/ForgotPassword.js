import { useNavigate, Link } from "react-router-dom";
import {useRef, useState, useEffect} from 'react';
import axios from '../api/axios';
import getCookie from '../functions/getCookie';

const FORGOT_PASS = '/mfaemail';

const PasswordReset = () => { 
    //Get the CSRF token from the cookies
    const csrftoken = getCookie('csrftoken');

    //States for the new password
    const [email, setEmail] = useState('');
    const [emailFocus, setEmailFocus] = useState(false);

    // Refs
    const errRef = useRef();

    // States
    const [errMsg, setErrMsg] = useState('');
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            //Try to post to the backend
            const response = await axios.post(FORGOT_PASS, JSON.stringify(
                { email, request_reason: "forgotpassword" }),
                {
                    headers: { 
                        'Content-Type': 'application/json', 
                        'X-CSRFToken' : csrftoken,
                    },      
                    withCredentials: true
                }
            );
            setEmail('');
            setEmailSent(true);
        }
        catch (error){
            if (!error?.response){
                setErrMsg('No Server Response');
            } else if (error.response?.status === 400) {
                //TODO - Would we want this to setEmailSent true to avoid people attempting different emails
                setErrMsg('Something Went Wrong')
            }
            errRef.current.focus();
        }
    }

return (
    emailSent 
        ?
        <section>
            <h2>An email has been sent to this email address</h2>
            <br />
            <p>Please follow the instructions to reset your password</p>
            <br />
            <Link to="/">Go Home</Link>
            <br />
        </section>

        :
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