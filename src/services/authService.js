import axios from './api';

const loginDevModeAPI = (email) => {
    return axios.get('/dev-mode/access-token', {
        params: { email } 
    });
};

export { loginDevModeAPI };