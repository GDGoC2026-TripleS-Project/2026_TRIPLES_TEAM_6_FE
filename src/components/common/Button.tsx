import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { colors } from '../../constants/colors';

interface ButtonProps {
  title: string;
  disabled?: boolean;
  onPress?: () => void;
  variant?: 'primary' | 'dark';
}

const Button = ({ title, disabled = false, onPress, variant = 'primary' }: ButtonProps) => {
  const getBackgroundColor = (pressed: boolean) => {
    if (disabled) {
      return colors.grayscale[700];
    }

    if (variant === 'dark') {
      return pressed ? colors.grayscale[900] : colors.grayscale[800];
    }

    return pressed ? colors.primary[700] : colors.primary[500];
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: getBackgroundColor(pressed),
          },
        ]}
      >
        <Text style={[
          styles.text,
          variant === 'dark' && styles.darkText,
          disabled && styles.disabledText
        ]}>
          {title}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 370,
    height: 56,
  },
  button: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: colors.grayscale[1000],
    fontSize: 16,
    fontWeight: '600',
  },
  darkText: {
    color: colors.grayscale[100],
  },
  disabledText: {
    color: colors.grayscale[500],
  },
});

export default Button;
