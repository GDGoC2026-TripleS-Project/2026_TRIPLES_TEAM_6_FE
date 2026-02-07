import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

interface SkipDrinkCheckboxProps {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export default function SkipDrinkCheckbox({
  value,
  onChange,
  disabled = false,
}: SkipDrinkCheckboxProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        value ? styles.containerActive : styles.containerInactive,
        disabled && styles.containerDisabled,
        pressed && !disabled && styles.containerPressed,
      ]}
      onPress={() => !disabled && onChange(!value)}
      disabled={disabled}
    >
      <View style={[styles.checkbox, value && styles.checkboxActive]}>
        <Ionicons
          name="checkmark"
          size={14}
          color={value ? colors.grayscale[100] : colors.grayscale[500]}
        />
      </View>
      <Text style={[styles.label, value && styles.labelActive]}>
        음료를 마시지 않았어요.
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: colors.grayscale[1000],
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  containerInactive: {
    backgroundColor: colors.grayscale[900],
    borderColor: colors.grayscale[900],
  },
  containerActive: {
    backgroundColor: colors.primary[1000],
    borderColor: colors.primary[1000],
  },
  containerPressed: {
    transform: [{ scale: 0.98 }],
  },
  containerDisabled: {
    opacity: 0.5,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    marginRight: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.primary[1000],
    borderColor: colors.primary[1000],
  },
  label: {
    color: colors.grayscale[200],
    fontSize: 14,
    fontFamily: 'Pretendard-Semibold',
  },
  labelActive: {
    color: colors.grayscale[100],
  },
});
