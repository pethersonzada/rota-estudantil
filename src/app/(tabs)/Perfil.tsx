import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Perfil() {
    const [nome, setNome] = useState('');
    const [tipo, setTipo] = useState('');
    const router = useRouter();
    const insets = useSafeAreaInsets();

    useEffect(() => {
        const carregar = async () => {
            setNome((await AsyncStorage.getItem('userName')) || 'Usuário');
            setTipo((await AsyncStorage.getItem('userTipo')) || 'Não definido');
        };
        carregar();
    }, []);

    const abrirWhatsApp = () => {
        const url = 'https://wa.me/5581991976404';
        Linking.openURL(url).catch(() => Alert.alert("Erro", "Não foi possível abrir o WhatsApp."));
    };

    const handleLogout = () => {
        Alert.alert(
            "Encerrar Sessão",
            "Você tem certeza que deseja sair do sistema?",
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Sair", 
                    style: "destructive", 
                    onPress: async () => {
                        await AsyncStorage.clear(); 
                        router.replace('/login');
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            
            <ScrollView 
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]} 
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{nome.charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={styles.nome}>{nome}</Text>
                    <View style={styles.badge}>
                        <Ionicons name="checkmark-circle" size={14} color="#fff" />
                        <Text style={styles.badgeText}> Conta Verificada</Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>TIPO DE CONTA</Text>
                        <Text style={styles.valor}>{tipo}</Text>
                    </View>
                    <View style={styles.linha} />
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>STATUS</Text>
                        <Text style={[styles.valor, { color: '#2536eb' }]}>Online</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/cadastro-endereco')}>
                    <Ionicons name="location" size={24} color="#2563eb" />
                    <Text style={styles.menuText}>Configurar Endereço</Text>
                    <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={abrirWhatsApp}>
                    <Ionicons name="headset" size={24} color="#2563eb" />
                    <Text style={styles.menuText}>Central de Ajuda</Text>
                    <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.botaoSair} onPress={handleLogout}>
                    <Text style={styles.textoBotaoSair}>Encerrar Sessão</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    scrollContent: { padding: 25 },
    header: { alignItems: 'center', marginBottom: 40 },
    avatar: { 
        width: 100, height: 100, borderRadius: 50, backgroundColor: '#2563eb', 
        justifyContent: 'center', alignItems: 'center', marginBottom: 15 
    },
    avatarText: { fontSize: 40, color: '#fff', fontWeight: 'bold' },
    nome: { fontSize: 24, fontWeight: '800', color: '#1e293b' },
    badge: { flexDirection: 'row', backgroundColor: '#2563eb', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginTop: 10, alignItems: 'center' },
    badgeText: { color: '#fff', fontSize: 12, fontWeight: '600', marginLeft: 4 },
    card: { 
        backgroundColor: '#fff', padding: 25, borderRadius: 20, marginBottom: 20, 
        borderWidth: 1, borderColor: '#e2e8f0'
    },
    infoRow: { marginBottom: 10 },
    label: { fontSize: 11, color: '#94a3b8', fontWeight: '800', letterSpacing: 0.8 },
    valor: { fontSize: 18, color: '#1e293b', fontWeight: '600', marginTop: 4 },
    linha: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 15 },
    menuItem: { 
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 20, 
        borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: '#e2e8f0'
    },
    menuText: { flex: 1, marginLeft: 15, fontSize: 16, fontWeight: '600', color: '#334155' },
    botaoSair: { marginTop: 20, alignItems: 'center', padding: 10 },
    textoBotaoSair: { color: '#ef4444', fontSize: 14, fontWeight: 'bold' }
});