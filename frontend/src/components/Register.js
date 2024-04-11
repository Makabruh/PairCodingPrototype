//Import hooks
import { useRef, useState, useEffect} from "react";
//Import visuals
import { faCheck, faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
//Import Axios
import axios from '../api/axios';

//Backend details
const REGISTER_URL = '/register';

//Regex statements
//Note that email will have to be properly checked with mfa TODO
const USER_REGEX = /^[a-zA-Z][a-zA-Z0-9-_]{3,23}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%£*]).{8,24}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

//? Bcrypt - May use this going forwards
// const bcrypt = require('bcryptjs');

const Register = () => {
    //userRef will allow us to set the focus on user input when the component loads
    const userRef = useRef();
    //If we get an error we need to put the focus on the error
    const errRef = useRef();
    // Put focus on email field
    const emailRef = useRef();

    //States for user field - user tied to user input, validName a boolean for validation, userFocus tied to focus on input field
    const [user, setUser] = useState('');
    const [validName, setValidName] = useState(false);
    const [userFocus, setUserFocus] = useState(false);

    //Same as above but for password and matching password fields
    const [pwd, setPwd] = useState('');
    const [validPwd, setValidPwd] = useState(false);
    const [pwdFocus, setPwdFocus] = useState(false);

    const [matchPwd, setMatchPwd] = useState('');
    const [validMatch, setValidMatch] = useState(false);
    const [matchFocus, setMatchFocus] = useState(false);

    //Same as above for email
    const [email, setEmail] = useState('');
    const [validEmail, setValidEmail] = useState(false);
    const [emailFocus, setEmailFocus] = useState(false);

    //Same for user level
    const [userLevel, setUserLevel] = useState('');
    const [validUserLevel, setValidUserLevel] = useState(false);
    const [userLevelFocus, setUserLevelFocus] = useState(false);

    //States for error messages and successful submission
    const [errMsg, setErrMsg] = useState('');
    const [success, setSuccess] = useState(false);

    //First time effect is applied is setting the focus when the component loads - nothing in dependency array
    useEffect(() => {
        userRef.current.focus();
    }, [])

    //Validating the username input field at every change
    useEffect(() => {
        const result = USER_REGEX.test(user);
        setValidName(result);
    }, [user])

    useEffect(() => {
        const result = EMAIL_REGEX.test(email);
        setValidEmail(result);
    }, [email])

    //Validating the password input field
    useEffect(() => {
        const result = PASSWORD_REGEX.test(pwd);
        setValidPwd(result);
        //Comparing the password and match password
        //Have them in the same effect as we want to re-check whenever one of the passwords changes
        const match = pwd === matchPwd;
        setValidMatch(match);
    }, [pwd, matchPwd])

    //Validating there is a userLevel input and not left empty
    useEffect(() => {
        const result = userLevel.trim() !== '';
        setValidUserLevel(result);
    }, [userLevel])

    //Any input state being changed requires a clearing of the error message
    useEffect(() => {
        setErrMsg('');
    }, [user, pwd, matchPwd, email])

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Security - preventing console JS hack of disabled button
        const v1 = USER_REGEX.test(user);
        const v2 = PASSWORD_REGEX.test(pwd);
        const v3 = EMAIL_REGEX.test(email)
        const v4 = userLevel.trim() !== '';
        if (!v1 || !v2 || !v3 || !v4) {
            setErrMsg("Invalid entry");
            return;
        }

        //? Bcrypt hashing - maybe
        // const salt = bcrypt.genSaltSync(10);
        // const hashedPassword = await bcrypt.hash(pwd,salt);
        // Would use hashedPassword in the payload below

        try {
            const response = await axios.post(REGISTER_URL, JSON.stringify(
                { username: user, password: pwd, userLevel: userLevel, email: email }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );
                setSuccess(true);
                setUser('');
                setPwd('');
                setMatchPwd('');
                setUserLevel('');
                setEmail('');
        }
        catch (error){
            if (!error?.response){
                setErrMsg('No Server Response');
            } else if (error.response?.status === 409){
                setErrMsg('Username Taken');
            } else {
                setErrMsg('Registration Failed')
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
        // This is displayed if the form has not been submitted correctly yet
        // section is more semantic than div
        <section>
            {/* Here is our error message, using a ternary operator to check if there is an error message */}
            {/* The offscreen class name means it is still available to screen readers when there is no error message but not visible on the screen */}
            {/* The aria-live means that if there is an error message, the focus will be put on the message for a screen reader */}
            <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>

            <h1>Register</h1>
            <form onSubmit={handleSubmit}>
                {/* This is the username field */}
                {/* The htmlFor needs to match the id of the input */}
                <label htmlFor="username">Username: 
                {/* These spans provide the green check mark if the username is valid and the red cross if not*/}
                    <span className={validName ? "valid" : "hide"}>
                        <FontAwesomeIcon icon={faCheck} />
                    </span>
                    <span className={validName || !user ? "hide" : "invalid"}>
                        <FontAwesomeIcon icon={faTimes} />
                    </span>
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
                    /* aria-invalid will be set to true when the component loads because blank is an invalid username */
                    aria-invalid={validName ? "false" : "true"}
                    /* This is the final thing read by the screen reader and here we give the full requirements for the field */
                    aria-describedby="uidnote"
                    /* Settinig focus */
                    onFocus={() => setUserFocus(true)}
                    onBlur={() => setUserFocus(false)}
                />
                {/* Info message for the username field */}
                <p id="uidnote" className={userFocus && user && !validName ? "instructions" : "offscreen"}>
                    <FontAwesomeIcon icon={faInfoCircle} />
                    4 to 24 characters <br/>
                    Must begin with a letter <br/>
                    Letters, numbers, underscores, and hyphens allowed
                </p>

                {/* This is the email field */}
                <label htmlFor="email">Email: 
                {/* These spans provide the green check mark if the username is valid and the red cross if not*/}
                    <span className={validEmail ? "valid" : "hide"}>
                        <FontAwesomeIcon icon={faCheck} />
                    </span>
                    <span className={validEmail || !email ? "hide" : "invalid"}>
                        <FontAwesomeIcon icon={faTimes} />
                    </span>
                </label>
                <input
                    type = "email"
                    id = "email"
                    /* ref allows us to set focus on the input */
                    ref = {emailRef}
                    /* Autocomplete off because we don't want to see previous values suggested */
                    autoComplete = "off"
                    /* onChange ties the input to the userState */
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    /* aria-invalid will be set to true when the component loads because blank is an invalid username */
                    aria-invalid={validEmail ? "false" : "true"}
                    /* This is the final thing read by the screen reader and here we give the full requirements for the field */
                    aria-describedby="emailnote"
                    /* Settinig focus */
                    onFocus={() => setEmailFocus(true)}
                    onBlur={() => setEmailFocus(false)}
                />
                {/* Info message for the username field */}
                <p id="emailnote" className={emailFocus && email && !validEmail ? "instructions" : "offscreen"}>
                    <FontAwesomeIcon icon={faInfoCircle} />
                    Please input a valid email address
                </p>

                {/* This is the password field */}
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
                <p id="confirmnote" className={matchFocus && !validPwd ? "instructions" : "offscreen"}>
                    <FontAwesomeIcon icon={faInfoCircle} />
                    Must match password
                </p>

                {/* User Level field - select */}
                {/* Info message - not visible to people looking at the form */}
                <p id="userLevelNote" className={userLevelFocus && !validUserLevel ? "instructions" : "offscreen"}>
                    <FontAwesomeIcon icon={faInfoCircle} />
                    Must select type of user
                </p>
                <label htmlFor="selectUserLevel">
                            Select the Type of User...
                        </label>
                <select id="selectUserLevel" onChange={(e) => setUserLevel(e.target.value)}>
                    <option
                        id="apprentice"
                        name="userLevel"
                        value="Apprentice">
                    Apprentice</option>
                    <option
                        id="training-provider"
                        name="userLevel"
                        value="Training Provider">
                    Training Provider</option>
                    <option
                        id="employer"
                        name="userLevel"
                        value="Employer">
                    Employer</option>
                </select>
                

                {/* No need for type=submit as when only one button in a form, that is default */}
                <button disabled={!validName || !validPwd || !validMatch || !validUserLevel ? true : false}>
                    Sign Up
                </button>

            </form>

            <p>
                Already registered? <br />
                <span className="line">
                    {/* Placeholder */}
                    <a href="/login">Sign In</a>
                </span>
            </p>
        </section>
            )}</>
    )
}

export default Register


