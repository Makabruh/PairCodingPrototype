import axios from 'axios';


//Set default axios variables (ensure the CSRF token gets sent with requests made to backend)
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

//This is the client instance with a base url
//It allows us to only make one change to the API address
export default axios.create({
    baseURL: 'http://localhost:8000'
});


const client = axios.create({
    baseURL: 'http://localhost:8000',
    withCredentials: true 
});
  
  //Get CSRF token from cookie
  const csrfToken = document.cookie.split('; ')
    .find(cookie => cookie.startsWith('csrftoken='))
    .split('=')[1];
  
  //Include the CSRF token in the headers
  client.defaults.headers.common['X-CSRFToken'] = csrfToken;
  