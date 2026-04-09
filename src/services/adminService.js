import axios from './api';

const adminService = {
  // Accounts - Doctor
  createDoctorAccount: (data) => axios.post('/admin/doctors', data),
  updateDoctorAccount: (id, data) => axios.put(`/admin/doctors/${id}`, data),
  deleteDoctorAccount: (id) => axios.delete(`/admin/doctors/${id}`),

  // Accounts - Admission Staff
  createAdmissionStaffAccount: (data) => axios.post('/admin/staffs', data),
  updateAdmissionStaffAccount: (id, data) => axios.put(`/admin/staffs/${id}`, data),
  deleteAdmissionStaffAccount: (id) => axios.delete(`/admin/staffs/${id}`),

  // AI Models - Diagnose
  getDiagnoseModels: (params) => axios.get('/admin/ai-models', { params }),
  createDiagnoseModel: (data) => axios.post('/admin/ai-models', data),
  updateDiagnoseModel: (id, data) => axios.put(`/admin/ai-models/${id}`, data),
  deleteDiagnoseModel: (id) => axios.delete(`/admin/ai-models/${id}`),

  // AI Models - Chatbot
  getChatbotModels: (params) => axios.get('/admin/chatbots', { params }),
  createChatbotModel: (data) => axios.post('/admin/chatbots', data),
  updateChatbotModel: (id, data) => axios.put(`/admin/chatbots/${id}`, data),
  deleteChatbotModel: (id) => axios.delete(`/admin/chatbots/${id}`),
};

export default adminService;