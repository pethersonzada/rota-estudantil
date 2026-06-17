import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_URL } from '../config/config';

export default function HomeMotorista() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [nome, setNome] = useState('');
    const [passageiros, setPassageiros] = useState<any[]>([]);

    const [viagemAtiva, setViagemAtiva] = useState(false);

    useFocusEffect(
        useCallback(() => {
            carregarDados();
        }, [])
    );

    async function carregarDados() {
        setLoading(true);
        const userName = await AsyncStorage.getItem('userName') || 'Motorista';
        setNome(userName.split(' ')[0]);
        await buscarPassageiros();
        await checarAmnesia();
        setLoading(false);
    }

    async function buscarPassageiros() {
        try {
            const res = await fetch(`${API_URL}/usuarios/passageiros`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            if (!res.ok) throw new Error("Erro na requisição");
            const data = await res.json();
            setPassageiros(data);
        } catch (e) {
            Alert.alert("Erro", "Falha estrutural ao buscar a lista de passageiros.");
        }
    }

    async function checarAmnesia() {
        try {
            const res = await fetch(`${API_URL}/rota/status-atual`);
            if (res.ok) {
                const data = await res.json();
                setViagemAtiva(data.status === 'ATIVA');
            }
        } catch (e) {
            console.log("O servidor silenciou.");
        }
    }

    async function handleRefresh() {
        setIsRefreshing(true);
        await buscarPassageiros();
        await checarAmnesia();
        setIsRefreshing(false);
    }

    const totalPassageiros = passageiros.length;
    const totalRespostas = passageiros.filter(p => p.status !== null && p.status !== '' && p.status !== undefined).length;
    const todosResponderam = totalPassageiros > 0 && totalRespostas === totalPassageiros;

    const iniciarRota = (sentido: string) => {
        if (viagemAtiva) {
            router.push(`/mapa?sentido=${sentido.toLowerCase()}`);
            return;
        }

        if (!todosResponderam) {
            Alert.alert(
                "Passageiros Pendentes",
                "Ainda existem alunos que não confirmaram. Deseja acessar o mapa mesmo assim?",
                [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Acessar", onPress: () => router.push(`/mapa?sentido=${sentido.toLowerCase()}`) }
                ]
            );
        } else {
            router.push(`/mapa?sentido=${sentido.toLowerCase()}`);
        }
    };

    if (loading) return <ActivityIndicator size="large" color="#2563eb" style={{ flex: 1, backgroundColor: '#f1f5f9' }} />;

    return (
        <View style={styles.container}>
            <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
                <Text style={styles.dateText}>{new Date().toLocaleDateString('pt-BR', { month: 'long', day: 'numeric' })}</Text>
                <Text style={styles.welcome}>Olá, {nome}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {viagemAtiva && (
                    <TouchableOpacity
                        style={styles.bannerAtivo}
                        onPress={() => router.push('/mapa')}
                    >
                        <Ionicons name="map" size={28} color="#fff" style={{ marginRight: 15 }} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.bannerTitulo}>ROTA EM ANDAMENTO</Text>
                            <Text style={styles.bannerSub}>Toque para voltar ao radar.</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#fff" />
                    </TouchableOpacity>
                )}

                <View style={[styles.statusBox, { backgroundColor: todosResponderam ? '#059669' : '#2563eb' }]}>
                    <Text style={styles.statusTitle}>{todosResponderam ? "PRONTO PARA PARTIDA!" : "COLETANDO DADOS..."}</Text>
                    <Text style={styles.statusSubtitle}>{totalRespostas} de {totalPassageiros} passageiros responderam</Text>
                </View>

                <View style={styles.actionContainer}>
                    <Text style={styles.sectionTitle}>{viagemAtiva ? "Acessar Mapa" : "Iniciar Trajeto"}</Text>

                    <View style={styles.grid}>
                        <TouchableOpacity
                            style={[
                                styles.btnMotorista,
                                { backgroundColor: viagemAtiva ? '#94a3b8' : (todosResponderam ? '#0ea5e9' : '#f59e0b') }
                            ]}
                            onPress={() => iniciarRota('IDA')}
                            disabled={viagemAtiva}
                        >
                            <Ionicons name={viagemAtiva ? "lock-closed" : "arrow-up"} size={20} color="#fff" />
                            <Text style={styles.btnText}>IDA</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.btnMotorista,
                                { backgroundColor: viagemAtiva ? '#94a3b8' : (todosResponderam ? '#6366f1' : '#f59e0b') }
                            ]}
                            onPress={() => iniciarRota('VOLTA')}
                            disabled={viagemAtiva}
                        >
                            <Ionicons name={viagemAtiva ? "lock-closed" : "arrow-down"} size={20} color="#fff" />
                            <Text style={styles.btnText}>VOLTA</Text>
                        </TouchableOpacity>
                    </View>

                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Lista de Passageiros</Text>
                    <TouchableOpacity onPress={handleRefresh} disabled={isRefreshing}>
                        {isRefreshing ? <ActivityIndicator size="small" color="#64748b" /> : <Ionicons name="refresh" size={20} color="#64748b" />}
                    </TouchableOpacity>
                </View>

                <View style={styles.cardList}>
                    {passageiros.map(p => (
                        <View key={p.id} style={styles.listItem}>
                            <View>
                                <Text style={styles.nameText}>{p.nome}</Text>
                                <Text style={styles.subText}>{p.status ? 'Respondeu' : 'Aguardando...'}</Text>
                            </View>
                            <View style={[styles.badge, { backgroundColor: p.status ? '#dcfce7' : '#fee2e2' }]}>
                                <Text style={{ color: p.status ? '#065f46' : '#991b1b', fontSize: 12, fontWeight: 'bold' }}>
                                    {p.status || 'PENDENTE'}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9' },
    header: { padding: 30, backgroundColor: '#fff', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    welcome: { fontSize: 28, fontWeight: '800', color: '#1e293b' },
    dateText: { color: '#64748b', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 5 },
    scrollContent: { padding: 20, paddingBottom: 40 },

    bannerAtivo: { flexDirection: 'row', backgroundColor: '#10b981', padding: 20, borderRadius: 15, marginBottom: 20, alignItems: 'center', borderWidth: 1, borderColor: '#059669' },
    bannerTitulo: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.5 },
    bannerSub: { color: '#ecfdf5', fontSize: 12, marginTop: 4, lineHeight: 16 },

    statusBox: { padding: 25, borderRadius: 20, alignItems: 'center', marginBottom: 25 },
    statusTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    statusSubtitle: { color: '#fff', opacity: 0.9, marginTop: 5 },
    actionContainer: { marginBottom: 10 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#334155', marginBottom: 10, textAlign: 'center' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    btnMotorista: { padding: 18, borderRadius: 15, width: '48%', alignItems: 'center', marginBottom: 15, flexDirection: 'row', justifyContent: 'center', gap: 8 },
    btnText: { color: '#fff', fontWeight: 'bold' },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, marginTop: 15 },
    infoLabel: { fontSize: 16, fontWeight: 'bold', color: '#334155' },
    cardList: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20 },
    listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    nameText: { fontSize: 16, fontWeight: '600', color: '#334155' },
    subText: { fontSize: 12, color: '#64748b' },
    badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }
});