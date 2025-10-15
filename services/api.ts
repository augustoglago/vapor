import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';
import {router} from 'expo-router';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
const TOKEN_KEY = 'user_jwt_token';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 60000, //1min devido-a hibernação do render
});

export const getToken = async (): Promise<string | null> => {
    try {
        if (Platform.OS === 'android' || Platform.OS === 'ios') {
            return await SecureStore.getItemAsync(TOKEN_KEY);
        } else {
            return await AsyncStorage.getItem(TOKEN_KEY);
        }
    } catch (e) {
        console.error("Erro ao obter token do storage:", e);
        return null;
    }
}

export const saveToken = async (token: string) => {
    try {
        if (Platform.OS === 'android' || Platform.OS === 'ios') {
            await SecureStore.setItemAsync(TOKEN_KEY, token);
        } else {
            await AsyncStorage.setItem(TOKEN_KEY, token);
        }
    } catch (e) {
        console.error("Erro ao salvar token:", e);
    }
}

export const deleteToken = async () => {
    try {
        if (Platform.OS === 'android' || Platform.OS === 'ios') {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
        } else {
            await AsyncStorage.removeItem(TOKEN_KEY);
        }
    } catch (e) {
        console.error("Erro ao deletar token:", e);
    }
}

api.interceptors.request.use(
    async (config) => {
        const token = await getToken();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status;

        if (status === 401 || status === 403) {
            console.log('Sessão expirada. Redirecionando para login.');

            await deleteToken();
            router.replace('/login');

            return Promise.reject({
                ...error,
                message: 'Sessão expirada. Faça login novamente.'
            });
        }

        return Promise.reject(error);
    }
);

export default api;