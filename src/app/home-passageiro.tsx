import { Ionicons } from '@expo/vector-icons';
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
import { useAuth } from './context/AuthContext';

export default function HomePassageiro() {
    const { user } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const vanMapRef = useRef<WebView>(null);
    
    const [loading, setLoading] = useState(true);
    const primeiraCarga = useRef(true);
    
    const [temEndereco, setTemEndereco] = useState(true);
    const [statusConfirmado, setStatusConfirmado] = useState('');
    const [minhaLocalizacao, setMinhaLocalizacao] = useState<{ latitude: number; longitude: number } | null>(null);
    const [statusViagem, setStatusViagem] = useState('INATIVA');
    const [statusGps, setStatusGps] = useState('GARAGEM');
    const [turma, setTurma] = useState(null);

    // Dispara o carregamento assim que o ID do usuário chega pelo AuthContext
    useEffect(() => {
        if (user?.id) {
            carregarDados();
        }
    }, [user?.id]);

    // Recarrega os dados sempre que a tela ganha foco
    useFocusEffect(
        useCallback(() => { 
            if (user?.id) {
                carregarDados();
            }
        }, [user?.id])
    );

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
        if (primeiraCarga.current) setLoading(true);

        try {
            setTemEndereco(!!user?.endereco && user.endereco !== 'Endereço Pendente');

            if (user?.id) {
                const [resStatus, resTurma] = await Promise.all([
                    fetch(`${API_URL}/usuarios/passageiros`, { headers: { 'Bypass-Tunnel-Reminder': 'true' } }),
                    fetch(`${API_URL}/turmas/usuario/${user.id}`, { headers: { 'Bypass-Tunnel-Reminder': 'true' } })
                ]);
                
                if (resStatus.ok) {
                    const list = await resStatus.json();
                    const meuRegistro = list.find((p: any) => String(p.id || p.usuarioId || p.passageiroId) === String(user.id));
                    setStatusConfirmado(meuRegistro?.status || meuRegistro?.presenca || '');
                }
                
                if (resTurma.ok) setTurma(await resTurma.json());

                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                    setMinhaLocalizacao({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
                }
            }
        } catch (e) { 
        } finally {
            setLoading(false);
            primeiraCarga.current = false;
        }
    }

    async function registrarPresenca(status: string) {
        if (!user?.id) return;
        const statusEnvio = status === 'LIMPAR' ? '' : status;
        setStatusConfirmado(statusEnvio);
        try {
            const resposta = await fetch(`${API_URL}/presenca/marcar`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
                body: JSON.stringify({ usuarioId: Number(user.id), status: statusEnvio })
            });
            
            if (!resposta.ok) {
                carregarDados();
            }
        } catch (e) { 
            carregarDados();
            Alert.alert("Erro", "Falha de conexão."); 
        }
    }

    const mapHtml = useMemo(() => {
        if (!minhaLocalizacao) return '';
        return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><style>body,html{height:100%;margin:0;padding:0}#map{height:100vh;width:100vw;position:absolute}.van-icon{font-size:24px;text-align:center}</style></head><body><div id="map"></div><script>var map=L.map('map',{zoomControl:false,dragging:true}).setView([${minhaLocalizacao.latitude},${minhaLocalizacao.longitude}],15);L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);var vMarker=null;function updateDriverLocation(lat,lng){if(!vMarker){vMarker=L.marker([lat,lng],{icon:L.divIcon({html:'🚐',className:'van-icon',iconSize:[30,30]})}).addTo(map);}else{vMarker.setLatLng([lat,lng]);map.panTo([lat,lng]);}}</script></body></html>`;
    }, [minhaLocalizacao]);

    if (loading) return <ActivityIndicator size="large" color="#2563eb" style={{ flex: 1, backgroundColor: '#f1f5f9' }} />;

    return (
        <View style={styles.container}>
            <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
                <Text style={styles.dateText}>{new Date().toLocaleDateString('pt-BR', { month: 'long', day: 'numeric' })}</Text>
                <Text style={styles.welcome}>Olá, {user?.nome ? user.nome.split(' ')[0] : ''}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {!temEndereco && (
                    <TouchableOpacity style={styles.bannerAlerta} onPress={() => router.push('/cadastro-endereco')}>
                        <Ionicons name="location" size={24} color="#b91c1c" />
                        <View style={{flex: 1, marginLeft: 10}}>
                            <Text style={styles.alertaTitulo}>Local faltando</Text>
                            <Text style={styles.alertaTexto}>Defina seu endereço no Perfil.</Text>
                        </View>
                    </TouchableOpacity>
                )}

                <CardTurmaPassageiro turma={turma} />

                {turma && (
                    <>
                        <View style={styles.topoPassageiro}>
                            <Text style={styles.sectionTitle}>Radar da Van</Text>
                            <View style={styles.badge}><Text style={styles.badgeTexto}>{statusGps}</Text></View>
                        </View>

                        <View style={styles.radarCard}>
                            {statusViagem === 'INATIVA' ? (
                                <View style={styles.cadeadoBox}>
                                    <Ionicons name="bus-outline" size={40} color="#94a3b8" />
                                    <Text style={styles.cadeadoTitulo}>A van está na garagem</Text>
                                </View>
                            ) : minhaLocalizacao ? (
                                <WebView ref={vanMapRef} source={{ html: mapHtml }} javaScriptEnabled={true} scrollEnabled={false} overScrollMode="never" bounces={false} />
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