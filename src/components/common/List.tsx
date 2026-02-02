import { View, Text, StyleSheet, Pressable } from "react-native";
import React, { useState } from "react";
import { Ionicons } from '@expo/vector-icons';
import { colors } from "../../constants/colors";
import ToggleButton from "./ToggleButton";
import HeartOff from '../../../assets/Property 1=false.svg'
import HeartOn from '../../../assets/Property 1=true.svg'
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
                <ToggleButton image1={HeartOff} image2={HeartOn}/>
            </View>

            <View style={styles.divider} />
        </Pressable>
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