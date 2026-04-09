import axios from './api'; 

const getTodayAppointments = (params) => {
    return axios.get('/staffs/today-appointments', {params});
};

const getActiveDoctors = (date) => {
    return axios.get(`/staffs/active-doctors/${date}`);
};
const getStaffAppointmentsAPI = (params) => {
    return axios.get('/staffs/appointments', { params });
};
const getStaffDashboardInfo = (params ) => {
    return axios.get('/staffs/staff-info-dashboard', { params });
};

const getStaffScheduleAPI = (startDate, endDate) => {
    return axios.get('/staffs/schedule', { params: { startDate, endDate } });
};

const createStaffScheduleAPI = (data) => {
    return axios.post('/staffs/schedule', data);
};

const importStaffScheduleCSVAPI = (formData) => {
    return axios.post('/staffs/import-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

const exportStaffScheduleCSVAPI = (startDate, endDate) => {
    return axios.get('/staffs/export-csv', {
        params: { startDate, endDate },
        responseType: 'blob' 
    });
};

const updateAppointmentNoteAPI = (appointmentId, note) => {
    return axios.patch(`/appointments/${appointmentId}/note`, { note }); 
};

export { getTodayAppointments, getActiveDoctors, getStaffAppointmentsAPI, getStaffDashboardInfo, getStaffScheduleAPI, createStaffScheduleAPI, importStaffScheduleCSVAPI, exportStaffScheduleCSVAPI, updateAppointmentNoteAPI };