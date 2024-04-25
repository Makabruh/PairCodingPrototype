import { useNavigate, Link } from "react-router-dom";
import {useRef, useState, useEffect} from 'react';
import axios from '../api/axios';
import useAuth from "../hooks/useAuth";
//Import visuals
import { faCheck, faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import getCookie from '../functions/getCookie';

const RESET_PASS = '/passwordreset';
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%£*]).{8,24}$/;

// There are two options here:
// If you are logged in - you will be asked for your old/current password and this will be sent to the backend
// If you are not logged in - you will be asked for the code sent to your email
// For the most reusable system, both sets of users will be asked to input their credential - old password / OTP
// Once this has been posted and accepted, they will be taken to a new page with just the new password to be inputted

const PasswordReset = () => {   
    //Get the CSRF token from the cookies
    const csrftoken = getCookie('csrftoken');
    //Get the auth state to check for user
    const { auth, setAuth } = useAuth();
    
    //States for the new password
    const [newPwd, setNewPwd] = useState('');
    const [validPwd, setValidPwd] = useState(false);
    const [pwdFocus, setPwdFocus] = useState(false);

    //States for the new confirmed password
    const [newMatchPwd, setNewMatchPwd] = useState('');
    const [validMatch, setValidMatch] = useState(false);
    const [matchFocus, setMatchFocus] = useState(false);

    // Refs
    const errRef = useRef();

    // States
    const [errMsg, setErrMsg] = useState('');
    const [passwordReset, setPasswordReset] = useState(false);

    useEffect(() => {
        const result = PASSWORD_REGEX.test(newPwd);
        setValidPwd(result);
        //Comparing the password and match password
        const match = newPwd === newMatchPwd;
        setValidMatch(match);
    }, [newPwd, newMatchPwd])

    useEffect(() => {
        // Reset error message to empty on value change
        setErrMsg('');
    }, [newPwd, newMatchPwd])

    //On button click
    const handleSubmit = async (e) => {
        //Prevent the form emptying
        e.preventDefault();

        //Check again to prevent console JS hack of disabled button
        const pwdCheck = PASSWORD_REGEX.test(newPwd);
        if (!pwdCheck) {
            setErrMsg("Invalid entry");
            return;
        }

        try {
            const verification = getCookie('accountVerification');
            //Try to post to the backend
            const response = await axios.post(RESET_PASS, JSON.stringify(
                { password: newPwd, username: "guest" }),
                {
                    headers: { 
                        'Content-Type': 'application/json', 
                        'X-CSRFToken' : csrftoken,
                        'Verification-Token' : verification,
                    },      
                    withCredentials: true
                }
            );
            setNewPwd('');
            setNewMatchPwd('');
            //Reset the auth to blank and lead the user to re-login
            setAuth({});
            setPasswordReset(true);
        }
        catch (error){
            if (!error?.response){
                setErrMsg('No Server Response');
            } else if (error.response?.status === 406) {
                setErrMsg('Please do not use a previous password')
            } else if (error.response?.status === 400) {
                setErrMsg('Please enter a new password')
            } else if (error.response?.status === 401) {
                // Here the cookie will have expired
                setErrMsg('Please re-verify your identity')
            } else {
                setErrMsg('Something went wrong')
            }
            errRef.current.focus();
        }

    }

    return (
        passwordReset
        ?
        <section>
            <h2>Your password has been reset</h2>
            <br />
            <p>Please login with your new credentials</p>
            <br />
            <Link to="/">Login</Link>
            <br />
        </section>
        :
        <section>
            {/* The error message displayed at the top if there is one (assertive means announced immediately when the focus is put on the error message) */}
            <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
            <h1>Reset Your Password Here:</h1>
            
            <form>
                <label htmlFor='new-password'>New Password: </label>
                <input 
                    type="password" 
                    id="new-password" 
                    onChange={(e) => setNewPwd(e.target.value)}
                    value={newPwd}
                    required
                    aria-invalid={validPwd ? "false" : "true"}
                    /* This is the final thing read by the screen reader and here we give the full requirements for the field */
                    aria-describedby="pwdnote"
                    /* Settinig focus */
                    onFocus={() => setPwdFocus(true)}
                    onBlur={() => setPwdFocus(false)}
                />
                {/* Info message for the password field */}
                <p id="pwdnote" className={pwdFocus && !validPwd ? "instructions" : "offscreen"}>
                    <FontAwesomeIcon icon={faInfoCircle} />
                    8 to 24 characters <br/>
                    Must include uppercase, lowercase, a number, and a special character <br />
                    {/* Each character is put in a span with an aria label so the screen reader can read it */}
                    Allowed special characters: 
                    <span aria-label="exclamation mark">!</span>
                    <span aria-label="at symbol">@</span>
                    <span aria-label="hashtag">#</span>
                    <span aria-label="dollar sign">$</span>
                    <span aria-label="percent">%</span>
                    <span aria-label="pound sign">£</span>
                    <span aria-label="star">*</span>
                </p>
                <label htmlFor='new-match-password'>Confirm Password: 
                    <span className={validMatch && newMatchPwd ? "valid" : "hide"}>
                        <FontAwesomeIcon icon={faCheck} />
                    </span>
                    <span className={validMatch || !newMatchPwd ? "hide" : "invalid"}>
                        <FontAwesomeIcon icon={faTimes} />
                    </span>
                </label>
                <input 
                    type="password" 
                    id="new-match-password" 
                    onChange={(e) => setNewMatchPwd(e.target.value)}
                    value={newMatchPwd}
                    required
                    aria-invalid={validMatch ? "false" : "true"}
                    aria-describedby="confirmnote"
                    onFocus={() => setMatchFocus(true)}
                    onBlur={() => setMatchFocus(false)}
                />
                {/* Info message for the password field */}
                <p id="confirmnote" className={matchFocus && !validPwd ? "instructions" : "offscreen"}>
                    <FontAwesomeIcon icon={faInfoCircle} />
                    Must match password
                </p>
                <button onClick={handleSubmit}>Reset Password</button>
            </form>

            <br />
            <Link to="/">Go Home</Link>
            <br />
        </section>
    )
}

export default PasswordReset