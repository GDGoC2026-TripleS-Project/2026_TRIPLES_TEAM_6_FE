import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/colors";

type TemperatureButtonProps = {
    value: 'hot' | 'ice';
    onChange: (next: 'hot' | 'ice') => void;
};

const TemperatureButton = ({ value, onChange }: TemperatureButtonProps) => {
    return (
        <View style={styles.wrap}>
            <Pressable
                onPress={() => onChange('hot')}
                style={[
                    styles.button,
                    styles.left,
                    value === 'hot' ? styles.active : styles.inactive,
                ]}
            >
                <Text style={styles.text}>Hot</Text>
            </Pressable>

            <Pressable
                onPress={() => onChange('ice')}
                style={[
                    styles.button,
                    styles.right,
                    value === 'ice' ? styles.active : styles.inactive,
                ]}
            >
                <Text style={styles.text}>Ice</Text>
            </Pressable>
        </View>
    );
};

const BORDER_RADIUS = 8;

const styles = StyleSheet.create({
    wrap: {
        flexDirection: 'row',
        height: 42,
    },

    button: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        backgroundColor: colors.grayscale[1000],
    },

    left: {
        borderTopLeftRadius: BORDER_RADIUS,
        borderBottomLeftRadius: BORDER_RADIUS,
        borderRightWidth: 1, 
    },

    right: {
        borderTopRightRadius: BORDER_RADIUS,
        borderBottomRightRadius: BORDER_RADIUS,
    },

    active: {
        backgroundColor: colors.primary[1000],
        borderColor: colors.primary[500],
    },

    inactive: {
        backgroundColor: colors.grayscale[1000],
        borderColor: colors.grayscale[700],
    },

    text: {
        fontSize: 16,
        fontFamily: 'Pretendard-SemiBold',
        color: colors.grayscale[100],
    },
});

export default TemperatureButton;
