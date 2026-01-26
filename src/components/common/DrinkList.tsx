import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors } from "../../constants/colors";

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
                        <View key={p.label} style={styles.pill}>
                            <Text style={styles.pillLabel}>{p.label}</Text>
                            <Text style={styles.pillValue}>
                                {p.value}
                                <Text style={styles.pillUnit}> {p.unit}</Text>
                            </Text>
                            </View>
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

    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 18,
        borderWidth: 0.8,
        borderColor: colors.grayscale[600],
        backgroundColor: colors.grayscale[1000],
        gap: 6,
    },

    pillLabel: {
        color: colors.grayscale[500],
        fontSize: 14,
        fontFamily: 'Pretendard-Regular',
    },

    pillValue: {
        color: colors.primary[600],
        fontSize: 13,
        fontFamily: 'Pretendard-Regular',
    },

    pillUnit: {
        color: colors.primary[600],
        fontFamily: 'Pretendard-Regular',
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