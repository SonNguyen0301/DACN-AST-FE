import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/public/LandingPage";
import PatientDashboardPage from "../pages/patient/DashboardPage"; 
import PersonalPage from "../pages/patient/PersonalPage";
import BookingPage from "../pages/patient/BookingPage";
import AppointmentPage from "../pages/patient/AppointmentPage";
import DoctorProfilePage from "../pages/patient/DoctorProfilePage";
import BookingConfirmationPage from "../pages/patient/BookingConfirmationPage";
export default function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />

      {/* Patient routes */}
      <Route path="/patient/dashboard" element={<PatientDashboardPage />} />
      <Route path="/patient/personal" element={<PersonalPage />} />
      <Route path="/patient/booking" element={<BookingPage />} />
      <Route path="/patient/appointments" element={<AppointmentPage />} />
      <Route path="/patient/booking/:id" element={<DoctorProfilePage />} />
      <Route path="/patient/book-confirm" element={<BookingConfirmationPage />} />
    </Routes>
  );
}
