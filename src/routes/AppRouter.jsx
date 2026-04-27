import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/public/LandingPage";
import PatientDashboardPage from "../pages/patient/DashboardPage"; 
import PersonalPage from "../pages/patient/PersonalPage";
import BookingPage from "../pages/patient/BookingPage";
import AppointmentPage from "../pages/patient/AppointmentPage";
import DoctorProfilePage from "../pages/patient/DoctorProfilePage";
import BookingConfirmationPage from "../pages/patient/BookingConfirmationPage";

import DoctorDashboardPage from "../pages/doctor/DashboardPage";
import ListAppointmentPage from "../pages/doctor/ListAppointmentPage";
import DoctorProfile from "../pages/doctor/DoctorProfilePage";
import ConsultingPage from "../pages/doctor/ConsultingPage";
import MedicalHistoryPage from "../pages/doctor/MedicalHistoryPage";

import StaffDashboardPage from "../pages/staff/DashboardPage";
import ListAppointmentStaffPage from "../pages/staff/ListAppointmentPage";
import ManageSchedulePage from "../pages/staff/ManageSchedulePage";
import StaffProfilePage from "../pages/staff/StaffProfilePage";

import AdminDashboardPage from "../pages/admin/DashboardPage";
import UserManagementPage from "../pages/admin/UserManagementPage";
import ModelAIPage from "../pages/admin/ModelAIPage";

import SignInPage from "../pages/public/SignInPage";
import SignUpPage from "../pages/public/SignUpPage";
import ForgotPasswordPage from "../pages/public/ForgotPasswordPage";
import ResetPasswordPage from "../pages/public/ResetPasswordPage";

export default function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<SignInPage />} />
      <Route path="/register" element={<SignUpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Patient routes */}
      <Route path="/patient/dashboard" element={<PatientDashboardPage />} />
      <Route path="/patient/personal" element={<PersonalPage />} />
      <Route path="/patient/booking" element={<BookingPage />} />
      <Route path="/patient/appointments" element={<AppointmentPage />} />
      <Route path="/patient/booking/:id" element={<DoctorProfilePage />} />
      <Route path="/patient/book-confirm" element={<BookingConfirmationPage />} />

      {/* Doctor routes */}
      <Route path="/doctor/dashboard" element={<DoctorDashboardPage />} />
      <Route path="/doctor/appointments" element={<ListAppointmentPage />} />
      <Route path="/doctor/profile" element={<DoctorProfile />} />
      <Route path="/doctor/consulting" element={<ConsultingPage />} />
      <Route path="/doctor/medical-history" element={<MedicalHistoryPage />} />
      
      {/* Staff routes */}
      <Route path="/staff/dashboard" element={<StaffDashboardPage />} />
      <Route path="/staff/appointments" element={<ListAppointmentStaffPage />} />
      <Route path="/staff/manage-schedule" element={<ManageSchedulePage />} />
      <Route path="/staff/profile" element={<StaffProfilePage />} />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      <Route path="/admin/user-management" element={<UserManagementPage />} />
      <Route path="/admin/model-ai" element={<ModelAIPage />} />

    </Routes>
  );
}
