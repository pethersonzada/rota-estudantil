import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function Signup() {
    const { tipo } = useLocalSearchParams();
    const router = useRouter();
    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [senha, setSenha] = useState('');
    const [telefone, setTelefone] = useState('');

    async function handleCadastro() {
        try {
            const response = await fetch('https://poor-rings-dress.loca.lt/usuarios/cadastrar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    nome, cpf, senha, telefone,
                    tipo: tipo || 'PASSAGEIRO', 
                    enderecoCompleto: 'Endereço Pendente', 
                    latitude: 0.0, longitude: 0.0 
                })
            });

            if (response.ok) {
                Alert.alert("Sucesso", "Conta criada!");
                router.replace('/loginn');
            } else {
                Alert.alert("Erro", "Falha ao cadastrar.");
            }
        } catch (error) {
            Alert.alert("Erro", "Sem conexão.");
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Cadastro de {tipo || 'Passageiro'}</Text>
            <TextInput style={styles.input} placeholder="Nome" onChangeText={setNome} />
            <TextInput style={styles.input} placeholder="CPF" keyboardType="numeric" onChangeText={setCpf} />
            <TextInput style={styles.input} placeholder="Telefone" onChangeText={setTelefone} />
            <TextInput style={styles.input} placeholder="Senha" secureTextEntry onChangeText={setSenha} />
            <Button title="CRIAR CONTA" onPress={handleCadastro} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
    titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 15, marginBottom: 15, borderRadius: 8 }
});