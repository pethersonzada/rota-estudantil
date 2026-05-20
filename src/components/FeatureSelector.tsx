import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";
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
import { FeatureChip } from "./FeatureChip";
import Title from "./Title";

interface FeatureSelectorProps {
  onDataChange: (features: string[]) => void;
}

export const FeatureSelector = ({ onDataChange }: FeatureSelectorProps) => {
  const availableFeatures = [
    { id: "ac", text: "Ar-Condicionado", icon: <Snowflake size={20} /> },
    { id: "wifi", text: "Wi-Fi Grátis", icon: <Wifi size={20} /> },
    { id: "recliningSeat", text: "Assento Reclinável", icon: <Armchair size={20} /> },
    { id: "usbCharger", text: "Tomada/USB", icon: <EvCharger size={20} /> },
    { id: "tv", text: "Televisão/DVD", icon: <Tv size={20} /> },
    { id: "music", text: "Música/Som", icon: <Music size={20} /> },
    { id: "curtains", text: "Cortinas de Sol", icon: <SunDim size={20} /> },
    { id: "tracking", text: "Rastreio em Tempo Real", icon: <MapPin size={20} /> },
    { id: "readingLight", text: "Luz de Leitura", icon: <Lightbulb size={20} /> },
    { id: "luggage", text: "Bagageiro Amplo", icon: <Briefcase size={20} /> },
  ];

  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const handleToggleFeature = (id: string) => {
    if (selectedFeatures.includes(id)) {
      setSelectedFeatures(selectedFeatures.filter((item) => item !== id));
    } else {
      setSelectedFeatures([...selectedFeatures, id]);
    }
  };

  useEffect(() => {
    onDataChange(selectedFeatures);
  }, [selectedFeatures]);

  return (
    <View style={styles.container}>
      <Title style={styles.title} text="Comodidades da Van" />
      
      
      <Text style={styles.instructionText}>
        O que tem na sua van? Clique nas opções abaixo para selecionar:
      </Text>
      
      <View style={styles.grid}>
        {availableFeatures.map((feature) => (
          <FeatureChip
            key={feature.id}
            text={feature.text}
            icon={feature.icon}
            selected={selectedFeatures.includes(feature.id)}
            onPress={() => handleToggleFeature(feature.id)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "95%",
    backgroundColor: "#9aafc2",
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    alignSelf: "center",
  },
  title: {
    fontSize: 24,
    color: "#ffffff",
    marginBottom: 8,
    textAlign: "center",
  },
  instructionText: {
    fontSize: 14,
    color: "#f0f9ff",
    marginBottom: 20,
    textAlign: "center",
    opacity: 0.9,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});