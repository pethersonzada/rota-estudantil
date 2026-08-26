import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { TextInputMask } from 'react-native-masked-text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_URL } from '../config/config';

export default function Login() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [cpf, setCpf] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleLogin() {
        if (!cpf || !senha) {
            Alert.alert("Erro", "Preencha o CPF e a senha.");
            return;
        }

        setLoading(true);
        try {
            const cpfLimpo = cpf.replace(/\D/g, '');

            const response = await fetch(`${API_URL}/usuarios/login`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Bypass-Tunnel-Reminder': 'true' 
                },
                body: JSON.stringify({ cpf: cpfLimpo, senha: senha })
            });

            if (response.ok) {
                const data = await response.json();
                
                await AsyncStorage.multiSet([
                    ['userId', String(data.id)],
                    ['userName', data.nome || 'Usuário'],
                    ['userTipo', data.tipo || ''],
                    ['userEndereco', data.enderecoCompleto || '']
                ]);

                console.log("Login efetuado com sucesso. ID do usuário:", data.id);
                router.replace('/(tabs)/home');
            } else {
                Alert.alert("Acesso Negado", "CPF ou senha incorretos.");
            }
        } catch (error) {
            Alert.alert("Erro", "Falha na conexão com o servidor.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            
            <ScrollView 
                contentContainerStyle={[styles.content, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]} 
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.logoBox}>
                    <Image source={require('@/assets/images/logo-app-sem-title.jpeg')} style={{ width: 150, height: 150, borderRadius: 20}}/>
                </View>

                <Text style={styles.title}>Bem-vindo de Volta!</Text>
                <Text style={styles.subtitle}>Entre com seus dados para acessar o sistema.</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>CPF</Text>
                    <TextInputMask 
                        type={'cpf'}
                        style={styles.input} 
                        placeholder="000.000.000-00"
                        placeholderTextColor="#94a3b8"
                        keyboardType="numeric"
                        value={cpf}
                        onChangeText={(text) => setCpf(text)}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Senha</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="••••••"
                        placeholderTextColor="#94a3b8"
                        secureTextEntry
                        value={senha}
                        onChangeText={setSenha}
                    />
                </View>

                <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Entrar</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.registerContainer}>
                    <Text style={styles.text}>Ainda não tem conta?</Text>
                    <View style={styles.row}>
                        <Text style={styles.text}>Cadastre-se como</Text>
                        <TouchableOpacity onPress={() => router.push({ pathname: '/cadastro', params: { tipo: 'PASSAGEIRO' } })}>
                            <Text style={styles.linkText}>Passageiro</Text>
                        </TouchableOpacity>
                        <Text style={styles.text}>ou</Text>
                        <TouchableOpacity onPress={() => router.push({ pathname: '/cadastro', params: { tipo: 'MOTORISTA' } })}>
                            <Text style={styles.linkText}>Motorista</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    content: { padding: 30, flexGrow: 1, justifyContent: 'center' },
    logoBox: { 
        width: 90, height: 90, backgroundColor: '#eff6ff', 
        borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 40, alignSelf: 'center',
        borderWidth: 1, borderColor: '#dbeafe'
    },
    title: { fontSize: 32, fontWeight: '800', color: '#1e293b', marginBottom: 10, textAlign: 'center' },
    subtitle: { fontSize: 16, color: '#64748b', marginBottom: 40, lineHeight: 24, textAlign: 'center' },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 13, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 },
    input: { 
        backgroundColor: '#ffffff', padding: 18, borderRadius: 15, fontSize: 16, 
        borderWidth: 1, borderColor: '#e2e8f0', color: '#1e293b'
    },
    button: { 
        backgroundColor: '#2563eb', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 
    },
    buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
    registerContainer: { marginTop: 40, alignItems: 'center' },
    row: { flexDirection: 'row', marginTop: 8, alignItems: 'center' },
    text: { color: "#64748b", fontSize: 14 },
    linkText: { color: "#2563eb", fontWeight: "bold", fontSize: 14, marginHorizontal: 5 }
});