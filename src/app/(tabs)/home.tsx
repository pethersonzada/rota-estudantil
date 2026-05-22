import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/config';

fetch(`${API_URL}/usuarios/passageiros`, { 
    headers: { 'bypass-tunnel-reminder': 'true' } 
})

export default function Home() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState({ id: '', nome: '', tipo: '' });
    const [passageiros, setPassageiros] = useState<any[]>([]);
    const [vanAtiva, setVanAtiva] = useState(false);

    useEffect(() => {
        carregarDados();
    }, []);

    async function carregarDados() {
        const id = await AsyncStorage.getItem('userId') || '';
        const nome = await AsyncStorage.getItem('userName') || 'Usuário';
        const tipo = await AsyncStorage.getItem('userTipo') || '';
        setUser({ id, nome, tipo });

        fetch(`${API_URL}/usuarios/passageiros`, { headers: { 'bypass-tunnel-reminder': 'true' } })
            .then(res => res.json())
            .then(data => setPassageiros(data))
            .catch(console.log);

        fetch(`${API_URL}/van/status`).then(res => res.json()).then(setVanAtiva).catch(() => setVanAtiva(false));
        
        setLoading(false);
    }

    if (loading) return <ActivityIndicator size="large" color="#2563eb" style={{ flex: 1 }} />;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            
            <View style={styles.header}>
                <Text style={styles.welcome}>Olá, {user.nome.split(' ')[0]}</Text>
                <Text style={styles.subtext}>{user.tipo === 'MOTORISTA' ? 'Gerenciando a frota' : 'Acompanhando seu trajeto'}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {user.tipo === 'MOTORISTA' ? (
                    <>
                        <TouchableOpacity style={styles.cardAction} onPress={() => router.push('/chamada')}>
                            <Ionicons name="list-outline" size={24} color="#2563eb" />
                            <Text style={styles.cardTitle}>Lista de Chamada</Text>
                        </TouchableOpacity>

                        <Text style={styles.sectionTitle}>Passageiros Cadastrados</Text>
                        <View style={styles.cardList}>
                            {passageiros.map(p => (
                                <View key={p.id} style={styles.listItem}>
                                    <Text style={styles.listText}>{p.nome}</Text>
                                </View>
                            ))}
                        </View>

                        <Text style={styles.sectionTitle}>Iniciar Rota</Text>
                        <TouchableOpacity style={[styles.btnRota, styles.btnIda]} onPress={() => router.push('/mapa?sentido=ida')}>
                            <Text style={styles.btnText}>ROTA DE IDA</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btnRota, styles.btnVolta]} onPress={() => router.push('/mapa?sentido=volta')}>
                            <Text style={styles.btnText}>ROTA DE VOLTA</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Text style={styles.sectionTitle}>Status do Trajeto</Text>
                        {vanAtiva ? (
                            <TouchableOpacity style={styles.btnMapaAtivo} onPress={() => router.push('/mapa?sentido=ida')}>
                                <Ionicons name="map-outline" size={24} color="#fff" />
                                <Text style={styles.btnText}>VISUALIZAR MAPA AO VIVO</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.cardInativo}>
                                <Text style={styles.inativoText}>A van ainda não iniciou o trajeto.</Text>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { padding: 30, paddingTop: 60, backgroundColor: '#ffffff' },
    welcome: { fontSize: 32, fontWeight: '800', color: '#1e293b' },
    subtext: { fontSize: 16, color: '#64748b' },
    scrollContent: { padding: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginVertical: 20 },
    cardAction: { backgroundColor: '#ffffff', padding: 20, borderRadius: 15, flexDirection: 'row', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0' },
    cardTitle: { marginLeft: 15, fontSize: 16, fontWeight: '600', color: '#1e293b' },
    cardList: { backgroundColor: '#ffffff', borderRadius: 15, padding: 15, borderWidth: 1, borderColor: '#e2e8f0' },
    listItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    listText: { color: '#334155', fontSize: 16 },
    btnRota: { padding: 20, borderRadius: 15, alignItems: 'center', marginBottom: 15 },
    btnIda: { backgroundColor: '#2563eb' },
    btnVolta: { backgroundColor: '#7c3aed' },
    btnMapaAtivo: { backgroundColor: '#10b981', padding: 20, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    cardInativo: { padding: 20, backgroundColor: '#ffffff', borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
    inativoText: { color: '#94a3b8' }
});