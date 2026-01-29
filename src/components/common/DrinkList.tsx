import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors } from "../../constants/colors";
import TagPill from "./TagPill";

type NutritionPillProps = {
    label: string;
    value: number;
    unit: string;
};

type MenuItemProps = {
    brandName: string;
    menuName: string;
    optionText: string;
    pills: [NutritionPillProps, NutritionPillProps];
    rightText?: string;
    RightIcon?: React.ReactNode;
    onPress?: () => void;
};

function MenuItemRow({
    brandName,
    menuName,
    optionText,
    pills,
    rightText,
    RightIcon,
    onPress,
}: MenuItemProps) {
    return (
        <Pressable style={styles.row} onPress={onPress}>
            <View style={styles.left}>
                <Text style={styles.brandLabel}>{brandName}</Text>
                <Text style={styles.menuName}>{menuName}</Text>
                <Text style={styles.optionText}>{optionText}</Text>

                <View style={styles.pillRow}>
                    {pills.map((p) => (
                        <TagPill
                        key={p.label}
                        label={p.label}
                        value={p.value}
                        unit={p.unit}
                        />
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

export default MenuItemRow;

const styles = StyleSheet.create({
    row: {
        width: '100%',
        paddingVertical: 18,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },

    left: {
        flex: 1,
    },

    brandLabel: {
        color: colors.grayscale[600],
        fontSize: 13,
        fontFamily: 'Pretendard-Regular',
        marginBottom: 7,
    },

    menuName: {
        color: colors.grayscale[100],
        fontSize: 18,
        fontFamily: 'Pretendard-Medium',
        marginBottom: 7,
    },

    optionText: {
        color: colors.grayscale[600],
        fontSize: 16,
        fontFamily: 'Pretendard-Regular',
        marginBottom: 15,
    },

    pillRow: {
        flexDirection: 'row',
        gap: 12,
    },
    
    right: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 10,
        marginLeft: 12,
    },

    rightText: {
        color: colors.primary[500],
        fontSize: 18,
        fontFamily: 'Pretendard-Medium',
    },

    rightIconWrap: {
        opacity: 0.9,
    },
});