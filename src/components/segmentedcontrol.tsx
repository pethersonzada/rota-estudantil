import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  opcoes: string[];
  selecionado: string;
  onChange: (opcao: string) => void;
}

export function SegmentedControl({ opcoes, selecionado, onChange }: Props) {
  return (
    <View style={styles.container}>
      {opcoes.map((opcao) => (

        <TouchableOpacity key={opcao} style={[styles.botao,selecionado===opcao&&styles.botaoAtivo]} onPress={() => onChange(opcao)}>

          <Text style={[styles.texto,selecionado===opcao&&styles.textoAtivo]}>{opcao}</Text>
        
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container:{
    flexDirection:"row",
    backgroundColor:"#9AAFC2",
    borderRadius:15,
    padding:4,
    marginVertical:10,
    width:350,
  },
  botao:{
    flex: 1,
    paddingVertical:10,
    alignItems:"center",
    borderRadius:15,
  },
  botaoAtivo: {
    backgroundColor: "#f0f9ff",
  },
  texto: {
    color: "#354d62",
    fontFamily:"Lato",
    fontWeight:"bold",
    letterSpacing:0.5,
  },
  textoAtivo: {
    color: "#9AAFC2",
    fontFamily:"Lato",
    fontWeight:"bold",
    letterSpacing:0.5,
  },
});