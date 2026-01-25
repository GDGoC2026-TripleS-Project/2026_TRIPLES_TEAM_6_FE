import { View, Text, StyleSheet, Pressable } from "react-native";
import React, { useState } from 'react';
import { colors } from "../../constants/colors";

type BrandSmallListProps = {
    brands: [string, string];
    onChange?: (selectedIndex: number) => void;
};

function BrandSmallList({ brands, onChange }: BrandSmallListProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const handlePress = (index: number) => {
        setSelectedIndex(index);
        onChange?.(index);
    };

    return (
        <View style={styles.container}>
            {brands.map((brand, index) => {
                const isActive = selectedIndex === index;

                return (
                    <Pressable
                    key={brand}
                    onPress={() => handlePress(index)}
                    style={[
                        styles.tab,
                        isActive && styles.activeTab,
                    ]}
                    >
                        <Text
                        style={[
                            styles.text,
                            isActive && styles.activeText,
                        ]}
                        >
                            {brand}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

export default BrandSmallList;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderRadius: 6,
        padding: 4,
        width: '100%',
    },

    tab: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 4,
        width: '20%',
        alignItems: 'center'
    },

    text: {
        fontSize: 14,
        color: colors.grayscale[300],
        fontFamily: 'Pretendard-Regular',
        paddingBottom: 3,
    },

    activeText: {
        color: colors.grayscale[100],
        fontFamily: 'Pretendard-SemiBold',
    },

    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: colors.grayscale[100],
    }
});