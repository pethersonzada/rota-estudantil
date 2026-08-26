import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { homeMotoristaStyles as styles } from '../constants/homeMotoristaStyles';

type Turma = {
    id: number;
    nome: string;
    turno: string;
};

type Props = {
    turmas: Turma[];
    turmaSelecionada: Turma | null;
    onSelecionarTurma: (turma: Turma) => void;
    onEditarTurma: () => void;
};

export function CardsTurmasMotorista({ turmas, turmaSelecionada, onSelecionarTurma, onEditarTurma }: Props) {
    return (
        <View>
            <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>Selecione a Turma / Rota</Text>
                {turmaSelecionada && (
                    <TouchableOpacity onPress={onEditarTurma} style={styles.btnEditarTurma}>
                        <Ionicons name="pencil" size={14} color="#2563eb" />
                        <Text style={styles.btnEditarTurmaText}>Editar Turma</Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.turmasScroll}>
                {turmas.map(t => {
                    const selecionada = turmaSelecionada?.id === t.id;
                    return (
                        <TouchableOpacity
                            key={t.id}
                            style={[styles.turmaCard, selecionada && styles.turmaCardSelecionada]}
                            onPress={() => onSelecionarTurma(t)}
                        >
                            <Ionicons name="bus" size={20} color={selecionada ? '#fff' : '#2563eb'} />
                            <Text style={[styles.turmaNome, selecionada && styles.turmaNomeSelecionada]}>{t.nome}</Text>
                            <Text style={[styles.turmaTurno, selecionada && styles.turmaTurnoSelecionada]}>{t.turno}</Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}