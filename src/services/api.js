import axios from 'axios';
// import dotenv from 'dotenv';

// dotenv.config({
//   path: '.env',
// });


const instance = axios.create({
    baseURL: import.meta.env.VITE_URL_SERVER,

    headers: {
        'Content-Type': 'application/json',
    },
});

instance.interceptors.request.use(
    (config) => {
        if (!config.headers['Authorization']) {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default instance;