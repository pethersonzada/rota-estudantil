import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
// Importação da configuração centralizada
import { API_URL } from '../config/config';

type Aluno = {
    id: number;
    nome: string;
    enderecoCompleto: string;
    statusPresenca?: string;
};

export default function Chamada() {
    const router = useRouter();
    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        obterPassageiros();
    }, []);

    async function obterPassageiros() {
        try {
            const response = await fetch(`${API_URL}/usuarios/passageiros`, {
                headers: { 'Bypass-Tunnel-Reminder': 'true' }
            });
            
            if (response.ok) {
                const data = await response.json();
                const listaTratada = data.map((a: Aluno) => ({ ...a, statusPresenca: 'PENDENTE' }));
                setAlunos(listaTratada);
            } else {
                Alert.alert("Aviso", "O servidor recusou a listagem de passageiros.");
            }
        } catch (error) {
            Alert.alert("Erro", "O backend está silencioso. Verifique o túnel.");
        } finally {
            setLoading(false);
        }
    }

    async function definirPresencaManual(alunoId: number, novoStatus: string) {
        const dataHoje = new Date().toISOString().split('T')[0]; 
        
        try {
            const response = await fetch(`${API_URL}/presenca/confirmar`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Bypass-Tunnel-Reminder': 'true'
                },
                body: JSON.stringify({
                    usuario: { id: alunoId }, 
                    data: dataHoje,
                    status: novoStatus
                })
            });

            if (response.ok) {
                setAlunos(prevState => 
                    prevState.map(aluno => 
                        aluno.id === alunoId ? { ...aluno, statusPresenca: novoStatus } : aluno
                    )
                );
            } else {
                Alert.alert("Erro", "Falha ao gravar presença no servidor.");
            }
        } catch (error) {
            Alert.alert("Erro de Conexão", "A ponte caiu durante o envio.");
        }
    }

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.textoCarregando}>Carregando prancheta...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.titulo}>Chamada Geral</Text>
            <Text style={styles.subtitulo}>Controle manual de rotas e turnos</Text>

            <FlatList
                data={alunos}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.info}>
                            <Text style={styles.nome}>{item.nome}</Text>
                            <Text style={styles.endereco}>{item.enderecoCompleto || 'Sem endereço'}</Text>
                        </View>
                        
                        <View style={styles.gradeBotoes}>
                            {[
                                { status: 'IDA_E_VOLTA', label: 'Ambos', color: '#10b981' },
                                { status: 'SO_IDA', label: 'Ida', color: '#3b82f6' },
                                { status: 'SO_VOLTA', label: 'Volta', color: '#8b5cf6' },
                                { status: 'FALTOU', label: 'Falta', color: '#ef4444' },
                            ].map((btn) => (
                                <TouchableOpacity 
                                    key={btn.status}
                                    style={[styles.miniBotao, item.statusPresenca === btn.status && { backgroundColor: btn.color, borderColor: btn.color }]}
                                    onPress={() => definirPresencaManual(item.id, btn.status)}
                                >
                                    <Text style={[styles.textoMiniBotao, item.statusPresenca === btn.status && { color: '#fff' }]}>{btn.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}
                ListEmptyComponent={<Text style={styles.vazio}>Nenhum passageiro encontrado.</Text>}
            />

            <View style={styles.rodape}>
                <TouchableOpacity style={[styles.botaoGerarRota, { backgroundColor: '#2563eb' }]} onPress={() => router.push({ pathname: '/mapa', params: { sentido: 'ida' } })}>
                    <Text style={styles.textoGerarRota}>ROTA DE IDA</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.botaoGerarRota, { backgroundColor: '#4f46e5' }]} onPress={() => router.push({ pathname: '/mapa', params: { sentido: 'volta' } })}>
                    <Text style={styles.textoGerarRota}>ROTA DE VOLTA</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc', padding: 15 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    textoCarregando: { marginTop: 15, color: '#1e293b', fontWeight: 'bold' },
    titulo: { fontSize: 24, fontWeight: '800', color: '#1e293b', textAlign: 'center', marginTop: 20 },
    subtitulo: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 20 },
    card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
    info: { marginBottom: 10 },
    nome: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
    endereco: { fontSize: 12, color: '#64748b', marginTop: 2 },
    gradeBotoes: { flexDirection: 'row', justifyContent: 'space-between', gap: 5, marginTop: 10 },
    miniBotao: { flex: 1, paddingVertical: 8, backgroundColor: '#f1f5f9', borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e1' },
    textoMiniBotao: { fontSize: 10, fontWeight: 'bold', color: '#475569' },
    rodape: { flexDirection: 'row', gap: 10, paddingBottom: 10 },
    botaoGerarRota: { flex: 1, padding: 18, borderRadius: 12, alignItems: 'center' },
    textoGerarRota: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
    vazio: { textAlign: 'center', marginTop: 40, color: '#94a3b8', fontSize: 16 }
});