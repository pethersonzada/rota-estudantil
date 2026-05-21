import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { WebView } from 'react-native-webview';

const API_URL = 'https://icy-paws-pump.loca.lt';
const MOTORISTA_ID = 2;

type Passageiro = {
    id: number;
    nome: string;
    latitude: number;
    longitude: number;
    enderecoCompleto: string;
};

export default function Mapa() {
    const [localizacao, setLocalizacao] = useState<{ latitude: number; longitude: number } | null>(null);
    const [rota, setRota] = useState<Passageiro[]>([]);
    const [loading, setLoading] = useState(true);
    const [pausado, setPausado] = useState(false);

    useEffect(() => {
        inicializar();
    }, []);

    async function inicializar() {
        try {
            console.log("[DEBUG] 1. Solicitando permissão de localização...");
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Aviso', 'Permissão de localização negada.');
                return;
            }

            console.log("[DEBUG] 2. Buscando sinal de GPS...");
            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            setLocalizacao({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });

            console.log("[DEBUG] 3. Chamando backend para carregar rota...");
            await carregarRota();
        } catch (error) {
            console.error("Erro no GPS:", error);
            Alert.alert("Erro", "Falha ao inicializar o GPS.");
        } finally {
            console.log("[DEBUG] 4. Encerrando tela de loading.");
            setLoading(false);
        }

        Location.watchPositionAsync(
            { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 5 },
            (loc) => setLocalizacao({ latitude: loc.coords.latitude, longitude: loc.coords.longitude })
        ).catch(err => console.error("Erro no rastreio:", err));
    }

    async function carregarRota() {
        try {
            const response = await fetch(`${API_URL}/rota/otimizar/${MOTORISTA_ID}`, {
                headers: { 'bypass-tunnel-reminder': 'true' }
            });
            
            if (!response.ok) {
                console.warn(`[DEBUG] Servidor retornou erro: ${response.status}`);
                return;
            }
            const data = await response.json();
            setRota(data);
            console.log(`[DEBUG] Rota carregada com sucesso. ${data.length} passageiro(s) encontrado(s).`);
        } catch (error) {
            console.error('Erro de rede:', error);
        }
    }

    async function recalcularRota() {
        setLoading(true);
        await carregarRota();
        setLoading(false);
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="white" />
                <Text style={styles.loadingText}>Mapeando rota nas ruas...</Text>
            </View>
        );
    }

    // Mapa Web Completo com Leaflet (OpenStreetMap) e OSRM (Traçado de Ruas)
    const htmlDoMapa = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
            <style>
                body { padding: 0; margin: 0; }
                #map { height: 100vh; width: 100vw; background: #e5e5e5; }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <script>
                // Inicializa no GPS ou no centro da cidade
                var map = L.map('map').setView([${localizacao?.latitude ?? -8.2331383}, ${localizacao?.longitude ?? -35.7475651}], 14);
                
                // Camada do OpenStreetMap
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '© OpenStreetMap'
                }).addTo(map);

                var pontosDaRota = [];

                // Posição do Motorista (Azul)
                ${localizacao ? `
                    var motoristaLat = ${localizacao.latitude};
                    var motoristaLng = ${localizacao.longitude};
                    L.circleMarker([motoristaLat, motoristaLng], {color: '#007AFF', radius: 8, fillOpacity: 1}).addTo(map).bindPopup("<b>Você está aqui</b>");
                    pontosDaRota.push({lat: motoristaLat, lng: motoristaLng});
                ` : ''}

                // Posição dos Passageiros (Preto)
                var passageiros = ${JSON.stringify(rota)};
                passageiros.forEach(function(p, index) {
                    L.marker([p.latitude, p.longitude]).addTo(map)
                     .bindPopup("<b>" + (index + 1) + ". " + p.nome + "</b><br>" + p.enderecoCompleto);
                    pontosDaRota.push({lat: p.latitude, lng: p.longitude});
                });

                // Traçado real das ruas com OSRM
                if (pontosDaRota.length > 1) {
                    var waypoints = pontosDaRota.map(function(p) { return p.lng + ',' + p.lat; }).join(';');
                    var osrmUrl = 'https://router.project-osrm.org/route/v1/driving/' + waypoints + '?geometries=geojson';

                    fetch(osrmUrl)
                        .then(function(response) { return response.json(); })
                        .then(function(data) {
                            if(data.routes && data.routes.length > 0) {
                                var coordenadasRua = data.routes[0].geometry.coordinates.map(function(coord) {
                                    return [coord[1], coord[0]];
                                });
                                var polyline = L.polyline(coordenadasRua, {color: 'black', weight: 5, opacity: 0.7}).addTo(map);
                                map.fitBounds(polyline.getBounds(), { padding: [30, 30] });
                            } else {
                                // Fallback em linha reta se o OSRM der timeout
                                var fallbackCoords = pontosDaRota.map(function(p){ return [p.lat, p.lng]; });
                                L.polyline(fallbackCoords, {color: 'red', weight: 4, dashArray: '10, 10'}).addTo(map);
                            }
                        })
                        .catch(function(err) {
                            console.error("Erro na API OSRM: ", err);
                            var fallbackCoords = pontosDaRota.map(function(p){ return [p.lat, p.lng]; });
                            L.polyline(fallbackCoords, {color: 'red', weight: 4, dashArray: '10, 10'}).addTo(map);
                        });
                }
            </script>
        </body>
        </html>
    `;

    return (
        <View style={styles.container}>
            <WebView 
                originWhitelist={['*']}
                source={{ html: htmlDoMapa }} 
                style={styles.map} 
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
            />

            <View style={styles.botoesContainer}>
                <TouchableOpacity
                    style={[styles.botao, pausado && styles.botaoPausado]}
                    onPress={() => setPausado(!pausado)}
                >
                    <Text style={styles.botaoTexto}>{pausado ? 'Retomar Rota' : 'Pausar Rota'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.botaoRecalcular} onPress={recalcularRota}>
                    <Text style={styles.botaoTexto}>Recalcular Rota</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },
    map: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', gap: 15 },
    loadingText: { color: 'white', fontSize: 18 },
    botoesContainer: { position: 'absolute', bottom: 40, left: 20, right: 20, gap: 10 },
    botao: { backgroundColor: 'black', padding: 15, borderRadius: 15, alignItems: 'center' },
    botaoPausado: { backgroundColor: '#444' },
    botaoRecalcular: { backgroundColor: '#222', padding: 15, borderRadius: 15, alignItems: 'center' },
    botaoTexto: { color: 'white', fontSize: 16, fontWeight: '600' },
});