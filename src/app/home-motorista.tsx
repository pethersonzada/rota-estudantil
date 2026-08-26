import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BotoesAcaoMotorista } from '../components/BotoesAcaoMotorista';
import { CardsTurmasMotorista } from '../components/CardsTurmasMotorista';
import { API_URL } from '../config/config';
import { homeMotoristaStyles as styles } from '../constants/homeMotoristaStyles';

export default function HomeMotorista() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [nome, setNome] = useState('');
    const [turmas, setTurmas] = useState<any[]>([]);
    const [turmaSelecionada, setTurmaSelecionada] = useState<any | null>(null);
    const [passageiros, setPassageiros] = useState<any[]>([]);
    const [viagemAtiva, setViagemAtiva] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [todosAlunos, setTodosAlunos] = useState<any[]>([]);
    const [carregandoAlunos, setCarregandoAlunos] = useState(false);

    const [modalEditarVisible, setModalEditarVisible] = useState(false);
    const [novoNomeTurma, setNovoNomeTurma] = useState('');
    const [novoTurnoTurma, setNovoTurnoTurma] = useState('');

    useFocusEffect(useCallback(() => { carregarDadosIniciais(); }, []));

    async function carregarDadosIniciais() {
        setLoading(true);
        const userName = await AsyncStorage.getItem('userName') || 'Motorista';
        const motoristaId = await AsyncStorage.getItem('userId');
        setNome(userName.split(' ')[0]);

        if (motoristaId) await buscarTurmas(motoristaId);
        await checarAmnesia();
        setLoading(false);
    }

    async function buscarTurmas(motoristaId: string) {
        try {
            const res = await fetch(`${API_URL}/turmas/motorista/${motoristaId}`, { headers: { 'Accept': 'application/json', 'Bypass-Tunnel-Reminder': 'true' } });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setTurmas(data);
            if (data.length > 0) {
                const atual = turmaSelecionada ? data.find((t: any) => t.id === turmaSelecionada.id) || data[0] : data[0];
                setTurmaSelecionada(atual);
                await buscarPassageirosPorTurma(atual.id);
            } else { setTurmaSelecionada(null); setPassageiros([]); }
        } catch (e) { Alert.alert("Erro", "Falha ao carregar as turmas."); }
    }

    async function buscarPassageirosPorTurma(turmaId: number) {
        try {
            const res = await fetch(`${API_URL}/turmas/${turmaId}/passageiros`, { headers: { 'Accept': 'application/json', 'Bypass-Tunnel-Reminder': 'true' } });
            if (res.ok) setPassageiros(await res.json());
        } catch (e) { Alert.alert("Erro", "Falha ao buscar passageiros."); }
    }

    async function checarAmnesia() {
        try {
            const res = await fetch(`${API_URL}/rota/status-atual`, { headers: { 'Bypass-Tunnel-Reminder': 'true' } });
            if (res.ok) { const data = await res.json(); setViagemAtiva(data.status === 'ATIVA'); }
        } catch (e) {}
    }

    async function abrirModalAdicionarAluno() {
        if (!turmaSelecionada) return;
        setModalVisible(true);
        setCarregandoAlunos(true);
        try {
            const res = await fetch(`${API_URL}/usuarios/passageiros/sem-turma`, { headers: { 'Bypass-Tunnel-Reminder': 'true' } });
            if (res.ok) setTodosAlunos(await res.json());
        } catch (e) { Alert.alert("Erro", "Não foi possível carregar alunos livres."); }
        finally { setCarregandoAlunos(false); }
    }

    const totalPassageiros = passageiros.length;
    const totalRespostas = passageiros.filter(p => p.status).length;
    const todosResponderam = totalPassageiros > 0 && totalRespostas === totalPassageiros;

    const iniciarRota = async (sentido: string) => {
        if (!turmaSelecionada) { Alert.alert("Atenção", "Selecione uma turma."); return; }
        if (viagemAtiva) { router.push(`/mapa?sentido=${sentido.toLowerCase()}`); return; }

        try {
            const res = await fetch(`${API_URL}/rota/iniciar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
                body: JSON.stringify({ turmaId: Number(turmaSelecionada.id), sentido: sentido })
            });
            if (!res.ok) { const err = await res.json(); throw new Error(err.erro); }

            if (!todosResponderam) {
                Alert.alert("Pendentes", "Existem alunos sem confirmar. Deseja acessar o mapa?", [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Acessar", onPress: () => router.push(`/mapa?sentido=${sentido.toLowerCase()}`) }
                ]);
            } else {
                router.push(`/mapa?sentido=${sentido.toLowerCase()}`);
            }
        } catch (e: any) { Alert.alert("Erro", e.message || "Erro ao iniciar."); }
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
                    <TouchableOpacity style={styles.bannerAtivo} onPress={() => router.push('/mapa')}>
                        <Ionicons name="map" size={28} color="#fff" style={{ marginRight: 15 }} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.bannerTitulo}>ROTA EM ANDAMENTO</Text>
                            <Text style={styles.bannerSub}>Toque para voltar ao radar.</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#fff" />
                    </TouchableOpacity>
                )}

                <CardsTurmasMotorista
                    turmas={turmas}
                    turmaSelecionada={turmaSelecionada}
                    onSelecionarTurma={async (t) => { setTurmaSelecionada(t); await buscarPassageirosPorTurma(t.id); }}
                    onEditarTurma={() => { setNovoNomeTurma(turmaSelecionada.nome); setNovoTurnoTurma(turmaSelecionada.turno); setModalEditarVisible(true); }}
                />

                {turmaSelecionada && (
                    <>
                        <View style={[styles.statusBox, { backgroundColor: todosResponderam ? '#059669' : '#2563eb' }]}>
                            <Text style={styles.statusTitle}>{todosResponderam ? "PRONTO!" : "COLETANDO..."}</Text>
                            <Text style={styles.statusSubtitle}>{turmaSelecionada.nome} ({totalRespostas}/{totalPassageiros} responderam)</Text>
                        </View>

                        <BotoesAcaoMotorista viagemAtiva={viagemAtiva} todosResponderam={todosResponderam} onIniciarRota={iniciarRota} />
                    </>
                )}

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Passageiros</Text>
                    {turmaSelecionada && (
                        <TouchableOpacity onPress={abrirModalAdicionarAluno} style={styles.btnAdd}>
                            <Ionicons name="person-add" size={18} color="#2563eb" />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.cardList}>
                    {passageiros.length === 0 ? (
                        <Text style={styles.emptyText}>Nenhum aluno vinculado.</Text>
                    ) : (
                        passageiros.map(p => (
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
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
}