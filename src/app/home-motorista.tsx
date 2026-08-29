import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BotoesAcaoMotorista } from '../components/BotoesAcaoMotorista';
import { CardsTurmasMotorista } from '../components/CardsTurmasMotorista';
import { API_URL } from '../config/config';
import { homeMotoristaStyles as styles } from '../constants/homeMotoristaStyles';
import { useAuth } from './context/AuthContext';

export default function HomeMotorista() {
    const { user } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    
    const [loading, setLoading] = useState(true);
    const primeiraCarga = useRef(true);

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

    useFocusEffect(
        useCallback(() => { 
            carregarDadosSilencioso(); 
        }, [user.id, turmaSelecionada?.id])
    );

    async function carregarDadosSilencioso() {
        if (primeiraCarga.current) {
            setLoading(true);
        }

        if (user.id) {
            await Promise.all([
                buscarTurmas(user.id),
                checarAmnesia()
            ]);
        }
        
        setLoading(false);
        primeiraCarga.current = false;
    }

    async function buscarTurmas(motoristaId: string) {
        try {
            const res = await fetch(`${API_URL}/turmas/motorista/${motoristaId}`, { headers: { 'Accept': 'application/json', 'Bypass-Tunnel-Reminder': 'true' } });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setTurmas(data);
            
            if (data.length > 0) {
                const atual = turmaSelecionada ? (data.find((t: any) => t.id === turmaSelecionada.id) || data[0]) : data[0];
                
                if (!turmaSelecionada || turmaSelecionada.id !== atual.id) {
                    setTurmaSelecionada(atual);
                }
                
                await buscarPassageirosPorTurma(atual.id);
            } else { 
                setTurmaSelecionada(null); 
                setPassageiros([]); 
            }
        } catch (e) { 
            console.log("Falha ao carregar as turmas."); 
        }
    }

    async function buscarPassageirosPorTurma(turmaId: number) {
        try {
            const res = await fetch(`${API_URL}/turmas/${turmaId}/passageiros`, { headers: { 'Accept': 'application/json', 'Bypass-Tunnel-Reminder': 'true' } });
            if (res.ok) {
                const dados = await res.json();
                setPassageiros(dados);
            }
        } catch (e) { 
            console.log("Falha ao buscar passageiros."); 
        }
    }

    async function checarAmnesia() {
        try {
            const res = await fetch(`${API_URL}/rota/status-atual`, { headers: { 'Bypass-Tunnel-Reminder': 'true' } });
            if (res.ok) { 
                const data = await res.json(); 
                setViagemAtiva(data.status === 'ATIVA'); 
            }
        } catch (e) {}
    }

    async function abrirModalAdicionarAluno() {
        if (!turmaSelecionada) return;
        setModalVisible(true);
        setCarregandoAlunos(true);
        try {
            const res = await fetch(`${API_URL}/usuarios/passageiros`, { headers: { 'Bypass-Tunnel-Reminder': 'true' } });
            if (res.ok) {
                const todosOsPassageiros = await res.json();
                const idsNaTurma = new Set(passageiros.map(p => p.id));
                const disponiveis = todosOsPassageiros.filter((p: any) => !idsNaTurma.has(p.id));
                setTodosAlunos(disponiveis);
            }
        } catch (e) { 
            Alert.alert("Erro", "Não foi possível carregar alunos livres."); 
        } finally { 
            setCarregandoAlunos(false); 
        }
    }

    async function vincularAluno(alunoId: number) {
        if (!turmaSelecionada) return;
        try {
            const res = await fetch(`${API_URL}/turmas/${turmaSelecionada.id}/alunos/${alunoId}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Bypass-Tunnel-Reminder': 'true' 
                }
            });
            
            if (res.ok) {
                setModalVisible(false);
                await buscarPassageirosPorTurma(turmaSelecionada.id);
            } else {
                const erroTexto = await res.text();
                Alert.alert("Erro", erroTexto || "Não foi possível vincular o aluno.");
            }
        } catch (e) {
            Alert.alert("Erro", "Falha de conexão com o servidor.");
        }
    }

    async function removerAluno(alunoId: number, nomeAluno: string) {
        if (!turmaSelecionada) return;
        
        Alert.alert(
            "Remover Passageiro",
            `Deseja realmente remover ${nomeAluno} desta turma?`,
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Remover", 
                    style: "destructive", 
                    onPress: async () => {
                        try {
                            const res = await fetch(`${API_URL}/turmas/${turmaSelecionada.id}/alunos/${alunoId}`, {
                                method: 'DELETE',
                                headers: { 'Bypass-Tunnel-Reminder': 'true' }
                            });
                            
                            if (res.ok) {
                                await buscarPassageirosPorTurma(turmaSelecionada.id);
                            } else {
                                Alert.alert("Erro", "Não foi possível remover o aluno.");
                            }
                        } catch (e) {
                            Alert.alert("Erro", "Falha de conexão com o servidor.");
                        }
                    }
                }
            ]
        );
    }

    const totalPassageiros = passageiros.length;
    const totalRespostas = passageiros.filter(p => p.status).length;
    const todosResponderam = totalPassageiros > 0 && totalRespostas === totalPassageiros;

    const iniciarRota = (sentido: string) => {
        if (!turmaSelecionada) { Alert.alert("Atenção", "Selecione uma turma."); return; }
        if (viagemAtiva) return;

        const executarInicioNoServidor = async () => {
            try {
                const res = await fetch(`${API_URL}/rota/iniciar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
                    body: JSON.stringify({ turmaId: Number(turmaSelecionada.id), sentido: sentido })
                });
                
                if (!res.ok) { 
                    const err = await res.json(); 
                    throw new Error(err.erro); 
                }

                router.push(`/mapa?sentido=${sentido.toLowerCase()}`);
            } catch (e: any) { 
                Alert.alert("Erro", e.message || "Erro ao iniciar a rota."); 
            }
        };

        if (!todosResponderam) {
            Alert.alert(
                "Alunos Pendentes", 
                "Existem alunos sem confirmar presença. Deseja iniciar a rota de " + sentido + " mesmo assim?", 
                [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Iniciar Trajeto", style: "default", onPress: executarInicioNoServidor }
                ]
            );
        } else {
            Alert.alert(
                "Iniciar Rota", 
                "Deseja iniciar a rota de " + sentido + " agora?", 
                [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Iniciar", style: "default", onPress: executarInicioNoServidor }
                ]
            );
        }
    };

    if (loading) return <ActivityIndicator size="large" color="#2563eb" style={{ flex: 1, backgroundColor: '#f1f5f9' }} />;

    return (
        <View style={styles.container}>
            <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
                <Text style={styles.dateText}>{new Date().toLocaleDateString('pt-BR', { month: 'long', day: 'numeric' })}</Text>
                <Text style={styles.welcome}>Olá, {user.nome.split(' ')[0]}</Text>
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
                            <View key={p.id} style={[styles.listItem, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.nameText}>{p.nome}</Text>
                                    <Text style={styles.subText}>{p.status ? 'Respondeu' : 'Aguardando...'}</Text>
                                </View>
                                
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                    <View style={[styles.badge, { backgroundColor: p.status ? '#dcfce7' : '#fee2e2' }]}>
                                        <Text style={{ color: p.status ? '#065f46' : '#991b1b', fontSize: 12, fontWeight: 'bold' }}>
                                            {p.status || 'PENDENTE'}
                                        </Text>
                                    </View>

                                    <TouchableOpacity onPress={() => removerAluno(p.id, p.nome)} style={{ padding: 6 }}>
                                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>

            <Modal visible={modalVisible} animationType="fade" transparent={true} onRequestClose={() => setModalVisible(false)}>
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <TouchableOpacity 
                        style={{ flex: 1 }} 
                        activeOpacity={1} 
                        onPress={() => setModalVisible(false)} 
                    />
                    <View style={{ 
                        backgroundColor: '#ffffff', 
                        borderTopLeftRadius: 28, 
                        borderTopRightRadius: 28, 
                        paddingHorizontal: 24,
                        paddingTop: 16,
                        paddingBottom: 40, 
                        maxHeight: '75%',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 12,
                        elevation: 10
                    }}>
                        <View style={{ alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: '#cbd5e1', marginBottom: 16 }} />

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <View>
                                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#0f172a' }}>Adicionar Passageiro</Text>
                                <Text style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Selecione um aluno para vincular à turma</Text>
                            </View>
                            <TouchableOpacity 
                                onPress={() => setModalVisible(false)}
                                style={{ backgroundColor: '#eff6ff', padding: 8, borderRadius: 20 }}
                            >
                                <Ionicons name="close" size={20} color="#2563eb" />
                            </TouchableOpacity>
                        </View>

                        {carregandoAlunos ? (
                            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                                <ActivityIndicator size="large" color="#64748b" />
                            </View>
                        ) : todosAlunos.length === 0 ? (
                            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                                <Ionicons name="people-outline" size={48} color="#cbd5e1" style={{ marginBottom: 12 }} />
                                <Text style={{ textAlign: 'center', color: '#64748b', fontSize: 15, fontWeight: '500' }}>Nenhum aluno disponível sem turma.</Text>
                            </View>
                        ) : (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {todosAlunos.map(aluno => (
                                    <TouchableOpacity 
                                        key={aluno.id} 
                                        style={{ 
                                            flexDirection: 'row', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center', 
                                            paddingVertical: 12,
                                            paddingHorizontal: 12,
                                            borderRadius: 8,
                                            marginBottom: 8,
                                            backgroundColor: '#f8fafc',
                                            borderWidth: 1,
                                            borderColor: '#e2e8f0'
                                        }}
                                        onPress={() => vincularAluno(aluno.id)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                                                <Ionicons name="person" size={16} color="#64748b" />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontSize: 16, fontWeight: '600', color: '#1e293b' }}>{aluno.nome}</Text>
                                                {aluno.telefone ? <Text style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>{aluno.telefone}</Text> : null}
                                            </View>
                                        </View>
                                        <View style={{ backgroundColor: '#eff6ff', padding: 6, borderRadius: 16 }}>
                                            <Ionicons name="add" size={18} color="#2563eb" />
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}