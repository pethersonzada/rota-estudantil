import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function Perfil() {
    const [nome, setNome] = useState('Carregando...');
    const [tipo, setTipo] = useState('');
    const router = useRouter();

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        const nomeSalvo = await AsyncStorage.getItem('userName');
        const tipoSalvo = await AsyncStorage.getItem('userTipo');
        setNome(nomeSalvo || 'Usuário');
        setTipo(tipoSalvo || '');
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.clear();
            // O replace força o redirecionamento e limpa o histórico da pilha
            router.replace('/loginn'); 
        } catch (error) {
            Alert.alert("Erro", "Não foi possível sair.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Perfil</Text>
            <View style={styles.card}>
                <Text style={styles.label}>Nome: {nome}</Text>
                <Text style={styles.label}>Tipo de Conta: {tipo}</Text>
            </View>

            <View style={styles.botaoSair}>
                <Button title="Sair do Sistema" color="#d9534f" onPress={handleLogout} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 20, 
        justifyContent: 'center', 
        backgroundColor: '#f5f5f5' 
    },
    titulo: { 
        fontSize: 28, 
        fontWeight: 'bold', 
        marginBottom: 20, 
        textAlign: 'center' 
    },
    card: { 
        backgroundColor: '#fff', 
        padding: 20, 
        borderRadius: 10,
        marginBottom: 30
    },
    label: { 
        fontSize: 18, 
        marginVertical: 5 
    },
    botaoSair: { 
        marginTop: 20 
    }
});