import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors } from "../../constants/colors";
import TagPill from "./TagPill";

type NutritionPillProps = {
  label: string;
  value: number;
  unit: string;
};

type DrinkListProps = {
  brandName: string;
  menuName: string;
  optionText: string | React.ReactNode;
  pills: [NutritionPillProps, NutritionPillProps];
  rightText?: string;
  RightIcon?: React.ReactNode;
  onPress?: () => void;
};

export default function DrinkList({
  brandName,
  menuName,
  optionText,
  pills,
  rightText,
  RightIcon,
  onPress,
}: DrinkListProps) {
  const optionParts =
    typeof optionText === 'string' ? optionText.split(' | ').map((s) => s.trim()) : [];
  const optionBase = optionParts.length > 0 ? optionParts[0] : '';
  const optionExtra = optionParts.slice(1);

  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.left}>
        <Text style={styles.brandLabel}>{brandName}</Text>
        <Text style={styles.menuName}>{menuName}</Text>
        {typeof optionText === 'string' ? (
          <View style={styles.optionWrap}>
            <Text style={styles.optionBase}>{optionBase || optionText}</Text>
            {optionExtra.length > 0 && (
              <Text style={styles.optionExtra}>{optionExtra.join(', ')}</Text>
            )}
          </View>
        ) : (
          optionText
        )}

        <View style={styles.pillRow}>
          {pills.map((p) => (
            <TagPill key={p.label} label={p.label} value={p.value} unit={p.unit} />
          ))}
        </View>
      </View>

      <View style={styles.right}>
        {!!rightText && <Text style={styles.rightText}>{rightText}</Text>}
        {!!RightIcon && <View style={styles.rightIconWrap}>{RightIcon}</View>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
    row: {
        width: '100%',
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.grayscale[900]
    },

    left: {
        flex: 1,
    },

    brandLabel: {
        color: colors.grayscale[600],
        fontSize: 12,
        fontFamily: 'Pretendard-Regular',
        marginBottom: 7,
    },

    menuName: {
        color: colors.grayscale[100],
        fontSize: 16,
        fontFamily: 'Pretendard',
        fontWeight: 600,
        marginBottom: 7,
    },

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

    pillRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10
    },
    
    right: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 10,
        marginLeft: 12,
    },

    rightText: {
        color: colors.primary[500],
        fontSize: 14,
        fontFamily: 'Pretendard-Medium',
    },

    rightIconWrap: {
        opacity: 0.9,
    },
});
