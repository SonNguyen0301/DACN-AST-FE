import axios from './api'; 

// Hàm lấy danh sách bác sĩ
const getDoctorsAPI = (params) => {
    return axios.get('/doctors', { params });
};

const getDoctorInfoAPI = (doctorId) => {
    return axios.get(`/doctors/info/${doctorId}`);
};

// 2. Lấy danh sách ca khám của bác sĩ (Dựa theo curl, gọi /shifts và truyền query)
const getDoctorShiftsAPI = (params) => {
    return axios.get('/shifts', { params });
};

// 3. API Xác nhận đặt lịch (Dùng FormData vì có upload file)
const bookAppointmentAPI = (formData) => {
    return axios.post('/shifts/book', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

export { getDoctorsAPI, getDoctorInfoAPI, getDoctorShiftsAPI, bookAppointmentAPI };