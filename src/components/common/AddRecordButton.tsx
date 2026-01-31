import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../../constants/colors';

type AddRecordButtonProps = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
};

export default function AddRecordButton({
  title,
  onPress,
  disabled = false,
}: AddRecordButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
      hitSlop={8}
    >
      <Text style={[styles.text, disabled && styles.disabledText]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,       
    paddingHorizontal: 10,     
    borderRadius: 14,
    backgroundColor: colors.grayscale[1000],
  },

  pressed: {
    backgroundColor: colors.grayscale[800],
  },

  disabled: {
    backgroundColor: colors.grayscale[900],
    opacity: 0.5,
  },

  text: {
    fontSize: 13,     
    fontFamily: 'Pretendard-SemiBold',
    color: colors.primary[300],
  },

  disabledText: {
    color: colors.grayscale[600],
  },
});
