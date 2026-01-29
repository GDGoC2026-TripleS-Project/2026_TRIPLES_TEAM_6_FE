import { View, Text, StyleSheet, Pressable } from "react-native";
import React, { useState } from "react";
import { Ionicons } from '@expo/vector-icons';
import { colors } from "../../constants/colors";

type ListProps = {
    title: string;
    defaultLiked?: boolean;
    onPress?: () => void;
};

function List({ title, defaultLiked = false, onPress }: ListProps) {
    const [liked, setLiked] = useState(defaultLiked);

    return (
        <Pressable onPress={onPress} style={styles.container}>
            <View style={styles.row}>
                <Text style={styles.title}>{title}</Text>

                <Pressable
                hitSlop={8}
                onPress={() => setLiked(prev => !prev)}
                >
                    <Ionicons
                    name={liked ? 'heart' : 'heart'}
                    size={22}
                    color={liked ? 'skyblue' : 'white'}
                    />
                </Pressable>
            </View>

            <View style={styles.divider} />
        </Pressable>
    );
}

export default List;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingTop: 18,
        width: '95%',
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '95%',
    },

    title: {
        color: colors.grayscale[100],
        fontSize: 16,
        fontFamily: 'Pretendard-SemiBold',
    },

    divider: {
        marginTop: 22,
        height: 1,
        backgroundColor: colors.grayscale[700],
    },
});