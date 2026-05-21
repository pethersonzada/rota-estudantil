import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Home() {
  const [horario, setHorario] = useState('');

  useEffect(() => {
    const agora = new Date();
    setHorario(agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    const interval = setInterval(() => {
      setHorario(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <View>
          <Text style={styles.saudacao}>Bom dia, Motorista</Text>
          <Text style={styles.data}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
        </View>
        <View style={styles.horaContainer}>
          <Text style={styles.hora}>{horario}</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.card}>
          <Text style={styles.cardTitulo}>Resumo de hoje</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNumero}>2</Text>
              <Text style={styles.statLabel}>Vão hoje</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNumero}>1</Text>
              <Text style={styles.statLabel}>Não vão</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNumero}>3</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.botaoRota} onPress={() => router.push('/confirmacao')}>
          <Ionicons name="people" size={24} color="white" />
          <Text style={styles.botaoRotaTexto}>Gerenciar Passageiros</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botaoMapa} onPress={() => router.push('/mapa')}>
          <Ionicons name="navigate" size={24} color="#354c62" />
          <Text style={styles.botaoMapaTexto}>Ver Rota</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.cardTitulo}>Próxima saída</Text>
          <View style={styles.proximaSaida}>
            <Ionicons name="time" size={28} color="#354c62" />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.horaSaida}>07:00</Text>
              <Text style={styles.destinoText}>Faculdade UNINASSAU</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f0f9ff' },
  header: {
    backgroundColor: '#354c62',
    padding: 25,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  saudacao: { fontSize: 22, fontWeight: 'bold', color: 'white' },
  data: { fontSize: 13, color: '#9aafc2', marginTop: 4 },
  horaContainer: { backgroundColor: '#9aafc2', borderRadius: 12, padding: 10 },
  hora: { fontSize: 20, fontWeight: 'bold', color: 'white' },
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
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  stat: { alignItems: 'center' },
  statNumero: { fontSize: 32, fontWeight: 'bold', color: '#354c62' },
  statLabel: { fontSize: 12, color: '#9aafc2', marginTop: 4 },
  statDivider: { width: 1, height: 40, backgroundColor: '#e0e0e0' },
  botaoRota: {
    backgroundColor: '#354c62',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  botaoRotaTexto: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  botaoMapa: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#354c62',
    elevation: 2,
  },
  botaoMapaTexto: { fontSize: 18, fontWeight: 'bold', color: '#354c62' },
  proximaSaida: { flexDirection: 'row', alignItems: 'center' },
  horaSaida: { fontSize: 24, fontWeight: 'bold', color: '#354c62' },
  destinoText: { fontSize: 14, color: '#9aafc2', marginTop: 2 },
});