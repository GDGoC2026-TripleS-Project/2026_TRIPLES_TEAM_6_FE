import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors } from "../../constants/colors";
import { Ionicons } from '@expo/vector-icons';

type HeaderDetailProps = {
    title: string;
    onBack?: () => void;
    initialRightType?: 'close' | 'heart';
};

function HeaderDetail({
    title,
    onBack,
    initialRightType = 'close',
}: HeaderDetailProps) {
    const [rightType, setRightType] = useState<'close' | 'heart'>(initialRightType);

    const handleRightPress = () => {
        setRightType((prev) => (prev === 'close' ? 'heart' : 'close'));
    };

    return (
        <View style={styles.container}>
            <Pressable style={styles.side} onPress={onBack}>
                <Ionicons
                name="chevron-back"
                size={24}
                color={colors.grayscale[100]}
                />
            </Pressable>

            <Text style={styles.title}>{title}</Text>

            <Pressable style={styles.side} onPress={handleRightPress}>
                <Ionicons
                name={rightType === 'close' ? 'close' : 'heart-outline'}
                size={24}
                color={
                    rightType === 'heart'
                    ? colors.primary[100]
                    : colors.primary[100]
                }
                />
            </Pressable>
        </View>
    );
}

export default HeaderDetail;

const styles = StyleSheet.create({
    container: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.grayscale[700],
    },

    side: {
        width: 56,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },

    title: {
        flex: 1,
        textAlign: 'center',
        color: colors.grayscale[100],
        fontSize: 16,
        fontFamily: 'Pretendard-Medium',
    },
});