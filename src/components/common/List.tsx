import { View, Text, StyleSheet, Pressable } from "react-native";
import React, { useEffect, useState } from "react";
import { colors } from "../../constants/colors";
import ToggleButton from "./ToggleButton";
import HeartOff from '../../../assets/Property 1=false.svg'
import HeartOn from '../../../assets/Property 1=true.svg'

type ListProps = {
    title: string;
    defaultLiked?: boolean;
    liked?: boolean;
    showToggle?: boolean;
    onToggleLike?: (next: boolean) => void;
    toggleDisabled?: boolean;
    onPress?: () => void;
};

function List({
    title,
    defaultLiked = false,
    liked: likedProp,
    showToggle = true,
    onToggleLike,
    toggleDisabled = false,
    onPress,
}: ListProps) {
    const [likedState, setLikedState] = useState(defaultLiked);
    const isControlled = typeof likedProp !== 'undefined';
    const isLiked = isControlled ? likedProp : likedState;

    useEffect(() => {
        if (typeof likedProp === 'undefined') return;
        setLikedState(likedProp);
    }, [likedProp]);

    const handleToggleLike = (next: boolean) => {
        if (toggleDisabled) return;
        if (!isControlled) {
            setLikedState(next);
        }
        onToggleLike?.(next);
    };

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <Pressable onPress={onPress} style={styles.titlePressArea}>
                    <Text style={styles.title}>{title}</Text>
                </Pressable>
                {showToggle ? (
                    <ToggleButton
                        key={`like_${isLiked ? 'on' : 'off'}`}
                        image1={HeartOff}
                        image2={HeartOn}
                        initialImage={isLiked ? 2 : 1}
                        onToggle={handleToggleLike}
                    />
                ) : null}
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
    titlePressArea: {
        flex: 1,
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
