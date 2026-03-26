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
    return axios.post('/shifts/book', formData, {
        headers: {
            'Content-Type': 'multipart/form-data' 
        }
    });
};

const getDoctorAppointmentsAPI = (params) => {
    return axios.get('/doctors/personal-appointment', { params });
};

const getAppointmentCalendarAPI = (doctorId, params) => {
    return axios.get(`/doctors/${doctorId}/appointment-calendar`, { params });
};

const getAppointmentsByDateAPI = (doctorId, date) => {
    return axios.get(`/doctors/${doctorId}/appointment-date/${date}`);
};

export { getDoctorsAPI, getDoctorInfoAPI, getDoctorShiftsAPI, bookAppointmentAPI, getDoctorAppointmentsAPI, getAppointmentCalendarAPI, getAppointmentsByDateAPI };