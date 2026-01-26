import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../../constants/colors";

type TagProps = {
  label: string;
  value: number | string;
  unit?: string;
  style?: ViewStyle;
};

function TagPill({ label, value, unit, style }: TagProps) {
  return (
    <View style={[styles.pill, style]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>
        {value}
        {!!unit && <Text style={styles.unit}> {unit}</Text>}
      </Text>
    </View>
  );
}

export default TagPill;

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.grayscale[700],
    backgroundColor: colors.grayscale[1000],
    gap: 6,
  },

  label: {
    color: colors.grayscale[400],
    fontSize: 14,
    fontFamily: "Pretendard-Regular",
  },

  value: {
    color: colors.primary[600],
    fontSize: 14,
    fontFamily: "Pretendard-Regular",
  },

  unit: {
    color: colors.primary[600],
    fontFamily: "Pretendard-Regular",
  },
});
