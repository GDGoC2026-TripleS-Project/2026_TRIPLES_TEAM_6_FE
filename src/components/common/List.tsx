import { View, Text, StyleSheet, Pressable } from "react-native";
import React, { useMemo, useState } from "react";
import { colors } from "../../constants/colors";
import ToggleButton from "./ToggleButton";
import HeartOff from '../../../assets/Property 1=false.svg'
import HeartOn from '../../../assets/Property 1=true.svg'
type ListProps = {
    title: string;
    defaultLiked?: boolean;
    liked?: boolean;
    onPress?: () => void;
    onToggle?: (nextLiked: boolean) => void;
};

function List({ title, defaultLiked = false, liked, onPress, onToggle }: ListProps) {
    const [internalLiked, setInternalLiked] = useState(defaultLiked);
    const isControlled = liked !== undefined;
    const effectiveLiked = useMemo(
        () => (isControlled ? liked : internalLiked),
        [isControlled, liked, internalLiked]
    );

    const handleToggle = (nextLiked: boolean) => {
        if (!isControlled) setInternalLiked(nextLiked);
        onToggle?.(nextLiked);
    };

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                {onPress ? (
                    <Pressable style={styles.titlePressable} onPress={onPress}>
                        <Text style={styles.title}>{title}</Text>
                    </Pressable>
                ) : (
                    <View style={styles.titlePressable}>
                        <Text style={styles.title}>{title}</Text>
                    </View>
                )}
                <ToggleButton
                    image1={HeartOff}
                    image2={HeartOn}
                    isOn={effectiveLiked}
                    initialImage={defaultLiked ? 2 : 1}
                    onToggle={handleToggle}
                />
            </View>

            <View style={styles.divider} />
        </View>
    );
}

export default List;

const styles = StyleSheet.create({
    container: {
        paddingTop: 24,
        width: '100%',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 16,
    },
    titlePressable: {
        flex: 1,
        paddingVertical: 4,
        paddingRight: 12,
    },

    title: {
        color: colors.grayscale[100],
        fontSize: 16,
        fontFamily: 'Pretendard-SemiBold',
    },

    divider: {
        marginTop: 24,
        height: 1,
        backgroundColor: colors.grayscale[900],
    },
});
