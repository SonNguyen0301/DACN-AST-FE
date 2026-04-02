import axios from './api'; 

const getTodayAppointments = (params) => {
    return axios.get('/staffs/today-appointments', {params});
};

const getActiveDoctors = (date) => {
    return axios.get(`/staffs/active-doctors/${date}`);
};

export { getTodayAppointments, getActiveDoctors };