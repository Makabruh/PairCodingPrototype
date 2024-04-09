import getCookie from "../common/getCookie";
import axios from "../api/axios";

async function getAuthFromBackend(){
    //Get the csrf token from the cookie
    const token = getCookie("csrftoken");
    const sessionid = getCookie("sessionid");
    // const authDetails = sendCookieDetails(token, sessionid);
    // console.log("auth from hook: " + authDetails);
    // return authDetails;
    try {
        // Wait for sendCookieDetails promise to resolve
        const authDetails = await sendCookieDetails(token, sessionid);
        console.log("auth from hook:", authDetails);
        return authDetails;
    } catch (error) {
        console.error("Error fetching auth", error);
        return null;
    }
}

const sendCookieDetails = async (token, sessionid) => {
    const AUTH_URL = "/getauth"
    //Send token and sessionid to backend
    try {
        const response = await axios.get(AUTH_URL, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token,
                'SessionID': sessionid
            },
            withCredentials: true
        });
        //Get the CSRF token from the response data
        //const accessToken = response?.data?.csrf_token;
        console.log(response.data)
        return response.data;
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