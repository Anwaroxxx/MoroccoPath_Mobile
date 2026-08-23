/**
 * MoroccoPath API v1 client.
 *
 * Base URL is auto-detected from the Expo dev server so it works on:
 *  - Android emulator  → 10.0.2.2 (host loopback)
 *  - iOS simulator     → localhost
 *  - Physical device   → your computer's LAN IP (same Wi-Fi)
 *
 * Requires the Laravel backend to listen on all interfaces:
 *   php artisan serve --host=0.0.0.0 --port=8000
 *
 * Override manually here for production builds if needed.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const MANUAL_BASE: string | null = null;

function resolveBase(): string {
    if (MANUAL_BASE) {
        return MANUAL_BASE;
    }

    const hostUri = Constants.expoConfig?.hostUri; // e.g. "192.168.1.20:8081"
    const host = hostUri?.split(':')[0] ?? '10.0.2.2';

    return `http://${host}:8000/api/v1`;
}

export const API_BASE = resolveBase();

const TOKEN_KEY = 'mp_token';

export async function getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token: string | null): Promise<void> {
    if (token === null) {
        await AsyncStorage.removeItem(TOKEN_KEY);
    } else {
        await AsyncStorage.setItem(TOKEN_KEY, token);
    }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = await getToken();
    const response = await fetch(`${API_BASE}${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(init.headers ?? {}),
        },
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            (payload as { message?: string }).message ?? `Request failed (${response.status})`,
        );
    }

    return payload as T;
}

export type LoginResult = { token: string; user: { id: number; name: string; email: string } };

export const api = {
    login: (email: string, password: string) =>
        request<LoginResult>('/auth/token', {
            method: 'POST',
            body: JSON.stringify({ email, password, device_name: 'mobile-app' }),
        }),

    logout: () => request<{ message: string }>('/auth/token', { method: 'DELETE' }),

    programs: (query = '') =>
        request<{
            data: Array<{
                id: number;
                slug: string;
                name: string;
                study_mode: string;
                duration_label: string | null;
                institution: string;
                city: string | null;
            }>;
            meta: { current_page: number; last_page: number; total: number };
        }>(`/programs${query ? `?${query}` : ''}`),

    saveProfile: (profile: Record<string, unknown>) =>
        request<{ data: unknown }>('/me/profile', {
            method: 'PATCH',
            body: JSON.stringify(profile),
        }),

    recommendations: () =>
        request<{
            data: Array<{
                program: { slug: string; name: string };
                match_score: number | null;
                eligible: boolean;
                reasons: string[];
                missing_requirements: string[];
            }>;
        }>('/recommendations'),
};
