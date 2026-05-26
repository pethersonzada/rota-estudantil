import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/config';

export default function Home() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState({ id: '', nome: '', tipo: '' });
    const [passageiros, setPassageiros] = useState<any[]>([]);
    const [statusConfirmado, setStatusConfirmado] = useState<string | null>(null);

    useEffect(() => { carregarDados(); }, []);

    async function carregarDados() {
        try {
            const id = await AsyncStorage.getItem('userId');
            const nome = await AsyncStorage.getItem('userName') || 'Usuário';
            const tipo = await AsyncStorage.getItem('userTipo') || '';
            if (id) setUser({ id, nome, tipo });
            
            const res = await fetch(`${API_URL}/usuarios/passageiros`);
            const data = await res.json();
            setPassageiros(data);
            const meuStatus = data.find((p: any) => p.id.toString() === id);
            setStatusConfirmado(meuStatus?.status || null);
        } catch (e) { console.log(e); }
        setLoading(false);
    }

    async function registrarPresenca(status: string) {
        const id = await AsyncStorage.getItem('userId');
        if (!id) return;

        // Atualização Otimista
        setStatusConfirmado(status === 'LIMPAR' ? null : status);

        try {
            const res = await fetch(`${API_URL}/rota/confirmar?usuarioId=${id}&status=${status}`, { method: 'POST' });
            if (!res.ok) {
                carregarDados();
                Alert.alert("Erro", "Erro ao salvar no servidor.");
            }
        } catch (e) {
            carregarDados();
        }
    }

    const totalPassageiros = passageiros.length;
    const totalRespostas = passageiros.filter(p => p.status !== null).length;
    const todosResponderam = totalPassageiros > 0 && totalRespostas === totalPassageiros;

    if (loading) return <ActivityIndicator size="large" color="#2563eb" style={{ flex: 1 }} />;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}><Text style={styles.welcome}>Olá, {user.nome.split(' ')[0]}</Text></View>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {user.tipo === 'MOTORISTA' ? (
                    <>
                        <View style={[styles.statusBox, { backgroundColor: todosResponderam ? '#dcfce7' : '#fee2e2' }]}>
                            <Text style={{ fontWeight: 'bold' }}>{todosResponderam ? "✅ TODOS RESPONDERAM" : `⚠️ AGUARDANDO (${totalRespostas}/${totalPassageiros})`}</Text>
                        </View>
                        <View style={styles.cardList}>
                            {passageiros.map(p => (
                                <View key={p.id} style={styles.listItem}>
                                    <Text>{p.nome}</Text>
                                    <Ionicons name={p.status ? "checkmark-circle" : "alert-circle"} size={22} color={p.status ? "#059669" : "#dc2626"} />
                                </View>
                            ))}
                        </View>
                        <TouchableOpacity disabled={!todosResponderam} style={[styles.btn, !todosResponderam && styles.btnDisabled]} onPress={() => router.push('/mapa?sentido=ida')}>
                            <Text style={styles.btnText}>{todosResponderam ? "INICIAR ROTA" : "PENDENTE DE RESPOSTA"}</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        {statusConfirmado ? (
                            <View style={styles.cardConfirmado}>
                                <Text>✅ Status: <Text style={{fontWeight:'bold'}}>{statusConfirmado}</Text></Text>
                                <TouchableOpacity onPress={() => registrarPresenca('LIMPAR')} style={styles.btnAlterar}><Text style={styles.btnAlterarText}>Limpar Decisão</Text></TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.grid}>
                                {['IDA', 'VOLTA', 'AMBOS', 'NAO_VOU'].map((s) => (
                                    <TouchableOpacity key={s} style={styles.btnPequeno} onPress={() => registrarPresenca(s)}><Text style={styles.btnText}>{s}</Text></TouchableOpacity>
                                ))}
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
    header: { padding: 30, paddingTop: 60, backgroundColor: '#fff' },
    welcome: { fontSize: 32, fontWeight: '800' },
    scrollContent: { padding: 20 },
    cardConfirmado: { backgroundColor: '#fff', padding: 20, borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 },
    btnAlterar: { marginTop: 10, padding: 10, backgroundColor: '#fee2e2', borderRadius: 8 },
    btnAlterarText: { color: '#dc2626', fontWeight: 'bold' },
    btn: { padding: 20, borderRadius: 15, alignItems: 'center', backgroundColor: '#2563eb' },
    btnDisabled: { backgroundColor: '#cbd5e1' },
    btnPequeno: { padding: 15, borderRadius: 10, width: '47%', alignItems: 'center', marginBottom: 10, backgroundColor: '#2563eb' },
    btnText: { color: '#fff', fontWeight: 'bold' },
    cardList: { backgroundColor: '#fff', borderRadius: 15, padding: 15, marginBottom: 20 },
    listItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
    statusBox: { padding: 20, borderRadius: 15, alignItems: 'center', marginBottom: 20 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }
});