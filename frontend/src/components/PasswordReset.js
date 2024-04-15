import { useNavigate, Link } from "react-router-dom";
import {useRef, useState, useEffect} from 'react';
import axios from '../api/axios';
//Import visuals
import { faCheck, faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import getCookie from '../functions/getCookie';

const RESET_PASS = '/passwordreset';
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%£*]).{8,24}$/;

const PasswordReset = () => {   
    //Get the CSRF token from the cookies
    const csrftoken = getCookie('csrftoken');
    //States for the current password
    const [currentPwd, setCurrentPwd] = useState('');
    
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
            //Try to post to the backend
            const response = await axios.post(RESET_PASS, JSON.stringify(
                { password: currentPwd, newPassword: newPwd }),
                {
                    headers: { 
                        'Content-Type': 'application/json', 
                        'X-CSRFToken' : csrftoken,
                    },      
                    withCredentials: true
                }
            );
            setCurrentPwd('');
            setNewPwd('');
            setNewMatchPwd('');
            console.log("Password change success!")
        }
        catch (error){
            if (!error?.response){
                setErrMsg('No Server Response');
            } else {
                setErrMsg('Password Change Failed')
            }
            errRef.current.focus();
        }

    }

    return (
        <section>
            {/* The error message displayed at the top if there is one (assertive means announced immediately when the focus is put on the error message) */}
            <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
            <h1>Reset Your Password Here:</h1>
            
            <form>
                <label htmlFor='current-password'>Old Password: </label>
                <input 
                    type="password" 
                    id="current-password" 
                    onChange={(e) => setCurrentPwd(e.target.value)}
                    value={currentPwd}
                    required
                />
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