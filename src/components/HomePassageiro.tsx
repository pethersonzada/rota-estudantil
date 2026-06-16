import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { API_URL } from '../config/config';

export default function HomePassageiro() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const vanMapRef = useRef<WebView>(null);
    const [loading, setLoading] = useState(true);
    const [nome, setNome] = useState('');
    const [temEndereco, setTemEndereco] = useState(true);
    const [statusConfirmado, setStatusConfirmado] = useState<string>('');
    const [sinalPerdido, setSinalPerdido] = useState(false);
    const [minhaLocalizacao, setMinhaLocalizacao] = useState<{ latitude: number; longitude: number } | null>(null);

    useEffect(() => {
        carregarDados();
    }, []);

    useEffect(() => {
        let errosConsecutivos = 0;
        const intervalo = window.setInterval(async () => {
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
                    throw new Error('Sem sinal');
                }
            } catch (error) {
                errosConsecutivos++;
                if (errosConsecutivos > 3) setSinalPerdido(true);
            }
        }, 5000);

        return () => window.clearInterval(intervalo);
    }, []);

    const simularMovimentoDaVan = (lat: number, lng: number) => {
        if (vanMapRef.current) {
            vanMapRef.current.injectJavaScript(`updateDriverLocation(${lat}, ${lng}); true;`);
        }
    };

    async function carregarDados() {
        setLoading(true);
        const userName = await AsyncStorage.getItem('userName') || 'Usuário';
        const end = await AsyncStorage.getItem('userEndereco') || '';
        const id = await AsyncStorage.getItem('userId');
        
        setNome(userName.split(' ')[0]);
        setTemEndereco(end !== '' && end !== 'Endereço Pendente');

        try {
            const res = await fetch(`${API_URL}/usuarios/passageiros`, { method: 'GET', headers: { 'Accept': 'application/json' } });
            if (res.ok) {
                const data = await res.json();
                const meuStatus = data.find((p: any) => p.id.toString() === id);
                setStatusConfirmado(meuStatus?.status || '');
            }
        } catch (e) {
            console.log("Erro ao buscar status");
        }

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

    async function registrarPresenca(status: string) {
        const id = await AsyncStorage.getItem('userId') || '';
        if (!id) return;
        
        setStatusConfirmado(status === 'LIMPAR' ? '' : status);
        
        try {
            const response = await fetch(`${API_URL}/rota/confirmar?usuarioId=${id}&status=${status}`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
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
                    
                    var vanIcon = L.divIcon({ html: '🚐', className: 'van-icon', iconSize: [30, 30], iconAnchor: [15, 15] });
                    var driverMarker = null;
                    
                    L.circleMarker([${minhaLocalizacao.latitude}, ${minhaLocalizacao.longitude}], {
                        radius: 8, fillColor: "#2563eb", color: "#ffffff", weight: 2, opacity: 1, fillOpacity: 0.8
                    }).addTo(map);

                    function updateDriverLocation(lat, lng) {
                        if (!driverMarker) driverMarker = L.marker([lat, lng], {icon: vanIcon}).addTo(map);
                        else driverMarker.setLatLng([lat, lng]);
                        map.panTo([lat, lng]); 
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
                        <WebView ref={vanMapRef} source={{ html: mapHtml }} javaScriptEnabled={true} scrollEnabled={false} />
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
    topoPassageiro: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    sectionTitleLeft: { fontSize: 16, fontWeight: 'bold', color: '#334155' },
    sinalPerdidoBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fee2e2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, gap: 4 },
    sinalPerdidoTexto: { fontSize: 10, color: '#b91c1c', fontWeight: 'bold' },
    radarCard: { height: 220, borderRadius: 20, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#e2e8f0', justifyContent: 'center' },
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