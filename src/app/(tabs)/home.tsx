import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { API_URL } from '../../config/config';

export default function Home() {
    const router = useRouter();
    const vanMapRef = useRef<WebView>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [user, setUser] = useState({ id: '', nome: '', tipo: '' });
    const [passageiros, setPassageiros] = useState<any[]>([]);
    const [statusConfirmado, setStatusConfirmado] = useState<string>('');
    const [temEndereco, setTemEndereco] = useState(true);
    const [sinalPerdido, setSinalPerdido] = useState(false);
    
    const [minhaLocalizacao, setMinhaLocalizacao] = useState<{ latitude: number; longitude: number } | null>(null);

    useEffect(() => { 
        carregarDadosCompletos(); 
    }, []);

    useEffect(() => {
        let intervalo: number;
        let errosConsecutivos = 0;

        if (user.tipo && user.tipo !== 'MOTORISTA') {
            intervalo = window.setInterval(async () => {
                try {
                    const res = await fetch(`${API_URL}/rota/localizacao-van`, {
                        method: 'GET',
                        headers: { 'Accept': 'application/json' }
                    });
                    
                    if (res.ok) {
                        errosConsecutivos = 0;
                        setSinalPerdido(false);
                        const dadosVan = await res.json();
                        if (dadosVan && dadosVan.latitude && dadosVan.longitude) {
                            simularMovimentoDaVan(dadosVan.latitude, dadosVan.longitude);
                        }
                    } else {
                        throw new Error('Sem sinal do backend');
                    }
                } catch (error) {
                    errosConsecutivos++;
                    if (errosConsecutivos > 3) setSinalPerdido(true);
                }
            }, 5000);
        }

        return () => window.clearInterval(intervalo);
    }, [user.tipo]);

    const simularMovimentoDaVan = (lat: number, lng: number) => {
        if (vanMapRef.current) {
            vanMapRef.current.injectJavaScript(`updateDriverLocation(${lat}, ${lng}); true;`);
        }
    };

    async function carregarDadosCompletos() {
        setLoading(true);
        await carregarInfoUsuario();
        await buscarPassageiros();
        
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                setMinhaLocalizacao({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
            } else {
                setMinhaLocalizacao({ latitude: -8.2336, longitude: -35.7958 });
            }
        } catch (e) {
            setMinhaLocalizacao({ latitude: -8.2336, longitude: -35.7958 });
        }
        
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
            const id = await AsyncStorage.getItem('userId');
            const meuStatus = data.find((p: any) => p.id.toString() === id);
            setStatusConfirmado(meuStatus?.status || '');
        } catch (e) { 
            Alert.alert("Erro", "Falha estrutural ao buscar a lista de passageiros."); 
        }
    }

    async function carregarInfoUsuario() {
        const id: string = await AsyncStorage.getItem('userId') || '';
        const nome: string = await AsyncStorage.getItem('userName') || 'Usuário';
        const tipo: string = await AsyncStorage.getItem('userTipo') || '';
        const end = (await AsyncStorage.getItem('userEndereco')) as string;

        setUser({ id, nome, tipo });

        if (tipo === 'MOTORISTA') {
            setTemEndereco(true);
        } else {
            const valorEnd = end || '';
            const valido = valorEnd !== '' && valorEnd !== 'Endereço Pendente';
            setTemEndereco(valido);
        }
    }

    async function handleRefresh() {
        setIsRefreshing(true);
        await buscarPassageiros();
        setIsRefreshing(false);
    }

    async function registrarPresenca(status: string) {
        const id: string = await AsyncStorage.getItem('userId') || '';
        if (!id) return;
        
        setStatusConfirmado(status === 'LIMPAR' ? '' : status);
        
        try {
            const response = await fetch(`${API_URL}/rota/confirmar?usuarioId=${id}&status=${status}`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (!response.ok) {
                buscarPassageiros(); 
                Alert.alert("Erro do Servidor", "Sua confirmação não foi processada.");
            }
        } catch (e) { 
            buscarPassageiros(); 
            Alert.alert("Falha de Conexão", "Não foi possível conectar ao servidor.");
        }
    }

    const totalPassageiros = passageiros.length;
    const totalRespostas = passageiros.filter(p => p.status !== null && p.status !== '' && p.status !== undefined).length;
    const todosResponderam = totalPassageiros > 0 && totalRespostas === totalPassageiros;

    const iniciarRota = (sentido: string) => {
        if (!todosResponderam) {
            Alert.alert(
                "Passageiros Pendentes",
                "Ainda existem alunos que não confirmaram. Deseja iniciar o trajeto mesmo assim?",
                [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Iniciar", onPress: () => router.push(`/mapa?sentido=${sentido}`) }
                ]
            );
        } else {
            router.push(`/mapa?sentido=${sentido}`);
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
                #map { height: 100vh; width: 100vw; position: absolute; top: 0; left: 0; }
                .van-icon { font-size: 30px; text-align: center; }
            </style></head>
            <body>
                <div id="map"></div>
                <script>
                    var map = L.map('map', {
                        zoomControl: false, dragging: false, tap: false, 
                        touchZoom: false, scrollWheelZoom: false, doubleClickZoom: false
                    }).setView([${minhaLocalizacao.latitude}, ${minhaLocalizacao.longitude}], 15);
                    
                    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
                    
                    var vanIcon = L.divIcon({
                        html: '🚐', 
                        className: 'van-icon', 
                        iconSize: [30, 30],
                        iconAnchor: [15, 15]
                    });
                    
                    var driverMarker = null;
                    
                    L.circleMarker([${minhaLocalizacao.latitude}, ${minhaLocalizacao.longitude}], {
                        radius: 8, fillColor: "#2563eb", color: "#ffffff", weight: 2, opacity: 1, fillOpacity: 0.8
                    }).addTo(map);

                    function updateDriverLocation(lat, lng) {
                        if (!driverMarker) {
                            driverMarker = L.marker([lat, lng], {icon: vanIcon}).addTo(map);
                        } else {
                            driverMarker.setLatLng([lat, lng]);
                        }
                        map.panTo([lat, lng]); 
                    }
                </script>
            </body></html>`;
    }, [minhaLocalizacao]);

    if (loading) return <ActivityIndicator size="large" color="#2563eb" style={{ flex: 1 }} />;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <Text style={styles.dateText}>{new Date().toLocaleDateString('pt-BR', { month: 'long', day: 'numeric' })}</Text>
                <Text style={styles.welcome}>Olá, {user.nome.split(' ')[0]}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {!temEndereco && (
                    <TouchableOpacity style={styles.bannerAlerta} onPress={() => router.push('/CadastroEndereco')}>
                        <Ionicons name="location" size={24} color="#b91c1c" />
                        <View style={{flex: 1, marginLeft: 10}}>
                            <Text style={styles.alertaTitulo}>Local de embarque faltando</Text>
                            <Text style={styles.alertaTexto}>Defina seu endereço no Perfil para o motorista te encontrar.</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#b91c1c" />
                    </TouchableOpacity>
                )}

                {user.tipo === 'MOTORISTA' ? (
                    <>
                        <View style={[styles.statusBox, { backgroundColor: todosResponderam ? '#059669' : '#2563eb' }]}>
                            <Text style={styles.statusTitle}>{todosResponderam ? "PRONTO PARA PARTIDA!" : "COLETANDO DADOS..."}</Text>
                            <Text style={styles.statusSubtitle}>{totalRespostas} de {totalPassageiros} passageiros responderam</Text>
                        </View>

                        <View style={styles.actionContainer}>
                            <Text style={styles.sectionTitle}>Iniciar Trajeto</Text>
                            <View style={styles.grid}>
                                <TouchableOpacity 
                                    style={[styles.btnMotorista, { backgroundColor: todosResponderam ? '#0ea5e9' : '#f59e0b' }]} 
                                    onPress={() => iniciarRota('IDA')}
                                >
                                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                                    <Text style={styles.btnText}>IDA</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.btnMotorista, { backgroundColor: todosResponderam ? '#6366f1' : '#f59e0b' }]} 
                                    onPress={() => iniciarRota('VOLTA')}
                                >
                                    <Ionicons name="arrow-back" size={20} color="#fff" />
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
                                        <Text style={{color: p.status ? '#065f46' : '#991b1b', fontSize: 12, fontWeight: 'bold'}}>
                                            {p.status || 'PENDENTE'}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </>
                ) : (
                    <>
                        <View style={styles.topoPassageiro}>
                            <Text style={styles.sectionTitleLeft}>Radar do Motorista</Text>
                            {sinalPerdido && (
                                <View style={styles.sinalPerdidoBadge}>
                                    <Ionicons name="warning" size={14} color="#b91c1c" />
                                    <Text style={styles.sinalPerdidoTexto}>Sinal perdido</Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.radarCard}>
                            {minhaLocalizacao ? (
                                <WebView 
                                    ref={vanMapRef}
                                    source={{ html: mapHtml }} 
                                    javaScriptEnabled={true} 
                                    scrollEnabled={false} 
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
                                <Ionicons name="checkmark-circle" size={48} color="#059669" />
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9' },
    header: { padding: 30, paddingTop: 60, backgroundColor: '#fff', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    welcome: { fontSize: 28, fontWeight: '800', color: '#1e293b' },
    dateText: { color: '#64748b', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 5 },
    scrollContent: { padding: 20, paddingBottom: 40 },
    bannerAlerta: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fee2e2', padding: 15, borderRadius: 15, marginBottom: 20, borderWidth: 1, borderColor: '#fecaca' },
    alertaTitulo: { fontWeight: 'bold', color: '#991b1b' },
    alertaTexto: { fontSize: 12, color: '#b91c1c' },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, marginTop: 25 },
    infoLabel: { fontSize: 16, fontWeight: 'bold', color: '#334155' },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#334155', marginBottom: 10, textAlign: 'center' },
    topoPassageiro: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    sectionTitleLeft: { fontSize: 16, fontWeight: 'bold', color: '#334155' },
    sinalPerdidoBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fee2e2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, gap: 4 },
    sinalPerdidoTexto: { fontSize: 10, color: '#b91c1c', fontWeight: 'bold' },
    infoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', padding: 15, borderRadius: 15, marginBottom: 20 },
    infoCardText: { flex: 1, marginLeft: 10, color: '#1e40af', fontSize: 14 },
    statusBox: { padding: 25, borderRadius: 20, alignItems: 'center', marginBottom: 25 },
    statusTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    statusSubtitle: { color: '#fff', opacity: 0.9, marginTop: 5 },
    cardList: { backgroundColor: '#fff', borderRadius: 20, padding: 20 },
    listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    nameText: { fontSize: 16, fontWeight: '600', color: '#334155' },
    subText: { fontSize: 12, color: '#64748b' },
    badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
    radarCard: { height: 220, borderRadius: 20, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#e2e8f0', justifyContent: 'center' },
    cardConfirmado: { backgroundColor: '#fff', padding: 30, borderRadius: 25, alignItems: 'center' },
    confirmTitle: { fontSize: 20, fontWeight: 'bold', marginVertical: 10 },
    btnMotorista: { padding: 18, borderRadius: 15, width: '48%', alignItems: 'center', marginBottom: 15, flexDirection: 'row', justifyContent: 'center', gap: 8 },
    btnPassageiro: { padding: 18, borderRadius: 15, width: '48%', alignItems: 'center', marginBottom: 10, backgroundColor: '#2563eb' },
    btnText: { color: '#fff', fontWeight: 'bold' },
    btnAlterar: { marginTop: 15, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 15, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0' },
    btnAlterarText: { color: '#dc2626', fontSize: 12, fontWeight: 'bold' },
    confirmStatus: { color: '#64748b', marginBottom: 5 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    actionContainer: { marginBottom: 10 }
});