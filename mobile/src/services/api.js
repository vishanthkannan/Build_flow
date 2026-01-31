import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// UPDATE THIS WITH YOUR LOCAL IP, NOT LOCALHOST IF ON PHYSICAL DEVICE/EMULATOR
export const API_URL = 'http://10.1.132.58:5000/api';


const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
