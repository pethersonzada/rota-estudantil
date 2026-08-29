import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
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
            const res = await fetch(`${API_URL}/usuarios/passageiros/sem-turma`, { headers: { 'Bypass-Tunnel-Reminder': 'true' } });
            if (res.ok) setTodosAlunos(await res.json());
        } catch (e) { Alert.alert("Erro", "Não foi possível carregar alunos livres."); }
        finally { setCarregandoAlunos(false); }
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