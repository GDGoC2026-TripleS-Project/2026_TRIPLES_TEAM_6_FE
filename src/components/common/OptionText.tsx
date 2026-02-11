import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

type OptionTextProps = {
  text?: string;
  base?: string;
  extra?: string[];
};

function OptionText({ text, base, extra }: OptionTextProps) {
  const parts = text ? text.split(' | ').map((s) => s.trim()).filter(Boolean) : [];
  const baseFromText = parts.length > 0 ? parts[0] : text ?? '';
  const extraFromText = parts.length > 1 ? parts.slice(1) : [];
  const resolvedBase = base || baseFromText || '';
  const resolvedExtra = extra ?? extraFromText;

  return (
    <View style={styles.optionWrap}>
      <Text style={styles.optionBase}>{resolvedBase}</Text>
      {resolvedExtra.length > 0 && (
        <Text style={styles.optionExtra}>{resolvedExtra.join(', ')}</Text>
      )}
    </View>
  );
}

const areEqual = (prev: OptionTextProps, next: OptionTextProps) => {
  if (prev.text !== next.text) return false;
  if (prev.base !== next.base) return false;
  const prevExtra = prev.extra;
  const nextExtra = next.extra;
  if (prevExtra === nextExtra) return true;
  if (!prevExtra || !nextExtra) return false;
  if (prevExtra.length !== nextExtra.length) return false;
  for (let i = 0; i < prevExtra.length; i += 1) {
    if (prevExtra[i] !== nextExtra[i]) return false;
  }
  return true;
};

const MemoOptionText = memo(OptionText, areEqual);
MemoOptionText.displayName = 'OptionText';

export default MemoOptionText;

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
    flexShrink: 0, 
  },
  optionExtra: {
    color: colors.grayscale[200],
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    flexShrink: 1, 
    flex: 1,
  },
});
