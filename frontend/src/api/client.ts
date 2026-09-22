import * as SecureStore from 'expo-secure-store';
// import i18n from "../i18n";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  console.warn('Falta EXPO_PUBLIC_API_URL en .env');
}

export async function api(endpoint: string, options: RequestInit = {}) {
  const token = await SecureStore.getItemAsync('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 204) return null;

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.code || data.message || 'SOMETHING_WENT_WRONG');
  }

  return data;
}
