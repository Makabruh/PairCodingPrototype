import { useNavigate, Link, useParams } from "react-router-dom";
import {useRef, useState, useEffect} from 'react';
import axios from '../api/axios';
import useAuth from "../hooks/useAuth";


import getCookie from '../functions/getCookie';

const VERIFY_USER = '/verifyuser';

// There are two options here:
// If you are logged in - you will be asked for your old/current password and this will be sent to the backend
// If you are not logged in - you will be asked for the code sent to your email
// For the most reusable system, both sets of users will be asked to input their credential - old password / OTP
// Once this has been posted and accepted, they will be taken to a new page with just the new password to be inputted
// This is step-up authentication
//TODO In the React, the current password and OTP might be able to be combined to one as the backend checks if a user is logged

const VerifyUser = () => {   
    //Get the CSRF token from the cookies
    const csrftoken = getCookie('csrftoken');
    //Get the auth state to check for user
    const { auth } = useAuth();

    const { username } = useParams();
    
    //States for the current password
    const [currentPwd, setCurrentPwd] = useState('');

    //States for OTP
    const [otp, setOtp] = useState('');

    // Refs
    const errRef = useRef();

    // States
    const [errMsg, setErrMsg] = useState('');

    const navigate = useNavigate();

    //On button click
    const handleSubmit = async (e) => {
        //Prevent the form emptying
        e.preventDefault();

        try {
            //Try to post to the backend
            const response = await axios.post(VERIFY_USER, JSON.stringify(
                { password: currentPwd, username }),
                {
                    headers: { 
                        'Content-Type': 'application/json', 
                        'X-CSRFToken' : csrftoken,
                    },      
                    withCredentials: true
                }
            );
            console.log("Password accepted!")
            const verification = getCookie('accountVerification');
            console.log(verification)
            navigate('/resetpassword');
        }
        catch (error){
            if (!error?.response){
                setErrMsg('No Server Response');
            } else if (error.response?.status === 401) {
                setErrMsg('Incorrect Password')
            } else if (error.response?.status === 400) {
                setErrMsg('Please enter your password')
            } else {
                setErrMsg('Something went wrong')
            }
            errRef.current.focus();
        }

    }

    const handleOTP = async (e) => {
        //Prevent the form emptying
        e.preventDefault();
        try {
            //Try to post to the backend
            const response = await axios.post(VERIFY_USER, JSON.stringify(
                { password: otp, username }),
                {
                    headers: { 
                        'Content-Type': 'application/json', 
                        'X-CSRFToken' : csrftoken,
                    },      
                    withCredentials: true
                }
            );
            console.log("OTP accepted")
            const verification = getCookie('accountVerification');
            console.log(verification)
            navigate('/resetpassword');
        }
        catch (error){
            if (!error?.response){
                setErrMsg('No Server Response');
            } else if (error.response?.status === 401) {
                setErrMsg('Incorrect OTP')
            } else if (error.response?.status === 400) {
                setErrMsg('Please enter your OTP')
            } else {
                setErrMsg('Something went wrong')
            }
            errRef.current.focus();
        }

    }

    return (
        <>
            {/* This is displayed if the user is not logged in */}
            {!auth.user ? (
                    <section>
                        <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
                        <h1>Reset Your Password Here</h1>
                        <form>
                            <label htmlFor="otp-code">Enter your OTP</label>
                            <input
                                type="number"
                                id="otp-code"
                                onChange={(e) => setOtp(e.target.value)}
                                value={otp}
                                required
                            />
                            <button onClick={handleOTP}>Reset Password</button>
                        </form>
                    </section>
                ) : (
            // This is displayed if the user is logged in
                <section>
                    {/* The error message displayed at the top if there is one (assertive means announced immediately when the focus is put on the error message) */}
                    <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
                    <h1>Please enter your old Password:</h1>
                    
                    <form>
                        <label htmlFor='current-password'>Current Password: </label>
                        <input 
                            type="password" 
                            id="current-password" 
                            onChange={(e) => setCurrentPwd(e.target.value)}
                            value={currentPwd}
                            required
                        />
                        <button onClick={handleSubmit}>Request</button>
                    </form>

                    <br />
                    <Link to="/">Go Home</Link>
                    <br />
                </section>
            )}
        </>
    )
}

export default VerifyUser