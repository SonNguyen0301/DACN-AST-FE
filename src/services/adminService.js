import axios from './api';

const serializeBooleanQueryParams = (params = {}) => {
  const normalizedParams = { ...params };

  if (typeof normalizedParams.isPublic === 'boolean') {
    normalizedParams.isPublic = normalizedParams.isPublic ? 'true' : 'false';
  }

  return normalizedParams;
};

const adminService = {
  // Accounts - Doctor
  createDoctorAccount: (data) => axios.post('/admin/doctors', data),
  updateDoctorAccount: (id, data) => axios.put(`/admin/doctors/${id}`, data),
  deleteDoctorAccount: (id) => axios.delete(`/admin/doctors/${id}`),

  // Accounts - Admission Staff
  getListStaffs: (params) => axios.get('/admin/staffs', { params }),
  createAdmissionStaffAccount: (data) => axios.post('/admin/staffs', data),
  updateAdmissionStaffAccount: (id, data) => axios.put(`/admin/staffs/${id}`, data),
  deleteAdmissionStaffAccount: (id) => axios.delete(`/admin/staffs/${id}`),

  // Accounts - Patient
  getListPatients: (params) => axios.get('/admin/patients', { params }),

  // User Statistics
  getUserStatistics: () => axios.get('/admin/users/statistics'),

  // Dashboard Drill-down
  getDoctorPatients: (doctorId, params) => axios.get(`/admin/dashboard/doctors/${doctorId}/patients`, { params }),
  getPatientConsultations: (doctorId, patientId, params) => axios.get(`/admin/dashboard/doctors/${doctorId}/patients/${patientId}/consultations`, { params }),
  getTopDiseases: (params) => axios.get('/admin/dashboard/top-diseases', { params }),

  // AI Models - Diagnose
  getDiagnoseModels: (params) => axios.get('/admin/ai-models', { params: serializeBooleanQueryParams(params) }),
  createDiagnoseModel: (data) => axios.post('/admin/ai-models', data),
  updateDiagnoseModel: (id, data) => axios.put(`/admin/ai-models/${id}`, data),
  deleteDiagnoseModel: (id) => axios.delete(`/admin/ai-models/${id}`),

  // AI Models - Chatbot
  getChatbotModels: (params) => axios.get('/admin/chatbots', { params: serializeBooleanQueryParams(params) }),
  createChatbotModel: (data) => axios.post('/admin/chatbots', data),
  updateChatbotModel: (id, data) => axios.put(`/admin/chatbots/${id}`, data),
  deleteChatbotModel: (id) => axios.delete(`/admin/chatbots/${id}`),

  // Dashboard - Statistics
  getSystemOverview: (params) => axios.get('/admin/dashboard/overview', { params }),
  getDoctorPerformanceStatistics: (params) => axios.get('/admin/dashboard/doctor-performance', { params }),
};

export default adminService;