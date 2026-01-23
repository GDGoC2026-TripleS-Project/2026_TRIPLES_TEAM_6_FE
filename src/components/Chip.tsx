import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import PropTypes from 'prop-types';
import { colors } from '../constants/colors';

type ChipProps = {
  label: string;
  variant?: 'outlined' | 'filled';
  onPress?: (() => void) | null;
};

const Chip = ({ label, variant = 'outlined', onPress = null }: ChipProps) => {
  const isFilled = variant === 'filled';

  return (
    <Pressable
      onPress={onPress ?? undefined}
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

Chip.propTypes = {
  label: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['outlined', 'filled']),
  onPress: PropTypes.func,
};

Chip.defaultProps = {
  variant: 'outlined',
  onPress: null,
};

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
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
