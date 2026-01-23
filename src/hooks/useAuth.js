import { useContext } from 'react';
// Đảm bảo đường dẫn này trỏ đúng tới file AuthContext.jsx của bạn
import { AuthContext } from '../context/AuthContext'; 

const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth phải được sử dụng bên trong AuthProvider");
  }

  return context;
};

export default useAuth;