import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';


interface SocialButtonProps {
  title: string;
  icon: ImageSourcePropType;
  onPress: () => void;
}

export function SocialButton({ title, icon, onPress }: SocialButtonProps) {
  return (
    
      <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
        <Image source={icon} style={styles.icon} />
        <Text style={styles.text}>{title}</Text>
      </TouchableOpacity>
  
  );
}

const styles = StyleSheet.create({
  shadowContainer: {
    flex: 1,
    marginHorizontal:10,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 8,
    resizeMode: 'contain',
  },
  text: {
    color: '#354d62',
    fontSize: 12,
    fontFamily: 'Lato',
  },
});