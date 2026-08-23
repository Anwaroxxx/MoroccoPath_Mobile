import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, getToken } from './src/api/client';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Button,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

type Program = {
    id: number;
    slug: string;
    name: string;
    study_mode: string;
    duration_label: string | null;
    institution: string;
    city: string | null;
};

export default function App() {
    const [ready, setReady] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [programs, setPrograms] = useState<Program[]>([]);

    useEffect(() => {
        (async () => {
            const stored = await getToken();
            if (stored) {
                await loadPrograms();
                setToken(stored);
            }
            setReady(true);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadPrograms = async () => {
        const result = await api.programs();
        setPrograms(result.data);
    };

    const login = async () => {
        setError(null);
        try {
            const result = await api.login(email.trim(), password);
            await AsyncStorage.setItem('mp_token', result.token);
            setToken(result.token);
            await loadPrograms();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Login failed');
        }
    };

    const logout = async () => {
        try {
            await api.logout();
        } catch {}
        await AsyncStorage.removeItem('mp_token');
        setToken(null);
        setPrograms([]);
    };

    if (!ready) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!token) {
        return (
            <View style={styles.form}>
                <Text style={styles.title}>MoroccoPath</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <Button title="Log in" onPress={login} />
                <Text style={styles.hint}>
                    Create your account on the MoroccoPath website first.
                </Text>
            </View>
        );
    }

    return (
        <FlatList
            style={styles.list}
            data={programs}
            keyExtractor={(item) => String(item.id)}
            ListHeaderComponent={
                <View style={styles.headerRow}>
                    <Text style={styles.title}>Published programs</Text>
                    <Pressable onPress={logout}>
                        <Text style={styles.logout}>Log out</Text>
                    </Pressable>
                </View>
            }
            renderItem={({ item }) => (
                <View style={styles.card}>
                    <Text style={styles.programName}>{item.name}</Text>
                    <Text style={styles.muted}>{item.institution}</Text>
                    <View style={styles.badgeRow}>
                        <Text style={styles.badge}>{item.study_mode.replace('_', ' ')}</Text>
                        {item.city ? <Text style={styles.badge}>{item.city}</Text> : null}
                        {item.duration_label ? (
                            <Text style={styles.badge}>{item.duration_label}</Text>
                        ) : null}
                    </View>
                </View>
            )}
        />
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center' },
    form: { flex: 1, justifyContent: 'center', padding: 24, gap: 12 },
    list: { flex: 1, backgroundColor: '#f6f7f4' },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    title: { fontSize: 22, fontWeight: '700', color: '#0e7a52' },
    input: {
        borderWidth: 1,
        borderColor: '#d5d9d3',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    error: { color: '#c0392b' },
    hint: { textAlign: 'center', color: '#777', marginTop: 8 },
    card: {
        marginHorizontal: 16,
        marginBottom: 12,
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 14,
    },
    programName: { fontSize: 16, fontWeight: '600' },
    muted: { color: '#777', marginTop: 2 },
    badgeRow: { flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' },
    badge: {
        backgroundColor: '#e8efe9',
        color: '#0e7a52',
        borderRadius: 999,
        overflow: 'hidden',
        paddingHorizontal: 8,
        paddingVertical: 2,
        fontSize: 12,
    },
    logout: { color: '#0e7a52', fontWeight: '600' },
});
