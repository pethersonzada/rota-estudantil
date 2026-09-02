import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Passageiro {
  nome: string;
  iniciais: string;
}

interface ConfirmadosAvataresProps {
  passageiros: Passageiro[];
}

export default function ConfirmadosAvatares({ passageiros = [] }: ConfirmadosAvataresProps) {
  const maxVisiveis = 4;
  const visiveis = passageiros.slice(0, maxVisiveis);
  const excedentes = passageiros.length - maxVisiveis;

  return (
    <View style={styles.container}>
      <View style={styles.avatarGroup}>
        {visiveis.map((passageiro, index) => (
          <View
            key={index}
            style={[styles.avatarCircle, { zIndex: maxVisiveis - index, marginLeft: index > 0 ? -10 : 0 }]}
          >
            <Text style={styles.avatarText}>{passageiro.iniciais || 'P'}</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.textContainer}>
        {passageiros.length > 0 ? (
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>{passageiros.length}</Text> {passageiros.length === 1 ? 'confirmado' : 'confirmados'} na rota
            {excedentes > 0 && <Text> +{excedentes}</Text>}
          </Text>
        ) : (
          <Text style={styles.emptyText}>Nenhuma confirmação ainda</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    height: 32,
    width: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: '#0E1524',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  textContainer: {
    flex: 1,
  },
  infoText: {
    fontSize: 12,
    color: '#475569',
  },
  boldText: {
    fontWeight: '700',
    color: '#0f172a',
  },
  emptyText: {
    fontSize: 12,
    color: '#94a3b8',
  },
});