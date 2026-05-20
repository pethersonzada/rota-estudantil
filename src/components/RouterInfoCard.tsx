import React from "react";
import { View, StyleSheet } from "react-native";
import Title from "./Title";

interface RouteInfoCardProps {
  dados: any;
}

export const RouteInfoCard = ({ dados }: RouteInfoCardProps) => {
  if (!dados) return null;

  const { veiculo } = dados;

  return (
    <View style={styles.card}>
      <Title style={styles.mainTitle} text="Informação de Rota e Serviço" />

      <View style={styles.infoRow}>
        <Title style={styles.label} text="Sai de (Origem):" />
        <Title style={styles.value} text={veiculo?.origem || "--"} />
      </View>

    
      <View style={styles.infoRow}>
        <Title style={styles.label} text="Vai para (Destino):" />
        <Title style={styles.value} text={veiculo?.destino || "--"} />
      </View>

      
      <View style={styles.flexRow}>
        <View style={styles.flexColumn}>
          <Title style={styles.label} text="Horário Saída:" />
          <Title style={styles.value} text={veiculo?.coleta || veiculo?.horarioSaida || "--"} />
        </View>
        <View style={styles.flexColumn}>
          <Title style={styles.label} text="Horário Retorno:" />
          <Title style={styles.value} text={veiculo?.horarioRetorno || "--"} />
        </View>
      </View>

      <View style={styles.flexRow}>
        <View style={styles.flexColumn}>
          <Title style={styles.label} text="Mensalidade:" />
          <Title style={styles.value} text={veiculo?.mensalidade || "R$ 0,00"} />
        </View>
        <View style={styles.flexColumn}>
          <Title style={styles.label} text="Meses Cobrados:" />
          <Title style={styles.value} text={dados.detalhes_servico?.mesesPagantes || "--"} />
        </View>
      </View>

      <View style={styles.infoRow}>
        <Title style={styles.label} text="Tempo de tolerância por parada:" />
        <Title style={styles.value} text={dados.detalhes_servico?.tempoTolerancia || "--"} />
      </View>

      <View style={styles.infoRowLast}>
        <Title style={styles.label} text="Instituições que trabalha/atende:" />
        <Title style={styles.value} text={dados.detalhes_servico?.instituicoes || "--"} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#9aafc2",
    width: "100%",
    borderRadius: 20,
    padding: 18,
    alignSelf: "center",
    marginVertical: 15,
    marginBottom: 30,
    
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#f0f9ff",
    textAlign: "center",
    marginTop: 5,
    marginBottom: 20,
  },
  infoRow: {
    width: "100%",
    borderBottomWidth: 0.5,
    borderColor: "#f0f9ff70",
    paddingBottom: 8,
    marginBottom: 12,
  },
  infoRowLast: {
    width: "100%",
    paddingBottom: 5,
  },
  flexRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    borderBottomWidth: 0.5,
    borderColor: "#f0f9ff70",
    paddingBottom: 8,
    marginBottom: 12,
  },
  flexColumn: {
    width: "48%",
  },
  label: {
    fontSize: 16,
    color: "#f0f9ff",
    marginBottom: 3,
    fontWeight:"bold",
    textShadowColor:"#59748c",
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius:2,
  },
  value: {
    fontSize: 15,
    color: "#f0f9ff",
    textShadowColor:"#59748c",
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius:0,    
  },
});