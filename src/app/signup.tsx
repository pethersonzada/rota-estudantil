import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { TextInputMask } from 'react-native-masked-text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_URL } from '../config/config';

export default function Signup() {
    const { tipo } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    
    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmaSenha, setConfirmaSenha] = useState('');
    const [telefone, setTelefone] = useState('');
    const [codigoAcesso, setCodigoAcesso] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSenha, setShowSenha] = useState(false);

    const tipoUsuario = (tipo as string) || 'PASSAGEIRO';

    async function handleCadastro() {
        if (!nome || !cpf || !senha || !confirmaSenha || !telefone) {
            Alert.alert("Atenção", "Preencha todos os campos.");
            return;
        }

        if (tipoUsuario === 'MOTORISTA' && codigoAcesso !== 'NOVO2026') {
            Alert.alert("Acesso Restrito", "Código de motorista inválido.");
            return;
        }

        if (senha !== confirmaSenha) {
            Alert.alert("Erro", "As senhas não coincidem.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/usuarios/cadastrar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
                body: JSON.stringify({ 
                    nome, 
                    cpf: cpf.replace(/\D/g, ''), 
                    senha, 
                    telefone: telefone.replace(/\D/g, ''), 
                    tipo: tipoUsuario, 
                    enderecoCompleto: 'Endereço Pendente', 
                    latitude: 0.0, 
                    longitude: 0.0 
                })
            });

            if (response.ok) {
                Alert.alert("Sucesso", "Conta criada com sucesso!");
                router.replace('/login');
            } else {
                Alert.alert("Erro", "Não foi possível realizar o cadastro.");
            }
        } catch (error) {
            Alert.alert("Erro de Conexão", "Verifique o servidor.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
                <ScrollView 
                    contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 }]} 
                    showsVerticalScrollIndicator={false}
                >
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#1e293b" />
                    </TouchableOpacity>

                    <Text style={styles.titulo}>Cadastro {tipoUsuario.charAt(0) + tipoUsuario.slice(1).toLowerCase()}</Text>
                    <Text style={styles.subtitulo}>Preencha seus dados para começar</Text>
                    
                    {tipoUsuario === 'MOTORISTA' && (
                        <View style={[styles.inputContainer, { borderColor: '#d97706', backgroundColor: '#fffbeb' }]}>
                            <Ionicons name="key-outline" size={20} color="#d97706" style={styles.inputIcon} />
                            <TextInput 
                                style={styles.input} 
                                placeholder="Código de Autorização" 
                                placeholderTextColor="#92400e"
                                onChangeText={setCodigoAcesso}
                                secureTextEntry
                            />
                        </View>
                    )}

                    <View style={styles.inputContainer}>
                        <Ionicons name="person-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                        <TextInput style={styles.input} placeholder="Nome Completo" placeholderTextColor="#94a3b8" onChangeText={setNome} />
                    </View>

                    <View style={styles.inputContainer}>
                        <Ionicons name="card-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                        <TextInputMask type={'cpf'} style={styles.input} placeholder="CPF" placeholderTextColor="#94a3b8" keyboardType="numeric" value={cpf} onChangeText={setCpf} />
                    </View>

                    <View style={styles.inputContainer}>
                        <Ionicons name="call-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                        <TextInputMask type={'cel-phone'} options={{ withDDD: true, dddMask: '(99) ' }} style={styles.input} placeholderTextColor="#94a3b8" placeholder="Telefone" keyboardType="numeric" value={telefone} onChangeText={setTelefone} />
                    </View>

                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                        <TextInput style={styles.input} placeholder="Senha" placeholderTextColor="#94a3b8" secureTextEntry={!showSenha} onChangeText={setSenha} />
                    </View>

                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                        <TextInput style={styles.input} placeholder="Confirmar Senha" placeholderTextColor="#94a3b8" secureTextEntry={!showSenha} onChangeText={setConfirmaSenha} />
                        <TouchableOpacity onPress={() => setShowSenha(!showSenha)} style={styles.eyeIcon}>
                            <Ionicons name={showSenha ? "eye-off" : "eye"} size={20} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle-outline" size={20} color="#2563eb" />
                        <Text style={styles.infoText}>
                            O endereço será configurado posteriormente no seu perfil.
                        </Text>
                    </View>
                    
                    <TouchableOpacity style={styles.btnPrimary} onPress={handleCadastro} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>CRIAR CONTA</Text>}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    content: { flexGrow: 1, padding: 30, justifyContent: 'center' },
    backBtn: { width: 45, height: 45, backgroundColor: '#fff', borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0' },
    titulo: { fontSize: 28, fontWeight: '800', color: '#1e293b', marginBottom: 10, textAlign: 'center' },
    subtitulo: { fontSize: 16, color: '#64748b', marginBottom: 30, textAlign: 'center', lineHeight: 22 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 15 },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, paddingVertical: 18, fontSize: 16, color: '#1e293b' },
    eyeIcon: { padding: 10 },
    infoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#bfdbfe' },
    infoText: { flex: 1, color: '#1e40af', fontSize: 13, marginLeft: 10, fontWeight: '500' },
    btnPrimary: { backgroundColor: '#2563eb', padding: 20, borderRadius: 15, alignItems: 'center', marginTop: 10 },
    btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 }
});