function getCookie(cookieName) {
    //Get all cookie values from the browser as one string
    const cookieString = document.cookie;
    //Split these cookies into an array at the semicolon
    const cookies = cookieString.split('; ');

    //Out of this array, split again at the = (between cookie name and value)
    //Return the cookie value for the cookie with the name passed to the function
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].split('=');
        if (cookie[0] === cookieName) {
          return cookie[1];
        }
    }
    //If no cookie is found, return null
    return null;
}

export default getCookie