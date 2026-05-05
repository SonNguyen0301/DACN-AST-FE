// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import { loginAPI } from '../services/authService';
import { getChatbotTokenAPI } from '../services/chatService';
import api from '../services/api';

import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return !!localStorage.getItem('accessToken');
    });

    const [chatToken, setChatToken] = useState(() => {
        return localStorage.getItem('chatToken') || null;
    });
    
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const avatarUrl = localStorage.getItem('userAvatarUrl');
                return avatarUrl ? { ...decoded, avatarUrl } : decoded;
            } catch (error) {
                console.error("Token lỗi khi reload:", error);
                return null;
            }
        }
        return null;
    });

    const login = async (email,password,rememberMe = false) => {
        try {
            // --- GIAI ĐOẠN 1: LẤY USER TOKEN ---
            const userRes = await loginAPI(email, password);
            const userToken = userRes.data.data.accessToken; 

            const decodedUser = jwtDecode(userToken);

            // Lưu token trước để interceptor có thể dùng
            localStorage.setItem('accessToken', userToken);
            setIsAuthenticated(true);

            const storage = rememberMe ? localStorage : sessionStorage;
            storage.setItem('accessToken', userToken);

            // --- GIAI ĐOẠN 2: LẤY AVATAR TỪ PROFILE ---
            try {
                const profileRes = await api.get('/users/info');
                const avatarUrl = profileRes.data?.data?.avatarUrl || null;
                localStorage.setItem('userAvatarUrl', avatarUrl || '');
                setUser({ ...decodedUser, avatarUrl });
            } catch {
                localStorage.removeItem('userAvatarUrl');
                setUser(decodedUser);
            }

            // --- GIAI ĐOẠN 3: LẤY CHATBOT TOKEN ---
            try {
                const chatRes = await getChatbotTokenAPI();
                // API trả về: data.data.access_token (theo mẫu bạn cung cấp)
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
        localStorage.removeItem('userAvatarUrl');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('chatToken');
        setIsAuthenticated(false);
        setChatToken(null);
        setUser(null);
    };

    const updateUser = (newInfo) => {
        if (newInfo.avatarUrl !== undefined) {
            localStorage.setItem('userAvatarUrl', newInfo.avatarUrl);
        }
        setUser((prevUser) => ({
            ...prevUser,
            ...newInfo
        }));
    };

    // Khi F5 trang, nạp lại cả 2 token
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const cToken = localStorage.getItem('chatToken');
        if (token) {
            setIsAuthenticated(true);
            try {
                const decodedUser = jwtDecode(token);
                const savedAvatarUrl = localStorage.getItem('userAvatarUrl');
                setUser(savedAvatarUrl ? { ...decodedUser, avatarUrl: savedAvatarUrl } : decodedUser);
            } catch (error) {
                console.error("Token không hợp lệ:", error);
                logout();
            }
        }
        if (cToken) setChatToken(cToken);
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, chatToken, login, logout, user, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};