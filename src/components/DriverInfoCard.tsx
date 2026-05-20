import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { 
  Wifi, 
  Snowflake, 
  Armchair, 
  EvCharger, 
  Tv, 
  Music, 
  SunDim, 
  MapPin, 
  Lightbulb, 
  Briefcase 
} from "lucide-react-native";

interface DriverInfoCardProps {
  dados: any;
}

export const DriverInfoCard = ({ dados }: DriverInfoCardProps) => {
  if (!dados) return null;

  const { nome, data_nascimento, telefone, veiculo, detalhes_servico, comodidades } = dados;

  
  const calcularIdade = (dataNasc: string) => {
    if (!dataNasc) return "--";
    
    
    const partes = dataNasc.split('/');
    if (partes.length !== 3) return "--";

    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1;
    const ano = parseInt(partes[2], 10);

    const hoje = new Date();
    const nascimento = new Date(ano, mes, dia);
    
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const formatarTelefone = (tel: string) => {
    if (!tel) return "";
    const limpou = tel.replace(/\D/g, "");
    if (limpou.length === 11) {
      return `(${limpou.substring(0, 2)}) ${limpou.substring(2, 3)} ${limpou.substring(3, 7)}-${limpou.substring(7)}`;
    }
    return tel;
  };

  const dicionarioComodidades: { [key: string]: { text: string; icon: React.ReactElement } } = {
    ac: { text: "Ar-Condicionado", icon: <Snowflake size={16} color="#ffffff" /> },
    wifi: { text: "Wi-Fi", icon: <Wifi size={16} color="#ffffff" /> },
    recliningSeat: { text: "Bancos Reclináveis", icon: <Armchair size={16} color="#ffffff" /> },
    usbCharger: { text: "Entradas USB", icon: <EvCharger size={16} color="#ffffff" /> },
    tv: { text: "Televisão/DVD", icon: <Tv size={16} color="#ffffff" /> },
    music: { text: "Tem Música", icon: <Music size={16} color="#ffffff" /> },
    curtains: { text: "Cortinas de Sol", icon: <SunDim size={16} color="#ffffff" /> },
    tracking: { text: "Rastreio em Tempo Real", icon: <MapPin size={16} color="#ffffff" /> },
    readingLight: { text: "Luz de Leitura", icon: <Lightbulb size={16} color="#ffffff" /> },
    luggage: { text: "Bagageiro Amplo", icon: <Briefcase size={16} color="#ffffff" /> },
  };

  
  const listaComodidades = Array.isArray(comodidades) ? comodidades : [];

  return (
    <View style={styles.card}>
      
      
      <Text style={styles.sectionTitle}>Sobre o Motorista:</Text>
      <View style={styles.rowInfo}>
        <Image 
          source={{ uri: detalhes_servico?.fotoPerfil || "https://via.placeholder.com/100" }} 
          style={styles.avatarMini} 
        />
        <View style={styles.textGroup}>
          <Text style={styles.infoText}><Text style={styles.bold}>Nome:</Text> {nome}</Text>
          <Text style={styles.infoText}><Text style={styles.bold}>Idade:</Text> {calcularIdade(data_nascimento)} Anos</Text>
          <Text style={styles.infoText}><Text style={styles.bold}>Conduzindo alunos há:</Text> {detalhes_servico?.tempoExperiencia || "--"}</Text>
          <Text style={styles.infoText}><Text style={styles.bold}>Telefone:</Text> {formatarTelefone(telefone)}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Sobre este Veículo:</Text>
      <View style={styles.rowInfo}>
        <Image 
          source={{ uri: veiculo?.foto || "https://via.placeholder.com/100" }} 
          style={styles.vanMini} 
          resizeMode="cover"
        />
        <View style={styles.textGroup}>
          <Text style={styles.infoText}><Text style={styles.bold}>Modelo:</Text> {veiculo?.marca} {veiculo?.modelo}</Text>
          <Text style={styles.infoText}><Text style={styles.bold}>Placa:</Text> {veiculo?.placa || "--"}</Text>
          <Text style={styles.infoText}><Text style={styles.bold}>Ano:</Text> {veiculo?.ano || "--"}</Text>
          <Text style={styles.infoText}><Text style={styles.bold}>Quantidade de Lugares:</Text> {veiculo?.capacidade || "--"}</Text>
        </View>
      </View>

      
      {listaComodidades.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Mais informações:</Text>
          <View style={styles.gridComodidades}>
            {listaComodidades.map((itemKey) => {
              const item = dicionarioComodidades[itemKey];
              if (!item) return null; 
              
              return (
                <View key={itemKey} style={styles.comodidadeItem}>
                  {item.icon}
                  <Text style={styles.comodidadeText} numberOfLines={1}>
                    {item.text}
                  </Text>
                </View>
              );
            })}
          </View>
        </>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f0f9ff",
    width: "100%",
    borderRadius: 20,
    padding: 18,
    alignSelf: "center",
    marginVertical: 15,
    borderWidth: 1,
    borderColor: "#354c6270",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#354c62",
    marginTop: 5,
    marginBottom: 10,
  },
  rowInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    gap: 15,
  },
  avatarMini: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#9aafc2",
  },
  vanMini: {
    width: 80,
    height: 65,
    borderRadius: 10,
    backgroundColor: "#9aafc2",
  },
  textGroup: {
    flex: 1,
    justifyContent: "center",
  },
  infoText: {
    fontSize: 14,
    color: "#354c6290",
    marginBottom: 2,
  },
  bold: {
    fontWeight: "bold",
    color: "#354c62",
  },
  gridComodidades: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent:"space-between",
    gap: 8,
    marginTop: 5,
  },
  comodidadeItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#9aafc2",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 15,
    width: "48%",
    gap: 8,
  },
  comodidadeText: {
    color: "#f0f9ff",
    fontSize: 12,
    flex: 1,
  },
});