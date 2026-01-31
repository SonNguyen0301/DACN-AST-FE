// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import { loginDevModeAPI, loginAPI } from '../services/authService';
import { getChatbotTokenAPI } from '../services/chatService'; 

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [chatToken, setChatToken] = useState(null); 

    const login = async (email, password) => {
        try {
            // --- GIAI ĐOẠN 1: LẤY USER TOKEN ---
            const userRes = await loginAPI(email, password);
            const userToken = userRes.data.data.accessToken; 
            
            // Lưu User Token 
            localStorage.setItem('accessToken', userToken);
            setIsAuthenticated(true);

            // --- GIAI ĐOẠN 2: LẤY CHATBOT TOKEN ---
            try {
                const chatRes = await getChatbotTokenAPI();
                // API trả về: data.data.access_token 
                const tokenForBot = chatRes.data.data.access_token;
                
                // Lưu Chat Token riêng ra
                localStorage.setItem('chatToken', tokenForBot);
                setChatToken(tokenForBot);
                
                console.log("Đã lấy được Chat Token:", tokenForBot);

            } catch (chatError) {
                console.error("Lỗi lấy token chatbot:", chatError);
                // Vẫn cho đăng nhập thành công dù lỗi chat, nhưng thông báo nhẹ
            }

            return { success: true };

        } catch (error) {
            console.error("Login Error:", error);
            return { 
                success: false, 
                message: error.response?.data?.message || "Lỗi đăng nhập" 
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('chatToken'); 
        setIsAuthenticated(false);
        setChatToken(null);
    };

    // Khi F5 trang, nạp lại cả 2 token
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const cToken = localStorage.getItem('chatToken');
        if (token) setIsAuthenticated(true);
        if (cToken) setChatToken(cToken);
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, chatToken, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};