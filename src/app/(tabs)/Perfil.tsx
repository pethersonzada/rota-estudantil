import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_URL } from '../../config/config';

export default function Perfil() {
    const [nome, setNome] = useState('');
    const [tipo, setTipo] = useState('');
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [modalDeletarVisivel, setModalDeletarVisivel] = useState(false);
    const [codigoDigitado, setCodigoDigitado] = useState('');
    const [carregandoExclusao, setCarregandoExclusao] = useState(false);

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

    const confirmarEExcluirConta = async () => {
        if (codigoDigitado.trim().toUpperCase() !== 'ROTA2026') {
            Alert.alert("Código Inválido", "O código de segurança está incorreto.");
            return;
        }

        setCarregandoExclusao(true);
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (userId) {
                await fetch(`${API_URL}/usuarios/${userId}`, { method: 'DELETE' });
            }
        } catch (error) {
            console.error(error);
        } finally {
            await AsyncStorage.clear(); 
            setModalDeletarVisivel(false);
            router.replace('/login');
        }
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
                    <Ionicons name="log-out-outline" size={22} color="#dc2626" />
                    <Text style={styles.textoBotaoSair}>Encerrar Sessão</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.botaoDeletar} onPress={() => setModalDeletarVisivel(true)}>
                    <Ionicons name="trash-outline" size={22} color="#fff" />
                    <Text style={styles.textoBotaoDeletar}>Excluir Minha Conta</Text>
                </TouchableOpacity>
            </ScrollView>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalDeletarVisivel}
                onRequestClose={() => setModalDeletarVisivel(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.iconeAlerta}>
                            <Ionicons name="warning" size={40} color="#dc2626" />
                        </View>
                        <Text style={styles.modalTitulo}>Deletar conta</Text>
                        <Text style={styles.modalTexto}>
                            Esta ação é irreversível. Todos os seus dados serão apagados. Para confirmar, digite o código <Text style={{fontWeight: 'bold'}}>ROTA2026</Text> abaixo:
                        </Text>
                        
                        <TextInput
                            style={styles.inputCodigo}
                            placeholder="Digite o código"
                            placeholderTextColor="#94a3b8"
                            value={codigoDigitado}
                            onChangeText={setCodigoDigitado}
                            autoCapitalize="characters"
                            autoCorrect={false}
                        />

                        <View style={styles.modalBotoes}>
                            <TouchableOpacity 
                                style={[styles.botaoModal, styles.botaoCancelar]} 
                                onPress={() => {
                                    setModalDeletarVisivel(false);
                                    setCodigoDigitado('');
                                }}
                                disabled={carregandoExclusao}
                            >
                                <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.botaoModal, styles.botaoConfirmarExclusao]} 
                                onPress={confirmarEExcluirConta}
                                disabled={carregandoExclusao}
                            >
                                {carregandoExclusao ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.textoBotaoConfirmarExclusao}>Excluir Conta</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    botaoSair: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#fee2e2', 
        padding: 18, 
        borderRadius: 15, 
        marginTop: 20, 
        borderWidth: 1, 
        borderColor: '#fecaca',
        gap: 8 
    },
    textoBotaoSair: { color: '#dc2626', fontSize: 16, fontWeight: 'bold' },
    botaoDeletar: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#ef4444', 
        padding: 18, 
        borderRadius: 15, 
        marginTop: 15, 
        borderWidth: 1, 
        borderColor: '#dc2626',
        gap: 8 
    },
    textoBotaoDeletar: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', width: '100%', borderRadius: 20, padding: 25, alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
    iconeAlerta: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fee2e2', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    modalTitulo: { fontSize: 22, fontWeight: '900', color: '#1e293b', marginBottom: 10 },
    modalTexto: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 20, lineHeight: 22 },
    inputCodigo: { width: '100%', backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, padding: 15, fontSize: 16, textAlign: 'center', fontWeight: 'bold', color: '#1e293b', marginBottom: 25 },
    modalBotoes: { flexDirection: 'row', gap: 15, width: '100%' },
    botaoModal: { flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    botaoCancelar: { backgroundColor: '#f1f5f9' },
    textoBotaoCancelar: { color: '#64748b', fontSize: 16, fontWeight: 'bold' },
    botaoConfirmarExclusao: { backgroundColor: '#dc2626' },
    textoBotaoConfirmarExclusao: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});