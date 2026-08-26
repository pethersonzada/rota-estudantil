import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_URL } from '../config/config';

type Turma = {
    id: number;
    nome: string;
    turno: string;
};

type Aluno = {
    id: number;
    nome: string;
    tipo: string;
};

export default function HomeMotorista() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [nome, setNome] = useState('');
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [turmaSelecionada, setTurmaSelecionada] = useState<Turma | null>(null);
    const [passageiros, setPassageiros] = useState<any[]>([]);
    const [viagemAtiva, setViagemAtiva] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [todosAlunos, setTodosAlunos] = useState<Aluno[]>([]);
    const [carregandoAlunos, setCarregandoAlunos] = useState(false);

    const [modalEditarVisible, setModalEditarVisible] = useState(false);
    const [novoNomeTurma, setNovoNomeTurma] = useState('');
    const [novoTurnoTurma, setNovoTurnoTurma] = useState('');

    useFocusEffect(
        useCallback(() => {
            carregarDadosIniciais();
        }, [])
    );

    async function carregarDadosIniciais() {
        setLoading(true);
        const userName = await AsyncStorage.getItem('userName') || 'Motorista';
        const motoristaId = await AsyncStorage.getItem('userId');
        setNome(userName.split(' ')[0]);

        if (motoristaId) {
            await buscarTurmas(motoristaId);
        }
        await checarAmnesia();
        setLoading(false);
    }

    async function buscarTurmas(motoristaId: string) {
        try {
            const res = await fetch(`${API_URL}/turmas/motorista/${motoristaId}`, {
                method: 'GET',
                headers: { 
                    'Accept': 'application/json',
                    'Bypass-Tunnel-Reminder': 'true'
                }
            });
            if (!res.ok) throw new Error("Erro ao buscar turmas");
            const data = await res.json();
            setTurmas(data);
            
            if (data.length > 0) {
                // Mantém a selecionada atual se existir, senão pega a primeira
                const atual = turmaSelecionada ? data.find((t: Turma) => t.id === turmaSelecionada.id) || data[0] : data[0];
                setTurmaSelecionada(atual);
                await buscarPassageirosPorTurma(atual.id);
            } else {
                setTurmaSelecionada(null);
                setPassageiros([]);
            }
        } catch (e) {
            Alert.alert("Erro", "Falha ao carregar as turmas do motorista.");
        }
    }

    async function buscarPassageirosPorTurma(turmaId: number) {
        try {
            const res = await fetch(`${API_URL}/turmas/${turmaId}/passageiros`, {
                method: 'GET',
                headers: { 
                    'Accept': 'application/json',
                    'Bypass-Tunnel-Reminder': 'true'
                }
            });
            if (!res.ok) throw new Error("Erro na requisicao");
            const data = await res.json();
            setPassageiros(data);
        } catch (e) {
            Alert.alert("Erro", "Falha ao buscar a lista de passageiros.");
        }
    }

    async function selecionarTurma(turma: Turma) {
        setTurmaSelecionada(turma);
        await buscarPassageirosPorTurma(turma.id);
    }

    async function checarAmnesia() {
        try {
            const res = await fetch(`${API_URL}/rota/status-atual`, {
                headers: {
                    'Bypass-Tunnel-Reminder': 'true'
                }
            });
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
        const motoristaId = await AsyncStorage.getItem('userId');
        if (motoristaId) {
            await buscarTurmas(motoristaId);
            if (turmaSelecionada) {
                await buscarPassageirosPorTurma(turmaSelecionada.id);
            }
        }
        await checarAmnesia();
        setIsRefreshing(false);
    }

    async function abrirModalAdicionarAluno() {
        if (!turmaSelecionada) return;
        setModalVisible(true);
        setCarregandoAlunos(true);
        try {
            const res = await fetch(`${API_URL}/usuarios/passageiros/sem-turma`, {
                headers: { 'Bypass-Tunnel-Reminder': 'true' }
            });
            if (res.ok) {
                const data = await res.json();
                setTodosAlunos(data);
            }
        } catch (e) {
            Alert.alert("Erro", "Não foi possível carregar a lista de alunos livres.");
        } finally {
            setCarregandoAlunos(false);
        }
    }

    async function adicionarAlunoTurma(alunoId: number) {
        if (!turmaSelecionada) return;
        try {
            const res = await fetch(`${API_URL}/turmas/${turmaSelecionada.id}/alunos/${alunoId}`, {
                method: 'POST',
                headers: { 'Bypass-Tunnel-Reminder': 'true' }
            });
            if (!res.ok) throw new Error("Erro ao vincular aluno");
            
            Alert.alert("Sucesso", "Aluno adicionado à turma com sucesso!");
            setModalVisible(false);
            await buscarPassageirosPorTurma(turmaSelecionada.id);
        } catch (e) {
            Alert.alert("Erro", "Não foi possível vincular o aluno.");
        }
    }

    function abrirModalEditarTurma() {
        if (!turmaSelecionada) return;
        setNovoNomeTurma(turmaSelecionada.nome);
        setNovoTurnoTurma(turmaSelecionada.turno);
        setModalEditarVisible(true);
    }

    async function salvarEdicaoTurma() {
        if (!turmaSelecionada) return;
        if (!novoNomeTurma.trim() || !novoTurnoTurma.trim()) {
            Alert.alert("Atenção", "Preencha todos os campos da turma.");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/turmas/${turmaSelecionada.id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Bypass-Tunnel-Reminder': 'true'
                },
                body: JSON.stringify({
                    nome: novoNomeTurma,
                    turno: novoTurnoTurma
                })
            });

            if (!res.ok) throw new Error("Erro ao atualizar turma");

            Alert.alert("Sucesso", "Turma atualizada com sucesso!");
            setModalEditarVisible(false);
            const motoristaId = await AsyncStorage.getItem('userId');
            if (motoristaId) {
                await buscarTurmas(motoristaId);
            }
        } catch (e) {
            Alert.alert("Erro", "Não foi possível atualizar a turma.");
        }
    }

    const totalPassageiros = passageiros.length;
    const totalRespostas = passageiros.filter(p => p.status !== null && p.status !== '' && p.status !== undefined).length;
    const todosResponderam = totalPassageiros > 0 && totalRespostas === totalPassageiros;

    const iniciarRota = async (sentido: string) => {
        if (!turmaSelecionada) {
            Alert.alert("Atenção", "Selecione uma turma antes de iniciar a viagem.");
            return;
        }

        if (viagemAtiva) {
            router.push(`/mapa?sentido=${sentido.toLowerCase()}`);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/rota/iniciar`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Bypass-Tunnel-Reminder': 'true'
                },
                body: JSON.stringify({
                    turmaId: turmaSelecionada.id,
                    sentido: sentido
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.erro || "Erro ao iniciar rota");
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
        } catch (e: any) {
            Alert.alert("Erro", e.message || "Não foi possível iniciar a rota.");
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

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <Text style={styles.sectionTitle}>Selecione a Turma / Rota</Text>
                    {turmaSelecionada && (
                        <TouchableOpacity onPress={abrirModalEditarTurma} style={styles.btnEditarTurma}>
                            <Ionicons name="pencil" size={14} color="#2563eb" />
                            <Text style={styles.btnEditarTurmaText}>Editar nome/turno</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.turmasScroll}>
                    {turmas.map(t => {
                        const selecionada = turmaSelecionada?.id === t.id;
                        return (
                            <TouchableOpacity
                                key={t.id}
                                style={[styles.turmaCard, selecionada && styles.turmaCardSelecionada]}
                                onPress={() => selecionarTurma(t)}
                            >
                                <Ionicons name="bus" size={20} color={selecionada ? '#fff' : '#2563eb'} />
                                <Text style={[styles.turmaNome, selecionada && styles.turmaNomeSelecionada]}>{t.nome}</Text>
                                <Text style={[styles.turmaTurno, selecionada && styles.turmaTurnoSelecionada]}>{t.turno}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {turmaSelecionada && (
                    <>
                        <View style={[styles.statusBox, { backgroundColor: todosResponderam ? '#059669' : '#2563eb' }]}>
                            <Text style={styles.statusTitle}>{todosResponderam ? "PRONTO PARA PARTIDA!" : "COLETANDO DADOS..."}</Text>
                            <Text style={styles.statusSubtitle}>Turma: {turmaSelecionada.nome} ({totalRespostas} de {totalPassageiros} responderam)</Text>
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
                    </>
                )}

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Lista de Passageiros</Text>
                    <View style={{ flexDirection: 'row', gap: 15, alignItems: 'center' }}>
                        {turmaSelecionada && (
                            <TouchableOpacity onPress={abrirModalAdicionarAluno} style={styles.btnAdd}>
                                <Ionicons name="person-add" size={18} color="#2563eb" />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={handleRefresh} disabled={isRefreshing}>
                            {isRefreshing ? <ActivityIndicator size="small" color="#64748b" /> : <Ionicons name="refresh" size={20} color="#64748b" />}
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.cardList}>
                    {passageiros.length === 0 ? (
                        <Text style={styles.emptyText}>Nenhum aluno vinculado a esta turma.</Text>
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

            {/* Modal para Adicionar Aluno */}
            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Adicionar Aluno à Turma</Text>
                        <Text style={styles.modalSub}>{turmaSelecionada?.nome}</Text>

                        {carregandoAlunos ? (
                            <ActivityIndicator size="large" color="#2563eb" style={{ marginVertical: 20 }} />
                        ) : (
                            <ScrollView style={{ maxHeight: 300, marginVertical: 15 }}>
                                {todosAlunos.length === 0 ? (
                                    <Text style={styles.emptyText}>Nenhum aluno livre disponível para vincular.</Text>
                                ) : (
                                    todosAlunos.map(aluno => (
                                        <TouchableOpacity 
                                            key={aluno.id} 
                                            style={styles.modalItem}
                                            onPress={() => adicionarAlunoTurma(aluno.id)}
                                        >
                                            <Ionicons name="person" size={18} color="#2563eb" />
                                            <Text style={styles.modalItemText}>{aluno.nome}</Text>
                                            <Ionicons name="add-circle" size={22} color="#059669" />
                                        </TouchableOpacity>
                                    ))
                                )}
                            </ScrollView>
                        )}

                        <TouchableOpacity 
                            style={styles.btnCloseModal} 
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.btnCloseModalText}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal para Editar Turma */}
            <Modal visible={modalEditarVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Editar Turma</Text>
                        <Text style={styles.modalSub}>Altere as informações da rota</Text>

                        <View style={{ marginVertical: 15 }}>
                            <Text style={styles.inputLabel}>Nome da Turma</Text>
                            <TextInput
                                style={styles.input}
                                value={novoNomeTurma}
                                onChangeText={setNovoNomeTurma}
                                placeholder="Ex: Escola Dom Bosco"
                            />

                            <Text style={styles.inputLabel}>Turno</Text>
                            <TextInput
                                style={styles.input}
                                value={novoTurnoTurma}
                                onChangeText={setNovoTurnoTurma}
                                placeholder="Ex: Manhã / Noite"
                            />
                        </View>

                        <TouchableOpacity 
                            style={styles.btnSalvarTurma} 
                            onPress={salvarEdicaoTurma}
                        >
                            <Text style={styles.btnSalvarTurmaText}>Salvar Alterações</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.btnCloseModal} 
                            onPress={() => setModalEditarVisible(false)}
                        >
                            <Text style={styles.btnCloseModalText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    turmasScroll: { marginBottom: 20 },
    turmaCard: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginRight: 12, width: 140, borderWidth: 1, borderColor: '#e2e8f0', justifyContent: 'center' },
    turmaCardSelecionada: { backgroundColor: '#2563eb', borderColor: '#1d4ed8' },
    turmaNome: { fontWeight: 'bold', color: '#1e293b', marginTop: 8, fontSize: 14 },
    turmaNomeSelecionada: { color: '#fff' },
    turmaTurno: { fontSize: 12, color: '#64748b', marginTop: 2 },
    turmaTurnoSelecionada: { color: '#bfdbfe' },
    statusBox: { padding: 25, borderRadius: 20, alignItems: 'center', marginBottom: 25 },
    statusTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    statusSubtitle: { color: '#fff', opacity: 0.9, marginTop: 5 },
    actionContainer: { marginBottom: 10 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#334155' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    btnMotorista: { padding: 18, borderRadius: 15, width: '48%', alignItems: 'center', marginBottom: 15, flexDirection: 'row', justifyContent: 'center', gap: 8 },
    btnText: { color: '#fff', fontWeight: 'bold' },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, marginTop: 15 },
    infoLabel: { fontSize: 16, fontWeight: 'bold', color: '#334155' },
    btnAdd: { backgroundColor: '#eff6ff', padding: 8, borderRadius: 10, borderWidth: 1, borderColor: '#bfdbfe' },
    cardList: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20 },
    listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    nameText: { fontSize: 16, fontWeight: '600', color: '#334155' },
    subText: { fontSize: 12, color: '#64748b' },
    badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
    emptyText: { textAlign: 'center', color: '#64748b', fontStyle: 'italic', paddingVertical: 15 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', width: '100%', borderRadius: 20, padding: 20, maxHeight: '80%' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', textAlign: 'center' },
    modalSub: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 15 },
    modalItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    modalItemText: { flex: 1, marginLeft: 10, fontSize: 15, color: '#334155', fontWeight: '500' },
    btnCloseModal: { backgroundColor: '#ef4444', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    btnCloseModalText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    btnEditarTurma: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#bfdbfe' },
    btnEditarTurmaText: { fontSize: 12, fontWeight: 'bold', color: '#2563eb' },
    inputLabel: { fontSize: 13, fontWeight: 'bold', color: '#334155', marginBottom: 5 },
    input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12, marginBottom: 15, color: '#1e293b' },
    btnSalvarTurma: { backgroundColor: '#059669', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 5 },
    btnSalvarTurmaText: { color: '#fff', fontWeight: 'bold', fontSize: 14 }
});