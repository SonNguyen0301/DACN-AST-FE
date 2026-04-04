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

export { getTodayAppointments, getActiveDoctors, getStaffAppointmentsAPI, getStaffDashboardInfo };