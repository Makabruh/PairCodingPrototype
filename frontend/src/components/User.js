import axios from '../api/axios';
import getCookie from '../functions/getCookie';
import useAuth from '../hooks/useAuth';
import {useRef, useState, useEffect} from 'react';

const USER_URL = '/user';



const CurrentUser = () => {

    const {auth, setAuth} = useAuth();
    const [sessionUser, setSessionUser] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const errRef = useRef();

    const csrftoken = getCookie('csrftoken');

    useEffect(() => {
        console.log("User:", auth.user);
        console.log("Access Token:", auth.accessLevel);
      }, [auth]);

      useEffect(() => {
        setErrMsg('');
    }, [])


      const GetUser = async (e) => {

        e.preventDefault();
        try {
            const response = await axios.post(USER_URL, 
                JSON.stringify({ username: auth.user}),
                {
                    headers: { 
                        'Content-Type': 'application/json', 
                        'X-CSRFToken' : csrftoken
                    },    
                }
            );
            console.log(response.status);
            console.log(response.data.user);
            setSessionUser(response.data.user);

        }
        catch (err) {
            //If there is no error coming back from the server
            if(!err?.response){
                setErrMsg('No Server Response')
            }
            else if (err.response?.status === 403) {
                setErrMsg('You do not have the required permissions')
            } else {
                setErrMsg('Get User Failed')
                console.log("Error: Catch Statement")
            }
            errRef.current.focus();
        }
    }

    return(
        <section>
            <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
            <h2>Current User:</h2>
            <p>Auth User: {auth.user}</p>
            <p>Auth Access Token: {auth.accessLevel}</p>
            <p>Session Username: {sessionUser}</p>
            <div className="flexGrow">
                <button onClick={GetUser}>Get</button>
            </div>
        </section>
        
    )
}

export default CurrentUser