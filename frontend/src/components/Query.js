import axios from '../api/axios';
import getCookie from '../functions/getCookie';
import useAuth from '../hooks/useAuth';
import {useRef, useState, useEffect} from 'react';

const QUERY_URL = '/query';


const Query = () => {

    const {auth, setAuth} = useAuth();
    const [currentUser, setCurrentUser] = useState('');
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
            const response = await axios.post(QUERY_URL, 
                JSON.stringify({username: auth.user}),
                {
                    headers: { 
                        'Content-Type': 'application/json', 
                        'X-CSRFToken' : csrftoken
                    },    
                }
            );
            console.log(response.data.username);
            setCurrentUser(response.data);
            console.log(currentUser);

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
            <p>User: {currentUser.username}</p>
            <p>User Level: {currentUser.userLevel}</p>
            <p>Email: {currentUser.email}</p>
            <div className="flexGrow">
                <button onClick={GetUser}>Get</button>
            </div>
        </section>
        
    )
}

export default Query