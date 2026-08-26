import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { CardTurmaPassageiro } from '../components/CardTurmaPassageiro';
import { SeletorPresenca } from '../components/SeletorPresenca';
import { API_URL } from '../config/config';
import { homePassageiroStyles as styles } from '../constants/homePassageiroStyles';

export default function HomePassageiro() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const vanMapRef = useRef<WebView>(null);
    
    const [loading, setLoading] = useState(true);
    const [nome, setNome] = useState('');
    const [temEndereco, setTemEndereco] = useState(true);
    const [statusConfirmado, setStatusConfirmado] = useState('');
    const [minhaLocalizacao, setMinhaLocalizacao] = useState<{ latitude: number; longitude: number } | null>(null);
    const [statusViagem, setStatusViagem] = useState('INATIVA');
    const [statusGps, setStatusGps] = useState('GARAGEM');
    const [turma, setTurma] = useState(null);

    useFocusEffect(useCallback(() => { carregarDados(); }, []));

    useEffect(() => {
        const intervalo = setInterval(async () => {
            try {
                const res = await fetch(`${API_URL}/rota/status-atual`, { headers: { 'Bypass-Tunnel-Reminder': 'true' } });
                if (!res.ok) return;
                const data = await res.json();
                setStatusViagem(data.status);

                if (data.status === 'ATIVA') {
                    const resLoc = await fetch(`${API_URL}/rota/localizacao-van`, { headers: { 'Bypass-Tunnel-Reminder': 'true' } });
                    if (resLoc.ok) {
                        setStatusGps('ONLINE');
                        const pos = await resLoc.json();
                        if (pos?.latitude && pos?.longitude && vanMapRef.current) {
                            vanMapRef.current.injectJavaScript(`if(typeof updateDriverLocation==='function')updateDriverLocation(${pos.latitude},${pos.longitude});true;`);
                        }
                    } else if (resLoc.status === 404) { setStatusGps('AGUARDANDO'); }
                } else { setStatusGps('GARAGEM'); }
            } catch (e) { setStatusGps('ERRO'); }
        }, 5000);
        return () => clearInterval(intervalo);
    }, []);

    async function carregarDados() {
        try {
            const [userName, end, id] = await Promise.all([
                AsyncStorage.getItem('userName'),
                AsyncStorage.getItem('userEndereco'),
                AsyncStorage.getItem('userId')
            ]);
            setNome((userName || 'Usuário').split(' ')[0]);
            setTemEndereco(end ? end !== 'Endereço Pendente' : false);
            setLoading(false);

            if (id) {
                const [resStatus, resTurma] = await Promise.all([
                    fetch(`${API_URL}/usuarios/passageiros`, { headers: { 'Bypass-Tunnel-Reminder': 'true' } }),
                    fetch(`${API_URL}/turmas/usuario/${id}`, { headers: { 'Bypass-Tunnel-Reminder': 'true' } })
                ]);
                if (resStatus.ok) {
                    const list = await resStatus.json();
                    setStatusConfirmado(list.find((p: any) => p.id.toString() === id)?.status || '');
                }
                if (resTurma.ok) setTurma(await resTurma.json());

                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                    setMinhaLocalizacao({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
                }
            }
        } catch (e) { setLoading(false); }
    }

    async function registrarPresenca(status: string) {
        const id = await AsyncStorage.getItem('userId');
        if (!id) return;
        
        const statusEnvio = status === 'LIMPAR' ? '' : status;
        setStatusConfirmado(statusEnvio);

        try {
            await fetch(`${API_URL}/presenca/marcar`, { 
                method: 'POST', 
                headers: { 
                    'Content-Type': 'application/json', 
                    'Bypass-Tunnel-Reminder': 'true' 
                },
                body: JSON.stringify({ 
                    usuarioId: Number(id), 
                    status: statusEnvio 
                })
            });
        } catch (e) { 
            carregarDados(); 
            Alert.alert("Erro", "Falha de conexão."); 
        }
    }

    const mapHtml = useMemo(() => {
        if (!minhaLocalizacao) return '';
        return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1.0"/><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><style>body,html{height:100%;margin:0}#map{height:100vh;width:100vw;position:absolute}</style></head><body><div id="map"></div><script>var map=L.map('map',{zoomControl:false}).setView([${minhaLocalizacao.latitude},${minhaLocalizacao.longitude}],15);L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);var vMarker=null;function updateDriverLocation(lat,lng){if(!vMarker){vMarker=L.marker([lat,lng]).addTo(map);}else{vMarker.setLatLng([lat,lng]);map.panTo([lat,lng]);}}</script></body></html>`;
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
                            <Text style={styles.alertaTexto}>Defina seu endereço no Perfil.</Text>
                        </View>
                    </TouchableOpacity>
                )}

                <CardTurmaPassageiro turma={turma} />

                {turma && (
                    <>
                        <View style={styles.topoPassageiro}>
                            <Text style={styles.sectionTitle}>Radar do Motorista</Text>
                            <View style={styles.badge}><Text style={styles.badgeTexto}>{statusGps}</Text></View>
                        </View>

                        <View style={styles.radarCard}>
                            {statusViagem === 'INATIVA' ? (
                                <View style={styles.cadeadoBox}>
                                    <Ionicons name="bus-outline" size={40} color="#94a3b8" />
                                    <Text style={styles.cadeadoTitulo}>A van está na garagem</Text>
                                </View>
                            ) : minhaLocalizacao ? (
                                <WebView ref={vanMapRef} source={{ html: mapHtml }} javaScriptEnabled={true} scrollEnabled={false} />
                            ) : (
                                <ActivityIndicator size="large" color="#2563eb" style={{ flex: 1 }} />
                            )}
                        </View>

                        <SeletorPresenca statusConfirmado={statusConfirmado} onRegistrar={registrarPresenca} />
                    </>
                )}
            </ScrollView>
        </View>
    );
}