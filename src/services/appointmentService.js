import axios from './api'; 

const getPatientAppointmentsAPI = (userId, params) => {
    return axios.get(`patients/appointments/${userId}`, { params });
};

const cancelAppointmentAPI = (appointmentId) => {
    return axios.patch(`/appointments/${appointmentId}/cancel`);
};

const updateAppointmentAPI = (appointmentId, formData) => {
    return axios.patch(`/appointments/${appointmentId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data' 
        }
    });
};

const getUpcomingAppointmentAPI = () => {
    return axios.get('patients/upcoming-appointment');
};

export { getPatientAppointmentsAPI, cancelAppointmentAPI, updateAppointmentAPI, getUpcomingAppointmentAPI };