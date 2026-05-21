import * as Location from 'expo-location';
import React, { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, Alert, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';

// CONFIGURAÇÃO DO SERVIDOR
const API_URL = 'https://poor-rings-dress.loca.lt';
const MOTORISTA_ID = 2;

// ESTRUTURA DE DADOS DO PASSAGEIRO
type Passageiro = {
    id: number;
    nome: string;
    latitude: number;
    longitude: number;
    enderecoCompleto: string;
};

export default function Mapa() {
    const webViewRef = useRef<WebView>(null);
    const [localizacao, setLocalizacao] = useState<{ latitude: number; longitude: number } | null>(null);
    const [rota, setRota] = useState<Passageiro[]>([]);
    const [loading, setLoading] = useState(true);

    // INICIALIZAÇÃO DO GPS E CARREGAMENTO DE DADOS
    useEffect(() => {
        const iniciarSistema = async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Aviso', 'Permissão de localização negada pelo usuário.');
                    return;
                }

                await Location.watchPositionAsync(
                    { accuracy: Location.Accuracy.High, distanceInterval: 5 },
                    (loc) => {
                        setLocalizacao({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
                    }
                );

                await carregarRotaDoServidor();
            } catch (error) {
                console.error("Erro na inicialização:", error);
            } finally {
                setLoading(false);
            }
        };

        iniciarSistema();
    }, []);

    // ENVIO DA LOCALIZAÇÃO DO MOTORISTA PARA A WEBVIEW
    useEffect(() => {
        if (localizacao && webViewRef.current) {
            const script = `
                window.posicaoAtual = [${localizacao.latitude}, ${localizacao.longitude}];
                if (typeof atualizarVan === 'function') {
                    atualizarVan(window.posicaoAtual);
                }
            `;
            webViewRef.current.injectJavaScript(script);
        }
    }, [localizacao]);

    // CHAMADA À API PARA OBTER A ROTA OTIMIZADA
    async function carregarRotaDoServidor() {
        try {
            const response = await fetch(`${API_URL}/rota/otimizar/${MOTORISTA_ID}`, {
                headers: { 'bypass-tunnel-reminder': 'true' }
            });
            if (response.ok) {
                const data = await response.json();
                setRota(data);
            }
        } catch (error) {
            Alert.alert('Erro', 'Falha ao conectar com o backend. Verifique o túnel.');
        }
    }

    // ARQUIVO HTML COMPLETO COM TODA A LÓGICA DE NAVEGAÇÃO
    const htmlDoMapa = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
                // CONFIGURAÇÃO INICIAL DO LEAFLET
                var map = L.map('map').setView([-8.23, -35.74], 14);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
                
                // VARIÁVEIS DE ESTADO DO MAPA
                var vanMarker = L.marker([0,0], {icon: L.divIcon({html: '🚐', className: 'van-icon', iconSize: [30,30]})}).addTo(map);
                var polyline = L.polyline([], {color: '#2563eb', weight: 8, opacity: 0.7, lineJoin: 'round'}).addTo(map);
                var fullCoords = [];
                var passageiros = ${JSON.stringify(rota)};
                var uniCaruaru = [-8.2833, -35.9715];

                // ADICIONAR PASSAGEIROS AO MAPA
                passageiros.forEach((p, i) => {
                    L.marker([p.latitude, p.longitude]).addTo(map).bindPopup("<b>" + (i+1) + ". " + p.nome + "</b>");
                });

                // ADICIONAR DESTINO FINAL (UNINASSAU)
                L.marker(uniCaruaru, {
                    icon: new L.Icon({iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', iconSize: [25, 41]})
                }).addTo(map).bindPopup("<b>🏁 UNINASSAU</b>");

                // FUNÇÃO DE ATUALIZAÇÃO DA POSIÇÃO E RASTRO
                function atualizarVan(pos) {
                    vanMarker.setLatLng(pos);
                    // Lógica para apagar o caminho atrás da van
                    var filtrado = fullCoords.filter(c => map.distance(c, pos) > 40);
                    polyline.setLatLngs(filtrado);
                    // Lógica de desvio: Se estiver a mais de 50m do traçado, recalcula
                    if (fullCoords.length > 0 && fullCoords.every(c => map.distance(c, pos) > 50)) {
                        recalcularRotaCompleta(pos);
                    }
                }

                // FUNÇÃO DE RECALCULO DE ROTA (DETECTOR DE DESVIO)
                function recalcularRotaCompleta(novaPos) {
                    var waypoints = novaPos[1] + "," + novaPos[0] + ";" + 
                                   passageiros.map(p => p.longitude + ',' + p.latitude).join(';') + 
                                   ";" + uniCaruaru[1] + "," + uniCaruaru[0];
                    
                    fetch('https://router.project-osrm.org/route/v1/driving/' + waypoints + '?geometries=geojson&overview=full')
                        .then(r => r.json()).then(data => {
                            fullCoords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
                            polyline.setLatLngs(fullCoords);
                        });
                }

                // CÁLCULO INICIAL DA ROTA
                var startWay = "${localizacao?.longitude ?? -35.75},${localizacao?.latitude ?? -8.23}";
                var initialWaypoints = startWay + ";" + passageiros.map(p => p.longitude + ',' + p.latitude).join(';') + ";" + uniCaruaru[1] + "," + uniCaruaru[0];
                
                fetch('https://router.project-osrm.org/route/v1/driving/' + initialWaypoints + '?geometries=geojson&overview=full')
                    .then(r => r.json()).then(data => {
                        fullCoords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
                        polyline.setLatLngs(fullCoords);
                    });
            </script>
        </body>
        </html>
    `;

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ffffff" />
                <Text style={styles.loadingText}>Configurando mapa profissional...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <WebView 
                ref={webViewRef}
                originWhitelist={['*']} 
                source={{ html: htmlDoMapa }} 
                style={styles.map} 
            />
            <TouchableOpacity style={styles.botaoAtualizar} onPress={carregarRotaDoServidor}>
                <Text style={styles.textoBotao}>Recarregar Rota</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    map: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
    loadingText: { color: '#ffffff', fontSize: 16, marginTop: 15, fontWeight: '500' },
    botaoAtualizar: { 
        position: 'absolute', 
        bottom: 30, 
        left: 20, 
        right: 20, 
        padding: 18, 
        backgroundColor: '#2563eb', 
        borderRadius: 12, 
        alignItems: 'center',
        elevation: 5 
    },
    textoBotao: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' }
});