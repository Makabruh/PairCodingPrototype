import axios from 'axios';

const BASE_URL = 'http://localhost:8000'


//Set default axios variables (ensure the CSRF token gets sent with requests made to backend)
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

//This is the client instance with a base url
//It allows us to only make one change to the API address
export default axios.create({
    baseURL: BASE_URL
});


export const client = axios.create({
    baseURL: BASE_URL,
    withCredentials: true 
});

//!CHANGES
export const AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 5000,
    headers: {
        "Content-Type": "application/json",
        accept: "application/json"
    }
})

//For refreshing tokens & JWT
export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
})
  