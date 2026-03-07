import axios from './api'; 

// Hàm lấy danh sách bác sĩ
const getDoctorsAPI = (params) => {
    return axios.get('/doctors', { params });
};

const getDoctorInfoAPI = (doctorId) => {
    return axios.get(`/doctors/info/${doctorId}`);
};

const getDoctorShiftsAPI = (doctorId, params) => {
    return axios.get(`/shifts/${doctorId}`, { params });
};

const bookAppointmentAPI = (formData) => {
    return axios.post('/shifts/book', formData);
};

export { getDoctorsAPI, getDoctorInfoAPI, getDoctorShiftsAPI, bookAppointmentAPI };