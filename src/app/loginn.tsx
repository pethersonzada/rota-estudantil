import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { API_URL } from '.././config/config';

export default function Login() {
    const router = useRouter();
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
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Bypass-Tunnel-Reminder': 'true' 
                },
                body: JSON.stringify({ cpf, senha })
            });

            if (response.ok) {
                const data = await response.json();
                await AsyncStorage.setItem('userId', String(data.id));
                await AsyncStorage.setItem('userName', data.nome);
                await AsyncStorage.setItem('userTipo', data.tipo);
                await AsyncStorage.setItem('userEndereco', data.endereco || '');
                
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
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            
            <View style={styles.content}>
                <View style={styles.logoBox}>
                    <Ionicons name="bus" size={48} color="#2563eb" />
                </View>

                <Text style={styles.title}>Bem-vindo de volta</Text>
                <Text style={styles.subtitle}>Entre com seus dados para acessar o sistema.</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>CPF</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="000.000.000-00"
                        keyboardType="numeric"
                        value={cpf}
                        onChangeText={setCpf}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Senha</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="••••••"
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
                        <TouchableOpacity onPress={() => router.push({ pathname: '/signup', params: { tipo: 'PASSAGEIRO' } })}>
                            <Text style={styles.linkText}>Cadastrar Aluno</Text>
                        </TouchableOpacity>
                        <Text style={styles.text}> ou </Text>
                        <TouchableOpacity onPress={() => router.push({ pathname: '/signup', params: { tipo: 'MOTORISTA' } })}>
                            <Text style={styles.linkText}>Motorista</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc', justifyContent: 'center' },
    content: { padding: 30 },
    logoBox: { 
        width: 90, height: 90, backgroundColor: '#eff6ff', 
        borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 30 
    },
    title: { fontSize: 32, fontWeight: '800', color: '#1e293b', marginBottom: 10 },
    subtitle: { fontSize: 16, color: '#64748b', marginBottom: 40, lineHeight: 24 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 13, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 },
    input: { 
        backgroundColor: '#ffffff', padding: 18, borderRadius: 15, fontSize: 16, 
        borderWidth: 1, borderColor: '#e2e8f0', color: '#1e293b' 
    },
    button: { backgroundColor: '#2563eb', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
    registerContainer: { marginTop: 30, alignItems: 'center' },
    row: { flexDirection: 'row', marginTop: 5 },
    text: { color: "#64748b", fontSize: 14 },
    linkText: { color: "#2563eb", fontWeight: "bold", fontSize: 14, marginHorizontal: 5 }
});