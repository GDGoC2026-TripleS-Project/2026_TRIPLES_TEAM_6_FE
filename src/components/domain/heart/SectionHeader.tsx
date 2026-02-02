import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors } from '../../../constants/colors';

interface SectionHeaderProps {
  title: string;
}

export default function SectionHeader({ title }: SectionHeaderProps) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

const styles = StyleSheet.create({
  sectionHeader: {
    paddingVertical: 9.5,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayscale[800],
    color: colors.grayscale[300],
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
  },
});