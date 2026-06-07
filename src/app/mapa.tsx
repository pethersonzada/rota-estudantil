import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { API_URL } from '../config/config';

type Passageiro = {
    id: number;
    nome: string;
    latitude: number;
    longitude: number;
};

export default function Mapa() {
    const webViewRef = useRef<WebView>(null);
    const { sentido } = useLocalSearchParams<{ sentido: string }>(); 
    const direcao = sentido || 'ida'; 

    const [localizacao, setLocalizacao] = useState<{ latitude: number; longitude: number } | null>(null);
    const [rota, setRota] = useState<Passageiro[]>([]);
    const [garagem, setGaragem] = useState<{ latitude: number; longitude: number } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let locationSubscription: Location.LocationSubscription | null = null;

        const iniciarSistema = async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    locationSubscription = await Location.watchPositionAsync(
                        { 
                            accuracy: Location.Accuracy.High, 
                            timeInterval: 5000, 
                            distanceInterval: 5 
                        },
                        async (loc) => {
                            const lat = loc.coords.latitude;
                            const lng = loc.coords.longitude;
                            
                            setLocalizacao({ latitude: lat, longitude: lng });

                            try {
                                await fetch(`${API_URL}/rota/localizacao-van?latitude=${lat}&longitude=${lng}`, {
                                    method: 'POST',
                                    headers: { 'Accept': 'application/json' }
                                });
                            } catch (e) {
                                console.log("Falha na transmissão silenciada. Verifique a rede.");
                            }
                        }
                    );
                }
                await carregarDadosDinamicamente();
            } catch (error) {
                console.error("Erro no GPS:", error);
            } finally {
                setLoading(false);
            }
        };

        iniciarSistema();

        return () => {
            if (locationSubscription) {
                locationSubscription.remove();
            }
        };
    }, []);

    useEffect(() => {
        if (localizacao && webViewRef.current) {
            webViewRef.current.injectJavaScript(`
                if (typeof atualizarVan === 'function') atualizarVan([${localizacao.latitude}, ${localizacao.longitude}]);
                true;
            `);
        }
    }, [localizacao]);

    async function carregarDadosDinamicamente() {
        setLoading(true);
        try {
            const resMotorista = await fetch(`${API_URL}/usuarios/motorista`, {
                headers: { 'bypass-tunnel-reminder': 'true' }
            });
            
            if (!resMotorista.ok) return;
            const dadosMotorista = await resMotorista.json();
            setGaragem({ latitude: dadosMotorista.latitude, longitude: dadosMotorista.longitude });

            const resRota = await fetch(`${API_URL}/rota/otimizar/${dadosMotorista.id}?sentido=${direcao}`, {
                headers: { 'bypass-tunnel-reminder': 'true' }
            });
            
            if (resRota.ok) {
                const dadosRota = await resRota.json();
                setRota(dadosRota);
            }
        } catch (error) {
            console.log("Erro ao conectar com a base.");
        } finally {
            setLoading(false);
        }
    }

    if (loading || !garagem) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>Traçando rota de {direcao.toUpperCase()}...</Text>
            </View>
        );
    }

    const htmlDoMapa = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
            <style>
                body { padding: 0; margin: 0; }
                #map { height: 100vh; width: 100vw; }
                .van-icon { font-size: 24px; text-align: center; }
            </style>
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
                
                var map = L.map('map').setView([startLat, startLng], 14);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
                
                var polyline = L.polyline([], {color: '#2563eb', weight: 8, opacity: 0.7, lineJoin: 'round'}).addTo(map);
                
                var passageiros = ${JSON.stringify(rota)};
                var casaMotorista = [${garagem.latitude}, ${garagem.longitude}]; 
                var uniCaruaru = [-8.302755, -35.991248]; 

                var sentidoAtual = "${direcao}"; 

                L.marker(casaMotorista).addTo(map).bindPopup("<b>🏠 Garagem</b>");
                L.marker(uniCaruaru, {
                    icon: new L.Icon({iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', iconSize: [25, 41]})
                }).addTo(map).bindPopup("<b>🏁 UNINASSAU</b>");

                passageiros.forEach((p, i) => {
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

                // CORREÇÃO: vanMarker inicia nulo para evitar ícone fantasma
                var vanMarker = null;

                function atualizarVan(pos) {
                    if (!vanMarker) {
                        vanMarker = L.marker(pos, {icon: L.divIcon({html: '🚐', className: 'van-icon', iconSize: [30,30]})}).addTo(map);
                    } else {
                        vanMarker.setLatLng(pos);
                    }
                }

                // Se já tivermos localização real, desenha, caso contrário, espera o sinal
                if (${localizacao !== null ? 'true' : 'false'}) {
                    atualizarVan([startLat, startLng]);
                }
                
                var initialWaypoints = construirWaypoints();
                
                fetch('https://router.project-osrm.org/route/v1/driving/' + initialWaypoints + '?geometries=geojson&overview=full')
                    .then(r => r.json())
                    .then(data => {
                        if(data.routes && data.routes.length > 0) {
                            var fullCoords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
                            polyline.setLatLngs(fullCoords);
                        }
                    }).catch(e => console.log("Erro no OSRM", e));
            </script>
        </body>
        </html>
    `;

    return (
        <View style={styles.container}>
            <View style={styles.badgeSentido}>
                <Text style={styles.textoBadge}>ROTA DE {direcao.toUpperCase()}</Text>
            </View>
            <WebView 
                ref={webViewRef}
                originWhitelist={['*']} 
                source={{ html: htmlDoMapa }} 
                style={styles.map} 
                javaScriptEnabled={true}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    map: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
    loadingText: { color: '#ffffff', fontSize: 16, marginTop: 15, fontWeight: '500' },
    badgeSentido: { position: 'absolute', top: 40, left: 20, right: 20, backgroundColor: 'rgba(0,0,0,0.8)', padding: 10, borderRadius: 8, zIndex: 10, alignItems: 'center' },
    textoBadge: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 }
});