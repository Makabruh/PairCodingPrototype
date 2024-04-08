import getCookie from "../common/getCookie";
import axios from "../api/axios";

function getAuthFromBackend(){
    //Get the csrf token from the cookie
    const token = getCookie("csrftoken");
    const sessionid = getCookie("sessionid");
    sendCookieDetails(token, sessionid);
}

const sendCookieDetails = async (token, sessionid) => {
    const AUTH_URL = "/getauth"
    //Send token and sessionid to backend
    try {
        const response = await axios.get(AUTH_URL, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'SessionID': sessionid
            },
            withCredentials: true
        });
        //Get the CSRF token from the response data
        //const accessToken = response?.data?.csrf_token;
        console.log(response.data)
    }
    catch (err) {
        //If there is no error coming back from the server
        if(!err?.response){
            console.log('No Server Response')
        }
        else if (err.response?.status === 400) {
            console.log('400')
        }
        else if (err.response?.status === 401) {
            console.log('401')
        }
        else if (err.response?.status === 403) {
            console.log('You do not have the required permissions')
        } else {
            console.log('Login Failed')
            console.log("Error: Catch Statement")
        }

    }
}


export default getAuthFromBackend