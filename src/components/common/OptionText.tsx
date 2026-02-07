import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

type OptionTextProps = {
  text: string;
};

export default function OptionText({ text }: OptionTextProps) {
  const parts = text.split(' | ').map((s) => s.trim()).filter(Boolean);
  const base = parts.length > 0 ? parts[0] : text;
  const extra = parts.length > 1 ? parts.slice(1) : [];

  return (
    <View style={styles.optionWrap}>
      <Text style={styles.optionBase}>{base}</Text>
      {extra.length > 0 && (
        <Text style={styles.optionExtra}>{extra.join(', ')}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  optionWrap: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 15,
  },
  optionBase: {
    color: colors.grayscale[600],
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
  },
  optionExtra: {
    color: colors.grayscale[200],
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
  },
});
