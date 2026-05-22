import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/config'; // Importação centralizada

export default function CadastroEndereco() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [enderecoCompleto, setEnderecoCompleto] = useState('Toque no mapa para marcar sua localização');

    useEffect(() => {
        async function obterLocalizacao() {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLocation({ latitude: -8.2336, longitude: -35.7958 });
                setLoading(false);
                return;
            }
            try {
                let loc = await Location.getCurrentPositionAsync({});
                setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
            } catch (error) {
                setLocation({ latitude: -8.2336, longitude: -35.7958 });
            }
            setLoading(false);
        }
        obterLocalizacao();
    }, []);

    const handleMapMessage = async (event: any) => {
        try {
            const { latitude, longitude } = JSON.parse(event.nativeEvent.data);
            setLocation({ latitude, longitude });
            const [resultado] = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (resultado) {
                setEnderecoCompleto(`${resultado.street || 'Rua não identificada'}, ${resultado.streetNumber || 'S/N'}`);
            }
        } catch (error) {
            setEnderecoCompleto('Endereço selecionado no mapa');
        }
    };

    const salvarEndereco = async () => {
        if (!location) return Alert.alert('Atenção', 'Selecione uma localização no mapa.');
        try {
            const userId = await AsyncStorage.getItem('userId');
            const response = await fetch(`${API_URL}/usuarios/salvar-endereco`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idUsuario: Number(userId), latitude: location.latitude, longitude: location.longitude, enderecoCompleto })
            });

            if (response.ok) {
                Alert.alert('Sucesso', 'Local definido!');
                router.replace('/(tabs)/home');
            }
        } catch (e) {
            Alert.alert('Erro', 'Falha na conexão com o servidor.');
        }
    };

    if (loading || !location) return <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>;

    const mapHtml = `
        <!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>body, html, #map { height: 100%; margin: 0; }</style></head>
        <body><div id="map"></div><script>
            var map = L.map('map').setView([${location.latitude}, ${location.longitude}], 16);
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
            var marker = L.marker([${location.latitude}, ${location.longitude}]).addTo(map);
            map.on('click', function(e) {
                marker.setLatLng(e.latlng);
                window.ReactNativeWebView.postMessage(JSON.stringify({ latitude: e.latlng.lat, longitude: e.latlng.lng }));
            });
        </script></body></html>`;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <Text style={styles.header}>Onde você embarca?</Text>
            <View style={styles.mapContainer}>
                <WebView source={{ html: mapHtml }} onMessage={handleMapMessage} javaScriptEnabled={true} scrollEnabled={false} />
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