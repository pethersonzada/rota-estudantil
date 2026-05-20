import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";

interface FeatureChipProps {
  text: string;
  icon: React.ReactElement; 
  selected: boolean;
  onPress: () => void;
}

export const FeatureChip = ({ text, icon, selected, onPress }: FeatureChipProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[
        styles.chip,
        selected ? styles.chipSelected : styles.chipUnselected,
      ]}
      onPress={onPress}
    >
      <View style={styles.content}>
        
        {React.cloneElement(icon, {
          color: selected ? "#ffffff" : "#59748c",
        } as React.Attributes & { color: string })}
        
        <Text style={[styles.text, selected ? styles.textSelected : styles.textUnselected]}>
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    margin: 5,
    minWidth: "45%",
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  chipUnselected: {
    backgroundColor: "#f0f9ff",
    borderColor: "#354c6270",
  },
  chipSelected: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: "bold",
  },
  textUnselected: {
    color: "#59748c",
  },
  textSelected: {
    color: "#ffffff",
  },
});