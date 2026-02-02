import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [splashLoading, setSplashLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = async (username, password) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post('/auth/login', {
                username,
                password,
            });

            const userInfo = response.data;
            await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
            await AsyncStorage.setItem('token', userInfo.token);
            setUser(userInfo);
        } catch (e) {
            console.log(e);
            setError(e.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await AsyncStorage.removeItem('userInfo');
            await AsyncStorage.removeItem('token');
            setUser(null);
        } catch (e) {
            console.log(`logout error ${e}`);
        } finally {
            setIsLoading(false);
        }
    };

    const isLoggedIn = async () => {
        try {
            setSplashLoading(true);
            const userInfo = await AsyncStorage.getItem('userInfo');
            const token = await AsyncStorage.getItem('token');

            if (userInfo && token) { // Check both
                setUser(JSON.parse(userInfo));
            }
        } catch (e) {
            console.log(`isLoggedIn error ${e}`);
        } finally {
            setSplashLoading(false);
        }
    };

    useEffect(() => {
        isLoggedIn();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                isLoading,
                user,
                splashLoading,
                error,
                login,
                logout,
            }}>
            {children}
        </AuthContext.Provider>
    );
};
