import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors } from "../../constants/colors";
import { Ionicons } from '@expo/vector-icons';
import HeartOff from '../../../assets/headerH.svg';
import HeartOn from '../../../assets/Property 1=true.svg';

type HeaderDetailProps = {
    title: string;
    onBack?: () => void;
    initialRightType?: 'close' | 'heart' | 'none';
    onRightPress?: () => void;
    rightActive?: boolean;
};

function HeaderDetail({
    title,
    onBack,
    initialRightType = 'close',
    onRightPress,
    rightActive = false,
}: HeaderDetailProps) {
    const rightType = initialRightType;
    const handleRightPress = () => {
        if (rightType === 'none') return;
        if (onRightPress) {
            onRightPress();
            return;
        }
        if (rightType === 'close') {
            onBack?.();
        }
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

            {rightType === 'none' ? (
                <View style={styles.side} />
            ) : (
                <Pressable
                    style={styles.side}
                    onPress={handleRightPress}
                    disabled={rightType === 'heart' && !onRightPress}
                >
                    
                    {rightType === 'close' ? (
                        <Ionicons
                            name={'close'}
                            size={24}
                            color={colors.primary[100]}
                        />
                    ): (
                        rightActive ? <HeartOn width={24} height={24} /> : <HeartOff width={24} height={24} />
                    )
                }
                </Pressable>
            )}
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
        borderBottomColor: colors.grayscale[800],
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
