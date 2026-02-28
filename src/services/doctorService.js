import axios from './api'; 

// Hàm lấy danh sách bác sĩ
const getDoctorsAPI = (params) => {
    return axios.get('/doctors', { params });
};

const getDoctorShiftsAPI = (doctorId, params) => {
    return axios.get(`/shifts/${doctorId}`, { params });
};

export { getDoctorsAPI, getDoctorShiftsAPI };