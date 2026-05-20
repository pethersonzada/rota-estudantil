import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';

export default function Perfil() {
    const motorista = {
        nome: 'João Motorista',
        email: 'joao@email.com',
        telefone: '(81) 99999-9999',
        cnh: '12345678900',
        veiculo: {
            modelo: 'Sprinter 2020',
            placa: 'ABC-1234',
            cor: 'Branca',
            capacidade: '15 passageiros',
        },
        rota: {
            origem: 'Bezerros, PE',
            destino: 'Faculdade UNINASSAU',
            horarioSaida: '07:00',
            horarioRetorno: '18:00',
        }
    };

    return (
        <View style={styles.wrapper}>
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <Ionicons name="person-circle" size={80} color="white" />
                </View>
                <Text style={styles.nome}>{motorista.nome}</Text>
                <Text style={styles.email}>{motorista.email}</Text>
            </View>

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

                <View style={styles.card}>
                    <Text style={styles.cardTitulo}>Informações Pessoais</Text>
                    <View style={styles.infoRow}>
                        <Ionicons name="call" size={20} color="#354c62" />
                        <Text style={styles.infoTexto}>{motorista.telefone}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="card" size={20} color="#354c62" />
                        <Text style={styles.infoTexto}>CNH: {motorista.cnh}</Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitulo}>Veículo</Text>
                    <View style={styles.infoRow}>
                        <Ionicons name="car" size={20} color="#354c62" />
                        <Text style={styles.infoTexto}>{motorista.veiculo.modelo}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="pricetag" size={20} color="#354c62" />
                        <Text style={styles.infoTexto}>Placa: {motorista.veiculo.placa}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="color-palette" size={20} color="#354c62" />
                        <Text style={styles.infoTexto}>Cor: {motorista.veiculo.cor}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="people" size={20} color="#354c62" />
                        <Text style={styles.infoTexto}>{motorista.veiculo.capacidade}</Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitulo}>Rota</Text>
                    <View style={styles.infoRow}>
                        <Ionicons name="location" size={20} color="#354c62" />
                        <Text style={styles.infoTexto}>Origem: {motorista.rota.origem}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="flag" size={20} color="#354c62" />
                        <Text style={styles.infoTexto}>Destino: {motorista.rota.destino}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="time" size={20} color="#354c62" />
                        <Text style={styles.infoTexto}>Saída: {motorista.rota.horarioSaida}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="time-outline" size={20} color="#354c62" />
                        <Text style={styles.infoTexto}>Retorno: {motorista.rota.horarioRetorno}</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.botaoSair} onPress={() => router.push('/loginn')}>
                    <Ionicons name="log-out" size={20} color="white" />
                    <Text style={styles.botaoSairTexto}>Sair</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: { flex: 1, backgroundColor: '#f0f9ff' },
    header: {
        backgroundColor: '#354c62',
        padding: 30,
        paddingTop: 60,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    avatarContainer: { marginBottom: 10 },
    nome: { fontSize: 22, fontWeight: 'bold', color: 'white' },
    email: { fontSize: 14, color: '#9aafc2', marginTop: 4 },
    scroll: { padding: 20 },
    card: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    cardTitulo: { fontSize: 16, fontWeight: 'bold', color: '#354c62', marginBottom: 15 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    infoTexto: { fontSize: 15, color: '#354c62' },
    botaoSair: {
        backgroundColor: '#c0392b',
        borderRadius: 20,
        padding: 18,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        marginBottom: 30,
    },
    botaoSairTexto: { fontSize: 16, fontWeight: 'bold', color: 'white' },
});