import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text } from 'react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';

interface Props {
  navigation: NavigationProp<ParamListBase>;
}

export default function CadastroAluno({ navigation }: Props) {
    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [senha, setSenha] = useState('');
    const [telefone, setTelefone] = useState('');

    async function handleCadastro() {
        if (!nome || !cpf || !senha) {
            Alert.alert("Atenção", "Preencha todos os campos!");
            return;
        }

        try {
            // Substitua pela URL gerada pelo seu localtunnel
            const response = await fetch('http://SUA_URL_DO_TUNEL:8080/usuarios/cadastrar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
                Alert.alert("Sucesso", "Cadastro realizado com sucesso!");
                navigation.navigate('Login'); // Certifique-se que sua rota de login tem esse nome
            } else {
                Alert.alert("Erro", "Falha ao cadastrar. O CPF ou telefone já existem.");
            }
        } catch (error) {
            Alert.alert("Erro", "Não foi possível conectar ao servidor. Verifique o túnel.");
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Cadastro de Passageiro</Text>
            
            <TextInput style={styles.input} placeholder="Nome Completo" onChangeText={setNome} />
            <TextInput style={styles.input} placeholder="CPF" keyboardType="numeric" onChangeText={setCpf} />
            <TextInput style={styles.input} placeholder="Telefone" keyboardType="phone-pad" onChangeText={setTelefone} />
            <TextInput style={styles.input} placeholder="Senha" secureTextEntry onChangeText={setSenha} />
            
            <Button title="CRIAR CONTA" onPress={handleCadastro} color="#007bff" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
    titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 15, marginBottom: 15, borderRadius: 8 }
});