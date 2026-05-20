import React from 'react';
import { 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle
} from 'react-native';

interface ButtonProps {
  title: string;
  style?: ViewStyle;
  textStyle?: any;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function Button({ 
  title, 
  style,
  textStyle, 
  onPress, 
  isLoading = false, 
  disabled = false 
}: ButtonProps) {
  
  const isButtonDisabled = disabled || isLoading;

  return (
    
    
      <TouchableOpacity 
        onPress={onPress} 
        disabled={isButtonDisabled}
        activeOpacity={0.8}
        style={[
          styles.button, 
          isButtonDisabled && styles.disabled,
          style
        ]}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={[styles.text,textStyle]}>
            {title}
          </Text>
        )}
      </TouchableOpacity>
    
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#354D62",
    height:60,
    borderRadius: 15,
    padding:15,
    justifyContent: 'center',
    alignItems: 'center',
    width: "100%",
  },
  text: {
    color: '#F0f9ff',
    fontSize: 20,
    fontWeight: "bold",
    fontFamily:"Lato",
  },
  disabled: {
    backgroundColor: '#9aafc2',
  }
});