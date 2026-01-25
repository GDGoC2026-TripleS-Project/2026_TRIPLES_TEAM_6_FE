import React, { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../../constants/colors';

type ChipProps = {
  label: string;
  defaultVariant?: 'outlined' | 'filled';
  onToggle?: (variant: 'outlined' | 'filled') => void;
};

const Chip = ({ label, defaultVariant = 'outlined', onToggle }: ChipProps) => {
  const [variant, setVariant] = useState(defaultVariant);
  const isFilled = variant === 'filled';

  const handlePress = () => {
    const newVariant = isFilled ? 'outlined' : 'filled';
    setVariant(newVariant);
    onToggle?.(newVariant);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.base, isFilled ? styles.filled : styles.outlined]}
    >
      <Text
        style={[
          styles.text,
          isFilled ? styles.textFilled : styles.textOutlined,
          { fontFamily: isFilled ? 'Pretendard-SemiBold' : 'Pretendard-Regular' },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.grayscale[300],
  },
  filled: {
    backgroundColor: colors.primary[500],
  },
  text: {
    fontSize: 14,
  },
  textOutlined: {
    color: colors.grayscale[300],
  },
  textFilled: {
    color: colors.grayscale[1000],
  },
});

export default Chip;