import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
// Importação centralizada da URL
import { API_URL } from '../config/config'; 

export default function CadastroAluno() {
    const router = useRouter();
    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [senha, setSenha] = useState('');
    const [telefone, setTelefone] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleCadastro() {
        if (!nome || !cpf || !senha || !telefone) {
            Alert.alert("Atenção", "Preencha todos os campos para continuar.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/usuarios/cadastrar`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Bypass-Tunnel-Reminder': 'true' 
                },
                body: JSON.stringify({ 
                    nome, 
                    cpf, 
                    senha, 
                    telefone,
                    tipo: 'PASSAGEIRO', 
                    enderecoCompleto: 'Endereço Pendente', 
                    latitude: 0.0, 
                    longitude: 0.0 
                })
            });

            if (response.ok) {
                Alert.alert("Sucesso", "Passageiro registrado com sucesso!");
                router.replace('/loginn'); // Certifique-se de que o nome da rota está correto
            } else {
                Alert.alert("Erro", "O banco rejeitou o cadastro. CPF ou telefone já existem.");
            }
        } catch (error) {
            Alert.alert("Erro de Conexão", "Não foi possível alcançar o servidor.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.content}>
                <Text style={styles.titulo}>Cadastro de Passageiro</Text>
                <Text style={styles.subtitulo}>A sua jornada começa aqui</Text>
                
                <TextInput 
                    style={styles.input} 
                    placeholder="Nome Completo" 
                    onChangeText={setNome} 
                    editable={!loading}
                />
                <TextInput 
                    style={styles.input} 
                    placeholder="CPF" 
                    keyboardType="numeric" 
                    onChangeText={setCpf} 
                    editable={!loading}
                />
                <TextInput 
                    style={styles.input} 
                    placeholder="Telefone" 
                    keyboardType="phone-pad" 
                    onChangeText={setTelefone} 
                    editable={!loading}
                />
                <TextInput 
                    style={styles.input} 
                    placeholder="Senha" 
                    secureTextEntry 
                    onChangeText={setSenha} 
                    editable={!loading}
                />
                
                {loading ? (
                    <ActivityIndicator size="large" color="#354d62" />
                ) : (
                    <Button title="CRIAR CONTA" onPress={handleCadastro} color="#354d62" />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f5f5f5' 
    },
    content: {
        flex: 1,
        padding: 25,
        justifyContent: 'center'
    },
    titulo: { 
        fontSize: 26, 
        fontWeight: 'bold', 
        color: '#354d62',
        textAlign: 'center' 
    },
    subtitulo: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
        fontStyle: 'italic'
    },
    input: { 
        backgroundColor: '#fff',
        borderWidth: 1, 
        borderColor: '#ddd', 
        padding: 15, 
        marginBottom: 15, 
        borderRadius: 10,
        fontSize: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5
    }
});