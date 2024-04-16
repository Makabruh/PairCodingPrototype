import axios from '../api/axios';
import useAuth from './useAuth';

// The CSRF token that we get back from Django on login should only be valid for a short period of time (5-15mins)
// Once it has expired, the refresh token is used to fetch a new CSRF token from the backend, these are long lasting and stored in the JS and database
//

const useRefreshToken = () => {
    const {setAuth} = useAuth();

    const refresh = async () => {
        const response = await axios.get('/refresh', {
            withCredentials: true
        });
        setAuth(prev => {
            console.log(JSON.stringify(prev));
            console.log(response.data.accessToken)
            return {...prev, accessToken: response.data.accessToken}
        });
        return response.data.accessToken;
    }
    return refresh;
};

export default useRefreshToken;