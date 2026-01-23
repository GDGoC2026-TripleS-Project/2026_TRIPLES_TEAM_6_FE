import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import PropTypes from "prop-types";
import { colors } from "../constants/colors";

type ToggleSwitchProps = {
    value?: boolean;
    onValueChange?: ((next: boolean) => void) | null;
};

function ToggleSwitch({ value = false, onValueChange = null }: ToggleSwitchProps) {
    const toggleAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(toggleAnim, {
            toValue: value ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [toggleAnim, value]);

    const circlePosition = toggleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [3, 18],
    });

    const backgroundColor = toggleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.grayscale[800], colors.primary[500]],
    });

     return (
    <View style={styles.container}>
      <Pressable onPress={() => onValueChange?.(!value)}>
        <Animated.View style={[styles.track, { backgroundColor }]}>
          <Animated.View
            style={[styles.thumb, { transform: [{ translateX: circlePosition }] }]}
          />
        </Animated.View>
      </Pressable>
    </View>
  );
}

ToggleSwitch.propTypes = {
    value: PropTypes.bool,
    onValueChange: PropTypes.func,
};

ToggleSwitch.defaultProps = {
    value: false,
    onValueChange: null,
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    track: {
        height: 21,
        width: 36,
        borderRadius: 10.5,
        justifyContent: 'center',
    },

    thumb: {
        width: 15,
        height: 15,
        backgroundColor: colors.grayscale[100],
        borderRadius: 7.5,
    },
});

export default ToggleSwitch;