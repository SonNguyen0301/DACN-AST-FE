import axios from './api';

const loginDevModeAPI = (email) => {
    return axios.get('/dev-mode/access-token', {
        params: { email } 
    });
};

const loginAPI = (email, password) => {
    return axios.post('/auth/login', { email, password });
}

const requestOtpAPI = (email) => {
    return axios.post('/auth/request-otp', { email });
};

const verifyOtpAPI = ({ email, otp, sessionId, type }) => {
    return axios.post('/auth/verify-otp', { email, otp, sessionId, type });
};

const registerAPI = (data) => {
    return axios.post('/auth/register', data);
};

export { loginDevModeAPI, loginAPI, requestOtpAPI, verifyOtpAPI, registerAPI };