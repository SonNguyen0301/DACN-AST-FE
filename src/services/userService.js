import axios from './api';

const getUserInfoAPI = () => {
    return axios.get('/patients');
};

const updateUserInfoAPI = (data) => {
    return axios.put('/patients', data);
}
export { getUserInfoAPI, updateUserInfoAPI };