import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors } from "../../constants/colors";

type NutritionRow = {
    label: string;
    valueText: string;
    hintText?: string;
    emphasized?: boolean;
};

type GoalFieldProps = {
    brandName: string;
    menuName: string;
    rows: NutritionRow[];

    onEdit?: () => void;
    onDelete?: () => void;

    editText?: string;
    deleteText?: string;
};

function GoalField({
    brandName,
    menuName,
    rows,
    onEdit,
    onDelete,
    editText = '수정',
    deleteText = '삭제',
}: GoalFieldProps) {
    return (
        <View style={styles.container}>
            <View style={styles.handle} />

            <View style={styles.header}>
                <Text style={styles.brandLabel}>{brandName}</Text>
                <Text style={styles.menuName}>{menuName}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.list}>
                {rows.map((row, idx) => (
                    <View key={`${row.label}-${idx}`}>
                        <View style={styles.row}>
                            <Text style={[styles.leftLabel, row.emphasized && styles.leftLabelStrong]}>
                                {row.label}
                            </Text>

                            <View style={styles.rightBox}>
                                <Text style={[styles.valueText, row.emphasized && styles.valueTextStrong]}>
                                    {row.valueText}
                                </Text>
                                {!!row.hintText && <Text style={styles.hintText}>{row.hintText}</Text>}
                            </View>
                            </View>

                            {idx !== rows.length - 1 && <View style={styles.rowDivider} />}
                            </View>
                ))}
            </View>

            <View style={styles.buttonRow}>
                <Pressable
                style={[styles.button, styles.editButton]}
                onPress={onEdit}
                disabled={!onEdit}
                >
                    <Text style={styles.editButtonText}>{editText}</Text>
                </Pressable>

                <Pressable
                style={[styles.button, styles.deleteButton]}
                onPress={onDelete}
                disabled={!onDelete}
                >
                    <Text style={styles.deleteButtonText}>{deleteText}</Text>
                </Pressable>
            </View>
        </View>
    );
}

export default GoalField;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        paddingBottom: 18,
        overflow: 'hidden',
        backgroundColor: colors.grayscale[900]
    },

    handle: {
        alignSelf: 'center',
        width: 60,
        height: 5,
        borderRadius: 999,
        backgroundColor: colors.grayscale[700],
        marginTop: 10,
        marginBottom: 14,
    },

    header: {
        paddingHorizontal: 18,
        paddingBottom: 14,
    },

    brandLabel: {
        color: colors.grayscale[500],
        fontSize: 14,
        fontFamily: 'Pretendard-Regular',
        marginBottom: 8,
    },

    menuName: {
        color: colors.grayscale[200],
        fontSize: 20,
        fontFamily: 'Pretendard-Medium',
        marginBottom: 12,
    },

    divider: {
        height: 1,
        backgroundColor: colors.grayscale[800],
    },

    list: {
        paddingHorizontal: 18,
    },

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 18,
    },

    leftLabel: {
        color: colors.grayscale[300],
        fontSize: 16,
        fontFamily: 'Pretendard-Regular',
    },

    leftLabelStrong: {
        fontFamily: 'Pretendard-Medium',
    },

    rightBox: {
        alignItems: 'flex-end',
        gap: 6,
    },

    valueText: {
        color: colors.grayscale[200],
        fontSize: 18,
        fontFamily: 'Pretendard-Regular',
    },

    valueTextStrong: {
        fontFamily: 'Pretendard-Medium',
    },

    hintText: {
        color: colors.grayscale[500],
        fontSize: 13,
        fontFamily: 'Pretendard-Regular',
    },

    rowDivider: {
        height: 1,
        backgroundColor: colors.grayscale[800],
    },

    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 18,
        paddingTop: 18,
    },

    button: {
        flex: 1,
        height: 52,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },

    editButton: {
        backgroundColor: colors.primary[500],
    },

    editButtonText: {
        color: colors.grayscale[1000],
        fontSize: 16,
        fontFamily: 'Pretendard-SemiBold',
    },

    deleteButton: {
        backgroundColor: colors.grayscale[800],
    },

    deleteButtonText: {
        color: colors.grayscale[100],
        fontSize: 16,
        fontFamily: 'Pretendard-SemiBold',
    },
});
