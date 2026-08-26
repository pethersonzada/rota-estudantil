import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { API_URL } from '../config/config';

type Turma = {
    id: number;
    nome: string;
    turno: string;
    motorista?: {
        nome: string;
        telefone: string;
    };
};

export default function HomePassageiro() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const vanMapRef = useRef<WebView>(null);
    
    const [loading, setLoading] = useState(true);
    const [nome, setNome] = useState('');
    const [temEndereco, setTemEndereco] = useState(true);
    const [statusConfirmado, setStatusConfirmado] = useState<string>('');
    const [minhaLocalizacao, setMinhaLocalizacao] = useState<{ latitude: number; longitude: number } | null>(null);

    const [statusViagem, setStatusViagem] = useState<'INATIVA' | 'ATIVA'>('INATIVA');
    const [statusGps, setStatusGps] = useState<'GARAGEM' | 'AGUARDANDO' | 'ONLINE' | 'ERRO'>('GARAGEM');
    const [turma, setTurma] = useState<Turma | null>(null);

    useFocusEffect(
        useCallback(() => {
            carregarDados();
        }, [])
    );

    useEffect(() => {
        let errosConsecutivos = 0;
        const intervalo = setInterval(async () => {
            try {
                const resStatus = await fetch(`${API_URL}/rota/status-atual`, {
                    headers: { 'Bypass-Tunnel-Reminder': 'true' }
                });
                if (!resStatus.ok) throw new Error('Falha no status');
                const dataStatus = await resStatus.json();
                
                setStatusViagem(dataStatus.status);

                if (dataStatus.status === 'ATIVA') {
                    const resLoc = await fetch(`${API_URL}/rota/localizacao-van`, {
                        method: 'GET',
                        headers: { 
                            'Accept': 'application/json',
                            'Bypass-Tunnel-Reminder': 'true'
                        }
                    });
                    
                    if (resLoc.ok) {
                        errosConsecutivos = 0;
                        setStatusGps('ONLINE');
                        
                        const dadosVan = await resLoc.json();
                        if (dadosVan && dadosVan.latitude && dadosVan.longitude) {
                            simularMovimentoDaVan(dadosVan.latitude, dadosVan.longitude);
                        }
                    } else if (resLoc.status === 404) {
                        errosConsecutivos = 0;
                        setStatusGps('AGUARDANDO');
                    } else {
                        throw new Error('Sem sinal');
                    }
                } else {
                    setStatusGps('GARAGEM');
                }
            } catch (error) {
                errosConsecutivos++;
                if (errosConsecutivos > 3 && statusViagem === 'ATIVA') {
                    setStatusGps('ERRO');
                }
            }
        }, 5000);

        return () => clearInterval(intervalo);
    }, [statusViagem]);

    const simularMovimentoDaVan = (lat: number, lng: number) => {
        if (vanMapRef.current) {
            vanMapRef.current.injectJavaScript(`
                try {
                    if (typeof updateDriverLocation === 'function') { 
                        updateDriverLocation(${lat}, ${lng}); 
                    }
                } catch(e) {}
                true;
            `);
        }
    };

    async function carregarDados() {
        try {
            const [userName, end, id] = await Promise.all([
                AsyncStorage.getItem('userName'),
                AsyncStorage.getItem('userEndereco'),
                AsyncStorage.getItem('userId')
            ]);
            
            const nomeUsuario = userName || 'Usuário';
            const enderecoUsuario = end || '';
            
            setNome(nomeUsuario.split(' ')[0]);
            setTemEndereco(enderecoUsuario !== '' && enderecoUsuario !== 'Endereço Pendente');
            
            setLoading(false);

            if (id) {
                await Promise.all([
                    carregarStatusRemoto(id),
                    carregarGpsHardware(),
                    carregarTurmaDoAluno(id)
                ]);
            }

        } catch (error) {
            console.error("Erro na carga inicial:", error);
            setLoading(false);
        }
    }

    async function carregarStatusRemoto(id: string) {
        try {
            const res = await fetch(`${API_URL}/usuarios/passageiros`, { 
                method: 'GET', 
                headers: { 
                    'Accept': 'application/json',
                    'Bypass-Tunnel-Reminder': 'true'
                } 
            });
            if (res.ok) {
                const data = await res.json();
                const meuStatus = data.find((p: any) => p.id.toString() === id);
                setStatusConfirmado(meuStatus?.status || '');
            }
        } catch (e) {
            console.log("Erro ao buscar status");
        }
    }

    async function carregarTurmaDoAluno(userId: string) {
        try {
            // URL ATUALIZADA CORRETAMENTE PARA /turmas/usuario/{userId}
            const res = await fetch(`${API_URL}/turmas/usuario/${userId}`, {
                headers: { 'Bypass-Tunnel-Reminder': 'true' }
            });
            if (res.ok) {
                const data = await res.json();
                setTurma(data);
            } else {
                setTurma(null);
            }
        } catch (e) {
            console.log("Aluno sem turma vinculada");
            setTurma(null);
        }
    }

    async function carregarGpsHardware() {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const cacheLoc = await Location.getLastKnownPositionAsync({});
                if (cacheLoc) {
                    setMinhaLocalizacao({ latitude: cacheLoc.coords.latitude, longitude: cacheLoc.coords.longitude });
                }
                
                const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                setMinhaLocalizacao({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
            } else {
                setMinhaLocalizacao({ latitude: -8.2336, longitude: -35.7958 });
            }
        } catch (e) {
            setMinhaLocalizacao({ latitude: -8.2336, longitude: -35.7958 });
        }
    }

    async function registrarPresenca(status: string) {
        const id = await AsyncStorage.getItem('userId') || '';
        if (!id) return;
        
        setStatusConfirmado(status === 'LIMPAR' ? '' : status);
        
        try {
            const response = await fetch(`${API_URL}/rota/confirmar?usuarioId=${id}&status=${status}`, { 
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Bypass-Tunnel-Reminder': 'true'
                }
            });
            
            if (!response.ok) {
                carregarDados(); 
                Alert.alert("Erro", "Sua confirmação não foi processada.");
            }
        } catch (e) { 
            carregarDados(); 
            Alert.alert("Falha de Conexão", "Não foi possível conectar ao servidor.");
        }
    }

    const renderBadgeStatus = () => {
        switch (statusGps) {
            case 'ERRO':
                return (
                    <View style={[styles.badgeBase, styles.badgeErro]}>
                        <Ionicons name="warning" size={12} color="#991b1b" />
                        <Text style={[styles.badgeTexto, { color: '#991b1b' }]}>Sem Sinal</Text>
                    </View>
                );
            case 'AGUARDANDO':
                return (
                    <View style={[styles.badgeBase, styles.badgeAlerta]}>
                        <Ionicons name="time" size={12} color="#9a3412" />
                        <Text style={[styles.badgeTexto, { color: '#9a3412' }]}>Aguardando...</Text>
                    </View>
                );
            case 'ONLINE':
                return (
                    <View style={[styles.badgeBase, styles.badgeSucesso]}>
                        <Ionicons name="radio" size={12} color="#166534" />
                        <Text style={[styles.badgeTexto, { color: '#166534' }]}>Online</Text>
                    </View>
                );
            case 'GARAGEM':
            default:
                return (
                    <View style={[styles.badgeBase, styles.badgeInativo]}>
                        <Ionicons name="bus" size={12} color="#475569" />
                        <Text style={[styles.badgeTexto, { color: '#475569' }]}>Na Garagem</Text>
                    </View>
                );
        }
    };

    const mapHtml = useMemo(() => {
        if (!minhaLocalizacao) return '';
        return `
            <!DOCTYPE html><html><head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
            <style>
                body, html { height: 100%; margin: 0; padding: 0; overflow: hidden; }
                #map { height: 100vh; width: 100vw; position: absolute; top: 0; left: 0; touch-action: none; }
                .pin-waypoint {
                    width: 30px;
                    height: 30px;
                    background: #2563eb; 
                    border: 2px solid #ffffff;
                    border-radius: 50% 50% 50% 0; 
                    transform: rotate(-45deg); 
                    box-shadow: -2px 2px 5px rgba(0,0,0,0.4);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .pin-waypoint span {
                    transform: rotate(45deg);
                    font-size: 14px;
                }
            </style></head>
            <body>
                <div id="map"></div>
                <script>
                    var map = L.map('map', {
                        zoomControl: false, 
                        dragging: true, 
                        tap: true, 
                        touchZoom: true, 
                        scrollWheelZoom: true, 
                        doubleClickZoom: true
                    }).setView([${minhaLocalizacao.latitude}, ${minhaLocalizacao.longitude}], 15);
                    
                    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
                    
                    var vanIcon = L.divIcon({ 
                        html: '<div class="pin-waypoint"><span>🚐</span></div>', 
                        className: '', 
                        iconSize: [30, 30], 
                        iconAnchor: [15, 34] 
                    });
                    var driverMarker = null;
                    var primeiraVez = true;
                    
                    L.circleMarker([${minhaLocalizacao.latitude}, ${minhaLocalizacao.longitude}], {
                        radius: 8, fillColor: "#2563eb", color: "#ffffff", weight: 2, opacity: 1, fillOpacity: 0.8
                    }).addTo(map);

                    function updateDriverLocation(lat, lng) {
                        if (!driverMarker) {
                            driverMarker = L.marker([lat, lng], {icon: vanIcon}).addTo(map);
                        } else {
                            driverMarker.setLatLng([lat, lng]);
                        }
                        
                        if (primeiraVez) {
                            map.panTo([lat, lng]); 
                            primeiraVez = false;
                        }
                    }
                </script>
            </body></html>`;
    }, [minhaLocalizacao]);

    if (loading) return <ActivityIndicator size="large" color="#2563eb" style={{ flex: 1, backgroundColor: '#f1f5f9' }} />;

    return (
        <View style={styles.container}>
            <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
                <Text style={styles.dateText}>{new Date().toLocaleDateString('pt-BR', { month: 'long', day: 'numeric' })}</Text>
                <Text style={styles.welcome}>Olá, {nome}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {!temEndereco && (
                    <TouchableOpacity style={styles.bannerAlerta} onPress={() => router.push('/cadastro-endereco')}>
                        <Ionicons name="location" size={24} color="#b91c1c" />
                        <View style={{flex: 1, marginLeft: 10}}>
                            <Text style={styles.alertaTitulo}>Local de embarque faltando</Text>
                            <Text style={styles.alertaTexto}>Defina seu endereço no Perfil para o motorista te encontrar.</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#b91c1c" />
                    </TouchableOpacity>
                )}

                {/* Card da Turma/Van do Aluno */}
                <View style={styles.cardTurma}>
                    <View style={styles.cardHeaderRow}>
                        <Ionicons name="bus" size={20} color="#2563eb" />
                        <Text style={styles.cardTitle}>Sua Van / Rota</Text>
                    </View>
                    {turma ? (
                        <View style={{ marginTop: 8 }}>
                            <Text style={styles.turmaNome}>{turma.nome} ({turma.turno})</Text>
                            {turma.motorista && (
                                <Text style={styles.motoristaText}>Motorista: {turma.motorista.nome}</Text>
                            )}
                        </View>
                    ) : (
                        <View style={styles.semTurmaBox}>
                            <Ionicons name="time-outline" size={32} color="#f59e0b" />
                            <Text style={styles.semTurmaTitulo}>Aguardando vinculação</Text>
                            <Text style={styles.semTurmaSub}>O motorista ainda não te adicionou a nenhuma turma/rota.</Text>
                        </View>
                    )}
                </View>

                {turma && (
                    <>
                        <View style={styles.topoPassageiro}>
                            <Text style={styles.sectionTitleLeft}>Radar do Motorista</Text>
                            {renderBadgeStatus()}
                        </View>

                        <View style={styles.radarCard}>
                            {statusViagem === 'INATIVA' ? (
                                <View style={styles.cadeadoBox}>
                                    <Ionicons name="bus-outline" size={50} color="#94a3b8" />
                                    <Text style={styles.cadeadoTitulo}>A van está na garagem</Text>
                                    <Text style={styles.cadeadoSubtitulo}>
                                        O motorista ainda não iniciou a rota de hoje. O radar aparecerá aqui quando a viagem começar.
                                    </Text>
                                </View>
                            ) : minhaLocalizacao ? (
                                <WebView 
                                    ref={vanMapRef} 
                                    source={{ html: mapHtml }} 
                                    javaScriptEnabled={true} 
                                    scrollEnabled={false} 
                                    nestedScrollEnabled={true}
                                    overScrollMode="never"
                                />
                            ) : (
                                <ActivityIndicator size="large" color="#2563eb" style={{ flex: 1 }} />
                            )}
                        </View>

                        <View style={styles.infoCard}>
                            <Ionicons name="information-circle-outline" size={24} color="#2563eb" />
                            <Text style={styles.infoCardText}>Informe ao seu motorista se você vai utilizar o transporte hoje.</Text>
                        </View>

                        {statusConfirmado ? (
                            <View style={styles.cardConfirmado}>
                                <Ionicons name="checkmark-circle" size={48} color="#2563eb" />
                                <Text style={styles.confirmTitle}>Confirmado!</Text>
                                <Text style={styles.confirmStatus}>Sua opção: {statusConfirmado}</Text>
                                <TouchableOpacity onPress={() => registrarPresenca('LIMPAR')} style={styles.btnAlterar}>
                                    <Text style={styles.btnAlterarText}>Alterar minha decisão</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.grid}>
                                {['IDA', 'VOLTA', 'AMBOS', 'NAO_VOU'].map((s) => (
                                    <TouchableOpacity key={s} style={styles.btnPassageiro} onPress={() => registrarPresenca(s)}>
                                        <Text style={styles.btnText}>{s.replace('_', ' ')}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </>
                )}
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
    bannerAlerta: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fee2e2', padding: 15, borderRadius: 15, marginBottom: 20, borderWidth: 1, borderColor: '#fecaca' },
    alertaTitulo: { fontWeight: 'bold', color: '#991b1b' },
    alertaTexto: { fontSize: 12, color: '#b91c1c' },
    
    cardTurma: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0' },
    cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#334155' },
    turmaNome: { fontSize: 16, fontWeight: 'bold', color: '#2563eb', marginTop: 2 },
    motoristaText: { fontSize: 12, color: '#64748b', marginTop: 2 },
    
    semTurmaBox: { alignItems: 'center', paddingVertical: 15 },
    semTurmaTitulo: { fontSize: 15, fontWeight: 'bold', color: '#334155', marginTop: 6 },
    semTurmaSub: { fontSize: 13, color: '#64748b', textAlign: 'center', marginTop: 4 },

    topoPassageiro: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    sectionTitleLeft: { fontSize: 16, fontWeight: 'bold', color: '#334155' },
    
    badgeBase: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, gap: 4, borderWidth: 1 },
    badgeTexto: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    badgeInativo: { backgroundColor: '#f1f5f9', borderColor: '#cbd5e1' },
    badgeAlerta: { backgroundColor: '#ffedd5', borderColor: '#fed7aa' },
    badgeSucesso: { backgroundColor: '#dcfce7', borderColor: '#bbf7d0' },
    badgeErro: { backgroundColor: '#fee2e2', borderColor: '#fecaca' },
    
    radarCard: { height: 220, borderRadius: 20, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff', justifyContent: 'center' },
    cadeadoBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f8fafc' },
    cadeadoTitulo: { fontSize: 18, fontWeight: '800', color: '#334155', marginTop: 10, marginBottom: 6 },
    cadeadoSubtitulo: { fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 20, paddingHorizontal: 10 },
    
    infoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', padding: 15, borderRadius: 15, marginBottom: 20 },
    infoCardText: { flex: 1, marginLeft: 10, color: '#1e40af', fontSize: 14 },
    cardConfirmado: { backgroundColor: '#fff', padding: 30, borderRadius: 25, alignItems: 'center' },
    confirmTitle: { fontSize: 20, fontWeight: 'bold', marginVertical: 10 },
    confirmStatus: { color: '#64748b', marginBottom: 5 },
    btnAlterar: { marginTop: 15, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 15, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0' },
    btnAlterarText: { color: '#dc2626', fontSize: 12, fontWeight: 'bold' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    btnPassageiro: { padding: 18, borderRadius: 15, width: '48%', alignItems: 'center', marginBottom: 10, backgroundColor: '#2563eb' },
    btnText: { color: '#fff', fontWeight: 'bold' }
});