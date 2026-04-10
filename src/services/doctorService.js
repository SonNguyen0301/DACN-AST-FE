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

const getDoctorDashboardInfoAPI = (params) => {
    return axios.get('/doctors/doctor-info-dashboard', { params });
};

const getStatisticMonthlyDiseaseAPI = (params) => {
    return axios.get('/consultations/statistic-monthly-disease', { params });
};

const startExaminationAPI = (data) => {
    return axios.post('/doctors/start-examination', data);
};

const finishExaminationAPI = (data) => {
    return axios.post('/doctors/finish-examination', data);
};

const createAiDiagnosisAPI = (data) => {
    return axios.post('/doctors/ai-diagnosis', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

const getAiDiagnosisResultAPI = (consultationId) => {
    return axios.get(`/doctors/ai-diagnosis/${consultationId}`);
};

const getConsultationHistoryAPI = (params) => {
    return axios.get('/doctors/consultation-history', { params });
};

const getConsultationDetailAPI = (consultationId) => {
    return axios.get(`/doctors/consultations/${consultationId}/detail`);
};

export { getDoctorsAPI, getDoctorInfoAPI, getDoctorShiftsAPI, bookAppointmentAPI, getDoctorAppointmentsAPI, getAppointmentCalendarAPI, getAppointmentsByDateAPI, getDoctorDashboardInfoAPI, getStatisticMonthlyDiseaseAPI, startExaminationAPI, finishExaminationAPI, createAiDiagnosisAPI, getAiDiagnosisResultAPI, getConsultationHistoryAPI, getConsultationDetailAPI };