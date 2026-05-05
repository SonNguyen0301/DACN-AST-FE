import axios from './api';

const getUserInfoAPI = () => {
    return axios.get('/patients');
};

const updateUserInfoAPI = (data) => {
    return axios.put('/patients', data);
}

const getAdminInfoAPI = () => {
    return axios.get('/users/info');
};

const updateAdminInfoAPI = (data) => {
    return axios.put('/users', data);
}

const getHistoryConsultationsAPI = (patientId,params) => {
    return axios.get(`/consultations/${patientId}/history`, { params });
}
const getConsultationDetailAPI = (consultationId) => {
    return axios.get(`/consultations/${consultationId}`);
}
export { getUserInfoAPI, updateUserInfoAPI , getHistoryConsultationsAPI, getConsultationDetailAPI, getAdminInfoAPI, updateAdminInfoAPI };