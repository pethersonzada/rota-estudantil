import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { API_URL } from '../config/config';
import { mapaStyles as styles } from '../constants/mapaStyles';
import { useAuth } from './context/AuthContext';

type Passageiro = {
    id: number;
    nome: string;
    latitude: number;
    longitude: number;
};

export default function Mapa() {
    const webViewRef = useRef<WebView>(null);
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { sentido } = useLocalSearchParams<{ sentido: string }>(); 
    const { user } = useAuth();
    
    const [direcaoAtual, setDirecaoAtual] = useState(sentido || 'ida'); 
    const [localizacao, setLocalizacao] = useState<{ latitude: number; longitude: number } | null>(null);
    const [rota, setRota] = useState<Passageiro[]>([]);
    const [garagem, setGaragem] = useState<{ latitude: number; longitude: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [viagemAtiva, setViagemAtiva] = useState(false);

    useEffect(() => {
        let locationSubscription: Location.LocationSubscription | null = null;

        const iniciarSistema = async () => {
            try {
                let direcaoDefinitiva = sentido || 'ida';
                const resStatus = await fetch(`${API_URL}/rota/status-atual`, { headers: { 'Bypass-Tunnel-Reminder': 'true' } });
                if (resStatus.ok) {
                    const dataStatus = await resStatus.json();
                    if (dataStatus.status === 'ATIVA') {
                        setViagemAtiva(true);
                        if (dataStatus.sentido) direcaoDefinitiva = dataStatus.sentido.toLowerCase();
                    }
                }

                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    locationSubscription = await Location.watchPositionAsync(
                        { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 5 },
                        async (loc) => {
                            const lat = loc.coords.latitude;
                            const lng = loc.coords.longitude;
                            setLocalizacao({ latitude: lat, longitude: lng });

                            try {
                                await fetch(`${API_URL}/rota/localizacao-van?latitude=${lat}&longitude=${lng}`, {
                                    method: 'POST',
                                    headers: { 'Accept': 'application/json', 'Bypass-Tunnel-Reminder': 'true' }
                                });
                            } catch (e) {}
                        }
                    );
                }
                
                await carregarDadosDinamicamente(direcaoDefinitiva);
            } catch (error) {
                console.error("Erro no sistema:", error);
            } finally {
                setLoading(false);
            }
        };

        iniciarSistema();

        return () => { if (locationSubscription) locationSubscription.remove(); };
    }, []);

    useEffect(() => {
        if (localizacao && webViewRef.current) {
            webViewRef.current.injectJavaScript(`if (typeof atualizarVan === 'function') atualizarVan([${localizacao.latitude}, ${localizacao.longitude}]); true;`);
        }
    }, [localizacao]);

    async function carregarDadosDinamicamente(direcaoUsada: string) {
        setLoading(true);
        try {
            const resMotorista = await fetch(`${API_URL}/usuarios/motorista`, { headers: { 'bypass-tunnel-reminder': 'true' } });
            if (!resMotorista.ok) throw new Error();
            const dadosMotorista = await resMotorista.json();
            setGaragem({ latitude: Number(dadosMotorista.latitude), longitude: Number(dadosMotorista.longitude) });

            const resRota = await fetch(`${API_URL}/rota/otimizar?sentido=${direcaoUsada}`, { headers: { 'bypass-tunnel-reminder': 'true' } });
            if (resRota.ok) {
                setRota(await resRota.json());
                setDirecaoAtual(direcaoUsada);
            }
        } catch (error) {
            console.error("Erro na carga");
        } finally {
            setLoading(false);
        }
    }

    async function handleIniciarViagem() {
        if (!user.id) return;
        Alert.alert("Iniciar Rota", "Deseja iniciar a viagem agora?", [
            { text: "Cancelar", style: "cancel" },
            { text: "Iniciar", onPress: async () => {
                try {
                    const res = await fetch(`${API_URL}/rota/iniciar`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
                        body: JSON.stringify({ motoristaId: user.id, sentido: direcaoAtual.toUpperCase() }) 
                    });
                    if (res.ok) setViagemAtiva(true);
                } catch (error) {}
            }}
        ]);
    }

    async function handleEncerrarViagem() {
        Alert.alert("Finalizar Trajeto", "Encerrar viagem?", [
            { text: "Cancelar", style: "cancel" },
            { text: "Encerrar", style: 'destructive', onPress: async () => {
                try {
                    const res = await fetch(`${API_URL}/rota/encerrar`, { method: 'POST', headers: { 'Bypass-Tunnel-Reminder': 'true' } });
                    if (res.ok) {
                        setViagemAtiva(false);
                        router.replace('/(tabs)/home');
                    }
                } catch (error) {}
            }}
        ]);
    }

    function handleVoltar() {
        if (viagemAtiva) {
            Alert.alert("Atenção", "Sair da viagem?", [
                { text: "Cancelar", style: "cancel" },
                { text: "Sair", style: 'destructive', onPress: () => router.replace('/(tabs)/home') }
            ]);
        } else { router.replace('/(tabs)/home'); }
    }

    function centralizarNaVan() {
        if (webViewRef.current) {
            webViewRef.current.injectJavaScript(`if (typeof vanMarker !== 'undefined' && vanMarker) { map.setView(vanMarker.getLatLng(), 15); } true;`);
        }
    }

    if (loading || !garagem) return <ActivityIndicator size="large" color="#2563eb" style={{flex:1}} />;

    const htmlDoMapa = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
            <style>body{padding:0;margin:0}#map{height:100vh;width:100vw;touch-action:none}.van-icon{font-size:24px;text-align:center}</style>
        </head>
        <body>
            <div id="map"></div>
            <script>
                delete L.Icon.Default.prototype._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                });

                var startLat = ${localizacao?.latitude ?? garagem.latitude};
                var startLng = ${localizacao?.longitude ?? garagem.longitude};
                
                var map = L.map('map', { zoomControl: false }).setView([startLat, startLng], 14);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
                
                var polyline = L.polyline([], {color: '#2563eb', weight: 6, opacity: 0.8, lineJoin: 'round'}).addTo(map);
                
                var passageiros = ${JSON.stringify(rota)};
                var casaMotorista = [${garagem.latitude}, ${garagem.longitude}]; 
                var uniCaruaru = [-8.302755, -35.991248]; 
                var sentidoAtual = "${direcaoAtual}"; 

                L.marker(casaMotorista).addTo(map).bindPopup("<b>🏠 Garagem</b>");
                L.marker(uniCaruaru, {
                    icon: new L.Icon({iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', iconSize: [25, 41]})
                }).addTo(map).bindPopup("<b>🏁 UNINASSAU</b>");

                passageiros.forEach((p) => {
                    L.marker([p.latitude, p.longitude]).addTo(map).bindPopup("<b>" + p.nome + "</b>");
                });

                function construirWaypoints() {
                    var pontos = [];
                    if (sentidoAtual === 'ida') {
                        pontos.push(casaMotorista[1] + "," + casaMotorista[0]);
                        passageiros.forEach(function(p) { pontos.push(p.longitude + ',' + p.latitude); });
                        pontos.push(uniCaruaru[1] + "," + uniCaruaru[0]);
                    } else {
                        pontos.push(uniCaruaru[1] + "," + uniCaruaru[0]);
                        passageiros.slice().reverse().forEach(function(p) { pontos.push(p.longitude + ',' + p.latitude); });
                        pontos.push(casaMotorista[1] + "," + casaMotorista[0]);
                    }
                    return pontos.join(';'); 
                }

                var vanMarker = null;
                function atualizarVan(pos) {
                    if (!vanMarker) {
                        vanMarker = L.marker(pos, {icon: L.divIcon({html: '🚐', className: 'van-icon', iconSize: [30,30]})}).addTo(map);
                        map.setView(pos, 15);
                    } else {
                        vanMarker.setLatLng(pos);
                    }
                }

                if (${localizacao !== null ? 'true' : 'false'}) atualizarVan([startLat, startLng]);
                
                var initialWaypoints = construirWaypoints();
                fetch('https://router.project-osrm.org/route/v1/driving/' + initialWaypoints + '?geometries=geojson&overview=full')
                    .then(r => r.json())
                    .then(data => {
                        if(data.routes && data.routes.length > 0) {
                            var fullCoords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
                            polyline.setLatLngs(fullCoords);
                        }
                    }).catch(e => console.log(e));
            </script>
        </body>
        </html>
    `;

    return (
        <View style={styles.container}>
            <View style={[styles.headerOverlay, { top: insets.top + 10 }]}>
                <TouchableOpacity style={styles.backButton} onPress={handleVoltar}>
                    <Ionicons name="arrow-back" size={24} color="#1e293b" />
                </TouchableOpacity>
                <View style={styles.badgeSentido}>
                    <Text style={styles.textoBadge}>ROTA DE {direcaoAtual.toUpperCase()}</Text>
                </View>
            </View>
            
            <WebView ref={webViewRef} originWhitelist={['*']} source={{ html: htmlDoMapa }} style={styles.map} javaScriptEnabled={true} bounces={false} scrollEnabled={false} overScrollMode="never" />

            <TouchableOpacity style={styles.btnCentralizar} onPress={centralizarNaVan}>
                <Ionicons name="locate" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={[styles.footerAcoes, { bottom: insets.bottom + 20 }]}>
                {!viagemAtiva ? (
                    <TouchableOpacity style={styles.btnIniciar} onPress={handleIniciarViagem}>
                        <Ionicons name="play" size={20} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.btnText}>INICIAR ROTA</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.btnEncerrar} onPress={handleEncerrarViagem}>
                        <Ionicons name="stop" size={20} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.btnText}>ENCERRAR ROTA</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}