import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function Perfil() {
    const [nome, setNome] = useState('');
    const [tipo, setTipo] = useState('');
    const router = useRouter();

    useEffect(() => {
        const carregarDados = async () => {
            const userName = await AsyncStorage.getItem('userName');
            const userTipo = await AsyncStorage.getItem('userTipo');
            setNome(userName || 'Usuário');
            setTipo(userTipo || 'Não definido');
        };
        carregarDados();
    }, []);

    const handleSair = async () => {
        Alert.alert("Sair", "Deseja encerrar a sessão?", [
            { text: "Cancelar", style: "cancel" },
            { text: "Sair", style: "destructive", onPress: async () => {
                await AsyncStorage.clear();
                router.replace('/loginn'); 
            }}
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            
            <View style={styles.header}>
                <Text style={styles.titulo}>Perfil</Text>
                <Text style={styles.subtitulo}>Gerencie seus dados e localização</Text>
            </View>
            
            <View style={styles.card}>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Nome</Text>
                    <Text style={styles.valor}>{nome}</Text>
                </View>
                
                <View style={styles.linha} />
                
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Tipo de Conta</Text>
                    <Text style={styles.valor}>{tipo}</Text>
                </View>
            </View>

            <TouchableOpacity 
                style={styles.botaoMapa} 
                onPress={() => router.push('/CadastroEndereco')}
            >
                <Ionicons name="location-outline" size={20} color="#fff" />
                <Text style={styles.textoBotaoMapa}>Definir Local de Saída</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.botaoSair} onPress={handleSair}>
                <Text style={styles.textoBotaoSair}>Sair da Conta</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({ 
    container: { flex: 1, backgroundColor: '#f8fafc', padding: 25 }, 
    header: { marginBottom: 30, marginTop: 40 },
    titulo: { fontSize: 32, fontWeight: '800', color: '#1e293b', textAlign: 'center' },
    subtitulo: { fontSize: 16, color: '#64748b', marginTop: 5, textAlign: 'center' },
    card: { 
        backgroundColor: '#fff', 
        padding: 25, 
        borderRadius: 20, 
        marginBottom: 30, 
        borderWidth: 1, 
        borderColor: '#e2e8f0'
    },
    infoRow: { marginBottom: 15 },
    label: { fontSize: 13, color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: 0.5 },
    valor: { fontSize: 18, color: '#1e293b', fontWeight: '600', marginTop: 4 },
    linha: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 15 },
    botaoMapa: { 
        backgroundColor: '#2563eb', 
        paddingVertical: 18, 
        borderRadius: 15, 
        flexDirection: 'row', 
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15 
    },
    textoBotaoMapa: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
    botaoSair: { 
        backgroundColor: '#f52020', 
        paddingVertical: 18, 
        borderRadius: 15, 
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },
    textoBotaoSair: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' }
});