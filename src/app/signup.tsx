import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { API_URL } from '../config/config';

export default function Signup() {
    const { tipo } = useLocalSearchParams();
    const router = useRouter();
    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [senha, setSenha] = useState('');
    const [telefone, setTelefone] = useState('');
    const [loading, setLoading] = useState(false);

    const tipoUsuario = (tipo as string) || 'PASSAGEIRO';

    async function handleCadastro() {
        if (!nome || !cpf || !senha || !telefone) {
            Alert.alert("Atenção", "Preencha todos os campos.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/usuarios/cadastrar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
                body: JSON.stringify({ nome, cpf, senha, telefone, tipo: tipoUsuario, enderecoCompleto: 'Endereço Pendente', latitude: 0.0, longitude: 0.0 })
            });

            if (response.ok) {
                Alert.alert("Sucesso", "Conta criada com sucesso!");
                router.replace('/loginn');
            } else {
                const erro = await response.text();
                Alert.alert("Erro", erro.substring(0, 100));
            }
        } catch (error) {
            Alert.alert("Erro de Conexão", "Verifique o servidor.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.titulo}>Cadastro {tipoUsuario}</Text>
                    <Text style={styles.subtitulo}>Preencha seus dados para começar</Text>
                    
                    <TextInput style={styles.input} placeholder="Nome Completo" onChangeText={setNome} editable={!loading} />
                    <TextInput style={styles.input} placeholder="CPF" keyboardType="numeric" onChangeText={setCpf} editable={!loading} />
                    <TextInput style={styles.input} placeholder="Telefone" keyboardType="phone-pad" onChangeText={setTelefone} editable={!loading} />
                    <TextInput style={styles.input} placeholder="Senha" secureTextEntry onChangeText={setSenha} editable={!loading} />
                    
                    <TouchableOpacity style={styles.btnPrimary} onPress={handleCadastro} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>CRIAR CONTA</Text>}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9' },
    content: { flexGrow: 1, padding: 30, justifyContent: 'center' },
    titulo: { fontSize: 32, fontWeight: '800', color: '#1e293b', textAlign: 'center', marginBottom: 10 },
    subtitulo: { fontSize: 16, color: '#64748b', textAlign: 'center', marginBottom: 40 },
    input: { backgroundColor: '#fff', padding: 18, borderRadius: 15, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: '#e2e8f0' },
    btnPrimary: { backgroundColor: '#2563eb', padding: 20, borderRadius: 15, alignItems: 'center', marginTop: 10 },
    btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});