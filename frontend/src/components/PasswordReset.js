import {useRef, useState, useEffect} from 'react';

//Import Axios
import axios from '../api/axios';

//Import visuals
import { faCheck, faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

const RESET_URL = '/passwordreset';

//Regex statements
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%£*]).{8,24}$/;

const PasswordReset = () => {

        //States
    const [user, setUser] = useState('');
    const [userFocus, setUserFocus] = useState(false);

    //Same as above but for password and matching password fields
    const [pwd, setPwd] = useState('');
    const [validPwd, setValidPwd] = useState(false);
    const [pwdFocus, setPwdFocus] = useState(false);

    const [matchPwd, setMatchPwd] = useState('');
    const [validMatch, setValidMatch] = useState(false);
    const [matchFocus, setMatchFocus] = useState(false);

    //Refs
    const userRef = useRef();
    const errRef = useRef();

    //States for error messages and successful submission
    const [errMsg, setErrMsg] = useState('');
    const [success, setSuccess] = useState(false);

    //Set the focus on the username input when the component loads
    useEffect(() => {
        userRef.current.focus();
    }, [])

    //Validating the password input field
    useEffect(() => {
        const result = PASSWORD_REGEX.test(pwd);
        setValidPwd(result);
        //Comparing the password and match password
        //Have them in the same effect as we want to re-check whenever one of the passwords changes
        const match = pwd === matchPwd;
        setValidMatch(match);
    }, [pwd, matchPwd])

    //Empty the error message if the user changes the username or password states
    useEffect(() => {
        setErrMsg('');
    }, [user, pwd])

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            //Failing at this block
            const response = await axios.post(RESET_URL, 
                JSON.stringify({ username: user, password: pwd}),
                {
                    headers: { 
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true
                }
            );
            setSuccess(true);
            setUser('');
            setPwd('');
            setMatchPwd('');
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
                setErrMsg('Change Password Failed')
                console.log("Error: Catch Statement")
            }
            errRef.current.focus();
        }
    }
    return (
        <>
        {/* This is displayed if the form has been submitted correctly */}
        {success ? (
                <section>
                    <h1>Account Created</h1>
                    <p>
                        <a href="#">Sign In Here</a>
                    </p>
                </section>
            ) : (
            <section>
            {/* Here is our error message, using a ternary operator to check if there is an error message */}
            {/* The offscreen class name means it is still available to screen readers when there is no error message but not visible on the screen */}
            {/* The aria-live means that if there is an error message, the focus will be put on the message for a screen reader */}
            <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
            <h1>Change Your Password Here</h1>
            <form onSubmit={handleSubmit}>

                <label htmlFor="username">
                    Username: 
                    {/* Both validMatch and matchPassword needed or there could be a green check for empty passwords */}
                </label>
                <input
                    type = "text"
                    id = "username"
                    /* ref allows us to set focus on the input */
                    ref = {userRef}
                    /* Autocomplete off because we don't want to see previous values suggested */
                    autoComplete = "off"
                    /* onChange ties the input to the userState */
                    onChange={(e) => setUser(e.target.value)}
                    required
                    /* Settinig focus */
                    onFocus={() => setUserFocus(true)}
                    onBlur={() => setUserFocus(false)}
                />
                <label htmlFor="password">
                    Password: 
                    <span className={validPwd ? "valid" : "hide"}>
                        <FontAwesomeIcon icon={faCheck} />
                    </span>
                    <span className={validPwd || !pwd ? "hide" : "invalid"}>
                        <FontAwesomeIcon icon={faTimes} />
                    </span>
                </label>
                <input
                    type = "password"
                    id = "password"
                    /* onChange ties the input to the passwordState */
                    onChange={(e) => setPwd(e.target.value)}
                    required
                    /* aria-invalid will be set to true when the component loads because blank is an invalid username */
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

                {/* This is the matching password field */}
                <label htmlFor="confirm_password">
                    Confirm Password: 
                    {/* Both validMatch and matchPassword needed or there could be a green check for empty passwords */}
                    <span className={validMatch && matchPwd ? "valid" : "hide"}>
                        <FontAwesomeIcon icon={faCheck} />
                    </span>
                    <span className={validMatch || !matchPwd ? "hide" : "invalid"}>
                        <FontAwesomeIcon icon={faTimes} />
                    </span>
                </label>
                <input
                    type = "password"
                    id = "confirm_password"
                    /* onChange ties the input to the passwordState */
                    onChange={(e) => setMatchPwd(e.target.value)}
                    required
                    /* aria-invalid will be set to true when the component loads because blank is an invalid username */
                    aria-invalid={validMatch ? "false" : "true"}
                    /* This is the final thing read by the screen reader and here we give the full requirements for the field */
                    aria-describedby="confirmnote"
                    /* Setting focus */
                    onFocus={() => setMatchFocus(true)}
                    onBlur={() => setMatchFocus(false)}
                />
                {/* Info message for the password field */}
                <p id="confirmnote" className={pwdFocus && !validPwd ? "instructions" : "offscreen"}>
                    <FontAwesomeIcon icon={faInfoCircle} />
                    Must match password
                </p>




            </form>
           
        </section>
    )}</>
    )
}


export default PasswordReset