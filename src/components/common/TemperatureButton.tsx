import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';

type TemperatureButtonProps = {
    value: 'hot' | 'ice';
    onChange: (next: 'hot' | 'ice') => void;
};

const TemperatureButton = ({ value, onChange }: TemperatureButtonProps) => {
    const isHot = value === 'hot';
    const isIce = value === 'ice';

    const handlePress = (selected: 'hot' | 'ice') => {
        if (value === selected) return;
        onChange(selected);
    };

    return (
        <View style={styles.wrap}>
            <Pressable
                onPress={() => handlePress('hot')}
                style={[
                    styles.item,
                    styles.leftItem,
                    isHot ? styles.active : styles.inactive,
                ]}
            >
                <Text style={[styles.text, isHot ? styles.textActive : styles.textInactive]}>
                    Hot
                </Text>
            </Pressable>

            <View style={styles.separator} />

            <Pressable
                onPress={() => handlePress('ice')}
                style={[
                    styles.item,
                    styles.rightItem,
                    isIce ? styles.active : styles.inactive,
                ]}
            >
                <Text style={[styles.text, isIce ? styles.textActive : styles.textInactive]}>
                    Ice
                </Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    wrap: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: colors.grayscale[700],
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: colors.grayscale[1000],
        height: 42,
    },

    item: {
        flex: 1,
        height: 41,
        alignItems: 'center',
        justifyContent: 'center',
    },

    leftItem: {
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
    },

    rightItem: {
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
    },

    separator: {
        width: 1,
        backgroundColor: colors.grayscale[700],
    },

    active: {
        backgroundColor: colors.primary[1000],
        borderWidth: 1,
        borderColor: colors.primary[500],
    },

    inactive: {
        backgroundColor: 'transparent',
    },

    text: {
        fontSize: 16,
        fontFamily: 'Pretendard-SemiBold',
    },

    textActive: {
        color: colors.grayscale[100],
    },

    textInactive: {
        color: colors.grayscale[100],
        opacity: 0.9,
    },
});

export default TemperatureButton;
