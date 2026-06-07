import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { API_URL } from '../config/config';

export default function CadastroEndereco() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    
    // Guarda a localização inicial apenas para montar o mapa
    const [initialLocation, setInitialLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [enderecoCompleto, setEnderecoCompleto] = useState('Buscando seu endereço...');
    
    // useRef guarda a coordenada mais recente sem forçar a tela a piscar
    const currentCoords = useRef<{ latitude: number; longitude: number } | null>(null);

    useEffect(() => {
        (async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Aviso', 'Permissão de GPS negada. Usando local padrão.');
                    const fallback = { latitude: -8.2336, longitude: -35.7958 };
                    setInitialLocation(fallback);
                    currentCoords.current = fallback;
                    setLoading(false);
                    return;
                }

                // Força a precisão máxima do GPS
                let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
                const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
                
                setInitialLocation(coords);
                currentCoords.current = coords;

                // Já tenta buscar o nome da rua onde você está agora
                const [resultado] = await Location.reverseGeocodeAsync(coords);
                if (resultado) {
                    setEnderecoCompleto(`${resultado.street || 'Rua não identificada'}, ${resultado.streetNumber || 'S/N'}`);
                } else {
                    setEnderecoCompleto('Arraste o mapa para ajustar');
                }

            } catch (error) {
                Alert.alert('Erro de GPS', 'Não foi possível encontrar sua localização exata. Verifique o GPS.');
                const fallback = { latitude: -8.2336, longitude: -35.7958 };
                setInitialLocation(fallback);
                currentCoords.current = fallback;
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleMapMessage = async (event: any) => {
        try {
            const { lat, lng } = JSON.parse(event.nativeEvent.data);
            
            // Atualiza a coordenada silenciosamente sem re renderizar o mapa
            currentCoords.current = { latitude: lat, longitude: lng };
            
            const [resultado] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
            if (resultado) {
                setEnderecoCompleto(`${resultado.street || 'Rua não identificada'}, ${resultado.streetNumber || 'S/N'}`);
            }
        } catch (error) {
            setEnderecoCompleto('Endereço selecionado no mapa');
        }
    };

    const salvarEndereco = async () => {
        if (!currentCoords.current) return Alert.alert('Atenção', 'Aguarde o mapa carregar.');
        try {
            const userId = await AsyncStorage.getItem('userId');
            const payload = { 
                idUsuario: Number(userId), 
                latitude: currentCoords.current.latitude, 
                longitude: currentCoords.current.longitude, 
                enderecoCompleto 
            };
            
            const response = await fetch(`${API_URL}/usuarios/salvar-endereco`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                Alert.alert('Sucesso', 'Local definido!');
                router.replace('/(tabs)/home');
            } else {
                Alert.alert('Erro', `Status: ${response.status}`);
            }
        } catch (e) {
            Alert.alert('Erro', 'Falha estrutural na conexão.');
        }
    };

    // O mapa só é montado UMA VEZ usando useMemo. 
    const mapHtml = useMemo(() => {
        if (!initialLocation) return '';
        return `
            <!DOCTYPE html><html><head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
            <style>
                body, html { height: 100%; margin: 0; padding: 0; overflow: hidden; }
                #map { height: 100vh; width: 100vw; position: absolute; top: 0; left: 0; }
                .pino-container {
                    position: absolute; top: 50%; left: 50%;
                    width: 25px; height: 41px;
                    margin-top: -41px; margin-left: -12.5px;
                    z-index: 9999; pointer-events: none;
                }
            </style></head>
            <body>
                <div class="pino-container"><img src="https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png"></div>
                <div id="map"></div>
                <script>
                    // Injeta a coordenada real direto na criação do mapa
                    var map = L.map('map', {zoomControl: false, inertia: false, tap: true}).setView([${initialLocation.latitude}, ${initialLocation.longitude}], 16);
                    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
                    
                    var timeout = null;
                    map.on('move', function() {
                        clearTimeout(timeout);
                        timeout = setTimeout(function() {
                            var center = map.getCenter();
                            window.ReactNativeWebView.postMessage(JSON.stringify({ lat: center.lat, lng: center.lng }));
                        }, 200);
                    });
                </script>
            </body></html>
        `;
    }, [initialLocation]);

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <Text style={styles.header}>Onde você embarca?</Text>
            <View style={styles.mapContainer}>
                <WebView 
                    source={{ html: mapHtml }} 
                    onMessage={handleMapMessage} 
                    javaScriptEnabled={true} 
                    scrollEnabled={false} 
                />
            </View>
            <View style={styles.footer}>
                <Text style={styles.enderecoLabel}>Endereço selecionado:</Text>
                <Text style={styles.enderecoText}>{enderecoCompleto}</Text>
                <TouchableOpacity style={styles.button} onPress={salvarEndereco}>
                    <Text style={styles.buttonText}>Confirmar Localização</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 20, fontSize: 20, fontWeight: '800', color: '#1e293b', textAlign: 'center', marginTop: 10 },
    mapContainer: { flex: 1 },
    footer: { backgroundColor: '#fff', padding: 25, borderTopLeftRadius: 25, borderTopRightRadius: 25, borderWidth: 1, borderColor: '#e2e8f0' },
    enderecoLabel: { fontWeight: '700', color: '#64748b', fontSize: 13, textTransform: 'uppercase' },
    enderecoText: { fontSize: 16, marginVertical: 12, color: '#1e293b', fontWeight: '600' },
    button: { backgroundColor: '#2563eb', padding: 18, borderRadius: 15, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});