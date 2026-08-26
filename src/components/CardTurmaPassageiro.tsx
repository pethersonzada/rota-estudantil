import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { homeMotoristaStyles as styles } from '../constants/homeMotoristaStyles';

type Turma = {
    id: number;
    nome: string;
    turno: string;
    motorista?: { nome: string; telefone: string };
};

export function CardTurmaPassageiro({ turma }: { turma: Turma | null }) {
    return (
        <View style={styles.cardList}>
            <View style={styles.headerRow}>
                <Ionicons name="bus" size={20} color="#2563eb" />
                <Text style={styles.sectionTitle}>Sua Van / Rota</Text>
            </View>
            {turma ? (
                <View style={{ marginTop: 8 }}>
                    <Text style={styles.nameText}>{turma.nome} ({turma.turno})</Text>
                    {turma.motorista && <Text style={styles.subText}>Motorista: {turma.motorista.nome}</Text>}
                </View>
            ) : (
                <View style={{ alignItems: 'center', paddingVertical: 15 }}>
                    <Ionicons name="time-outline" size={32} color="#f59e0b" />
                    <Text style={styles.nameText}>Aguardando vinculação</Text>
                    <Text style={styles.subText}>O motorista ainda não te adicionou a nenhuma turma.</Text>
                </View>
            )}
        </View>
    );
}