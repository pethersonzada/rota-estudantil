import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const passageirosIniciais = [
    { id: 1, nome: 'Miguel Petherson', endereco: 'Rua José Rufino, Bezerros' },
    { id: 2, nome: 'Maria Rafaela', endereco: 'Rua Idelfonso Antônio, Bezerros' },
    { id: 3, nome: 'João Silva', endereco: 'Rua das Flores, Bezerros' },
    { id: 4, nome: 'Ana Souza', endereco: 'Av. Central, Bezerros' },
];

export default function Confirmacao() {
    const [passageiros, setPassageiros] = useState(
        passageirosIniciais.map(p => ({ ...p, vai: false }))
    );

    function toggleVai(id: number) {
        setPassageiros(prev =>
            prev.map(p => p.id === id ? { ...p, vai: !p.vai } : p)
        );
    }

    const confirmados = passageiros.filter(p => p.vai).length;

    return (
        <View style={styles.wrapper}>
            <View style={styles.header}>
                <Text style={styles.titulo}>Passageiros</Text>
                <Text style={styles.subtitulo}>{confirmados} de {passageiros.length} confirmados</Text>
            </View>

            <View style={styles.container}>
                <FlatList
                    data={passageiros}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ gap: 12, paddingVertical: 20 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.card, item.vai && styles.cardConfirmado]}
                            onPress={() => toggleVai(item.id)}
                            activeOpacity={0.8}
                        >
                            <View style={styles.cardInfo}>
                                <Ionicons
                                    name="person-circle"
                                    size={44}
                                    color={item.vai ? 'white' : '#354c62'}
                                />
                                <View>
                                    <Text style={[styles.nomePassageiro, item.vai && styles.textoConfirmado]}>
                                        {item.nome}
                                    </Text>
                                    <Text style={[styles.enderecoTexto, item.vai && styles.textoConfirmadoSub]}>
                                        {item.endereco}
                                    </Text>
                                </View>
                            </View>
                            <View style={[styles.toggle, item.vai && styles.toggleAtivo]}>
                                <Ionicons
                                    name={item.vai ? 'checkmark' : 'close'}
                                    size={20}
                                    color="white"
                                />
                            </View>
                        </TouchableOpacity>
                    )}
                />

                <TouchableOpacity
                    style={[styles.botaoRota, confirmados === 0 && styles.botaoDesabilitado]}
                    onPress={() => confirmados > 0 && router.push('/mapa')}
                    activeOpacity={confirmados > 0 ? 0.8 : 1}
                >
                    <Ionicons name="navigate" size={22} color="white" />
                    <Text style={styles.botaoRotaTexto}>
                        {confirmados > 0 ? `Iniciar Rota (${confirmados})` : 'Selecione os passageiros'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: { flex: 1, backgroundColor: '#354c62' },
    header: {
        paddingTop: 60,
        paddingHorizontal: 25,
        paddingBottom: 25,
    },
    titulo: { fontSize: 32, fontWeight: '700', color: 'white' },
    subtitulo: { fontSize: 16, color: '#9aafc2', marginTop: 4 },
    container: {
        flex: 1,
        backgroundColor: '#f0f9ff',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        borderRadius: 18,
        padding: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    cardConfirmado: { backgroundColor: '#354c62' },
    cardInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    nomePassageiro: { fontSize: 16, fontWeight: '600', color: '#354c62' },
    enderecoTexto: { fontSize: 12, color: '#9aafc2', marginTop: 2 },
    textoConfirmado: { color: 'white' },
    textoConfirmadoSub: { color: '#9aafc2' },
    toggle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#9aafc2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    toggleAtivo: { backgroundColor: '#2ecc71' },
    botaoRota: {
        backgroundColor: '#354c62',
        borderRadius: 18,
        padding: 18,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        marginTop: 10,
    },
    botaoDesabilitado: { backgroundColor: '#9aafc2' },
    botaoRotaTexto: { fontSize: 16, fontWeight: 'bold', color: 'white' },
});