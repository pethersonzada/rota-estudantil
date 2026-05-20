import React, { useState, useEffect } from "react";
import { View, StyleSheet, Switch, TouchableOpacity, Text, Image } from "react-native";
import { Plus, Trash2 } from "lucide-react-native";
import * as ImagePicker from 'expo-image-picker';
import Title from "./Title";
import Input from "./Input";

interface DriverProfileCardProps {
  onDataChange: (data: any) => void;
}

export const DriverProfileCard = ({ onDataChange }: DriverProfileCardProps) => {
  
  const [bio, setBio] = useState("");
  const [tempoExperiencia, setTempoExperiencia] = useState("");
  const [tempoTolerancia, setTempoTolerancia] = useState(""); 
  const [instituicoes, setInstituicoes] = useState("");
  const [mesesPagantes, setMesesPagantes] = useState("");
  const [podeComer, setPodeComer] = useState(false);
  const [pontosColeta, setPontosColeta] = useState<string[]>([""]);
  

  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);

  
  const pickProfileImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Precisamos de permissão para acessar suas fotos!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setFotoPerfil(result.assets[0].uri);
    }
  };

  const handleAdicionarPonto = () => {
    setPontosColeta([...pontosColeta, ""]);
  };

  const handleAlterarPonto = (texto: string, index: number) => {
    const novosPontos = [...pontosColeta];
    novosPontos[index] = texto;
    setPontosColeta(novosPontos);
  };

  const handleRemoverPonto = (index: number) => {
    if (pontosColeta.length > 1) {
      const novosPontos = pontosColeta.filter((_, i) => i !== index);
      setPontosColeta(novosPontos);
    } else {
      setPontosColeta([""]);
    }
  };

  useEffect(() => {
    onDataChange({
      fotoPerfil,
      bio,
      tempoExperiencia,
      tempoTolerancia,
      instituicoes,
      mesesPagantes,
      podeComer,
      pontosColeta: pontosColeta.filter(ponto => ponto.trim() !== ""),
    });
  }, [fotoPerfil, bio, tempoExperiencia, tempoTolerancia, instituicoes, mesesPagantes, podeComer, pontosColeta]);

  return (
    <View style={styles.card}>
     
      <Title style={styles.cardTitle} text="Adicionais para o perfil" />

      
      <Title style={styles.subtitle} text="Foto de Perfil" />
      <TouchableOpacity style={styles.fotoContainer} onPress={pickProfileImage}>
        {fotoPerfil ? (
          <Image source={{ uri: fotoPerfil }} style={styles.fotoPreview} />
        ) : (
          <Text style={styles.fotoPlaceholder}>Clique para adicionar sua foto</Text>
        )}
      </TouchableOpacity>

      <View style={styles.inputGroup}>
        <Title style={styles.fieldLabel} text="Sua Apresentação (Bio):" />
        <Input
          style={styles.textArea}
          placeholder="Conte sobre suas rotas e diferenciais..."
          maxLength={300}
          value={bio}
          onChangeText={setBio}
          keyboardType="default"
        />
      </View>

      <View style={styles.row}>
        <View style={styles.inputGroup2}>
          <Title style={styles.fieldLabel2} text="Conduz alunos há:" />
          <Input
            placeholder="Ex: 3 anos"
            value={tempoExperiencia}
            onChangeText={setTempoExperiencia}
            keyboardType="default"
          />
        </View>

        <View style={styles.inputGroup2}>
          <Title style={styles.fieldLabel2} text="Tolerância por parada:" />
          <Input
            placeholder="Ex: 5 min"
            value={tempoTolerancia}
            onChangeText={setTempoTolerancia}
            keyboardType="default"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Title style={styles.fieldLabel} text="Instituições que atende:" />
        <Input
          placeholder="Ex: Uninassau, Unifavip, UFPE"
          value={instituicoes}
          onChangeText={setInstituicoes}
          keyboardType="default"
        />
      </View>

      <View style={styles.inputGroup}>
        <Title style={styles.fieldLabel} text="Meses cobrados no ano:" />
        <Input
          placeholder="Ex: Fevereiro a Dezembro"
          value={mesesPagantes}
          onChangeText={setMesesPagantes}
        />
      </View>

      <View style={styles.switchItem}>
        <Title style={styles.switchLabel} text="É permitido comer na van?" />
        <Switch 
          style={styles.switch}
          value={podeComer} 
          onValueChange={setPodeComer} 
          trackColor={{ true: '#9aafc2' }} 
        />
      </View>
      
      <View style={styles.pontosContainer}>
        <View style={styles.pontosHeader}>
          <Title style={styles.pontosLabel} text="Pontos de Coleta / Embarque:" />
          <TouchableOpacity style={styles.addButton} onPress={handleAdicionarPonto}>
            <Plus color="#3b82f6" size={16}  />
            <Text style={styles.addButtonText}>Add ponto</Text>
          </TouchableOpacity>
        </View>

        {pontosColeta.map((ponto, index) => (
          <View key={index} style={styles.pontoRow}>
            <View style={styles.containerColeta}>
              <Input
                placeholder={`Ex: Ponto da praça principal ou Posto X`}
                value={ponto}
                onChangeText={(texto) => handleAlterarPonto(texto, index)}
              />
            </View>
            <TouchableOpacity 
              style={styles.removeButton} 
              onPress={() => handleRemoverPonto(index)}
            >
              <Trash2 color="#ef4444" size={20} />
            </TouchableOpacity>
          </View>
        ))}
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#9aafc2",
    width: "95%",
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
  },
  cardTitle: {
    fontSize: 30,
    marginBottom: 15,
    marginTop:10
  },
  fotoContainer:{
    width: 120,
    height: 120,
    backgroundColor:"#7a8f9f",
    borderRadius: 60,
    justifyContent:"center",
    alignItems:"center",
    marginBottom: 20,
    alignSelf: "center",
    borderWidth: 1,
    borderColor:"#ffffff",
    borderStyle:"dashed",
    overflow: "hidden"
  },
  fotoPreview:{
    width:"100%",
    height:"100%",
    borderRadius: 60
  },
  fotoPlaceholder:{
    color:"#ffffff",
    fontSize:12,
    fontWeight:"bold",
    textAlign: "center",
    padding: 10
  },
  subtitle:{
    fontSize:18,
    color:"#f0f9ff",
    marginBottom:5,
    textAlign:"center",
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputGroup2: {
    marginBottom: 12,
    width:"48%"
  },
  row: {
    flexDirection: "row",
    justifyContent:"space-between",
    padding:0
  },
  fieldLabel: {
    fontSize: 20,
    textAlign:"left",
    color: "#ffffff",
    marginBottom: 6,
  },
  fieldLabel2: {
    fontSize: 16,
    textAlign:"left",
    color: "#ffffff",
    marginBottom: 6,
  },
  textArea: {
    height: 60,
  },
  switchItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f9ff",
    width:"100%",
    height:60,
    borderRadius: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#354c6270",
    paddingHorizontal:40,
  },
  switchLabel: {
    fontSize: 14,
    textAlign:"left",     
    color: "#59748c",
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius:0,
  },
  pontosContainer: {
    marginTop: 10,
  },
  pontosHeader: {
    flexDirection: "row",
    justifyContent:"center",
    alignItems: "center",
    marginBottom: 8,
  },
  pontosLabel: {
    fontSize: 15,         
    color: "#ffffff",
    textAlign:"left",
    paddingLeft:100
  },
  switch:{
    marginRight:1
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight:90
  },
  addButtonText: {
    color: "#3b82f6",
    fontSize: 13,
    fontWeight: "bold",
    marginLeft: 4,
    
  },
  pontoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  removeButton: {
    padding: 8,
    marginLeft: 4,
  },
  containerColeta:{
    flex: 1 
  }
});